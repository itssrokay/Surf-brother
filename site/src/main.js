import "./style.css";
import { initMotion } from "./motion.js";
import { initPlanning } from "./planning.js";
import "./experience.css";
import content from "./content.js";
import { galleryImage } from "./media.js";
import { escapeHTML } from "./content-copy.js";
import { renderSections, renderGallery } from "./sections.js";
import {
  money,
  getSelection,
  composeEnquiry,
  validateEnquiry,
  todayInIndia,
  dateLabel,
  addDays,
} from "./packages.js";
renderSections();
// Put choosing a trip before the immersive story and accommodation deep dive.
document.querySelector('#learn').after(document.querySelector('#packages'));
initPlanning();
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const menu = $(".menu-toggle"),
  mobile = $("#mobile-nav");
function closeMenu() {
  mobile.hidden = true;
  menu.setAttribute("aria-expanded", "false");
}
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", open);
  mobile.hidden = !open;
});
mobile.addEventListener("click", (e) => {
  if (e.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !mobile.hidden) {
    closeMenu();
    menu.focus();
  }
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 760) closeMenu();
});
const state = {
  mode: "staySurf",
  days: 3,
  stay: "nonAc",
  guests: 1,
  date: "",
  meals: "none",
  private: false,
  notes: "",
};
const form = $("#enquiry-form");
$("#start-date").min = todayInIndia();
function durations() {
  const courses =
    state.mode === "staySurf"
      ? content.packages.staySurf.courses
      : content.packages.surfOnly.courses;
  if (!courses.some((c) => c.days === state.days)) state.days = 3;
  $("#duration-options").innerHTML = courses
    .map(
      (c) =>
        `<label><input type="radio" name="days" value="${c.days}" ${c.days === state.days ? "checked" : ""}><span>${c.days}<small>${c.days === 1 ? "DAY" : "DAYS"}${c.nights ? " / " + c.nights + "N" : ""}</small></span></label>`,
    )
    .join("");
}
function updateSummary() {
  const sel = getSelection(content, state),
    stay = state.mode === "staySurf";
  $("#summary-title").textContent = sel.name.toUpperCase();
  $("#summary-detail").textContent =
    `${sel.days} ${sel.days === 1 ? "day" : "days"}${stay ? ` / ${sel.nights} nights · ${sel.stay}` : ` · ${sel.sessions} ${sel.sessions === 1 ? "session" : "sessions"}`}`;
  $("#package-price").textContent = money(sel.rate);
  $("#mobile-rate-price").textContent = money(sel.rate);
  $("#mobile-rate-label").textContent =
    `${sel.name} · ${sel.days} ${sel.days === 1 ? "day" : "days"}${stay ? " / " + sel.nights + " nights" : ""}`;
  $("#mobile-rate-basis").textContent =
    sel.basis || "Listed rate · confirm price basis & total with the team";
  $("#rate-basis").textContent = sel.basis
    ? sel.basis
    : content.packages.staySurf.rateNote;
  const guestValid =
    Number.isInteger(Number(state.guests)) &&
    Number(state.guests) >= 1 &&
    Number(state.guests) <= 99;
  const dateValid =
    /^\d{4}-\d{2}-\d{2}$/.test(state.date) &&
    !Number.isNaN(Date.parse(state.date + "T00:00:00Z"));
  const facts = [
    guestValid
      ? `${state.guests} ${Number(state.guests) === 1 ? "guest" : "guests"} · availability to confirm`
      : "Set your guest count below",
  ];
  if (dateValid)
    facts.push(
      stay
        ? `${dateLabel(state.date)} – ${dateLabel(addDays(state.date, sel.nights))} · ${sel.nights} nights`
        : `Starting ${dateLabel(state.date)} · tentative`,
    );
  else facts.push("Choose tentative dates below");
  if (!stay && guestValid)
    facts.push(
      `Surf tuition subtotal: ${money(sel.rate * Number(state.guests))}`,
    );
  $("#booking-facts").textContent = facts.join("\n");
  $("#package-inclusions").innerHTML = sel.inclusions
    .map((x) => `<li>${escapeHTML(x)}</li>`)
    .join("");
  $("#package-exclusions").textContent =
    sel.exclusions.join(" ") +
    (sel.note && state.private ? " " + sel.note : "");
  const meal = content.packages.meals.find((m) => m.id === state.meals);
  $("#selected-meals").hidden = !stay;
  $("#selected-meals").textContent = meal?.rate
    ? `Requested add-on: ${meal.label} ${money(meal.rate)}/day. Meal days and number of meals to confirm; not added to a total.`
    : `Meals are optional: ${content.packages.meals
        .filter((m) => m.rate)
        .map((m) => m.label + " " + money(m.rate) + "/day")
        .join(" or ")}. Not included by default.`;
  $("#payment-terms").textContent = sel.payment;
  $("#weekday-offer").hidden = !stay;
  $("#stay-options").hidden = !stay;
  $("#meal-control").hidden = !stay;
  $("#private-choice").hidden = stay;
  $(".duration-selector").hidden = state.private;
  $(".duration-selector legend").textContent = stay
    ? "01   How long are you staying?"
    : "01   Choose your course length";
  $("#date-label").textContent = stay
    ? "Tentative check-in"
    : "Tentative start date";
}
durations();
updateSummary();
function sync() {
  const data = new FormData(form);
  const mode = data.get("mode");
  if (mode !== state.mode) {
    state.mode = mode;
    state.private = false;
    $("input[name=private]").checked = false;
    durations();
  }
  state.days = Number(new FormData(form).get("days")) || state.days;
  state.stay = data.get("stay") || state.stay;
  state.guests = data.get("guests");
  state.date = data.get("date");
  state.meals = data.get("meals") || "none";
  state.private = state.mode === "surfOnly" && data.has("private");
  state.notes = data.get("notes") || "";
  updateSummary();
}
form.addEventListener("input", sync);
form.addEventListener("change", sync);
function showValidation(errors) {
  for (const name of ["guests", "date", "notes"]) {
    $(`#${name}-error`).textContent = errors[name] || "";
    const input = name === "date" ? $("#start-date") : $(`#${name}`);
    input.setAttribute("aria-invalid", errors[name] ? "true" : "false");
  }
}
form.addEventListener("input", (e) => {
  if (e.target.getAttribute("aria-invalid") === "true")
    showValidation(validateEnquiry(state));
});
let lastDialogTrigger;
function openDialog(dialog, trigger) {
  lastDialogTrigger = trigger;
  dialog.showModal();
}
$$("dialog").forEach((dialog) => {
  dialog
    .querySelector(".dialog-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener("close", () => {
    if (dialog.id === "video-dialog") dialog.querySelector("video").pause();
    lastDialogTrigger?.focus();
  });
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  sync();
  const errors = validateEnquiry(state);
  showValidation(errors);
  if (Object.keys(errors).length) {
    (Object.keys(errors)[0] === "date"
      ? $("#start-date")
      : $(`#${Object.keys(errors)[0]}`)
    ).focus();
    return;
  }
  const msg = composeEnquiry(content, state);
  $("#message-preview").value = msg;
  $("#copy-status").textContent = "";
  const link = $("#whatsapp-link");
  if (content.contacts.verified) {
    link.href = `https://wa.me/${content.contacts.phones[0].whatsapp}?text=${encodeURIComponent(msg)}`;
    link.hidden = false;
  } else {
    link.hidden = true;
    $("#copy-status").textContent =
      "Demo preview: this number is awaiting verification.";
  }
  openDialog($("#enquiry-dialog"), form.querySelector("[type=submit]"));
});
$("#copy-message").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("#message-preview").value);
    $("#copy-status").textContent =
      "Message copied. You can paste it into WhatsApp.";
  } catch {
    $("#message-preview").focus();
    $("#message-preview").select();
    $("#copy-status").textContent = "Select and copy the message above.";
  }
});
$$(".course-pick").forEach((b) =>
  b.addEventListener("click", () => {
    state.days = Number(b.dataset.days);
    durations();
    updateSummary();
    $("#packages").scrollIntoView({ behavior: "auto" });
  }),
);
$$(".ask-specific").forEach((b) =>
  b.addEventListener("click", () => {
    $("#notes").value = b.dataset.question;
    state.notes = b.dataset.question;
    $("#packages").scrollIntoView({ behavior: "auto" });
    $("#notes").focus({ preventScroll: true });
  }),
);
let galleryImages = renderGallery(),
  currentPhoto = 0;
