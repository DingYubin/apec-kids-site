/* ================================================================
   《小鹏友的APEC朋友圈》交互脚本
   内容数据在 data.js，这里只负责"让页面动起来"。
   ================================================================ */
(function () {
  "use strict";

  /* ---------- 小工具 ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

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

  /* 图片加载失败就自动隐藏，露出底下的表情占位图 */
  const imgTag = (src, alt, cls) =>
    `<img src="${src}" alt="${alt || ""}"${cls ? ` class="${cls}"` : ""} loading="lazy" onerror="this.remove()">`;

  /* ================= 1. 首页 ================= */
  function initHero() {
    /* 背景图：有 assets/home-bg.webp 就用，没有就用 CSS 画的风景 */
    const hero = $(".hero");
    const photo = $("#heroPhoto");
    if (photo) {
      const test = new Image();
      test.onload = () => hero.classList.add("has-photo");
      test.src = `assets/home-bg.${ASSET_EXT}`;
      photo.style.backgroundImage = `url("assets/home-bg.${ASSET_EXT}")`;
    }

    /* 21个小气泡：点一下，说一句"你好" */
    const field = $("#bubbleField");
    if (!field) return;
    const spots = [
      [6, 12], [18, 6], [34, 4], [52, 3], [70, 5], [86, 10], [94, 22],
      [95, 38], [93, 54], [95, 70], [88, 84], [74, 92], [58, 94],
      [42, 95], [26, 92], [12, 85], [4, 70], [3, 52], [4, 34],
      [14, 24], [28, 14],
    ];
    const toast = document.createElement("div");
    toast.className = "bubble-toast";
    document.body.appendChild(toast);

    ECONOMIES.forEach((eco, i) => {
      const [x, y] = spots[i % spots.length];
      const size = 34 + (i % 4) * 5;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "bubble";
      b.tabIndex = -1;
      b.style.left = x + "%";
      b.style.top = y + "%";
      b.style.width = size + "px";
      b.style.height = size + "px";
      b.style.background = `radial-gradient(circle at 32% 28%, rgba(255,255,255,.9), hsl(${eco.hue} 72% 62%))`;
      b.style.animationDelay = (i * 0.27).toFixed(2) + "s";
      b.title = eco.name;
      const say = eco.text.split(/[！!]/)[0];
      b.addEventListener("click", () => {
        toast.textContent = `${eco.name} · ${say}`;
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
    if (!grid) return;
    grid.innerHTML = ECONOMIES.map((eco) => `
      <article class="card" data-id="${eco.id}" aria-label="${eco.name}，APEC成员经济体">
        <div class="card-inner">
          <button type="button" class="card-face card-front" data-flip="open" aria-expanded="false" aria-controls="card-back-${eco.id}" aria-label="翻开${eco.name}卡片" style="--h:${eco.hue}deg">
            <span class="ph" aria-hidden="true">${eco.emoji}</span>
            ${imgTag(eco.img, eco.name + "插画")}
            <span class="card-num">${eco.id}</span>
            <span class="card-name">${eco.name}</span>
          </button>
          <div class="card-face card-back" id="card-back-${eco.id}" aria-hidden="true" inert>
            <p class="cb-name">${eco.id}. ${eco.name}</p>
            <p class="cb-text">${eco.text}</p>
            <button type="button" class="cb-star" data-star="${eco.id}" aria-pressed="false" disabled>☆ 学会这句问候语</button>
            <button type="button" class="cb-flip" data-flip="close">翻回卡片正面</button>
          </div>
        </div>
      </article>`).join("");
  }

  function initWall() {
    const stars = store.get(KEY.stars, {});
    const setFlipped = (card, flipped, moveFocus) => {
      const front = card.querySelector(".card-front");
      const back = card.querySelector(".card-back");
      const star = back.querySelector(".cb-star");
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
      const n = ECONOMIES.filter((e) => stars[e.id]).length;
      const a = $("#starCount"), b = $("#starCount2");
      if (a) a.textContent = n;
      if (b) b.textContent = n;
      $$("[data-star]").forEach((el) => {
        const on = !!stars[el.dataset.star];
        el.classList.toggle("on", on);
        el.setAttribute("aria-pressed", String(on));
        el.textContent = on ? "⭐ 已经学会啦！" : "☆ 学会这句问候语";
      });
    };

    $("#cardGrid").addEventListener("click", (ev) => {
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
      ECONOMIES.forEach((e) => { delete stars[e.id]; });
      store.set(KEY.stars, stars);
      sync();
    });

    sync();
  }

  /* ================= 3. 朋友圈 ================= */
  function renderFeed() {
    const feed = $("#feed");
    if (!feed) return;
    const liked = store.get(KEY.likes, {});

    feed.innerHTML = MOMENTS.map((m) => {
      const media = m.images.length > 1 ? "multi" : "one";
      return `
      <article class="post">
        <span class="post-avatar" data-emoji="${m.emoji}">${imgTag(m.avatar, m.name + "的头像")}</span>
        <div>
          <div class="post-head">
            <span class="post-name">${m.name}</span>
            <span class="post-place">${m.place}</span>
            <span class="post-time">${m.time}</span>
          </div>
          ${m.badge ? `<span class="post-badge">${m.badge}</span>` : ""}
          <p class="post-text">${m.text}</p>
          <div class="post-media ${media}">
            ${m.images.map((im) => `<span class="media" data-emoji="${im.emoji}">${imgTag(im.src, im.alt)}</span>`).join("")}
          </div>
          <div class="post-foot">
            <button type="button" class="like-btn${liked[m.id] ? " liked" : ""}" data-like="${m.id}" aria-pressed="${!!liked[m.id]}">
              ❤ 点赞 <b>${m.likes + (liked[m.id] ? 1 : 0)}</b>
            </button>
          </div>
          <ul class="comments">
            ${m.comments.map((c) => `<li><b>${c.who}：</b>${c.text}</li>`).join("")}
          </ul>
        </div>
      </article>`;
    }).join("");

    feed.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-like]");
      if (!btn) return;
      const id = btn.dataset.like;
      liked[id] = !liked[id];
      store.set(KEY.likes, liked);
      const base = MOMENTS.find((m) => m.id === id).likes;
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
    if (grid) {
      grid.innerHTML = NANSHAN.map((c) => `
        <article class="ns-card reveal">
          <div class="ns-media" data-emoji="${c.emoji}">${imgTag(c.img, c.title + "插画")}</div>
          <div class="ns-body">
            <span class="ns-tag">${c.tag}</span>
            <h3 class="ns-title">${c.title}</h3>
            <div class="ns-lines">${c.lines.map((l) => `<p>${l}</p>`).join("")}</div>
          </div>
        </article>`).join("");
    }
    const tl = $("#timeline");
    if (tl) {
      tl.innerHTML = TIMELINE.map((t) => `
        <li><span class="tl-year">${t.year}</span><span class="tl-text">${t.text}</span></li>`).join("");
    }
  }

  /* ================= 5. 测验 ================= */
  function initQuiz() {
    const box = $("#quizBox");
    if (!box) return;
    const pool = QUIZ.filter((q) => !q.backup);
    let i = 0, score = 0;

    function start() {
      i = 0; score = 0; render();
    }

    function render() {
      const q = pool[i];
      const pct = Math.round((i / pool.length) * 100);
      box.innerHTML = `
        <div class="quiz-top">
          <span class="quiz-count">第 ${i + 1} / ${pool.length} 题</span>
          <span class="quiz-score" aria-live="polite">⭐ ${score} 分</span>
          <div class="progress"><i style="width:${pct}%"></i></div>
        </div>
        <h4 class="quiz-q">${q.q}</h4>
        <div class="quiz-options">
          ${q.options.map((o, idx) => `<button type="button" class="opt" data-idx="${idx}">${String.fromCharCode(65 + idx)}. ${o}</button>`).join("")}
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
          $("#quizFb").innerHTML = `
            <div class="quiz-feedback ${ok ? "ok" : "no"}">
              <p><b>${ok ? "✅ 答对啦！" : "💡 再想想～正确答案是：" + q.options[q.answer]}</b></p>
              <p class="tip">${q.tip}</p>
              <button type="button" class="btn primary" id="quizNext">${last ? "看看我的成绩 →" : "下一题 →"}</button>
            </div>`;
          $("#quizNext").addEventListener("click", () => {
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
      $("#quizAgain").addEventListener("click", start);
      if (perfect) confetti(box.querySelector(".confetti"));
    }

    function confetti(host) {
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
    let notes = store.get(KEY.notes, null);
    if (!notes) { notes = NOTE_SEED.slice(); store.set(KEY.notes, notes); }

    function render() {
      wall.innerHTML = "";
      notes.forEach((n, idx) => {
        const el = document.createElement("div");
        el.className = "note n" + ((idx % 5) + 1);
        const p = document.createElement("p");
        p.textContent = n.text;               /* textContent：安全，不会被当成代码 */
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
      const name = $("#noteName").value.trim() || "一位小鹏友";
      const text = $("#noteText").value.trim();
      if (!text) return;
      notes.push({ name: name, text: text });
      store.set(KEY.notes, notes);
      $("#noteText").value = "";
      render();
      wall.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
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
    let done = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting || done) return;
        done = true;
        lines.forEach((p, i) => setTimeout(() => p.classList.add("lit"), i * 320));
        setTimeout(() => {
          $$(".lamp", lamps).forEach((l, i) => setTimeout(() => l.classList.add("lit"), i * 70));
          const tag = $("#endingTag");
          if (tag) tag.hidden = false;
        }, lines.length * 320);
      });
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
    const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
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
    let idx = Math.floor(Math.random() * PENGYOU_TIPS.length);
    btn.addEventListener("click", () => {
      bubble.textContent = "🐦 " + PENGYOU_TIPS[idx % PENGYOU_TIPS.length];
      idx++;
      bubble.hidden = false;
      clearTimeout(btn._t);
      btn._t = setTimeout(() => { bubble.hidden = true; }, 7000);
    });
  }

  /* ================= 10. 页脚署名 ================= */
  function initCredits() {
    const r = $("#creditResearch"), c = $("#creditCode");
    if (r) r.textContent = CREDITS.research;
    if (c) c.textContent = CREDITS.code;
  }

  /* ================= 启动 ================= */
  document.addEventListener("DOMContentLoaded", () => {
    initHero();
    renderWall();
    initWall();
    renderFeed();
    renderNanshan();
    initQuiz();
    initNotes();
    initEnding();
    initReveal();
    initNav();
    initEgg();
    initCredits();
  });
})();
