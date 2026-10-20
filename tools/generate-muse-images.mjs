#!/usr/bin/env node
/**
 * 用 Muse 绘图 API 生成站点插画。
 *
 * 用法：
 *   MUSE_API_TOKEN='<你的令牌>' node tools/generate-muse-images.mjs
 *   MUSE_API_TOKEN='<你的令牌>' node tools/generate-muse-images.mjs --only=avatar-kevin
 *   MUSE_API_TOKEN='<你的令牌>' node tools/generate-muse-images.mjs --category=avatars --concurrency=3
 *
 * 令牌只从环境变量读取，不会写入仓库或日志。
 * 生成原件存放在 .cache/muse-raw/，压缩后的 WebP 写入 web/assets/。
 */
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const API = process.env.MUSE_API_BASE || "https://muses.casstime.com/openapi/v1";
const TOKEN = process.env.MUSE_API_TOKEN || process.env.MUSE_API_KEY || "";
const MODEL = process.env.MUSE_MODEL || "gpt-image-2.5-flare";
const QUALITY = process.env.MUSE_QUALITY || "medium";
const manifestPath = path.join(__dirname, "muse-prompts.json");
const cacheDir = path.join(ROOT, ".cache", "muse-raw");
const logPath = path.join(ROOT, ".cache", "muse-generation-log.json");

if (!TOKEN) {
  console.error("缺少 MUSE_API_TOKEN。请先在当前 shell 设置环境变量，不要把令牌写进文件。");
  process.exit(2);
}

const args = new Map();
for (const arg of process.argv.slice(2)) {
  const [k, ...rest] = arg.replace(/^--/, "").split("=");
  args.set(k, rest.join("=") || "true");
}
const only = args.get("only") ? new Set(args.get("only").split(",").map(s => s.trim()).filter(Boolean)) : null;
const category = args.get("category") || "";
const concurrency = Math.max(1, Math.min(8, Number(args.get("concurrency") || 4)));
const retryLimit = Math.max(0, Number(args.get("retry") || 2));
const dryRun = args.has("dry-run");
const rawKeep = args.has("keep-raw");
const timeoutMs = Math.max(60_000, Number(args.get("timeout") || 20 * 60_000));

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const selected = manifest.images.filter(item =>
  (!only || only.has(item.id)) && (!category || item.category === category)
);
if (!selected.length) {
  console.error("没有匹配的图片。检查 --only / --category。");
  process.exit(2);
}

await mkdir(cacheDir, { recursive: true });

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function api(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const message = body && typeof body === "object" ? (body.detail || body.error || body.message) : body;
    throw new Error(`Muse API ${res.status}: ${String(message || "请求失败").slice(0, 600)}`);
  }
  return body;
}

async function submit(item) {
  return api("/text-to-image", {
    method: "POST",
    body: JSON.stringify({
      model_id: MODEL,
      prompt: `${item.prompt}\n${manifest.styleSuffix}`,
      negative_prompt: manifest.negativePrompt,
      params: {
        size: item.size,
        quality: QUALITY,
        output_format: "webp",
        output_compression: 88,
        background: "opaque",
        moderation: "low",
      },
      async: true,
    }),
  });
}

async function waitFor(taskId, label) {
  const started = Date.now();
  let delay = 2500;
  while (Date.now() - started < timeoutMs) {
    await sleep(delay);
    const task = await api(`/tasks/${encodeURIComponent(taskId)}`);
    if (task.status === "success") return task;
    if (task.status === "failed") throw new Error(`生成失败：${task.error || "未知错误"}`);
    delay = Math.min(6000, delay + 250);
    if ((Date.now() - started) % 30_000 < 4_000) {
      console.log(`  ${label}: ${task.status} (${Math.round((Date.now() - started) / 1000)}s)`);
    }
  }
  throw new Error(`等待超时（${Math.round(timeoutMs / 1000)}s），task_id=${taskId}`);
}

