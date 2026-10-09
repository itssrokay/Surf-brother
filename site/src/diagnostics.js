// Local QA only (?qa=1). No analytics endpoint, persistence, or customer data.
const metrics = { lcpMs: null, cls: 0 };
try {
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    metrics.lcpMs = entries.at(-1)?.startTime || metrics.lcpMs;
    publish();
  }).observe({ type: "largest-contentful-paint", buffered: true });
} catch {}
try {
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries())
      if (!entry.hadRecentInput) metrics.cls += entry.value;
    publish();
  }).observe({ type: "layout-shift", buffered: true });
} catch {}
const output = document.createElement("output");
output.id = "qa-metrics";
output.hidden = true;
document.body.append(output);
function publish() {
  if (!document.querySelector("#qa-metrics")) return;
  const navigation = performance.getEntriesByType("navigation")[0];
  const resources = performance.getEntriesByType("resource");
  const board = document.querySelector(".board");
  output.textContent = JSON.stringify({
    ...metrics,
    viewport: { width: innerWidth, height: innerHeight },
    scrollWidth: document.documentElement.scrollWidth,
    domContentLoadedMs: navigation?.domContentLoadedEventEnd,
    transferBytes: resources.reduce((sum, r) => sum + r.transferSize, 0),
    resourceCount: resources.length,
    resources: resources.map((r) => ({
      name: r.name.split("/").at(-1),
      transferBytes: r.transferSize,
      durationMs: r.duration,
    })),
    canvasCount: document.querySelectorAll("canvas").length,
    canvasRenderers: [...document.querySelectorAll("canvas")].map(
      (el) => el.dataset.renderer || "unknown",
    ),
    webglCanvasCount: document.querySelectorAll('canvas[data-renderer="webgl"]')
      .length,
    reducedMotionRequested:
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.reducedMotion === "true",
    boardAnimation: board ? getComputedStyle(board).animationName : null,
    focusElement:
      document.activeElement?.getAttribute("aria-label") ||
      document.activeElement?.id ||
      document.activeElement?.tagName,
    focusOutline: document.activeElement
      ? getComputedStyle(document.activeElement).outlineStyle
      : null,
    overflowElements: [...document.querySelectorAll("body *")]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return (
          r.width > 0 &&
          (r.right > innerWidth + 2 || r.left < -2) &&
          !e.closest("dialog") &&
          !e.classList.contains("sr-only")
        );
      })
      .map((e) => e.className || e.tagName),
    missingImages: [...document.images]
      .filter(
        (i) => i.hasAttribute("src") && i.complete && i.naturalWidth === 0,
      )
      .map((i) => i.getAttribute("src")),
  });
}
window.addEventListener(
  "load",
  () => requestAnimationFrame(() => requestAnimationFrame(publish)),
  { once: true },
);
window.addEventListener("resize", publish);
document.addEventListener("focusin", publish);
document.addEventListener("click", () => requestAnimationFrame(publish));
setTimeout(publish, 1500);
