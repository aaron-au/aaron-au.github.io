'use strict';

// ---- metric catalogue -------------------------------------------------------
// `good` says which way is better, so a rating or a change can be coloured by
// what it means rather than by the word. "High" muscle mass is a win; "High"
// body fat is not. Neutral metrics get no colour at all.

const RATINGS = ['', 'Low', 'Normal', 'High', 'Over range'];

const METRICS = {
  composition: [
    { key: 'weight', label: 'Weight', unit: 'kg', good: 'neutral' },
    { key: 'lbm', label: 'Lean body mass', unit: 'kg', good: 'high' },
    { key: 'smm', label: 'Skeletal muscle mass', unit: 'kg', good: 'high' },
    { key: 'bfm', label: 'Body fat mass', unit: 'kg', good: 'low' },
    { key: 'bfp', label: 'Body fat', unit: '%', good: 'low' },
    { key: 'tbw', label: 'Total body water', unit: 'L', good: 'neutral' },
  ],
  visceral: [
    { key: 'vfl', label: 'Visceral fat level', unit: '', good: 'low' },
    { key: 'vfm', label: 'Visceral fat mass', unit: 'kg', good: 'low' },
    { key: 'vfa', label: 'Visceral fat area', unit: 'cm²', good: 'low' },
    { key: 'abdo', label: 'Abdominal circumference', unit: 'cm', good: 'low' },
    { key: 'whr', label: 'Waist-to-hip ratio', unit: '', good: 'low' },
  ],
  metabolism: [
    { key: 'bmr', label: 'BMR', unit: 'kcal/day', good: 'neutral' },
    { key: 'tee', label: 'Estimated TEE', unit: 'kcal/day', good: 'neutral' },
    { key: 'intake', label: 'Recommended intake', unit: 'kcal/day', good: 'neutral' },
    { key: 'bioAge', label: 'Bio age', unit: 'yrs', good: 'low' },
    { key: 'bwi', label: 'BWI score', unit: '/10', good: 'high' },
  ],
};

const SEGMENTS = [
  { key: 'leftArm', label: 'Left arm' },
  { key: 'rightArm', label: 'Right arm' },
  { key: 'torso', label: 'Torso' },
  { key: 'leftLeg', label: 'Left leg' },
  { key: 'rightLeg', label: 'Right leg' },
];

const DISCLAIMER = 'Body composition figures are estimates from a bioimpedance scan. '
  + 'They are a guide for tracking progress, not a medical diagnosis. '
  + 'Speak to your GP about any health concerns.';

// ---- state -----------------------------------------------------------------

function blankGroup(title, keys, extra = {}) {
  const values = {};
  keys.forEach(k => { values[k] = { value: '', rating: '', prev: '' }; });
  return { title, focus: false, notes: '', values, ...extra };
}

function blankReport() {
  return {
    client: { name: '', age: '', height: '', scanDate: today(), scanType: 'Evolt 360 Body Scan', training: '' },
    coach: { name: '', business: 'Pulse Performance PT', contact: '' },
    prevDate: '',
    summary: '',
    groups: {
      composition: blankGroup('Body composition', METRICS.composition.map(m => m.key)),
      visceral: blankGroup('Visceral fat', METRICS.visceral.map(m => m.key)),
      segments: blankGroup('Muscle distribution', SEGMENTS.map(s => s.key)),
      metabolism: blankGroup('Metabolism & energy', METRICS.metabolism.map(m => m.key)),
    },
    sections: [
      { title: "Coach's interpretation", body: '', style: 'normal' },
      { title: 'Next steps', body: '', style: 'highlight' },
    ],
    disclaimer: DISCLAIMER,
  };
}

// Fill any gaps in a loaded or saved report from a blank one, so files saved
// by an older version still open.
function withDefaults(data) {
  const merge = (base, over) => {
    if (Array.isArray(base)) return Array.isArray(over) ? over : base;
    if (base && typeof base === 'object') {
      const out = { ...base };
      if (over && typeof over === 'object') {
        for (const k of Object.keys(over)) out[k] = k in base ? merge(base[k], over[k]) : over[k];
      }
      return out;
    }
    return over === undefined || over === null ? base : over;
  };
  return merge(blankReport(), data);
}

