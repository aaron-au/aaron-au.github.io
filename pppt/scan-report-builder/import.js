'use strict';

// Reads a scan write-up pasted as plain text (the kind an AI assistant or the
// coach produces) and turns it into report data. It is deliberately forgiving:
// headings are lines in CAPITALS or starting with #, measurements are
// "Label: value — Rating" lines, and everything else is kept as notes under
// whichever heading it sits beneath. Nothing is thrown away.

const IMPORT_ALIASES = {
  // [group, key]
  'weight': ['composition', 'weight'],
  'body weight': ['composition', 'weight'],
  'bodyweight': ['composition', 'weight'],
  'lean body mass': ['composition', 'lbm'],
  'lbm': ['composition', 'lbm'],
  'skeletal muscle mass': ['composition', 'smm'],
  'smm': ['composition', 'smm'],
  'body fat mass': ['composition', 'bfm'],
  'fat mass': ['composition', 'bfm'],
  'body fat': ['composition', 'bfp'],
  'body fat percentage': ['composition', 'bfp'],
  'body fat percent': ['composition', 'bfp'],
  'percent body fat': ['composition', 'bfp'],
  'pbf': ['composition', 'bfp'],
  'total body water': ['composition', 'tbw'],
  'tbw': ['composition', 'tbw'],
  'visceral fat level': ['visceral', 'vfl'],
  'visceral fat rating': ['visceral', 'vfl'],
  'visceral fat mass': ['visceral', 'vfm'],
  'visceral fat area': ['visceral', 'vfa'],
  'abdominal circumference': ['visceral', 'abdo'],
  'waist circumference': ['visceral', 'abdo'],
  'waist': ['visceral', 'abdo'],
  'waist to hip ratio': ['visceral', 'whr'],
  'waist hip ratio': ['visceral', 'whr'],
  'whr': ['visceral', 'whr'],
  'bmr': ['metabolism', 'bmr'],
  'basal metabolic rate': ['metabolism', 'bmr'],
  'tee': ['metabolism', 'tee'],
  'estimated tee': ['metabolism', 'tee'],
  'total energy expenditure': ['metabolism', 'tee'],
  'recommended intake': ['metabolism', 'intake'],
  'recommended calories': ['metabolism', 'intake'],
  'calorie target': ['metabolism', 'intake'],
  'bio age': ['metabolism', 'bioAge'],
  'biological age': ['metabolism', 'bioAge'],
  'bwi': ['metabolism', 'bwi'],
  'bwi score': ['metabolism', 'bwi'],
  'body wellness index': ['metabolism', 'bwi'],
  'left arm': ['segments', 'leftArm'],
  'right arm': ['segments', 'rightArm'],
  'torso': ['segments', 'torso'],
  'trunk': ['segments', 'torso'],
  'left leg': ['segments', 'leftLeg'],
  'right leg': ['segments', 'rightLeg'],
};

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july',
  'august', 'september', 'october', 'november', 'december'];

