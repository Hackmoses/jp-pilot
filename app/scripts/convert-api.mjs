import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const RAW_DIR = path.join(ROOT, 'api-trial', 'raw');
const OUT_FILE = path.join(ROOT, 'api-trial', 'mapped', 'questions-api-draft.json');
const SCHEMA_FILE = path.join(ROOT, 'schemas', 'questions.schema.json');

const SUBJECT_MAP = [
  { rawSlug: 'english', subjectId: 'english', idPrefix: 'engl', name: 'English Language' },
  { rawSlug: 'mathematics', subjectId: 'mathematics', idPrefix: 'math', name: 'Mathematics' },
  { rawSlug: 'physics', subjectId: 'physics', idPrefix: 'phys', name: 'Physics' },
  { rawSlug: 'chemistry', subjectId: 'chemistry', idPrefix: 'chem', name: 'Chemistry' },
  { rawSlug: 'biology', subjectId: 'biology', idPrefix: 'biol', name: 'Biology' },
  { rawSlug: 'economics', subjectId: 'economics', idPrefix: 'econ', name: 'Economics' },
  { rawSlug: 'government', subjectId: 'government', idPrefix: 'govt', name: 'Government' },
  { rawSlug: 'englishlit', subjectId: 'literature', idPrefix: 'lit', name: 'Literature in English' },
  { rawSlug: 'commerce', subjectId: 'commerce', idPrefix: 'comm', name: 'Commerce' },
  { rawSlug: 'accounting', subjectId: 'accounting', idPrefix: 'acct', name: 'Accounting' },
  { rawSlug: 'geography', subjectId: 'geography', idPrefix: 'geog', name: 'Geography' },
  { rawSlug: 'crk', subjectId: 'crs', idPrefix: 'crs', name: 'Christian Religious Studies' },
  { rawSlug: 'irk', subjectId: 'irs', idPrefix: 'irs', name: 'Islamic Religious Studies' },
  { rawSlug: 'agriculture', subjectId: 'agriculture', idPrefix: 'agri', name: 'Agriculture' },
  { rawSlug: 'computer', subjectId: 'computer', idPrefix: 'comp', name: 'Computer Studies' },
];

const NAMED_ENTITIES = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  deg: '°',
  ang: '∠',
  sup2: '²',
  sup3: '³',
  times: '×',
  divide: '÷',
  plusmn: '±',
  minus: '−',
  le: '≤',
  ge: '≥',
  ne: '≠',
  approx: '≈',
  radic: '√',
  rarr: '→',
  larr: '←',
  harr: '↔',
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'Δ',
  theta: 'θ',
  pi: 'π',
  sigma: 'σ',
  omega: 'Ω',
  lambda: 'λ',
  mu: 'μ',
  phi: 'φ',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
  ndash: '–',
  mdash: '—',
  hellip: '…',
};