const STORE_KEY = 'pulse-report';
const LOGO_KEY = 'pulse-logo';

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return withDefaults(JSON.parse(raw));
  } catch (e) { /* fall through to a blank report */ }
  return blankReport();
}

function persist() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ }
}

function getPath(path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), state);
}

function setPath(path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const obj = keys.reduce((o, k) => o[k], state);
  obj[last] = value;
}

// ---- helpers ---------------------------------------------------------------

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function num(s) {
  const n = parseFloat(String(s ?? '').replace(/,/g, ''));
  return isFinite(n) ? n : null;
}

// Show a change to the same precision the coach typed: 42.0 → 39.0 is "3.0".
function decimalsOf(s) {
  const m = String(s ?? '').match(/\.(\d+)/);
  return m ? m[1].length : 0;
}

function fmtNum(n, decimals) {
  return n.toLocaleString('en-AU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// Plain text to HTML. Blank lines split paragraphs, lines starting with
// "- " or "• " become bullets, and **text** is bold. Enough for a coach to
// format notes without learning markdown.
function prose(text) {
  const blocks = String(text || '').trim().split(/\n\s*\n/);
  return blocks.filter(b => b.trim()).map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    const isBullet = l => /^([-•*]|\d+[.)])\s+/.test(l);
    let html = '';
    let list = [];
    const flush = () => {
      if (list.length) html += `<ul>${list.map(l => `<li>${inline(l)}</li>`).join('')}</ul>`;
      list = [];
    };
    let para = [];
    const flushPara = () => {
      if (para.length) html += `<p>${para.map(inline).join('<br>')}</p>`;
      para = [];
    };
    for (const l of lines) {
      if (isBullet(l)) { flushPara(); list.push(l.replace(/^([-•*]|\d+[.)])\s+/, '')); }
      else { flush(); para.push(l); }
    }
    flushPara();
    flush();
    return html;
  }).join('');
}

// good | ok | flag | none: what a rating means for this metric.
function ratingTone(metric, rating) {
  if (!rating) return 'none';
  if (metric.good === 'neutral') return 'none';
  if (rating === 'Normal') return 'ok';
  if (metric.good === 'high') return rating === 'Low' ? 'flag' : 'good';
  return rating === 'Low' ? 'good' : 'flag';
}

function delta(metric, cur, prev) {
  const a = num(cur), b = num(prev);
  if (a === null || b === null || /[–-]\s*\d/.test(String(cur))) return null;
  const d = a - b;
  let tone = 'none';
  if (d !== 0 && metric.good !== 'neutral') {
    tone = (d > 0) === (metric.good === 'high') ? 'good' : 'flag';
  }
  return { d, tone };
}

function deltaHtml(metric, v) {
  const r = delta(metric, v.value, v.prev);
  if (!r) return '';
  const arrow = r.d > 0 ? '▲' : r.d < 0 ? '▼' : '■';
  const dp = Math.max(decimalsOf(v.value), decimalsOf(v.prev));
  const amount = r.d === 0 ? 'no change' : `${fmtNum(Math.abs(r.d), dp)} ${esc(metric.unit)}`.trim();
  return `<span class="delta delta-${r.tone}">${arrow} ${amount}</span>`;
}

function hasValue(v) { return v && String(v.value ?? '').trim() !== ''; }

// ---- report ----------------------------------------------------------------

function logoSrc() {
  return localStorage.getItem(LOGO_KEY) || 'logo.png';
}

function tile(metric, v) {
  const tone = ratingTone(metric, v.rating);
  const chip = v.rating ? `<span class="chip chip-${tone}">${esc(v.rating)}</span>` : '';
  return `
    <div class="tile tile-${tone}">
      <div class="tile-label">${esc(metric.label)}</div>
      <div class="tile-value">${esc(v.value)}<span class="unit">${esc(metric.unit)}</span></div>
      <div class="tile-foot">${chip}${deltaHtml(metric, v)}</div>
    </div>`;
}

function groupHeading(g) {
  const focus = g.focus ? '<span class="focus-tag">Key focus area</span>' : '';
  return `<h2><span>${esc(g.title)}</span>${focus}</h2>`;
}

