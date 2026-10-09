// Pure package selection and message composition. Unknown price bases never become totals.
export const money = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;
export function getSelection(content, state) {
  const packages = content.packages;
  if (state.mode === "surfOnly") {
    if (state.private)
      return {
        name: packages.surfOnly.private.label,
        days: 1,
        nights: 0,
        sessions: 1,
        rate: packages.surfOnly.private.rate,
        basis: packages.surfOnly.private.basis,
        stay: "Arranging my own stay",
        payment: packages.surfOnly.payment,
        inclusions: packages.surfOnly.private.inclusions,
        exclusions: packages.surfOnly.exclusions,
        note: packages.surfOnly.private.note,
      };
    const course = packages.surfOnly.courses.find(
      (c) => c.days === Number(state.days),
    );
    if (!course) throw new Error("Unsupported Surf Only duration");
    return {
      ...course,
      name: packages.surfOnly.label,
      nights: 0,
      basis: packages.surfOnly.priceBasis,
      stay: "Arranging my own stay",
      payment: packages.surfOnly.payment,
      inclusions: packages.surfOnly.inclusions,
      exclusions: packages.surfOnly.exclusions,
    };
  }
  const course = packages.staySurf.courses.find(
    (c) => c.days === Number(state.days),
  );
  const stay = packages.staySurf.accommodation.find((s) => s.id === state.stay);
  if (!course || !stay) throw new Error("Unsupported Stay & Surf selection");
  return {
    ...course,
    name: packages.staySurf.label,
    rate: course.rates[stay.id],
    basis: packages.staySurf.priceBasis,
    stay: stay.label,
    payment: packages.staySurf.payment,
    inclusions: packages.staySurf.inclusions,
    exclusions: packages.staySurf.exclusions,
    note: packages.staySurf.rateNote,
  };
}
export function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function dateLabel(iso) {
  if (!iso) return "Dates to discuss";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso + "T00:00:00Z"));
}
export function addDays(iso, days) {
  if (!iso) return "";
  const date = new Date(iso + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function validateEnquiry(state, today = todayInIndia()) {
  const errors = {};
  if (
    !Number.isInteger(Number(state.guests)) ||
    Number(state.guests) < 1 ||
    Number(state.guests) > 99
  )
    errors.guests =
      "Enter a guest count from 1 to 99. The team will confirm capacity.";
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(state.date) ||
    Number.isNaN(Date.parse(state.date + "T00:00:00Z")) ||
    addDays(state.date, 0) !== state.date
  )
    errors.date = "Choose a valid tentative start date.";
  else if (state.date < today) errors.date = "Choose today or a future date.";
  if ((state.notes || "").length > 600)
    errors.notes = "Keep your questions within 600 characters.";
  return errors;
}
export function composeEnquiry(content, state) {
  const errors = validateEnquiry(state);
  if (Object.keys(errors).length)
    throw new Error(Object.values(errors).join(" "));
  const sel = getSelection(content, state),
    stayMode = state.mode === "staySurf";
  const lines = [
    `Hi SurfBrothers Mulki! I'd like to enquire about a surf trip.`,
    "",
    `Package: ${sel.name}`,
    `Duration: ${sel.days} ${sel.days === 1 ? "day" : "days"}${stayMode ? ` / ${sel.nights} nights` : ` / ${sel.sessions} ${sel.sessions === 1 ? "session" : "sessions"}`}`,
    `Stay: ${sel.stay}`,
    `Guests: ${Number(state.guests)} (please confirm availability/capacity)`,
    `Tentative ${stayMode ? "check-in" : "start"}: ${dateLabel(state.date)}`,
  ];
  if (stayMode)
    lines.push(
      `Tentative departure: ${dateLabel(addDays(state.date, sel.nights))} (${sel.nights} nights; arrival/departure times to confirm)`,
    );
  lines.push(
    `Listed rate: ${money(sel.rate)}${sel.basis ? " " + sel.basis : " (please confirm price basis)"}`,
  );
  if (stayMode) {
    const meal = content.packages.meals.find((m) => m.id === state.meals);
    lines.push(
      `Meals: ${meal?.rate ? `${meal.label}, ${money(meal.rate)}/day — please confirm meal-day count and number of meals` : "No meal add-on requested"}`,
    );
    lines.push(
      "Please confirm my final total, room/tent allocation, bathrooms, surf beach, lesson timing and transfers.",
    );
    lines.push(
      `Please check whether ${content.packages.offer.title} applies. ${content.packages.offer.terms} Please confirm the discount basis.`,
    );
  } else
    lines.push(
      `Tuition for ${Number(state.guests)} ${Number(state.guests) === 1 ? "guest" : "guests"}: ${money(sel.rate * Number(state.guests))} (surf tuition only; availability to confirm)`,
      "I will arrange my own stay and travel to the surf location. Please confirm the surf beach and lesson timing.",
    );
  if (state.private)
    lines.push("Please confirm private session duration and equipment.");
  lines.push(
    "",
    `Payment terms noted: ${sel.payment}`,
    content.packages.weather,
  );
  if (state.notes?.trim())
    lines.push("", `My questions: ${state.notes.trim()}`);
  lines.push(
    "",
    "Please confirm total and availability before I pay. This is an enquiry, not a reservation.",
  );
  return lines.join("\n");
}