function decodeEntities(text) {
  return text.replace(/&([a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);/g, (full, code) => {
    if (code.startsWith('#x') || code.startsWith('#X')) {
      const cp = Number.parseInt(code.slice(2), 16);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : full;
    }
    if (code.startsWith('#')) {
      const cp = Number.parseInt(code.slice(1), 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : full;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? full;
  });
}

export function stripHtmlToPlainText(value) {
  if (value === null || value === undefined) return '';
  let s = String(value);
  if (!s.trim() || s.trim().toLowerCase() === 'null') return '';

  // Keep superscripts as ^<inner> (strip nested tags inside <sup>)
  s = s.replace(/<sup\b[^>]*>([\s\S]*?)<\/sup>/gi, (_, inner) => {
    const cleanInner = inner.replace(/<[^>]+>/g, '').trim();
    return cleanInner ? `^${cleanInner}` : '';
  });

  // Preserve subscripts as plain digits/text
  s = s.replace(/<sub\b[^>]*>([\s\S]*?)<\/sub>/gi, (_, inner) =>
    inner.replace(/<[^>]+>/g, '').trim()
  );

  // Drop raw MathML blocks if duplicated alongside plain question
  s = s.replace(/<math\b[^>]*>[\s\S]*?<\/math>/gi, ' ');

  // Convert block/line tags into newlines before stripping remaining tags
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/(?:p|div|li|tr|h[1-6])>/gi, '\n');
  s = s.replace(/<\/?(?:sub|sup|p|b|i|em|strong|span)\b(?![a-z])[^>]*>?/gi, '');
  s = s.replace(/<[^>]+>/g, '');

  s = decodeEntities(s);

  // Normalize horizontal whitespace while keeping intentional line breaks tidy
  return s
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const BOILERPLATE_SECTIONS = new Set([
  'choose the correct answer from the options provided.',
  'choose the option that correctly answers the question.',
]);

function buildStem(q) {
  const stemText = stripHtmlToPlainText(q.question);
  const sectionText = stripHtmlToPlainText(q.section);
  const passageText = stripHtmlToPlainText(q.passage);

  const parts = [];
  if (passageText) parts.push(passageText);
  if (
    sectionText &&
    !BOILERPLATE_SECTIONS.has(sectionText.toLowerCase()) &&
    sectionText !== passageText &&
    sectionText !== stemText
  ) {
    parts.push(sectionText);
  }
  if (stemText) parts.push(stemText);
  return parts.join('\n\n');
}

function convert() {
  const questions = [];
  let nonEmptyOptionECount = 0;

  for (const subj of SUBJECT_MAP) {
    const dir = path.join(RAW_DIR, subj.rawSlug);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
    const seenIds = new Set();
    let seq = 0;

    for (const file of files) {
      const parsed = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (parsed.status && parsed.status !== 200) continue;
      if (!Array.isArray(parsed.data)) continue;

      for (const rawQ of parsed.data) {
        if (!rawQ || rawQ.id === undefined || rawQ.id === null || seenIds.has(rawQ.id)) continue;
        seenIds.add(rawQ.id);
        seq += 1;

        const rawOpts = rawQ.option || {};
        if (stripHtmlToPlainText(rawOpts.e)) {
          nonEmptyOptionECount += 1;
        }

        const answerId = String(rawQ.answer ?? '').trim().toLowerCase();
        // Drop empty option E; emit core options a-d in schema shape
        const options = ['a', 'b', 'c', 'd'].map((id) => ({
          id,
          text: stripHtmlToPlainText(rawOpts[id]),
          why: '',
          whyWrong: id === answerId ? null : '',
        }));

        const yearLabel = rawQ.examyear ? String(rawQ.examyear).trim() : 'unknown';

        questions.push({
          id: `${subj.idPrefix}-${String(seq).padStart(3, '0')}`,
          subject: subj.subjectId,
          topic: '',
          type: 'recall',
          difficulty: 2,
          stem: buildStem(rawQ),
          options,
          answerId,
          removeOrder: [],
          hint: '',
          explanation: stripHtmlToPlainText(rawQ.solution),
          trap: '',
          mnemonic: '',
          askPresets: [],
          animationId: null,
          lockedOptions: [],
          source: `SdashAPI id ${rawQ.id} (UTME ${yearLabel})`,
          reviewed: false,
          yearVerified: false,
        });
      }
    }
  }

  const draft = {
    version: 1,
    subject: 'all',
    count: questions.length,
    questions,
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(draft, null, 2), 'utf8');

  // Validate against schemas/questions.schema.json
  const schema = JSON.parse(fs.readFileSync(SCHEMA_FILE, 'utf8'));
  const ajv = new Ajv2020({ allErrors: true });
  const validate = ajv.compile(schema);
  const valid = validate(draft);

  const summary = {
    totalQuestions: questions.length,
    nonEmptyOptionEDropped: nonEmptyOptionECount,
    schemaValid: Boolean(valid),
    totalSchemaErrors: validate.errors ? validate.errors.length : 0,
    errorsByRule: {},
    sampleErrors: (validate.errors || []).slice(0, 20),
  };

  for (const err of validate.errors || []) {
    const normalizedPath = err.instancePath.replace(/\/\d+/g, '/*');
    const key = `${normalizedPath || '/'} | ${err.keyword} | ${err.message}`;
    summary.errorsByRule[key] = (summary.errorsByRule[key] || 0) + 1;
  }

  console.log(JSON.stringify(summary, null, 2));
}

convert();