function metricGroup(name) {
  const g = state.groups[name];
  const shown = METRICS[name].filter(m => hasValue(g.values[m.key]));
  if (!shown.length && !g.notes.trim()) return '';
  const tiles = shown.length
    ? `<div class="tiles">${shown.map(m => tile(m, g.values[m.key])).join('')}</div>`
    : '';
  return `<section class="block ${g.focus ? 'block-focus' : ''}">
    ${groupHeading(g)}${tiles}<div class="prose">${prose(g.notes)}</div>
  </section>`;
}

function segmentGroup() {
  const g = state.groups.segments;
  const v = g.values;
  const any = SEGMENTS.some(s => hasValue(v[s.key]));
  if (!any && !g.notes.trim()) return '';

  const cell = (key, cls) => {
    const s = SEGMENTS.find(x => x.key === key);
    const val = v[key];
    if (!hasValue(val)) return `<div class="seg ${cls} seg-empty"></div>`;
    return `<div class="seg ${cls}">
      <div class="tile-label">${s.label}</div>
      <div class="tile-value">${esc(val.value)}<span class="unit">kg</span></div>
      <div class="tile-foot">${deltaHtml({ unit: 'kg', good: 'high' }, val)}</div>
    </div>`;
  };

  // Left/right balance: the gap as a share of the stronger side.
  const balance = (l, r, label) => {
    const a = num(v[l].value), b = num(v[r].value);
    if (a === null || b === null || !Math.max(a, b)) return '';
    const pct = Math.abs(a - b) / Math.max(a, b) * 100;
    const heavier = a === b ? 'even' : (a > b ? 'left' : 'right') + ' heavier';
    return `<div class="balance">
      <div class="balance-label">${label}</div>
      <div class="balance-bar"><span style="width:${(a / (a + b) * 100).toFixed(1)}%"></span></div>
      <div class="balance-ends"><span>L ${esc(v[l].value)}</span><span>R ${esc(v[r].value)}</span></div>
      <div class="balance-note">${pct.toFixed(1)}% difference, ${heavier}</div>
    </div>`;
  };

  const body = any ? `
    <div class="segments">
      <div class="seg-map">
        ${cell('leftArm', 'la')}${cell('torso', 'to')}${cell('rightArm', 'ra')}
        ${cell('leftLeg', 'll')}${cell('rightLeg', 'rl')}
      </div>
      <div class="seg-balance">
        ${balance('leftArm', 'rightArm', 'Arms')}
        ${balance('leftLeg', 'rightLeg', 'Legs')}
      </div>
    </div>` : '';

  return `<section class="block ${g.focus ? 'block-focus' : ''}">
    ${groupHeading(g)}
    ${any ? '<div class="sub">Lean mass by segment</div>' : ''}
    ${body}
    <div class="prose">${prose(g.notes)}</div>
  </section>`;
}

function progressTable() {
  const rows = [];
  for (const name of ['composition', 'visceral', 'metabolism']) {
    for (const m of METRICS[name]) {
      const v = state.groups[name].values[m.key];
      if (hasValue(v) && String(v.prev).trim()) rows.push({ m, v });
    }
  }
  for (const s of SEGMENTS) {
    const v = state.groups.segments.values[s.key];
    if (hasValue(v) && String(v.prev).trim()) {
      rows.push({ m: { label: `${s.label} lean mass`, unit: 'kg', good: 'high' }, v });
    }
  }
  if (!rows.length) return '';
  const since = state.prevDate ? ` since ${esc(fmtDate(state.prevDate))}` : '';
  return `<section class="block">
    <h2><span>Progress${since}</span></h2>
    <table class="progress">
      <thead><tr><th>Measure</th><th>Previous</th><th>This scan</th><th>Change</th></tr></thead>
      <tbody>${rows.map(({ m, v }) => `<tr>
        <td>${esc(m.label)}</td>
        <td>${esc(v.prev)} <span class="unit">${esc(m.unit)}</span></td>
        <td><strong>${esc(v.value)}</strong> <span class="unit">${esc(m.unit)}</span></td>
        <td>${deltaHtml(m, v)}</td>
      </tr>`).join('')}</tbody>
    </table>
  </section>`;
}