function displayPhoto() {
  const g = galleryImages[currentPhoto];
  $("#gallery-large").src = galleryImage(g);
  $("#gallery-large").alt = g.alt;
  $("#gallery-dialog-title").textContent = g.title;
  $("#gallery-counter").textContent =
    `${currentPhoto + 1} / ${galleryImages.length} · SURFBROTHERS MULKI`;
}
$("#gallery-grid").addEventListener("click", (e) => {
  const button = e.target.closest("[data-photo]");
  if (!button) return;
  currentPhoto = galleryImages.findIndex((g) => g.id === button.dataset.photo);
  displayPhoto();
  openDialog($("#gallery-dialog"), button);
});
$$(".gallery-filters button").forEach((b) =>
  b.addEventListener("click", () => {
    $$(".gallery-filters button").forEach((x) => {
      x.classList.toggle("active", x === b);
      x.setAttribute("aria-pressed", x === b ? "true" : "false");
    });
    galleryImages = renderGallery(b.dataset.category);
  }),
);
function stepPhoto(step) {
  currentPhoto =
    (currentPhoto + step + galleryImages.length) % galleryImages.length;
  displayPhoto();
}
$("#gallery-prev").addEventListener("click", () => stepPhoto(-1));
$("#gallery-next").addEventListener("click", () => stepPhoto(1));
$("#gallery-dialog").addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    e.preventDefault();
    stepPhoto(1);
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    stepPhoto(-1);
  }
});
$(".video-open").addEventListener("click", (e) =>
  openDialog($("#video-dialog"), e.currentTarget),
);
let heroVisible = true,
  packageVisible = false,
  footerVisible = false;
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.target.classList.contains("hero"))
        heroVisible = entry.isIntersecting;
      if (entry.target.id === "packages") packageVisible = entry.isIntersecting;
      if (entry.target.classList.contains("footer"))
        footerVisible = entry.isIntersecting;
    }
    $(".sticky-cta").classList.toggle(
      "in-package",
      heroVisible || packageVisible || footerVisible,
    );
  },
  { threshold: 0.01 },
);
observer.observe($(".hero"));
observer.observe($("#packages"));
observer.observe($(".footer"));
// A narrow page-scoped WebMCP tool stages the same package explorer. It never sends or reserves.
const modelContext = document.modelContext;
if (modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const registration = {
    name: "configure_surfbrothers_package",
    title: "Choose a SurfBrothers package",
    description:
      "Stage the visible package explorer and return its listed rate, nights and terms. Does not send, reserve, pay, apply an offer or calculate unresolved totals.",
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["surfOnly", "staySurf"] },
        days: { type: "number", enum: [1, 3, 5, 7, 10] },
        stay: { type: "string", enum: ["camping", "nonAc", "ac"] },
      },
      required: ["mode", "days"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async (input) => {
      if (
        !input ||
        !["surfOnly", "staySurf"].includes(input.mode) ||
        ![1, 3, 5, 7, 10].includes(input.days) ||
        (input.stay && !["camping", "nonAc", "ac"].includes(input.stay))
      )
        throw new Error("Choose a valid package, duration and accommodation.");
      const allowed = {
        ...state,
        mode: input.mode,
        days: input.days,
        stay: input.stay || "nonAc",
        private: false,
      };
      const selection = getSelection(content, allowed);
      state.mode = allowed.mode;
      state.days = allowed.days;
      state.stay = allowed.stay;
      state.private = false;
      $(`input[name=mode][value=${state.mode}]`).checked = true;
      $(`input[name=stay][value=${state.stay}]`).checked = true;
      $("input[name=private]").checked = false;
      durations();
      updateSummary();
      return {
        name: selection.name,
        days: selection.days,
        nights: selection.nights,
        rate: selection.rate,
        basis: selection.basis,
        total: null,
        availability: "Confirm with team",
        payment: selection.payment,
        inclusions: selection.inclusions,
      };
    },
  };
  try {
    Promise.resolve(
      modelContext.registerTool(registration, { signal: lifecycle.signal }),
    ).catch(() => {});
  } catch {}
  window.addEventListener("pagehide", () => lifecycle.abort(), { once: true });
}
const qaParams = new URLSearchParams(location.search);
if (qaParams.has("reduce-motion"))
  document.documentElement.dataset.reducedMotion = "true";
if (qaParams.get("qa") === "1") import("./diagnostics.js");

initMotion();
