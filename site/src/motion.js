import content from "./content.json";
import "./motion.css";
import "./creative.css";
import { FramePacks } from "./frame-packs.js";
import { initDetails } from "./details.js";

const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const mediaRoot = "/media/journey/";

export function initMotion() {
  const root = document.documentElement;
  const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  let motionOptIn = false;
  const reduced = () =>
    !motionOptIn && (reducedQuery.matches || root.dataset.reducedMotion === "true");
  const chapters = content.journey.chapters;
  document.querySelector("#packages").insertAdjacentHTML(
    "afterend",
    `
    <section class="surf-journey" id="surf-journey" aria-label="An illustrated journey from the shore to surfing">
      <div class="journey-stage">
        <div class="journey-topline"><div class="journey-call"><button class="shell-secret" type="button" aria-label="Discover a little ocean secret" title="Something washed ashore"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M11 26 3 15C-1 4 7 2 10 5c2-5 10-5 12 0 4-3 12 1 7 10l-8 11Z"/><path d="m16 25-6-20m6 20V5m0 20 6-20M16 25 5 11m11 14 11-14M11 26q5-4 10 0v3H11Z"/></svg></button><span>THE OCEAN IS CALLING</span></div><a href="#stay">Explore the stay <span aria-hidden="true">↘</span></a></div>
        <div class="journey-orbit" aria-hidden="true"></div>
        <div class="journey-copy">
          ${chapters.map((c, i) => `<div class="journey-chapter ${i === 0 ? "is-current" : ""}" data-chapter="${i}" ${i ? 'aria-hidden="true"' : ""}><p class="eyebrow"><span>0${i + 1}</span> / ${c.label}</p><h2>${c.title}</h2><p class="journey-description">${c.description}</p></div>`).join("")}
          <div class="journey-static-copy"><p class="eyebrow">YOUR OWN PACE. YOUR OWN WAY.</p><h2>FIND YOUR<br><em>FLOW.</em></h2><p>A little curiosity. Time in the water.<br>See where it takes you.</p><div class="journey-mode"><span class="journey-mode-label"></span><button class="journey-retry" type="button">Animate on scroll <span aria-hidden="true">↗</span></button></div></div>
        </div>
        <figure class="journey-art">
          <img class="journey-poster" src="${mediaRoot}${reduced() ? 'poster.webp' : 'shore.webp'}" alt="An original coastal miniature with a striped surfboard, sandy shore, palm trees and an adult surfer" width="960" height="960" loading="lazy" decoding="async">
          <canvas class="journey-canvas" data-renderer="2d" width="960" height="960" aria-hidden="true"></canvas>
          <figcaption class="sr-only">${content.journey.artworkNote}</figcaption>
        </figure>
        <div class="journey-bottom"><div class="journey-controls" aria-label="Surf journey chapters">${chapters.map((c, i) => `<button type="button" data-journey-step="${i}" ${i === 0 ? 'aria-current="step"' : ""}><span>0${i + 1}</span> ${c.shortLabel}<i aria-hidden="true"></i></button>`).join("")}</div><p class="journey-scroll-cue"><span class="scroll-wheel" aria-hidden="true"></span> SCROLL TO PADDLE OUT</p><p class="journey-art-note">AN OCEAN DAYDREAM</p></div>
      </div>
    </section>`,
  );
  const story = document.querySelector(".surf-journey");
  const stage = story.querySelector(".journey-stage");
  const canvas = story.querySelector("canvas");
  const poster = story.querySelector(".journey-poster");
  const context = canvas.getContext("2d", { alpha: true });
  const retryButton = story.querySelector('.journey-retry');
  const modeLabel = story.querySelector('.journey-mode-label');
  let fallbackReason = '';
  function staticFallback(reason = 'Frame decoding unavailable') {
    fallbackReason = reason;
    story.classList.add("sequence-unavailable");
    canvas.classList.remove("is-ready");
    poster.src = `${mediaRoot}poster.webp`;
    modeLabel.textContent = 'Still artwork · animation couldn’t load';
    retryButton.textContent = 'Retry animated story ↗';
    retryButton.hidden = !context;
  }
  if (!context) staticFallback('Canvas 2D unavailable');
  const chapterNodes = [...story.querySelectorAll(".journey-chapter")];
  const stepButtons = [...story.querySelectorAll("[data-journey-step]")];
  const header = document.querySelector(".header");
  const stickyCta = document.querySelector(".sticky-cta");
  const hero = document.querySelector(".hero");
  const boardStudy = document.querySelector(".board-study");
  const lifePhoto = document.querySelector(".life-photo");
  const closing = document.querySelector(".closing");
  const ticker = document.querySelector(".ticker");
  document
    .querySelector("#packages")
    .insertAdjacentHTML(
      "beforebegin",
      `<div class="tide-divider" aria-hidden="true"><svg viewBox="0 0 1600 80" preserveAspectRatio="none"><path class="tide-back" d="M0 30 Q200 70 400 30 T800 30 T1200 30 T1600 30 V80 H0Z"/><path d="M0 48 Q200 5 400 48 T800 48 T1200 48 T1600 48 V80 H0Z"/></svg></div>`,
    );
  const tide = document.querySelector(".tide-divider");
  const track = document.createElement("div");
  track.className = "ticker-track";
  track.append(...ticker.childNodes);
  // Copies are decorative; the ticker itself is already hidden from assistive technology.
  track.insertAdjacentHTML("beforeend", track.innerHTML + track.innerHTML);
  ticker.append(track);
  const revealTargets = [
    ...document.querySelectorAll(
      ".learn-copy, .section-top, .stay-notes, .day-rhythm article, .beyond > *, .coach-copy, .guest-stories figure, .arrival-grid > *, .faq-intro, .closing h2",
    ),
  ];
  let revealObserver;
  function setupReveals() {
    revealObserver?.disconnect();
    revealTargets.forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${(i % 3) * 60}ms`);
      // Content at or above the current viewport is never hidden, including restored scroll positions.
      el.classList.toggle(
        "will-reveal",
        !reduced() && el.getBoundingClientRect().top > innerHeight * 0.94,
      );
    });
    if (reduced()) return;
    revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add("has-revealed");
            revealObserver.unobserve(entry.target);
          }
      },
      { threshold: 0.08, rootMargin: "0px 0px -35px 0px" },
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
  }

  // Eight encoded packs replace 96 latency-sensitive frame requests. Decode only
  // the nearby frames and retain the compressed originals for instant reversal.
  const cache = new Map();
  const pending = new Map();
  const failures = new Set();
  const compact = matchMedia("(max-width: 760px)").matches;
  const cacheLimit = compact ? 12 : 20;
  const variant = compact ? "small" : "large";
  const connection = navigator.connection;
  const conserveData = connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || "");
  let packs;
  let decodes = 0;
  let decodeEpoch = 0;
  let openingTimer;
  let disposeDetails = initDetails({ reduced });
  let manifest,
    manifestRequest,
    desiredFrame = 1,
    displayedFrame = 0,
    lastStage = -1;
  let active = false,
    target = 0,
    progress = 0,
    raf = 0,
    disposed = false;
  function paint(frame, image) {
    if (!context || disposed || reduced()) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    displayedFrame = frame;
    canvas.classList.add("is-ready");
    story.dataset.frame = String(frame);
  }
  function paintNearest() {
    const nearest = [...cache.keys()].sort((a, b) => Math.abs(a - desiredFrame) - Math.abs(b - desiredFrame))[0];
    if (nearest !== undefined && nearest !== displayedFrame &&
        (!displayedFrame || Math.abs(nearest - desiredFrame) < Math.abs(displayedFrame - desiredFrame)))
      paint(nearest, cache.get(nearest));
  }
  function clearDecoded() {
    decodeEpoch++;
    cache.forEach(image => image.close?.());
    cache.clear();
    pending.clear();
    displayedFrame = 0;
  }
  function prune() {
    const order = [...cache.keys()].sort(
      (a, b) => Math.abs(a - desiredFrame) - Math.abs(b - desiredFrame),
    );
    order.slice(cacheLimit).forEach((k) => {
      cache.get(k)?.close?.();
      cache.delete(k);
    });
  }
  async function decodeBlob(blob) {
    if (typeof createImageBitmap === "function") {
      try { return await createImageBitmap(blob); } catch { /* Use the image decoder on older browsers. */ }
    }
    const image = new Image();
    const url = URL.createObjectURL(blob);
    try { image.decoding = "async"; image.src = url; await image.decode(); return image; }
    finally { URL.revokeObjectURL(url); }
  }
  function requestFrame(frame) {
    if (
      !manifest ||
      frame < 1 ||
      frame > manifest.frameCount ||
      cache.has(frame) ||
      pending.has(frame) ||
      failures.has(frame) ||
      decodes >= 3 ||
      reduced() ||
      !active
    )
      return;
    const blob = packs?.frames.get(frame);
    if (!blob) return;
    const epoch = decodeEpoch;
    pending.set(frame, epoch);
    decodes++;
    decodeBlob(blob)
      .then((image) => {
        if (disposed || epoch !== decodeEpoch || reduced()) { image.close?.(); return; }
        cache.set(frame, image);
        prune();
        paintNearest();
      })
      .catch(() => {
        if (epoch !== decodeEpoch) return;
        failures.add(frame);
        if (!displayedFrame && frame === desiredFrame)
          staticFallback();
      })
      .finally(() => {
        decodes--;
        if (pending.get(frame) === epoch) pending.delete(frame);
        if (!disposed) {
          pump();
          schedule();
        }
      });
  }
  function pump() {
    if (!manifest || !active || reduced() || disposed || document.hidden)
      return;
    packs?.request(desiredFrame, !conserveData && document.readyState === "complete");
    requestFrame(desiredFrame);
    // Neighbours are fetched only after the requested frame; fast jumps take priority.
    for (const offset of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5])
      requestFrame(desiredFrame + offset);
    // If the desired batch is still arriving, prepare its closest available neighbour.
    if (!cache.has(desiredFrame) && !pending.has(desiredFrame)) {
      const closest = [...(packs?.frames.keys() || [])].sort((a, b) => Math.abs(a - desiredFrame) - Math.abs(b - desiredFrame))[0];
      if (closest !== undefined) requestFrame(closest);
    }
    const packFailed = packs?.packs.findIndex(p => desiredFrame >= p.first && desiredFrame <= p.last);
    if (packs?.failed.has(packFailed)) {
      staticFallback('Required frame pack unavailable');
      active = false;
      packs.setActive(false);
      stickyCta?.classList.remove("in-journey");
    }
  }
  async function prepare() {
    if (manifest || manifestRequest || reduced() || !context) return;
    manifestRequest = fetch(`${mediaRoot}sequence.json`)
      .then((r) => {
        if (!r.ok) throw new Error("Sequence unavailable");
        return r.json();
      })
      .then((data) => {
        manifest = data;
        if (!data.packs?.[variant]?.length) throw new Error("Sequence packs unavailable");
        canvas.width = canvas.height = data.variants[variant];
        packs = new FramePacks(data.packs[variant], { root: mediaRoot, onChange: () => { pump(); schedule(); } });
        packs.setActive(active && !reduced() && !document.hidden);
        pump();
        schedule();
      })
      .catch((error) => {
        staticFallback(error.message);
      });
    await manifestRequest;
  }
  function stageProgress() {
    const rect = story.getBoundingClientRect();
    const top = header.getBoundingClientRect().height;
    return clamp(
      (top - rect.top) / Math.max(1, story.offsetHeight - stage.offsetHeight),
    );
  }
  function chapterAt(value) {
    return value < 0.3 ? 0 : value < 0.65 ? 1 : 2;
  }
  function setChapter(index) {
    if (index === lastStage) return;
    lastStage = index;
    story.dataset.chapter = String(index);
    chapterNodes.forEach((el, i) => {
      el.classList.toggle("is-current", i === index);
      el.setAttribute("aria-hidden", i === index ? "false" : "true");
    });
    stepButtons.forEach((el, i) =>
      i === index
        ? el.setAttribute("aria-current", "step")
        : el.removeAttribute("aria-current"),
    );
    story.querySelector(".journey-scroll-cue").lastChild.textContent =
      index === 2 ? " KEEP GOING. FEEL AT HOME." : " SCROLL TO PADDLE OUT";
  }
  function parallax(el, factor, name) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.bottom > -50 && r.top < innerHeight + 50)
      el.style.setProperty(
        name,
        `${(clamp((innerHeight - r.top) / (innerHeight + r.height)) - 0.5) * factor}px`,
      );
  }
  function tick() {
    raf = 0;
    if (disposed) return;
    root.style.setProperty(
      "--page-progress",
      String(
        clamp(
          scrollY /
            Math.max(1, document.documentElement.scrollHeight - innerHeight),
        ),
      ),
    );
    if (reduced()) return;
    const rect = story.getBoundingClientRect();
    const inPinnedScene =
      rect.top <= header.offsetHeight + 5 && rect.bottom > innerHeight * 0.65;
    stickyCta?.classList.toggle("in-journey", inPinnedScene);
    if (active) {
      target = stageProgress();
      progress += (target - progress) * 0.22;
      if (Math.abs(target - progress) < 0.0003) progress = target;
      story.style.setProperty("--journey-progress", String(progress));
      setChapter(chapterAt(progress));
      if (manifest) {
        desiredFrame = 1 + Math.round(progress * (manifest.frameCount - 1));
        paintNearest();
        pump();
      }
      if (Math.abs(target - progress) > 0.0003) schedule();
    }
    parallax(hero, 56, "--hero-shift");
    parallax(boardStudy, 110, "--board-shift");
    parallax(lifePhoto, 60, "--life-shift");
    parallax(tide, 170, "--tide-shift");
    if (closing)
      closing.style.setProperty(
        "--sun-turn",
        `${clamp((innerHeight - closing.getBoundingClientRect().top) / (innerHeight + closing.offsetHeight)) * 110}deg`,
      );
    const tr = ticker.getBoundingClientRect();
    if (tr.bottom > 0 && tr.top < innerHeight)
      track.style.transform = `translateX(${-120 - clamp((innerHeight - tr.top) / innerHeight) * 200}px)`;
  }
  function schedule() {
    if (!raf && !disposed && !document.hidden)
      raf = requestAnimationFrame(tick);
  }
  const storyObserver = new IntersectionObserver(
    (entries) => {
      active = entries[0].isIntersecting;
      packs?.setActive(active && !reduced() && !document.hidden);
      if (active) {
        prepare();
        schedule();
      }
    },
    { rootMargin: "500px 0px" },
  );
  storyObserver.observe(story);
  stepButtons.forEach((button, i) =>
    button.addEventListener("click", () => {
      const positions = [0, 0.46, 0.9];
      const y =
        scrollY +
        story.getBoundingClientRect().top -
        header.offsetHeight +
        positions[i] * (story.offsetHeight - stage.offsetHeight);
      window.scrollTo({ top: y, behavior: reduced() ? "instant" : "smooth" });
    }),
  );
  let pointerRaf = 0,
    pointerEvent;
  function resetPointer() {
    root.style.setProperty("--pointer-x", "0");
    root.style.setProperty("--pointer-y", "0");
  }
  const movePointer = (e) => {
    if (reduced() || !finePointer.matches) return;
    pointerEvent = e;
    if (pointerRaf) return;
    pointerRaf = requestAnimationFrame(() => {
      pointerRaf = 0;
      root.style.setProperty(
        "--pointer-x",
        String(pointerEvent.clientX / innerWidth - 0.5),
      );
      root.style.setProperty(
        "--pointer-y",
        String(pointerEvent.clientY / innerHeight - 0.5),
      );
    });
  };
  function applyPreference() {
    root.classList.toggle("motion-enabled", !reduced());
    root.classList.toggle("motion-reduced", reduced());
    if (reduced()) {
      modeLabel.textContent = 'Still artwork · reduced motion';
      retryButton.textContent = 'Animate on scroll ↗';
      canvas.classList.remove("is-ready");
      poster.src = `${mediaRoot}poster.webp`;
      clearDecoded();
      packs?.reset();
      resetPointer();
      stickyCta?.classList.remove("in-journey");
    } else {
      if (!story.classList.contains("sequence-unavailable")) poster.src = `${mediaRoot}shore.webp`;
      progress = stageProgress();
      packs?.setActive(active && !document.hidden);
      prepare();
    }
    setupReveals();
    schedule();
  }
  reducedQuery.addEventListener("change", applyPreference);
  retryButton.addEventListener('click', () => {
    if (!context) return;
    motionOptIn = true;
    packs?.reset();
    packs = undefined;
    manifest = undefined;
    manifestRequest = undefined;
    failures.clear();
    clearDecoded();
    fallbackReason = '';
    lastStage = -1;
    story.classList.remove('sequence-unavailable');
    active = true;
    applyPreference();
    stepButtons[0]?.focus({ preventScroll: true });
  });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("pointermove", movePointer, { passive: true });
  document.addEventListener("pointerleave", resetPointer);
  document.addEventListener("visibilitychange", schedule);
  document.addEventListener("visibilitychange", () => packs?.setActive(active && !reduced() && !document.hidden));
  window.addEventListener("load", () => { pump(); schedule(); }, { once: true });
  applyPreference();
  if (!reduced() && scrollY < 80 && !location.hash) {
    root.classList.add("is-opening");
    openingTimer = setTimeout(() => root.classList.remove("is-opening"), 1400);
  }
  // QA exposes bounded state only; no tracking or network telemetry.
  if (new URLSearchParams(location.search).get("qa") === "1") {
    const diagnostic = document.createElement("output");
    diagnostic.id = "motion-metrics";
    diagnostic.hidden = true;
    story.append(diagnostic);
    const update = () =>
      (diagnostic.textContent = JSON.stringify({
        progress,
        target,
        desiredFrame,
        displayedFrame,
        cachedFrames: cache.size,
        cacheLimit,
        pendingFrames: pending.size,
        encodedFrames: packs?.frames.size || 0,
        encodedBytes: packs?.bytes || 0,
        packRequests: packs?.requests || 0,
        readyPacks: packs?.ready.size || 0,
        pendingPacks: packs?.pending.size || 0,
        failedPacks: [...(packs?.failed || [])],
        canvasSize: canvas.width,
        conserveData: Boolean(conserveData),
        failedFrames: [...failures],
        active,
        reduced: reduced(),
        fallbackReason,
        motionOptIn,
        variant,
        frameCount: manifest?.frameCount || 0,
        renderer: context ? "canvas-2d" : "poster",
        chapter: lastStage,
      }));
    document.addEventListener("click", () => requestAnimationFrame(update));
    window.addEventListener("scroll", () => requestAnimationFrame(update), {
      passive: true,
    });
    const qaTimer = setInterval(update, 500);
    window.addEventListener("pagehide", () => clearInterval(qaTimer), {
      once: true,
    });
  }
  window.addEventListener("pagehide", () => {
    disposed = true;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(pointerRaf);
    storyObserver.disconnect();
    revealObserver?.disconnect();
    clearDecoded();
    packs?.reset();
    clearTimeout(openingTimer);
    disposeDetails();
  });
  // Resume a back/forward-cached document while preserving the visitor's form choices.
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      disposed = false;
      disposeDetails = initDetails({ reduced });
      storyObserver.observe(story);
      packs?.setActive(active && !reduced());
      applyPreference();
    }
  });
}
