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
const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com/citymetroalerts",
    icon: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/>' },
  { label: "X", href: "https://x.com/CityMetroAlert",
    icon: '<path d="M4 4l16 16M20 4L4 20" stroke-width="2.4"/>' },
  { label: "YouTube", href: "https://youtube.com/@CityMetroTransit",
    icon: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none"/>' },
  { label: "Pixelfed", href: "https://pixelfed.social/citymetro",
    icon: '<rect x="3" y="6" width="18" height="14" rx="3"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>' },
  { label: "Mastodon", href: "https://mastodon.social/@citymetro",
    icon: '<path d="M5 4h14a2 2 0 0 1 2 2v7a5 5 0 0 1-5 5h-3l-5 3v-3a5 5 0 0 1-3-4.6V6a2 2 0 0 1 2-2z"/><path d="M8 14V9.5a1.5 1.5 0 0 1 3 0V14M11 11a1.5 1.5 0 0 1 3 0V14"/>', rel: " me" }
];
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
    ${path === "/contact" ? '<p class="legal-note">In an emergency, always call 911 first. For security concerns, contact City Metro Transit Police at 888-CM-SAFE or text 77777. Notice: 800-UNION-STA is a fake phone number and does not connect to a real line.</p>' : ""}
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
