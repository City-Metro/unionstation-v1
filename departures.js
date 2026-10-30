/* ===== EDIT ME: Union Station Lego City departure board =====
   The board works out the next trains by itself from the "every X minutes" rules below.
   You only change this file if a frequency, track or destination changes.

   Each service (one row on the board):
     op       cm = City Metro, rsr = Republic State Railways, ml = City MetroLink, mn = City Metro-North
     line     text in the coloured badge (A, E, K, RSR2427 ...)
     dest     destination
     track    track number
     every    minutes between trains (60 = every hour, 120 = every 2 hours, 180 = every 3 hours)
     start    first train of the day, "HH:MM" in 24-hour time. Leave out for 00:00 (12:00 AM)
   Optional:
     via      e.g. "via Downtown and the Airport"
     area     shown under the track, e.g. "Regional Rail Area"
     service  small line under the destination (defaults to the operator name)
     days     only run on these days: 0 = Sunday ... 6 = Saturday. Leave out for every day
     status   "delayed", "cancelled" or "boarding" to override the automatic status
     delay    minutes late (with status "delayed"); all the times shown shift by this much
     note     small extra line, e.g. "Bus replacement"

   Trains run 24/7. Each day starts again at "start", then repeats every X minutes until midnight.
*/
const BOARD = {
  timezone: "America/Los_Angeles",   // same clock as the rest of your City Metro sites
  tzLabel: "PT",
  boardingMinutes: 10,               // "Boarding" shows this many minutes before departure (never more than half the gap between trains)
  thenCount: 3,                      // how many later trains to list under each row ("Then ...")
  homeRows: 12,
  pageRows: 30
};
const OPERATORS = {
  cm:  { name: "City Metro",                code: "CM",  color: "#134590" },
  rsr: { name: "Republic State Railways",   code: "RSR", color: "#8a1c2b" },
  ml:  { name: "City MetroLink",            code: "ML",  color: "#0f7a5a" },
  mn:  { name: "City Metro-North Railroad", code: "MN",  color: "#b45309" }
};
const RSR_SERVICE = "City Metro Express, operated by Republic State Railways";
const SERVICES = [
  // City Metro Rail
  { op: "cm", line: "A", dest: "Downtown Santa Mooica", via: "via Downtown and the Airport", track: "1", every: 4 },
  { op: "cm", line: "E", dest: "Table Central",         via: "via Downtown and the Airport", track: "2", every: 2 },
  { op: "cm", line: "K", dest: "Asian Town",            track: "3", every: 6 },
  // City Metro Express, operated by Republic State Railways
  { op: "rsr", line: "RSR2427", dest: "Heartlake City", track: "4", area: "Regional Rail Area", service: RSR_SERVICE, every: 60,  start: "00:30" },
  { op: "rsr", line: "RSR2427", dest: "Pillow Beach",   track: "4", area: "Regional Rail Area", service: RSR_SERVICE, every: 120, start: "00:15" },
  { op: "rsr", line: "RSR2427", dest: "Los Angeles",    track: "4", area: "Regional Rail Area", service: RSR_SERVICE, every: 180, start: "00:00" },
  // City Metro-North Railroad
  { op: "mn", line: "MN", dest: "TV Room Central",                       track: "5", every: 25 },
  { op: "mn", line: "MN", dest: "Felix Lego City International Airport", track: "5", every: 25, start: "00:05" },
  // City MetroLink
  { op: "ml", line: "ML", dest: "TV Room Central", via: "via Asian Town", track: "7", every: 35 },
  { op: "ml", line: "ML", dest: "Felix Lego City International Airport", track: "6", every: 35 }  // ASSUMED every 35 min: no frequency was given, change me
];
/* ==================================================== */

