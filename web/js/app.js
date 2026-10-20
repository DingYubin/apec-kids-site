/* ================================================================
   《小鹏友的APEC朋友圈》交互脚本
   内容数据在 data.js，这里只负责“让页面动起来”。
   任何一块数据或图片缺失，都尽量退回到可读的静态占位。
   ================================================================ */
(function () {
  "use strict";

  /* ---------- 小工具 ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const isPlainObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);
  const esc = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]));

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 无痕模式也没关系 */ }
    },
  };

  const KEY = { stars: "apec-stars", likes: "apec-likes", notes: "apec-notes" };

  /* 资源清单由 assets-manifest.js 提供：文件不在清单里，就直接显示 emoji/CSS 占位。 */
  function hasAsset(src) {
    if (!src) return false;
    const manifest = window.APEC_ASSET_MANIFEST;
    if (!manifest) return true; /* 清单没加载时仍可尝试图片，img 的 onerror 再兜底 */
    try {
      if (typeof manifest.has === "function") return manifest.has(src);
      if (Array.isArray(manifest)) return manifest.includes(src);
    } catch (e) { /* 清单异常时交给 onerror */ }
    return true;
  }

  /* 图片不可用时自动移除，露出底下的表情/CSS 占位。 */
  const imgTag = (src, alt, cls) => {
    if (!hasAsset(src)) return "";
    const className = cls ? ` class="${esc(cls)}"` : "";
    return `<img src="${esc(src)}" alt="${esc(alt || "")}"${className} loading="lazy" decoding="async" onerror="this.remove()">`;
  };

  let initFailureCount = 0;
  function showFallbackNotice() {
    const notice = $("#appFallback");
    if (notice) notice.hidden = false;
  }

  /* 某一块脚本出错时，不影响其他栏目继续初始化。 */
  function safeInit(name, fn) {
    try {
      fn();
    } catch (error) {
      initFailureCount++;
      showFallbackNotice();
      if (window.console && console.warn) console.warn(`[APEC] ${name} 初始化失败：`, error);
    }
  }

  /* ================= 1. 首页 ================= */
  function initHero() {
    const hero = $(".hero");
    const photo = $("#heroPhoto");
    const bgSrc = `assets/home-bg.${ASSET_EXT}`;
    if (hero && photo && hasAsset(bgSrc)) {
      const test = new Image();
      test.onload = () => hero.classList.add("has-photo");
      test.onerror = () => {
        hero.classList.remove("has-photo");
        photo.style.backgroundImage = "";
      };
      test.src = bgSrc;
      photo.style.backgroundImage = `url("${bgSrc}")`;
    }

    const field = $("#bubbleField");
    if (!field || !Array.isArray(ECONOMIES)) return;
    const spots = [
      [6, 12], [18, 6], [34, 4], [52, 3], [70, 5], [86, 10], [94, 22],
      [95, 38], [93, 54], [95, 70], [88, 84], [74, 92], [58, 94],
      [42, 95], [26, 92], [12, 85], [4, 70], [3, 52], [4, 34],
      [14, 24], [28, 14],
    ];
    const toast = document.createElement("div");
    toast.className = "bubble-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);

    ECONOMIES.forEach((eco, i) => {
      const [x, y] = spots[i % spots.length];
      const size = 34 + (i % 4) * 5;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "bubble";
      b.tabIndex = -1;
      b.setAttribute("aria-hidden", "true");
      b.style.left = x + "%";
      b.style.top = y + "%";
      b.style.width = size + "px";
      b.style.height = size + "px";
      b.style.background = `radial-gradient(circle at 32% 28%, rgba(255,255,255,.9), hsl(${Number(eco.hue) || 210} 72% 62%))`;
      b.style.animationDelay = (i * 0.27).toFixed(2) + "s";
      const name = String(eco.name || "一位亚太朋友");
      const text = String(eco.text || "你好！");
      b.title = name;
      const say = text.split(/[！!]/)[0];
      b.addEventListener("click", () => {
        toast.textContent = `${name} · ${say}`;
        toast.classList.add("show");
        clearTimeout(b._t);
        b._t = setTimeout(() => toast.classList.remove("show"), 1600);
      });
      field.appendChild(b);
    });
  }

  /* ================= 2. 班级墙 ================= */
  function renderWall() {
    const grid = $("#cardGrid");
    if (!grid || !Array.isArray(ECONOMIES)) return;
    grid.innerHTML = ECONOMIES.map((eco) => `
      <article class="card" data-id="${Number(eco.id) || ""}" aria-label="${esc(eco.name)}，APEC成员经济体">
        <div class="card-inner">
          <button type="button" class="card-face card-front" data-flip="open" aria-expanded="false" aria-controls="card-back-${Number(eco.id)}" aria-label="翻开${esc(eco.name)}卡片" style="--h:${Number(eco.hue) || 210}deg">
            <span class="ph" aria-hidden="true">${esc(eco.emoji || "🌏")}</span>
            ${imgTag(eco.img, `${eco.name}插画`)}
            <span class="card-num">${Number(eco.id)}</span>
            <span class="card-name">${esc(eco.name)}</span>
          </button>
          <div class="card-face card-back" id="card-back-${Number(eco.id)}" aria-hidden="true" inert>
            <p class="cb-name">${Number(eco.id)}. ${esc(eco.name)}</p>
            <p class="cb-text">${esc(eco.text)}</p>
            <button type="button" class="cb-star" data-star="${Number(eco.id)}" aria-pressed="false" disabled>☆ 学会这句问候语</button>
            <button type="button" class="cb-flip" data-flip="close">翻回卡片正面</button>
          </div>
        </div>
      </article>`).join("");
  }

  function initWall() {
    const grid = $("#cardGrid");
    if (!grid || !Array.isArray(ECONOMIES)) return;
    const savedStars = store.get(KEY.stars, {});
    const stars = isPlainObject(savedStars) ? savedStars : {};
    Object.keys(stars).forEach((key) => { if (stars[key] !== true) delete stars[key]; });

    const setFlipped = (card, flipped, moveFocus) => {
      if (!card) return;
      const front = card.querySelector(".card-front");
      const back = card.querySelector(".card-back");
      const star = back && back.querySelector(".cb-star");
      if (!front || !back || !star) return;
      card.classList.toggle("flipped", flipped);
      front.setAttribute("aria-expanded", String(flipped));
      front.setAttribute("aria-hidden", String(flipped));
      front.inert = flipped;
      back.setAttribute("aria-hidden", String(!flipped));
      back.inert = !flipped;
      star.disabled = !flipped;
      if (moveFocus) (flipped ? star : front).focus();
    };

    const sync = () => {
      const n = ECONOMIES.filter((e) => stars[String(e.id)] === true).length;
      const a = $("#starCount"), b = $("#starCount2");
      if (a) a.textContent = n;
      if (b) b.textContent = n;
      $$("[data-star]").forEach((el) => {
        const on = stars[el.dataset.star] === true;
        el.classList.toggle("on", on);
        el.setAttribute("aria-pressed", String(on));
        el.textContent = on ? "⭐ 已经学会啦！" : "☆ 学会这句问候语";
      });
    };

    grid.addEventListener("click", (ev) => {
      const star = ev.target.closest("[data-star]");
      if (star) {
        ev.stopPropagation();
        const id = star.dataset.star;
        stars[id] = !stars[id];
        store.set(KEY.stars, stars);
        sync();
        return;
      }
      const flip = ev.target.closest("[data-flip]");
      if (!flip) return;
      ev.stopPropagation();
      setFlipped(flip.closest(".card"), flip.dataset.flip === "open", ev.detail === 0);
    });

    const reset = $("#starReset");
    if (reset) reset.addEventListener("click", () => {
      if (!window.confirm("要清空全部21颗星标吗？这个操作不会删除卡片。")) return;
      ECONOMIES.forEach((e) => { delete stars[String(e.id)]; });
      store.set(KEY.stars, stars);
      sync();
    });

    sync();
  }

  /* ================= 3. 朋友圈 ================= */
  function renderFeed() {
    const feed = $("#feed");
    if (!feed || !Array.isArray(MOMENTS)) return;
    const savedLikes = store.get(KEY.likes, {});
    const liked = isPlainObject(savedLikes) ? savedLikes : {};
    Object.keys(liked).forEach((key) => { if (liked[key] !== true) delete liked[key]; });

    feed.innerHTML = MOMENTS.map((m) => {
      const images = Array.isArray(m.images) ? m.images : [];
      const comments = Array.isArray(m.comments) ? m.comments : [];
      const media = images.length > 1 ? "multi" : "one";
      const baseLikes = Number(m.likes) || 0;
      const isLiked = liked[m.id] === true;
      return `
      <article class="post">
        <span class="post-avatar" data-emoji="${esc(m.emoji || "🙂")}">${imgTag(m.avatar, `${m.name}的头像`)}</span>
        <div>
          <div class="post-head">
            <span class="post-name">${esc(m.name)}</span>
            <span class="post-place">${esc(m.place)}</span>
            <span class="post-time">${esc(m.time)}</span>
          </div>
          ${m.badge ? `<span class="post-badge">${esc(m.badge)}</span>` : ""}
          <p class="post-text">${esc(m.text)}</p>
          ${images.length ? `<div class="post-media ${media}">
            ${images.map((im) => `<span class="media" data-emoji="${esc(im.emoji || "🖼️")}">${imgTag(im.src, im.alt)}</span>`).join("")}
          </div>` : ""}
          <div class="post-foot">
            <button type="button" class="like-btn${isLiked ? " liked" : ""}" data-like="${esc(m.id)}" aria-pressed="${isLiked}">
              ❤ 点赞 <b>${baseLikes + (isLiked ? 1 : 0)}</b>
            </button>
          </div>
          ${comments.length ? `<ul class="comments">
            ${comments.map((c) => `<li><b>${esc(c.who)}：</b>${esc(c.text)}</li>`).join("")}
          </ul>` : ""}
        </div>
      </article>`;
    }).join("");

    feed.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-like]");
      if (!btn) return;
      const id = btn.dataset.like;
      const post = MOMENTS.find((m) => String(m.id) === id);
      if (!post) return;
      liked[id] = !liked[id];
      store.set(KEY.likes, liked);
      const base = Number(post.likes) || 0;
      const num = btn.querySelector("b");
      if (num) num.textContent = base + (liked[id] ? 1 : 0);
      btn.classList.toggle("liked", !!liked[id]);
      btn.setAttribute("aria-pressed", String(!!liked[id]));
      btn.classList.remove("pop");
      void btn.offsetWidth;
      btn.classList.add("pop");
    });
  }

  /* ================= 4. 南山五张卡 ================= */
  function renderNanshan() {
    const grid = $("#nsGrid");
    if (grid && Array.isArray(NANSHAN)) {
      grid.innerHTML = NANSHAN.map((c) => `
        <article class="ns-card reveal">
          <div class="ns-media" data-emoji="${esc(c.emoji || "🌉")}">${imgTag(c.img, `${c.title}插画`)}</div>
          <div class="ns-body">
            <span class="ns-tag">${esc(c.tag)}</span>
            <h3 class="ns-title">${esc(c.title)}</h3>
            <div class="ns-lines">${(Array.isArray(c.lines) ? c.lines : []).map((l) => `<p>${esc(l)}</p>`).join("")}</div>
          </div>
        </article>`).join("");
    }
    const tl = $("#timeline");
    if (tl && Array.isArray(TIMELINE)) {
      tl.innerHTML = TIMELINE.map((t) => `
        <li><span class="tl-year">${esc(t.year)}</span><span class="tl-text">${esc(t.text)}</span></li>`).join("");
    }
  }

  /* ================= 5. 测验 ================= */
  function initQuiz() {
    const box = $("#quizBox");
    if (!box) return;
    const pool = (Array.isArray(QUIZ) ? QUIZ : []).filter((q) =>
      q && typeof q.q === "string" && Array.isArray(q.options) &&
      q.options.length > 0 && Number.isInteger(q.answer) &&
      q.answer >= 0 && q.answer < q.options.length && !q.backup
    );
    if (!pool.length) {
      box.innerHTML = '<p class="empty-note">小测验暂时休息一下，先翻翻上面的卡片吧。</p>';
      return;
    }
    let i = 0, score = 0;

    function start() {
      i = 0;
      score = 0;
      render();
    }

    function render() {
      const q = pool[i];
      const pct = Math.round(((i + 1) / pool.length) * 100);
      box.innerHTML = `
        <div class="quiz-top">
          <span class="quiz-count">第 ${i + 1} / ${pool.length} 题</span>
          <span class="quiz-score" aria-live="polite">⭐ ${score} 分</span>
          <div class="progress" role="progressbar" aria-label="答题进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>
        </div>
        <h4 class="quiz-q">${esc(q.q)}</h4>
        <div class="quiz-options">
          ${q.options.map((o, idx) => `<button type="button" class="opt" data-idx="${idx}">${String.fromCharCode(65 + idx)}. ${esc(o)}</button>`).join("")}
        </div>
        <div id="quizFb" aria-live="polite" aria-atomic="true"></div>`;

      box.querySelectorAll(".opt").forEach((btn) => {
        btn.addEventListener("click", () => {
          const pick = Number(btn.dataset.idx);
          const ok = pick === q.answer;
          if (ok) score++;
          const scoreEl = box.querySelector(".quiz-score");
          if (scoreEl) scoreEl.textContent = `⭐ ${score} 分`;
          box.querySelectorAll(".opt").forEach((b) => {
            b.disabled = true;
            const idx = Number(b.dataset.idx);
            if (idx === q.answer) b.classList.add("right");
            else if (idx === pick) b.classList.add("wrong");
          });
          const last = i === pool.length - 1;
          const feedback = $("#quizFb", box);
          if (!feedback) return;
          feedback.innerHTML = `
            <div class="quiz-feedback ${ok ? "ok" : "no"}">
              <p><b>${ok ? "✅ 答对啦！" : `💡 再想想～正确答案是：${esc(q.options[q.answer])}`}</b></p>
              <p class="tip">${esc(q.tip || "每多了解一点，就离亚太朋友更近一点。")}</p>
              <button type="button" class="btn primary" id="quizNext">${last ? "看看我的成绩 →" : "下一题 →"}</button>
            </div>`;
          const next = $("#quizNext", box);
          if (next) next.addEventListener("click", () => {
            if (last) result(); else { i++; render(); }
          });
        });
      });
    }

    function result() {
      const perfect = score === pool.length;
      box.innerHTML = `
        <div class="quiz-result">
          <p class="big">${perfect ? "🎉" : score >= pool.length - 2 ? "👏" : "💪"}</p>
          <h4>${perfect ? "全对！你是APEC小达人！" : `你答对了 ${score} / ${pool.length} 题`}</h4>
          <p>${perfect
            ? "鹏小友飞出来转圈圈：深圳欢迎你，亚太欢迎你！"
            : "没关系，翻回上面的班级墙再逛一圈，回来一定全对！"}</p>
          <button type="button" class="btn primary" id="quizAgain">再玩一次 🎯</button>
          <div class="confetti" aria-hidden="true"></div>
        </div>`;
      const again = $("#quizAgain", box);
      if (again) again.addEventListener("click", start);
      if (perfect) confetti(box.querySelector(".confetti"));
    }

    function confetti(host) {
      if (!host) return;
      const colors = ["#ffc93c", "#ff7043", "#2fc39b", "#1f7ae0", "#ff8fb1"];
      for (let n = 0; n < 26; n++) {
        const s = document.createElement("i");
        s.style.left = 12 + Math.random() * 76 + "%";
        s.style.background = colors[n % colors.length];
        s.style.setProperty("--dx", (Math.random() * 160 - 80).toFixed(0) + "px");
        s.style.animationDelay = (Math.random() * 0.6).toFixed(2) + "s";
        host.appendChild(s);
      }
    }

    start();
  }

  /* ================= 6. 留言墙 ================= */
  function initNotes() {
    const wall = $("#noteWall");
    const form = $("#noteForm");
    if (!wall || !form) return;

    const cleanNote = (note) => {
      if (!isPlainObject(note) || typeof note.text !== "string") return null;
      const text = note.text.replace(/\s+/g, " ").trim().slice(0, 60);
      if (!text) return null;
      const name = typeof note.name === "string" && note.name.trim()
        ? note.name.replace(/\s+/g, " ").trim().slice(0, 12)
        : "一位小鹏友";
      return { name, text };
    };
    const seedNotes = () => (Array.isArray(NOTE_SEED) ? NOTE_SEED : []).map(cleanNote).filter(Boolean);
    const rawNotes = store.get(KEY.notes, null);
    let notes;
    if (!Array.isArray(rawNotes)) {
      notes = seedNotes();
      store.set(KEY.notes, notes);
    } else {
      const cleaned = rawNotes.map(cleanNote).filter(Boolean).slice(-100);
      notes = rawNotes.length > 0 && cleaned.length === 0 ? seedNotes() : cleaned;
      if (notes !== cleaned) store.set(KEY.notes, notes);
    }

    function render() {
      wall.innerHTML = "";
      if (!notes.length) {
        const empty = document.createElement("p");
        empty.className = "empty-note";
        empty.textContent = "留言墙还是空的，来贴第一句话吧。";
        wall.appendChild(empty);
        return;
      }
      notes.forEach((n, idx) => {
        const el = document.createElement("div");
        el.className = "note n" + ((idx % 5) + 1);
        const p = document.createElement("p");
        p.textContent = n.text; /* textContent：安全，不会被当成代码 */
        const who = document.createElement("p");
        who.className = "who";
        who.textContent = "—— " + (n.name || "一位小鹏友");
        el.appendChild(p);
        el.appendChild(who);
        wall.appendChild(el);
      });
    }

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const nameInput = $("#noteName");
      const textInput = $("#noteText");
      if (!textInput) return;
      const name = (nameInput && nameInput.value.trim()) || "一位小鹏友";
      const text = textInput.value.trim();
      if (!text) return;
      notes.push({ name: name.slice(0, 12), text: text.slice(0, 60) });
      notes = notes.slice(-100);
      store.set(KEY.notes, notes);
      textInput.value = "";
      render();
      if (wall.lastElementChild) {
        try { wall.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" }); }
        catch (e) { /* 老浏览器没有平滑滚动也没关系 */ }
      }
    });

    render();
  }

  /* ================= 7. 结语诗 + 21盏小灯 ================= */
  function initEnding() {
    const ending = $("#ending");
    const lamps = $("#lamps");
    if (!ending || !lamps) return;
    for (let i = 0; i < 21; i++) {
      const l = document.createElement("span");
      l.className = "lamp";
      lamps.appendChild(l);
    }
    const lines = $$("#endingPoem p");
    const tag = $("#endingTag");
    let done = false;
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finish = () => {
      if (done) return;
      done = true;
      const lineDelay = reduceMotion ? 0 : 180;
      const lampDelay = reduceMotion ? 0 : 45;
      lines.forEach((p, i) => setTimeout(() => p.classList.add("lit"), i * lineDelay));
      const lampStart = lines.length * lineDelay;
      setTimeout(() => {
        $$(".lamp", lamps).forEach((l, i) => setTimeout(() => l.classList.add("lit"), i * lampDelay));
        if (tag) tag.hidden = false;
      }, lampStart);
    };

    if (!("IntersectionObserver" in window)) {
      finish();
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        finish();
        io.disconnect();
      }
    }, { threshold: 0.35 });
    io.observe(ending);
  }

  /* ================= 8. 滚动渐显 + 导航高亮 ================= */
  function initReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
  }

  function initNav() {
    const links = $$(".nav-link");
    if (!links.length) return;
    if (!("IntersectionObserver" in window)) {
      links[0].classList.add("active");
      return;
    }
    const map = new Map(links.map((a) => [String(a.getAttribute("href") || "").replace(/^#/, ""), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((l) => l.classList.remove("active"));
        const link = map.get(en.target.id);
        if (link) link.classList.add("active");
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    ["home", "wall", "moments", "nanshan", "action"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* ================= 9. 鹏小友彩蛋 ================= */
  function initEgg() {
    const btn = $("#eggBtn"), bubble = $("#eggBubble");
    if (!btn || !bubble) return;
    const tips = Array.isArray(PENGYOU_TIPS) && PENGYOU_TIPS.length
      ? PENGYOU_TIPS
      : ["欢迎来深圳！点一点页面里的卡片，也许会发现新朋友。"];
    let idx = Math.floor(Math.random() * tips.length);
    btn.addEventListener("click", () => {
      bubble.textContent = "🐦 " + tips[idx % tips.length];
      idx++;
      bubble.hidden = false;
      clearTimeout(btn._t);
      btn._t = setTimeout(() => { bubble.hidden = true; }, 7000);
    });
  }

  /* ================= 10. 页脚署名 ================= */
  function initCredits() {
    const r = $("#creditResearch"), c = $("#creditCode");
    if (r && CREDITS && CREDITS.research) r.textContent = CREDITS.research;
    if (c && CREDITS && CREDITS.code) c.textContent = CREDITS.code;
  }

  /* ================= 启动 ================= */
  function start() {
    const reload = $("#appReload");
    if (reload) reload.addEventListener("click", () => window.location.reload());

    [
      ["首页", initHero],
      ["班级墙渲染", renderWall],
      ["班级墙交互", initWall],
      ["朋友圈", renderFeed],
      ["南山卡片", renderNanshan],
      ["知识测验", initQuiz],
      ["留言墙", initNotes],
      ["结语", initEnding],
      ["滚动渐显", initReveal],
      ["导航", initNav],
      ["彩蛋", initEgg],
      ["署名", initCredits],
    ].forEach(([name, fn]) => safeInit(name, fn));

    const bootState = window.__APEC_BOOT_STATE__ || (window.__APEC_BOOT_STATE__ = {});
    bootState.started = true;
    bootState.failureCount = initFailureCount;
    clearTimeout(window.__apecBootTimer);

    /* 正常启动后收起看门狗提示；局部初始化出错时保留提示。 */
    if (initFailureCount === 0 && !bootState.scriptError) {
      const notice = $("#appFallback");
      if (notice) notice.hidden = true;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
