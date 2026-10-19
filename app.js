(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle ---------- */
  const toggle = document.querySelector(".theme-toggle");
  const isDark = () =>
    root.dataset.theme ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  toggle.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* ---------- Bengaluru clock ---------- */
  const clock = document.getElementById("clock");
  const note = document.getElementById("clock-note");
  const fmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
  const hourFmt = new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" });
  function tick() {
    const now = new Date();
    clock.textContent = fmt.format(now).toUpperCase();
    const h = parseInt(hourFmt.format(now), 10);
    note.textContent =
      h < 7 ? "in Bengaluru · probably asleep" :
      h < 10 ? "in Bengaluru · coffee first" :
      h < 19 ? "in Bengaluru · probably shipping" :
      h < 23 ? "in Bengaluru · side-quest hours" : "in Bengaluru · should be asleep";
  }
  tick();
  setInterval(tick, 15000);

  /* ---------- Project filters ---------- */
  const filterBtns = document.querySelectorAll(".filters button");
  const projects = document.querySelectorAll(".proj:not(.cta)");
  const cta = document.querySelector(".proj.cta");
  filterBtns.forEach((btn) => {
    const f = btn.dataset.filter;
    const n = f === "all" ? projects.length
      : [...projects].filter((p) => p.dataset.tags.split(" ").includes(f)).length;
    const c = document.createElement("span");
    c.className = "count";
    c.textContent = n;
    btn.append(c);

    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      projects.forEach((p) => {
        p.hidden = !(f === "all" || p.dataset.tags.split(" ").includes(f));
        if (!p.hidden) p.classList.add("in");
      });
      if (cta) cta.hidden = f !== "all";
    });
  });

  /* ---------- Case-study dialog ---------- */
  const dlg = document.getElementById("case-dialog");
  const dlgHead = document.getElementById("dlg-head");
  const dlgNum = document.getElementById("dlg-num");
  const dlgTitle = document.getElementById("dlg-title");
  const dlgBody = document.getElementById("dlg-body");
  document.querySelectorAll("[data-case]").forEach((card) => {
    card.addEventListener("click", () => {
      const tpl = document.getElementById("case-" + card.dataset.case);
      if (!tpl) return;
      dlgNum.textContent = tpl.dataset.num;
      dlgTitle.innerHTML = tpl.dataset.title;
      dlgHead.className = "dlg-head tile-color";
      dlgHead.style.background = `var(--${tpl.dataset.color})`;
      dlgHead.style.color = "var(--on-color)";
      dlgBody.replaceChildren(tpl.content.cloneNode(true));
      dlgBody.scrollTop = 0;
      dlg.showModal();
    });
  });
  dlg.querySelector(".dlg-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

  /* ---------- Copy email ---------- */
  const toast = document.getElementById("toast");
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  }
  document.getElementById("copy-email").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("hardik96m@gmail.com");
      showToast("Email copied ✓");
    } catch (e) {
      showToast("hardik96m@gmail.com");
    }
  });

  /* ---------- Placeholder socials ---------- */
  document.querySelectorAll(".todo").forEach((el) =>
    el.addEventListener("click", () => showToast("Coming soon"))
  );

  /* ---------- Wave + confetti easter egg ---------- */
  const wave = document.querySelector(".wave");
  wave.addEventListener("click", () => {
    wave.classList.remove("go"); void wave.offsetWidth; wave.classList.add("go");
  });

  const sticker = document.getElementById("sticker");
  const bits = ["✦", "🚀", "✨", "⚡", "🎉", "🧠"];
  function burst(x, y) {
    if (reduceMotion) { showToast("🎉"); return; }
    for (let i = 0; i < 18; i++) {
      const s = document.createElement("span");
      s.className = "confetti";
      s.textContent = bits[i % bits.length];
      s.style.left = x + "px";
      s.style.top = y + "px";
      document.body.append(s);
      const a = Math.random() * Math.PI * 2;
      const d = 80 + Math.random() * 140;
      s.animate(
        [
          { transform: "translate(-50%,-50%) scale(.6)", opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d + 60}px)) rotate(${(Math.random() - .5) * 360}deg) scale(1)`, opacity: 0 }
        ],
        { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.2,.7,.3,1)" }
      ).onfinish = () => s.remove();
    }
  }
  const pop = (e) => {
    const r = sticker.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2);
  };
  sticker.addEventListener("click", pop);
  sticker.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pop(); } });

  /* ---------- Hero blobs follow the pointer ---------- */
  const hero = document.getElementById("hero");
  const blobs = hero.querySelectorAll(".blob");
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const loop = () => {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      blobs.forEach((b, i) => {
        const k = (i + 1) * 0.6;
        b.style.transform = `translate(${cx * k}px, ${cy * k}px)`;
      });
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3 ? requestAnimationFrame(loop) : null;
    };
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 60;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 60;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    hero.addEventListener("pointerleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  }

  /* ---------- Agent mode ---------- */
  const agent = document.getElementById("agent");
  const agentBody = document.getElementById("agent-body");
  const agentToggle = document.querySelector(".agent-toggle");
  let agentText = null;

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function renderMarkdown(md) {
    return md.split("\n").map((line) => {
      let html = esc(line).replace(/(https?:\/\/[^\s)|]+)/g, '<a href="$1">$1</a>');
      if (/^# /.test(line)) return `<span class="h1">${html}</span>`;
      if (/^## /.test(line)) return `<span class="h2">${html}</span>`;
      if (/^### /.test(line)) return `<span class="h3">${html}</span>`;
      if (/^> /.test(line)) return `<span class="q">${html}</span>`;
      if (/^\|/.test(line)) return `<span class="tb">${html}</span>`;
      if (/^- /.test(line)) return `<span class="li">${html}</span>`;
      return html;
    }).join("\n");
  }
  async function loadAgentText() {
    if (agentText !== null) return agentText;
    try {
      const res = await fetch("llms-full.txt", { cache: "no-cache" });
      if (!res.ok) throw new Error(res.status);
      agentText = await res.text();
    } catch (e) {
      agentText = "";
    }
    return agentText;
  }
  async function openAgent(push = true) {
    agent.hidden = false;
    document.body.classList.add("agent-open");
    agentToggle.setAttribute("aria-pressed", "true");
    if (push && location.hash !== "#agent") history.replaceState(null, "", "#agent");
    const text = await loadAgentText();
    agentBody.innerHTML = text
      ? renderMarkdown(text)
      : "Couldn't load llms-full.txt here (open the site over http, not as a local file).";
    agentBody.focus({ preventScroll: true });
  }
  function closeAgent() {
    agent.hidden = true;
    document.body.classList.remove("agent-open");
    agentToggle.setAttribute("aria-pressed", "false");
    if (location.hash === "#agent") history.replaceState(null, "", location.pathname + location.search);
    agentToggle.focus({ preventScroll: true });
  }
  agentToggle.addEventListener("click", () => (agent.hidden ? openAgent() : closeAgent()));
  document.getElementById("agent-close").addEventListener("click", closeAgent);
  document.getElementById("agent-copy").addEventListener("click", async () => {
    const text = await loadAgentText();
    try { await navigator.clipboard.writeText(text); showToast("Copied for your agent ✓"); }
    catch (e) { showToast("Copy failed: use Download .md"); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !agent.hidden) closeAgent();
  });
  window.addEventListener("hashchange", () => {
    if (location.hash === "#agent" && agent.hidden) openAgent(false);
  });
  if (location.hash === "#agent" || new URLSearchParams(location.search).get("mode") === "agent") openAgent(false);

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }
})();
