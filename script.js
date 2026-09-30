const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const themeToggle = document.getElementById("theme-toggle");
const navLinks = document.querySelectorAll(".nav-link");
const contactForm = document.getElementById("contact-form");
const topbar = document.getElementById("topbar");

function setMenu(open) {
  navMenu.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
}

navToggle.addEventListener("click", () => {
  setMenu(navToggle.getAttribute("aria-expanded") !== "true");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    navToggle.focus();
  }
});

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
  );
}

applyTheme(document.documentElement.getAttribute("data-theme") || "light");

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

const progress = document.getElementById("progress");

window.addEventListener("scroll", () => {
  topbar.classList.toggle("scrolled", window.scrollY > 8);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  progress.style.transform = `scaleX(${ratio})`;
}, { passive: true });

const sections = ["work", "about", "skills", "contact"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      const current = link.getAttribute("href") === `#${entry.target.id}`;
      if (current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  });
}, { rootMargin: "-40% 0px -50% 0px" });

sections.forEach((section) => sectionObserver.observe(section));

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateCount(element) {
  const target = Number(element.dataset.count);
  if (!Number.isFinite(target)) return;
  if (reduceMotion) {
    element.textContent = String(target);
    return;
  }
  const start = performance.now();
  const duration = 700;
  function frame(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  setTimeout(() => {
    element.textContent = String(target);
  }, 900);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    animateCount(entry.target);
    countObserver.unobserve(entry.target);
  });
}, { threshold: 0.2 });

document.querySelectorAll("[data-count]").forEach((element) => {
  if (reduceMotion) return;
  countObserver.observe(element);
});

const fields = [
  ["name", "Enter your name."],
  ["email", "Enter a valid email address."],
  ["subject", "Enter a subject."],
  ["message", "Enter a message."],
];

function setError(id, message) {
  const input = document.getElementById(id);
  const error = document.getElementById(`${id}-error`);
  input.setAttribute("aria-invalid", message ? "true" : "false");
  error.hidden = !message;
  error.textContent = message || "";
}

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = document.getElementById("form-status");
  let firstInvalid = null;
  const data = new FormData(contactForm);
  const email = String(data.get("email") || "").trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  fields.forEach(([id, message]) => {
    const value = String(data.get(id) || "").trim();
    const invalid = id === "email" ? !validEmail : value.length === 0;
    setError(id, invalid ? message : "");
    if (invalid && !firstInvalid) firstInvalid = document.getElementById(id);
  });

  if (firstInvalid) {
    status.textContent = "Fix the highlighted fields, then try again.";
    firstInvalid.focus();
    return;
  }

  const subject = String(data.get("subject")).trim();
  const body = `Name: ${String(data.get("name")).trim()}\nEmail: ${email}\n\n${String(data.get("message")).trim()}`;
  window.location.href = `mailto:mamr32278@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  status.textContent = "Your email app should open with this message. If it does not, write to mamr32278@gmail.com.";
});
