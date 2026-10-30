/* ===== EDIT ME ===== */
const ANNOUNCEMENT = {
  enabled: true,
  text: "Welcome to Union Station, Lego City: one station, four railroads.",
  linkText: "See operators",
  linkHref: "/operators"
};
const NAV = [
  { label: "Home", href: "/" },
  { label: "Operators", href: "/operators", items: [
    { label: "City Metro", href: "https://citymetro.xyz" },
    { label: "Republic State Railways", href: "https://rsr.citymetro.xyz" },
    { label: "City MetroLink", href: "https://metrolink.citymetro.xyz" },
    { label: "City Metro-North Railroad", href: "https://mnrr.citymetro.xyz" } ] },
  { label: "Station", href: "/station", items: [
    { label: "Facilities", href: "/station#facilities" },
    { label: "Getting here & transfers", href: "/station#transfers" },
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
    <a class="logo" href="/" aria-label="Union Station home"><img src="/logo.png" alt="Union Station"></a>
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
    <div class="legal"><span>© Union Station, Lego City. Served by City Metro, Republic State Railways, City MetroLink and City Metro-North Railroad.</span>
    <span><a href="/contact">Contact</a></span></div>
  </div></footer>`;
}
renderHeader(); renderFooter();