function renderReport() {
  const c = state.client;
  const weight = state.groups.composition.values.weight.value;
  const facts = [
    ['Age', c.age],
    ['Height', c.height && `${c.height} cm`],
    ['Weight', weight && `${weight} kg`],
    ['Previous scan', fmtDate(state.prevDate)],
  ].filter(([, v]) => v);

  const sections = state.sections
    .filter(s => s.title.trim() || s.body.trim())
    .map(s => `<section class="block ${s.style === 'highlight' ? 'block-highlight' : ''}">
      ${s.title.trim() ? `<h2><span>${esc(s.title)}</span></h2>` : ''}
      <div class="prose">${prose(s.body)}</div>
    </section>`).join('');

  const coach = [state.coach.name, state.coach.business, state.coach.contact].filter(x => x.trim());

  document.getElementById('report').innerHTML = `
    <div class="band">
      <img class="band-logo" src="${esc(logoSrc())}" alt="${esc(state.coach.business)}">
      <div class="band-text">
        <div class="band-kicker">${esc(c.scanType || 'Body scan')} report</div>
        <div class="band-name">${esc(c.name || 'Client name')}</div>
        ${c.scanDate ? `<div class="band-date">${esc(fmtDate(c.scanDate))}</div>` : ''}
      </div>
    </div>
    <div class="band-rule"></div>
    <div class="content">
      ${facts.length ? `<dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
      ${c.training.trim() ? `<p class="training"><strong>Current training.</strong> ${esc(c.training)}</p>` : ''}
      ${state.summary.trim() ? `<div class="summary prose">${prose(state.summary)}</div>` : ''}
      ${metricGroup('composition')}
      ${metricGroup('visceral')}
      ${segmentGroup()}
      ${metricGroup('metabolism')}
      ${progressTable()}
      ${sections}
      ${coach.length ? `<div class="signoff"><span>Prepared by</span> ${coach.map(esc).join('  ·  ')}</div>` : ''}
      ${state.disclaimer.trim() ? `<p class="disclaimer">${esc(state.disclaimer)}</p>` : ''}
    </div>`;

  // The printed footer lives in @page margin boxes, which only take literal
  // strings, so it is rewritten whenever the name or date changes.
  const footLeft = [state.coach.business, c.name, fmtDate(c.scanDate)].filter(Boolean).join('  ·  ');
  document.getElementById('page-rules').textContent = `
    @page { @bottom-left { content: ${JSON.stringify(footLeft)}; } }`;
}

// ---- editor ----------------------------------------------------------------

function input(path, label, opts = {}) {
  const v = esc(getPath(path) ?? '');
  const id = 'f-' + path.replace(/\./g, '-');
  let control;
  if (opts.rows) {
    control = `<textarea id="${id}" data-path="${path}" rows="${opts.rows}" placeholder="${esc(opts.placeholder || '')}">${v}</textarea>`;
  } else {
    control = `<input id="${id}" data-path="${path}" type="${opts.type || 'text'}" value="${v}" placeholder="${esc(opts.placeholder || '')}">`;
  }
  return `<label class="field ${opts.cls || ''}" for="${id}"><span>${label}</span>${control}</label>`;
}

function ratingSelect(path) {
  const cur = getPath(path);
  return `<select data-path="${path}" aria-label="Rating">${RATINGS.map(r =>
    `<option value="${r}" ${r === cur ? 'selected' : ''}>${r || '—'}</option>`).join('')}</select>`;
}

function metricTable(name, list, withRating = true) {
  const base = `groups.${name}.values`;
  return `<table class="metric-edit">
    <thead><tr><th></th><th>This scan</th>${withRating ? '<th>Rating</th>' : ''}<th>Previous</th></tr></thead>
    <tbody>${list.map(m => `<tr>
      <th scope="row">${esc(m.label)}${m.unit ? ` <small>${esc(m.unit)}</small>` : ''}</th>
      <td><input data-path="${base}.${m.key}.value" value="${esc(getPath(`${base}.${m.key}.value`))}" aria-label="${esc(m.label)}"></td>
      ${withRating ? `<td>${ratingSelect(`${base}.${m.key}.rating`)}</td>` : ''}
      <td><input data-path="${base}.${m.key}.prev" value="${esc(getPath(`${base}.${m.key}.prev`))}" aria-label="${esc(m.label)} previous"></td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function groupEditor(name, list, withRating = true) {
  const g = `groups.${name}`;
  const checked = state.groups[name].focus ? 'checked' : '';
  return `<details class="panel" open>
    <summary>${esc(state.groups[name].title)}</summary>
    <div class="row">
      ${input(`${g}.title`, 'Heading', { cls: 'grow' })}
      <label class="check"><input type="checkbox" data-path="${g}.focus" ${checked}> Key focus area</label>
    </div>
    ${metricTable(name, list, withRating)}
    ${input(`${g}.notes`, 'Coach notes', { rows: 5 })}
  </details>`;
}

function sectionEditor(s, i) {
  const n = state.sections.length;
  return `<div class="section-edit">
    <div class="row">
      ${input(`sections.${i}.title`, 'Heading', { cls: 'grow' })}
      <label class="field"><span>Style</span>
        <select data-path="sections.${i}.style">
          <option value="normal" ${s.style !== 'highlight' ? 'selected' : ''}>Plain</option>
          <option value="highlight" ${s.style === 'highlight' ? 'selected' : ''}>Highlighted</option>
        </select>
      </label>
    </div>
    ${input(`sections.${i}.body`, 'Text', { rows: 6 })}
    <div class="section-actions">
      <button type="button" data-move="${i}:-1" ${i === 0 ? 'disabled' : ''}>Move up</button>
      <button type="button" data-move="${i}:1" ${i === n - 1 ? 'disabled' : ''}>Move down</button>
      <button type="button" data-remove="${i}" class="danger">Remove</button>
    </div>
  </div>`;
}

function renderEditor() {
  document.getElementById('editor').innerHTML = `
    <details class="panel" open>
      <summary>Client & scan</summary>
      ${input('client.name', 'Client name')}
      <div class="row">
        ${input('client.age', 'Age', { type: 'number' })}
        ${input('client.height', 'Height (cm)', { type: 'number' })}
      </div>
      <div class="row">
        ${input('client.scanDate', 'Scan date', { type: 'date' })}
        ${input('prevDate', 'Previous scan date', { type: 'date' })}
      </div>
      ${input('client.scanType', 'Scan type')}
      ${input('client.training', 'Current training', { rows: 2 })}
      ${input('summary', 'Opening summary (optional)', { rows: 3 })}
    </details>

    ${groupEditor('composition', METRICS.composition)}
    ${groupEditor('visceral', METRICS.visceral)}
    ${groupEditor('segments', SEGMENTS.map(s => ({ ...s, unit: 'kg' })), false)}
    ${groupEditor('metabolism', METRICS.metabolism)}

    <details class="panel" open>
      <summary>Written sections</summary>
      <p class="hint">Leave a blank line between paragraphs. Start a line with "- " for a bullet point. Wrap words in **double asterisks** for bold.</p>
      ${state.sections.map(sectionEditor).join('')}
      <button type="button" data-action="add-section">Add section</button>
    </details>

    <details class="panel" open>
      <summary>Coach & footer</summary>
      <div class="row">
        ${input('coach.name', 'Coach name')}
        ${input('coach.business', 'Business name')}
      </div>
      ${input('coach.contact', 'Contact (phone, email or website)')}
      ${input('disclaimer', 'Disclaimer', { rows: 3 })}
    </details>`;
}

function refresh() {
  persist();
  renderReport();
}

function rebuild() {
  // Keep which panels are collapsed across a rebuild.
  const open = [...document.querySelectorAll('#editor details')].map(d => d.open);
  renderEditor();
  document.querySelectorAll('#editor details').forEach((d, i) => { if (i < open.length) d.open = open[i]; });
  refresh();
}

// ---- events ----------------------------------------------------------------

const editor = document.getElementById('editor');

editor.addEventListener('input', e => {
  const path = e.target.dataset.path;
  if (!path) return;
  setPath(path, e.target.type === 'checkbox' ? e.target.checked : e.target.value);
  refresh();
  // A group's heading doubles as its panel label.
  if (/^groups\.\w+\.title$/.test(path)) {
    e.target.closest('details').querySelector('summary').textContent = e.target.value;
  }
});

editor.addEventListener('click', e => {
  const t = e.target;
  if (t.dataset.action === 'add-section') {
    state.sections.push({ title: '', body: '', style: 'normal' });
    rebuild();
  } else if (t.dataset.remove !== undefined) {
    const i = +t.dataset.remove;
    const s = state.sections[i];
    if ((s.title || s.body) && !confirm(`Remove the section "${s.title || 'untitled'}"?`)) return;
    state.sections.splice(i, 1);
    rebuild();
  } else if (t.dataset.move) {
    const [i, step] = t.dataset.move.split(':').map(Number);
    const [s] = state.sections.splice(i, 1);
    state.sections.splice(i + step, 0, s);
    rebuild();
  }
});

function fileBase() {
  const name = state.client.name.trim() || 'Client';
  return `${name} - Body Scan Report - ${state.client.scanDate || today()}`;
}

document.querySelector('.toolbar').addEventListener('click', e => {
  const action = e.target.dataset.action;
  if (action === 'new') {
    if (!confirm('Start a new report? Save the current one first if you want to keep it.')) return;
    state = blankReport();
    rebuild();
  } else if (action === 'import') {
    openImport();
  } else if (action === 'example') {
    if (!confirm('Replace the current report with the example?')) return;
    state = withDefaults(structuredClone(EXAMPLE));
    rebuild();
  } else if (action === 'save') {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileBase() + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  } else if (action === 'print') {
    // Safari and Firefox ignore the page footer rules in styles.css and print
    // their own file path and page count unless the user switches it off.
    const chromium = /Chrome|Chromium|Edg\//.test(navigator.userAgent);
    if (!chromium && !sessionStorage.getItem('pulse-print-hint')) {
      sessionStorage.setItem('pulse-print-hint', '1');
      alert('In the print window, untick "Print headers and footers" '
        + '(in Safari, click "Show Details" to see it). Otherwise the file path is printed at the bottom of every page.\n\n'
        + 'Chrome or Edge give the best result: they print the report\'s own footer with page numbers.');
    }
    // Chrome and Edge use the document title as the PDF file name.
    const title = document.title;
    document.title = fileBase();
    window.print();
    document.title = title;
  }
});

document.querySelector('.toolbar').addEventListener('change', e => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  if (e.target.dataset.action === 'open') {
    reader.onload = () => {
      try {
        state = withDefaults(JSON.parse(reader.result));
        rebuild();
      } catch (err) {
        alert('That file could not be read as a saved report.');
      }
    };
    reader.readAsText(file);
  } else if (e.target.dataset.action === 'logo') {
    reader.onload = () => {
      try { localStorage.setItem(LOGO_KEY, reader.result); } catch (err) { alert('That image is too large to keep. Try a smaller file.'); }
      renderReport();
    };
    reader.readAsDataURL(file);
  }
  e.target.value = '';
});

// ---- import ----------------------------------------------------------------

// What to give an AI assistant so its write-up imports cleanly. The importer
// copes with looser text than this, but this layout never needs fixing up.
const AI_PROMPT = `Write the body scan report as plain text in exactly this layout, so it can be imported into our report builder.

First lines:
EVOLT 360 BODY SCAN REPORT — <client first name>
Scan Date: <e.g. 5 September 2026>
Age: <years>
Height: <cm>
Current training: <one sentence>

Then these sections, each starting with its heading in CAPITALS on its own line:
BODY COMPOSITION
VISCERAL FAT (add " — KEY AREA TO IMPROVE" to whichever section is the main focus)
MUSCLE DISTRIBUTION
METABOLISM & ENERGY

Under each heading, give every measurement on its own line as "Label: value unit — Rating", where Rating is Low, Normal, High or Over Range, or leave the rating off if the scan gives none. Use these labels:
Body composition: Weight, Lean Body Mass, Skeletal Muscle Mass, Body Fat Mass, Body Fat (%), Total Body Water
Visceral fat: Visceral Fat Level, Visceral Fat Mass, Visceral Fat Area, Abdominal Circumference, Waist-to-Hip Ratio
Muscle distribution (lean mass in kg): Left Arm, Right Arm, Torso, Left Leg, Right Leg
Metabolism: BMR, Estimated TEE, Recommended Intake (e.g. 1,950–2,050 kcal/day), Bio Age, BWI Score

After the measurements, write the coach's notes for that section, one paragraph per line. For a list, start each line with "- ".

Then add any further sections the same way (heading in CAPITALS, then paragraphs), for example COACH'S INTERPRETATION, NEXT SCAN and INITIAL TARGET. Sections with TARGET, GOAL or PLAN in the heading are highlighted in the report.

Plain text only: no markdown tables, no bold, no emoji.`;

const importDialog = document.getElementById('import-dialog');
const importText = document.getElementById('import-text');
const importStatus = document.getElementById('import-status');
const importCarry = document.getElementById('import-carry');

function reportHasNumbers(r) {
  return Object.values(r.groups).some(g => Object.values(g.values).some(hasValue));
}

function openImport() {
  importStatus.textContent = '';
  importCarry.checked = false;
  // Carrying numbers forward only makes sense if there are some to carry.
  const carryRow = document.getElementById('import-carry-row');
  carryRow.hidden = !reportHasNumbers(state);
  if (!carryRow.hidden && state.client.name) {
    carryRow.lastChild.textContent = ` Use ${state.client.name}'s ${fmtDate(state.client.scanDate) || 'current'} scan (open now) as the previous scan, for progress tracking`;
  }
  importDialog.showModal();
  importText.focus();
}

function applyImport(parsed, carry) {
  const old = state;
  const next = blankReport();
  next.coach = old.coach;
  next.disclaimer = old.disclaimer;
  Object.assign(next.client, parsed.client);
  if (parsed.summary) next.summary = parsed.summary;
  if (parsed.prevDate) next.prevDate = parsed.prevDate;

  for (const [name, g] of Object.entries(parsed.groups)) {
    const target = next.groups[name];
    if (g.title) target.title = g.title;
    if (g.focus !== undefined) target.focus = g.focus;
    if (g.notes) target.notes = g.notes;
    for (const [k, v] of Object.entries(g.values || {})) {
      if (target.values[k]) Object.assign(target.values[k], v);
    }
  }
  if (parsed.sections.length) next.sections = parsed.sections;

  if (carry) {
    for (const [name, g] of Object.entries(next.groups)) {
      for (const [k, v] of Object.entries(g.values)) v.prev = old.groups[name].values[k].value || '';
    }
    next.prevDate = old.client.scanDate;
    for (const k of ['name', 'age', 'height', 'training']) {
      if (!next.client[k]) next.client[k] = old.client[k];
    }
  }
  state = withDefaults(next);
  rebuild();
}

document.getElementById('import-go').addEventListener('click', () => {
  const text = importText.value.trim();
  if (!text) { importStatus.textContent = 'Paste the write-up first.'; return; }

  // A saved report pasted as text opens as-is.
  if (text.startsWith('{')) {
    try {
      state = withDefaults(JSON.parse(text));
      rebuild();
      importDialog.close();
      return;
    } catch (e) { /* not JSON after all, so read it as a write-up */ }
  }

  const { report, found } = parseScanText(text);
  if (!found.length && !report.sections.length) {
    importStatus.textContent = 'Nothing recognisable was found. Try the layout in "Copy instructions for an AI assistant".';
    return;
  }
  applyImport(report, importCarry.checked);
  importDialog.close();
  importText.value = '';
  alert(`Imported ${found.length} measurements and ${report.sections.length} extra sections. Check the ratings and notes before saving the PDF.`);
});

document.getElementById('import-file').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { importText.value = reader.result; importStatus.textContent = `Loaded ${file.name}.`; };
  reader.readAsText(file);
  e.target.value = '';
});