function importKey(label) {
  return label.toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[%]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function importRating(s) {
  const t = String(s || '').toLowerCase();
  if (/over|very high|excess/.test(t)) return 'Over range';
  if (/high|above/.test(t)) return 'High';
  if (/low|under|below/.test(t)) return 'Low';
  if (/normal|healthy|standard|average|optimal|within|in range/.test(t)) return 'Normal';
  return '';
}

// "5 September 2026", "5 Sep 2026", "05/09/2026" or "2026-09-05" -> ISO.
function importDate(s) {
  const t = String(s || '').trim();
  let m = t.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  m = t.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})/);
  if (m) {
    const mi = MONTHS.findIndex(mo => mo.startsWith(m[2].toLowerCase().slice(0, 3)));
    if (mi >= 0) return `${m[3]}-${String(mi + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  return '';
}

// "58.6 kg — High" -> { value: '58.6', rating: 'High' }. The value must start
// with a number, which is what separates a measurement from a sentence that
// happens to contain a colon.
function importMeasurement(rest) {
  const m = rest.match(/^~?\s*(\d[\d,]*(?:\.\d+)?(?:\s*[–-]\s*\d[\d,]*(?:\.\d+)?)?)(.*)$/);
  if (!m) return null;
  const value = m[1].replace(/\s*[–-]\s*/, '–');
  const tail = m[2];
  const split = tail.split(/\s+[—–-]\s+|\s*\|\s*|\(|,\s*/);
  const rating = split.length > 1 ? importRating(split.slice(1).join(' ')) : importRating(tail.replace(/^[^A-Za-z]*[A-Za-z/²%]*\s*/, ''));
  return { value, rating };
}

function sentenceCase(s) {
  const t = s.toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function isHeading(line) {
  if (/^#{1,6}\s+/.test(line)) return true;
  const t = line.replace(/\*\*/g, '').trim();
  if (t.length < 3 || t.length > 70) return false;
  if (!/[A-Z]{3}/.test(t)) return false;
  if (/:\s*\S/.test(t)) return false;
  return t === t.toUpperCase();
}

function cleanHeading(line) {
  return line.replace(/^#{1,6}\s+/, '').replace(/\*\*/g, '').replace(/:$/, '').trim();
}

function groupFor(heading) {
  const h = heading.toLowerCase();
  if (/composition/.test(h)) return 'composition';
  if (/visceral/.test(h)) return 'visceral';
  if (/muscle|segment|distribution|balance/.test(h)) return 'segments';
  if (/metabol|energy|calorie/.test(h)) return 'metabolism';
  return null;
}

// Joins a run of lines into the notes format the editor uses: one paragraph
// per line, bullets kept together as a list.
function linesToNotes(lines) {
  const out = [];
  for (const raw of lines) {
    let line = raw.trim();
    if (!line) continue;
    const bullet = /^([•●▪◦*-]|\d+[.)])\s+/.test(line);
    // "Weight ↓ | Body-fat mass ↓ | ..." is a list written on one line.
    const piped = line.split(/\s+\|\s+/);
    if (!bullet && piped.length > 2) {
      piped.forEach(p => out.push({ bullet: true, text: p }));
      continue;
    }
    if (bullet) line = line.replace(/^([•●▪◦*-]|\d+[.)])\s+/, '');
    out.push({ bullet, text: line });
  }
  let text = '';
  out.forEach((item, i) => {
    const prev = out[i - 1];
    if (i > 0) {
      // A list stays attached to the line that introduces it.
      const tight = item.bullet && (prev.bullet || /:$/.test(prev.text));
      text += tight ? '\n' : '\n\n';
    }
    text += item.bullet ? `- ${item.text}` : item.text;
  });
  return text;
}

// Returns the parts of a report the text supplied. The caller merges it over
// a blank report, so anything missing just stays empty.
function parseScanText(text) {
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n')
    .map(l => l.replace(/\t/g, ' ').replace(/\s+$/, ''));

  const result = { client: {}, groups: {}, sections: [], summary: '' };
  const found = [];
  const blocks = [];                 // { heading, group, lines }
  let current = { heading: null, group: null, lines: [] };

  for (let raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // The title line: "EVOLT 360 BODY SCAN REPORT — JORDAN".
    if (!blocks.length && !current.heading && /report/i.test(line) && isHeading(line.replace(/[—–-].*$/, ''))) {
      const [left, name] = line.split(/\s+[—–-]\s+/);
      const scanType = left.replace(/\s*report\s*$/i, '').replace(/\*\*/g, '').replace(/^#+\s*/, '').trim();
      if (scanType) result.client.scanType = scanType.replace(/\b([A-Z])([A-Z]+)\b/g, (w, a, b) => a + b.toLowerCase());
      if (name) result.client.name = name.replace(/\*\*/g, '').trim().replace(/\b([A-Z])([A-Z]+)\b/g, (w, a, b) => a + b.toLowerCase());
      continue;
    }

    if (isHeading(line)) {
      if (current.heading || current.lines.length) blocks.push(current);
      const heading = cleanHeading(line);
      current = { heading, group: groupFor(heading), lines: [] };
      continue;
    }

    // "Label: value" lines, with any bullet or bold stripped first.
    const bare = line.replace(/^([•●▪◦*-]|\d+[.)])\s+/, '').replace(/\*\*/g, '');
    const kv = bare.match(/^([A-Za-z][A-Za-z0-9 %()/&'’-]{0,40}?)\s*:\s*(.+)$/);
    if (kv) {
      const key = importKey(kv[1]);
      const val = kv[2].trim();
      if (['age'].includes(key)) { result.client.age = (val.match(/\d+/) || [''])[0]; continue; }
      if (['height'].includes(key)) { result.client.height = (val.match(/\d+(\.\d+)?/) || [''])[0]; continue; }
      if (['scan date', 'date', 'date of scan'].includes(key) && importDate(val)) {
        result.client.scanDate = importDate(val);
        continue;
      }
      if (['previous scan', 'previous scan date', 'last scan'].includes(key) && importDate(val)) {
        result.prevDate = importDate(val);
        continue;
      }
      if (['name', 'client', 'client name'].includes(key)) { result.client.name = val; continue; }
      if (['current training', 'training'].includes(key)) { result.client.training = val; continue; }
      const target = IMPORT_ALIASES[key];
      const m = target && importMeasurement(val);
      if (m) {
        const [g, k] = target;
        result.groups[g] = result.groups[g] || { values: {} };
        result.groups[g].values[k] = { value: m.value, rating: g === 'segments' ? '' : m.rating };
        found.push(kv[1].trim());
        continue;
      }
    }
    current.lines.push(line);
  }
  if (current.heading || current.lines.length) blocks.push(current);

  // The recommended intake is often only given in a sentence:
  // "The Evolt recommendation of approximately 1,950–2,050 kcal/day ...".
  const metab = result.groups.metabolism;
  if (!(metab && metab.values.intake)) {
    const m = String(text).match(/recommend[^.\n]*?(\d[\d,]*\s*[–-]\s*\d[\d,]*|\d[\d,]{3,})\s*(?:kcal|cal)/i);
    if (m) {
      const g = result.groups.metabolism = metab || { values: {} };
      g.values.intake = { value: m[1].replace(/\s*[–-]\s*/, '–'), rating: '' };
      found.push('Recommended intake');
    }
  }

  // Notes before the first heading become the opening summary.
  for (const b of blocks) {
    // "Lean mass:" on its own introduces the segment figures, which are now
    // tiles, so it has nothing left to introduce.
    b.lines = b.lines.filter(l => !/^[A-Za-z ]{2,30}:$/.test(l) || b.group !== 'segments');
    const notes = linesToNotes(b.lines);
    if (!b.heading) {
      result.summary = [result.summary, notes].filter(Boolean).join('\n\n');
      continue;
    }
    const [titlePart] = b.heading.split(/\s+[—–-]\s+/);
    const focus = /key|focus|improve|priority|attention/i.test(b.heading);
    if (b.group && !(result.groups[b.group] && result.groups[b.group].title)) {
      const g = result.groups[b.group] = result.groups[b.group] || { values: {} };
      g.title = sentenceCase(titlePart);
      g.focus = focus;
      g.notes = notes;
    } else {
      result.sections.push({
        title: sentenceCase(titlePart),
        body: notes,
        style: /target|goal|next step|action|plan/i.test(b.heading) ? 'highlight' : 'normal',
      });
    }
  }

  return { report: result, found };
}

if (typeof module !== 'undefined') module.exports = { parseScanText };