(() => {
  'use strict';
  const host = document.getElementById('board'); if (!host) return;
  const limit = Number(host.dataset.limit) || BOARD.homeRows;
  const withFilters = host.dataset.filters === 'true';
  let filter = 'all';

  const pad = n => String(n).padStart(2, '0');
  function el(tag, props = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    return n;
  }
  function nowParts() {
    const p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: BOARD.timezone, hour12: false, weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(new Date()).forEach(x => { p[x.type] = x.value; });
    return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), mins: (Number(p.hour) % 24) * 60 + Number(p.minute), secs: Number(p.second) };
  }
  function clockOf(m, short) {
    m = ((m % 1440) + 1440) % 1440;
    const h = Math.floor(m / 60);
    return ((h % 12) || 12) + ':' + pad(m % 60) + (short ? '' : ' ' + (h < 12 ? 'AM' : 'PM'));
  }
  function everyLabel(n) {
    if (n % 60 === 0) return n === 60 ? 'Every hour' : `Every ${n / 60} hours`;
    return `Every ${n} min`;
  }
  // Minutes from now until each of the next `count` trains of one service.
  function nextTrains(s, n, count) {
    const every = Number(s.every);
    if (!(every > 0)) return [];
    const [sh, sm] = String(s.start || '00:00').split(':').map(Number);
    const start = (sh || 0) * 60 + (sm || 0);
    const out = [];
    for (let off = 0; off < 8 && out.length < count; off++) {
      if (s.days && !s.days.includes((n.day + off) % 7)) continue;
      let k = (off === 0 && n.mins > start) ? Math.ceil((n.mins - start) / every) : 0;
      for (;; k++) {
        const t = start + k * every;
        if (t >= 1440) break;
        out.push(t - n.mins + off * 1440);
        if (out.length >= count) break;
      }
    }
    return out;
  }
  function statusOf(s, until) {
    if (s.status === 'cancelled') return ['Cancelled', 'bad'];
    if (s.status === 'delayed') return [s.delay ? `Delayed ${s.delay} min` : 'Delayed', 'warn'];
    if (s.status === 'boarding') return ['Boarding', 'go'];
    if (until <= 0) return ['Departing', 'go'];
    if (until <= Math.min(BOARD.boardingMinutes, Math.floor(Number(s.every) / 2))) return ['Boarding', 'go'];
    return ['On time', 'ok'];
  }
  function countdown(u) {
    if (u <= 0) return 'Now';
    if (u < 60) return `${u} min`;
    return `${Math.floor(u / 60)}h ${u % 60}m`;
  }

  const clock = el('span', { class: 'board-clock' });
  const list = el('div', { class: 'board-rows' });
  const head = el('div', { class: 'board-head' }, el('h3', { text: 'Next departures from Union Station Lego City' }), clock);
  const filters = el('div', { class: 'board-filters', role: 'group', 'aria-label': 'Filter by operator' });
  const foot = el('p', { class: 'board-foot' }, `Times shown in ${BOARD.tzLabel}. Trains run 24 hours a day. For delays and changes see `,
    el('a', { href: 'https://alerts.citymetro.xyz', text: 'Service Alerts' }), '.');
  const cols = el('div', { class: 'dep dep-cols', 'aria-hidden': 'true' },
    el('span', { text: 'Next' }), el('span', { text: 'Destination' }),
    el('span', { class: 'dep-meta' }, el('span', { text: 'Track' }), el('span', { text: 'Status' })));
  host.classList.add('board');
  host.append(head);
  if (withFilters) {
    const make = (key, label) => {
      const b = el('button', { type: 'button', class: 'bf', 'aria-pressed': String(key === filter), text: label,
        onclick: () => { filter = key; [...filters.children].forEach(x => x.setAttribute('aria-pressed', String(x.dataset.key === key))); draw(); } });
      b.dataset.key = key; return b;
    };
    [['all', 'All'], ...Object.entries(OPERATORS).map(([k, o]) => [k, o.name])].forEach(([k, l]) => filters.append(make(k, l)));
    host.append(filters);
  }
  host.append(cols, list, foot);

  function tick() {
    const n = nowParts();
    const h = Math.floor(n.mins / 60);
    clock.textContent = `${(h % 12) || 12}:${pad(n.mins % 60)}:${pad(n.secs)} ${h < 12 ? 'AM' : 'PM'} ${BOARD.tzLabel}`;
  }
  function draw() {
    const n = nowParts();
    const rows = SERVICES.filter(s => filter === 'all' || s.op === filter).map((s, i) => {
      const shift = s.status === 'delayed' ? (Number(s.delay) || 0) : 0;
      const times = nextTrains(s, n, 1 + BOARD.thenCount).map(u => u + shift);
      return { s, i, times };
    }).filter(r => r.times.length).sort((a, b) => a.times[0] - b.times[0] || a.i - b.i).slice(0, limit);
    if (!rows.length) { list.replaceChildren(el('p', { class: 'board-empty', text: 'No upcoming departures.' })); return; }
    list.replaceChildren(...rows.map(r => {
      const s = r.s, op = OPERATORS[s.op] || { name: s.op, code: String(s.op).toUpperCase(), color: '#64748b' };
      const until = r.times[0];
      const [label, kind] = statusOf(s, until);
      const chip = el('span', { class: 'dep-chip', text: s.line || op.code }); chip.style.background = op.color;
      const then = r.times.slice(1).map(u => clockOf(n.mins + u, true)).join(', ');
      return el('div', { class: 'dep' + (s.status === 'cancelled' ? ' is-cancelled' : '') },
        el('div', { class: 'dep-time' },
          el('b', { text: clockOf(n.mins + until) }),
          el('small', { text: countdown(until) })),
        el('div', { class: 'dep-main' }, chip,
          el('div', { class: 'dep-dest' },
            el('b', { text: s.dest }),
            el('small', { text: [s.service || op.name, s.via].filter(Boolean).join(' · ') }),
            el('small', { class: 'dep-then', text: `${everyLabel(Number(s.every))}${then ? ' · Then ' + then : ''}` }),
            s.note ? el('small', { class: 'dep-note', text: s.note }) : null)),
        el('div', { class: 'dep-meta' },
          el('span', { class: 'dep-plat' }, el('small', { class: 'dep-label', text: 'Track' }), el('b', { text: s.track || '–' }),
            s.area ? el('small', { class: 'dep-area', text: s.area }) : null),
          el('span', { class: 'dep-status', 'data-kind': kind, text: label })));
    }));
  }
  tick(); draw();
  setInterval(tick, 1000);
  setInterval(() => { if (!document.hidden) draw(); }, 5000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); draw(); } });
})();