document.getElementById('import-copy-prompt').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(AI_PROMPT);
    importStatus.textContent = 'Copied. Paste it into the AI chat along with the scan results.';
  } catch (e) {
    importText.value = AI_PROMPT;
    importStatus.textContent = 'Couldn\'t reach the clipboard, so the instructions are in the box above. Copy them from there.';
  }
});

// ---- example ---------------------------------------------------------------

// A made-up client with two scans, so the example shows progress tracking too.
const EXAMPLE = {
  client: {
    name: 'Jordan Ellis', age: '36', height: '175', scanDate: '2026-09-05', scanType: 'Evolt 360 Body Scan',
    training: 'Two small-group strength classes and one PT session per week, plus a Saturday parkrun.',
  },
  coach: { name: 'Coach name', business: 'Pulse Performance PT', contact: '' },
  prevDate: '2026-06-13',
  summary: 'Twelve weeks in, Jordan has dropped 3.4 kg and almost all of it is fat. Muscle mass has held and even crept up, which is exactly the pattern we want.',
  groups: {
    composition: {
      title: 'Body composition', focus: false,
      values: {
        weight: { value: '85.0', rating: '', prev: '88.4' },
        lbm: { value: '58.6', rating: 'Normal', prev: '58.1' },
        smm: { value: '31.6', rating: 'Normal', prev: '31.2' },
        bfm: { value: '26.4', rating: 'High', prev: '30.3' },
        bfp: { value: '31.1', rating: 'High', prev: '34.3' },
        tbw: { value: '', rating: '', prev: '' },
      },
      notes: 'Body fat mass is down 3.9 kg while lean mass is up half a kilo. The scale says 3.4 kg, but the change in body composition is bigger than that number suggests.\n\n'
        + 'Body fat percentage is still in the high range, so the priority stays the same: keep losing fat while holding on to muscle.',
    },
    visceral: {
      title: 'Visceral fat', focus: true,
      values: {
        vfl: { value: '9', rating: 'High', prev: '11' },
        vfm: { value: '3.2', rating: '', prev: '3.9' },
        vfa: { value: '109', rating: 'High', prev: '128' },
        abdo: { value: '97.0', rating: '', prev: '101.5' },
        whr: { value: '0.92', rating: 'High', prev: '0.94' },
      },
      notes: 'This is the key health marker to keep working on. Visceral fat sits around the abdominal organs and is linked to higher cardiometabolic risk, so it matters more than the number on the scale.\n\n'
        + 'It is moving the right way: the visceral fat area is down 19 cm² and the waist is down 4.5 cm.',
    },
    segments: {
      title: 'Muscle distribution', focus: false,
      values: {
        leftArm: { value: '3.08', rating: '', prev: '3.02' },
        rightArm: { value: '3.15', rating: '', prev: '3.10' },
        torso: { value: '24.80', rating: '', prev: '24.60' },
        leftLeg: { value: '9.05', rating: '', prev: '8.95' },
        rightLeg: { value: '9.20', rating: '', prev: '9.12' },
      },
      notes: 'Jordan is well balanced left to right and upper to lower body. The small side-to-side differences are normal.\n\n'
        + 'Every segment gained a little lean mass, which shows the strength work is doing its job during the calorie deficit.',
    },
    metabolism: {
      title: 'Metabolism & energy', focus: false,
      values: {
        bmr: { value: '1,735', rating: '', prev: '1,720' },
        tee: { value: '2,690', rating: '', prev: '2,660' },
        intake: { value: '1,950–2,050', rating: '', prev: '' },
        bioAge: { value: '38', rating: '', prev: '41' },
        bwi: { value: '6.4', rating: '', prev: '5.6' },
      },
      notes: 'Treat the estimated TEE as a starting point, not an exact requirement.\n\n'
        + 'The recommended 1,950–2,050 kcal/day, with plenty of protein, has been working. We will keep it there and adjust based on progress, hunger and recovery.',
    },
  },
  sections: [
    {
      title: "Coach's interpretation", style: 'normal',
      body: 'This is a great first block. Most people who lose weight this fast give up some muscle along the way. Jordan hasn\'t, because training stayed consistent.\n\n'
        + 'For the next 12 weeks the focus is:\n'
        + '- Keep both strength classes and the PT session every week\n'
        + '- Protein at every meal\n'
        + '- Build daily steps up towards 9,000',
    },
    {
      title: 'Next target', style: 'highlight',
      body: 'By the next scan, aim for **body fat below 29%** and a **visceral fat level of 8 or lower**, with skeletal muscle held at 31.5 kg or above.\n\n'
        + 'That would mean roughly another 2–3 kg of fat loss. We judge it on the scan, not the scale.',
    },
  ],
  disclaimer: DISCLAIMER,
};

// ---- start -----------------------------------------------------------------

// index.html#example opens straight onto the example, for a demo.
if (location.hash === '#example') state = withDefaults(structuredClone(EXAMPLE));
rebuild();