function run(command, argv) {
  return new Promise((resolve, reject) => {
    const p = spawn(command, argv, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", d => { err += d; });
    p.on("error", reject);
    p.on("close", code => code === 0 ? resolve() : reject(new Error(`${command} exited ${code}\n${err.slice(-1200)}`)));
  });
}

async function compress(source, target, categoryName, targetSize) {
  const outDir = path.dirname(target);
  await mkdir(outDir, { recursive: true });
  const qualities = categoryName === "cards" ? [84, 80, 76, 72] : [86, 82, 78, 74, 70];
  for (const q of qualities) {
    const resize = targetSize ? ["-resize", ...targetSize.split(/[x*]/)] : [];
    await run("/opt/homebrew/bin/cwebp", ["-quiet", "-q", String(q), "-m", "6", "-metadata", "none", ...resize, source, "-o", target]);
    const { size } = await import("node:fs/promises").then(fs => fs.stat(target));
    if (size <= 300 * 1024) return { quality: q, bytes: size };
  }
  throw new Error(`压缩后仍超过 300KB：${target}`);
}

async function processItem(item) {
  console.log(`→ ${item.id} (${item.size})`);
  let lastError;
  for (let attempt = 1; attempt <= retryLimit + 1; attempt++) {
    try {
      const submitted = await submit(item);
      if (!submitted.task_id) throw new Error(`创建任务未返回 task_id：${JSON.stringify(submitted)}`);
      console.log(`  ${item.id}: queued ${submitted.task_id}`);
      const result = await waitFor(submitted.task_id, item.id);
      if (!result.image_url) throw new Error("任务成功但没有 image_url");
      const rawPath = path.join(cacheDir, `${item.id}.png`);
      const dl = await fetch(result.image_url);
      if (!dl.ok) throw new Error(`下载图片失败 HTTP ${dl.status}`);
      await writeFile(rawPath, Buffer.from(await dl.arrayBuffer()));
      const target = path.join(ROOT, "web", item.output);
      const compressed = await compress(rawPath, target, item.category, item.targetSize);
      const record = {
        id: item.id,
        category: item.category,
        output: item.output,
        size: item.size,
        model: MODEL,
        quality: QUALITY,
        task_id: result.task_id,
        source_url: result.image_url,
        generated_at: new Date().toISOString(),
        webp_bytes: compressed.bytes,
        webp_quality: compressed.quality,
      };
      console.log(`✓ ${item.id}: ${Math.round(compressed.bytes / 1024)}KB webp`);
      if (!rawKeep) await rm(rawPath, { force: true });
      return record;
    } catch (error) {
      lastError = error;
      console.error(`! ${item.id} 第 ${attempt} 次失败：${error.message}`);
      if (attempt <= retryLimit) await sleep(attempt * 4000);
    }
  }
  throw lastError;
}

if (dryRun) {
  console.log(`将生成 ${selected.length} 张（${MODEL} / ${QUALITY} / 并发 ${concurrency}）：`);
  for (const item of selected) console.log(`- ${item.id} ${item.size} -> ${item.output}`);
  process.exit(0);
}

let log = {};
if (existsSync(logPath)) {
  try { log = JSON.parse(await readFile(logPath, "utf8")); } catch { log = {}; }
}

const queue = [...selected];
const completed = [];
const failed = [];
let cursor = 0;

async function worker(workerId) {
  while (true) {
    const index = cursor++;
    if (index >= queue.length) return;
    const item = queue[index];
    try {
      const record = await processItem(item);
      completed.push(record);
      log[item.id] = record;
      await writeFile(logPath, JSON.stringify(log, null, 2));
    } catch (error) {
      failed.push({ id: item.id, error: error.message });
      console.error(`✗ ${item.id}: ${error.message}`);
    }
  }
}

await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, (_, i) => worker(i + 1)));
await writeFile(logPath, JSON.stringify(log, null, 2));

console.log(`\n完成 ${completed.length}/${selected.length}；失败 ${failed.length}。`);
if (failed.length) {
  for (const f of failed) console.error(`- ${f.id}: ${f.error}`);
  process.exitCode = 1;
}
