/* ===== EDIT ME ===== */
const ANNOUNCEMENT = {
  enabled: true,
  text: "Welcome to Union Station Lego City: one station, four operators.",
  linkText: "See operators",
  linkHref: "/operators"
};
const NAV = [
  { label: "Home", href: "/" },
  { label: "Departures", href: "/departures" },
  { label: "Operators", href: "/operators", items: [
    { label: "City Metro", href: "https://citymetro.xyz" },
    { label: "Republic State Railways", href: "https://rsr.citymetro.xyz" },
    { label: "City MetroLink", href: "https://metrolink.citymetro.xyz" },
    { label: "City Metro-North Railroad", href: "https://mnrr.citymetro.xyz" } ] },
  { label: "Station", href: "/station", items: [
    { label: "Facilities", href: "/station#facilities" },
    { label: "Lines & transfers", href: "/station#transfers" },
    { label: "Accessibility", href: "/station#accessibility" } ] },
  { label: "Plan a Trip", href: "https://trip-planner.citymetro.xyz", items: [
    { label: "Trip Planner", href: "https://trip-planner.citymetro.xyz" },
    { label: "System Map", href: "https://map.citymetro.xyz" },
    { label: "Service Alerts", href: "https://alerts.citymetro.xyz" },
    { label: "MyBrickPass", href: "https://mybrickpass.citymetro.xyz" } ] }
];
const SOCIAL = [];
/* ==================== */

const path = location.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";
const li = (i) => `<li><a href="${i.href}">${i.label}</a></li>`;

function renderHeader() {
  const items = NAV.map(n => n.items && n.href
    ? `<li class="has-dd split"><a class="nav-link ${path === n.href ? "active" : ""}" href="${n.href}">${n.label}</a><button class="dd-toggle" aria-label="${n.label} menu" aria-expanded="false"></button><ul class="dd-menu">${n.items.map(li).join("")}</ul></li>`
    : `<li><a class="nav-link ${path === n.href ? "active" : ""}" href="${n.href}">${n.label}</a></li>`).join("");
  let bar = "";
  if (ANNOUNCEMENT.enabled && !sessionStorage.getItem("announceClosed")) {
    bar = `<div class="announce" role="region" aria-label="Announcement">${ANNOUNCEMENT.text} ${ANNOUNCEMENT.linkHref ? `<a href="${ANNOUNCEMENT.linkHref}">${ANNOUNCEMENT.linkText}</a>` : ""}<button aria-label="Dismiss">&times;</button></div>`;
  }
  document.getElementById("site-header").innerHTML = `${bar}
  <header class="site-header"><div class="container header-inner">
    <a class="logo" href="/" aria-label="Union Station Lego City home"><img src="https://police.citymetro.xyz/logo.png" alt="City Metro"><span class="logo-text">Union Station<small>Lego City</small></span></a>
    <button class="menu-btn" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
    <nav class="nav" aria-label="Main"><ul class="nav-list">${items}</ul><div class="nav-cta-wrap"><a class="btn nav-cta" href="/contact">Contact Us</a></div></nav>
  </div></header>`;

  const btn = document.querySelector(".menu-btn"), nav = document.querySelector(".nav");
  btn.onclick = () => { const o = nav.classList.toggle("open"); btn.setAttribute("aria-expanded", o); document.body.style.overflow = o ? "hidden" : ""; };
  document.querySelectorAll(".dd-toggle").forEach(t => t.onclick = (e) => {
    e.stopPropagation();
    const p = t.parentElement, wasOpen = p.classList.contains("open");
    document.querySelectorAll(".has-dd").forEach(x => { x.classList.remove("open"); x.querySelector(".dd-toggle").setAttribute("aria-expanded", "false"); });
    if (!wasOpen) { p.classList.add("open"); t.setAttribute("aria-expanded", "true"); }
  });
  document.addEventListener("click", () => document.querySelectorAll(".has-dd").forEach(x => x.classList.remove("open")));
  const x = document.querySelector(".announce button");
  if (x) x.onclick = () => { sessionStorage.setItem("announceClosed", "1"); x.parentElement.remove(); };
}

function renderFooter() {
  const social = SOCIAL.map(s => `<a href="${s.href}" target="_blank" rel="noopener noreferrer${s.rel || ""}" aria-label="${s.label}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${s.icon}</svg>${s.label}</a>`).join("");
  const cols = NAV.filter(n => n.items).map(n => `<div><h4>${n.label}</h4><ul>${n.items.map(li).join("")}</ul></div>`).join("");
  document.getElementById("site-footer").innerHTML = `<footer class="site-footer"><div class="container">
    <div class="footer-cols">${cols}</div>
    ${social ? `<div class="social" aria-label="Social media">${social}</div>` : ""}
    <div class="legal"><span>© Union Station Lego City. Owned and operated by City Metro, a subsidiary of the Republic States Railway and Transportation Authority.</span>
    <span><a href="/contact">Contact</a></span></div>
    ${path === "/contact" ? '<p class="legal-note">In an emergency, always call 911 first. Notice: 800-UNION-STA, 888-CM-SAFE, and 77777 are fake phone numbers and don't connect to a real line.</p>' : ""}
  </div></footer>`;
}
renderHeader(); renderFooter();

/* header logo + operator logos: fall back quietly (CSP blocks inline onerror, so it is attached here) */
const hl = document.querySelector(".logo img");
if (hl) hl.addEventListener("error", () => hl.remove(), { once: true });
function initOpLogos() {
  document.querySelectorAll("img[data-srcs]").forEach(im => {
    const list = im.dataset.srcs.split(" ").filter(Boolean);
    let i = 0;
    const next = () => {
      if (i < list.length) { im.src = list[i++]; return; }
      const m = document.createElement("div"); m.className = "op-mark"; m.textContent = im.dataset.code || im.alt; im.replaceWith(m);
    };
    im.addEventListener("error", next);
    next();
  });
}
initOpLogos();
