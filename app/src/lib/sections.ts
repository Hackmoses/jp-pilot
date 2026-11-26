import chemistry from '../../../data/syllabus/chemistry.json'

export type SyllabusChapter = { id: string; number: number; title: string; concepts: string[] }
export type SyllabusSection = { id: string; title: string; chapters: SyllabusChapter[] }

// Physics and Maths keep only section and topic names here, so the full syllabus files
// (with long concept lists) stay out of the main bundle. Chapter ids equal their numbers.
type Row = [string, string, [string, number][]]
function fromRows(rows: Row[]): { sections: SyllabusSection[] } {
  return { sections: rows.map(([id, title, chapters]) => ({
    id, title, chapters: chapters.map(([name, number]) => ({ id: String(number), number, title: name, concepts: [] })),
  })) }
}

const physics = fromRows([
  ['A', 'Mechanics and Properties of Matter', [['Measurements, Units and Vectors', 1], ['Linear Motion and Projectiles', 2], ['Forces, Momentum and Equilibrium', 3], ['Circular Motion and Gravitation', 4], ['Work, Energy, Power and Simple Machines', 5], ['Friction and Elasticity', 6], ['Pressure and Fluids at Rest', 7]]],
  ['B', 'Thermal Physics', [['Temperature and Thermal Expansion', 8], ['Gas Laws and Kinetic Theory', 9], ['Heat, Changes of State and Vapours', 10], ['Heat Transfer', 11]]],
  ['C', 'Oscillations, Waves, Sound and Light', [['Oscillations and Waves', 12], ['Sound', 13], ['Light, Reflection and Mirrors', 14], ['Refraction, Lenses and Optical Instruments', 15], ['Dispersion, Colour and the Electromagnetic Spectrum', 16]]],
  ['D', 'Electricity and Magnetism', [['Electrostatics and Capacitors', 17], ['Electric Cells and Direct-Current Circuits', 18], ['Electrical Energy and Power', 19], ['Magnetic Fields, Motors and Meters', 20], ['Electromagnetic Induction and AC Circuits', 21], ['Conduction in Liquids and Gases', 22]]],
  ['E', 'Modern Physics and Electronics', [['Atomic Physics and Quantum Effects', 23], ['Nuclear Physics', 24], ['Semiconductors and Electronics', 25]]],
])

const mathematics = fromRows([
  ['I', 'Number and Numeration', [['Number Bases', 1], ['Fractions, Decimals, Approximations and Percentages', 2], ['Indices, Logarithms and Surds', 3], ['Sets', 4]]],
  ['II', 'Algebra', [['Polynomials', 5], ['Variation', 6], ['Inequalities', 7], ['Progression', 8], ['Binary Operations', 9], ['Matrices and Determinants', 10]]],
  ['III', 'Geometry and Trigonometry', [['Euclidean Geometry', 11], ['Mensuration', 12], ['Loci', 13], ['Coordinate Geometry', 14], ['Trigonometry', 15]]],
  ['IV', 'Calculus', [['Differentiation', 16], ['Application of Differentiation', 17], ['Integration', 18]]],
  ['V', 'Statistics', [['Representation of Data', 19], ['Measures of Location', 20], ['Measures of Dispersion', 21], ['Permutation and Combination', 22], ['Probability', 23]]],
])

// Slim list from english-bank/syllabus-english.json. The grammar deck covers chapters 7, 8 and 10.
const english = fromRows([
  ['B', 'Lexis and Structure', [
    ['Synonyms', 4], ['Antonyms', 5], ['Idioms and Sentence Interpretation', 6],
    ['Grammar Rules', 7], ['Tenses and Reported Speech', 8], ['Prepositions and Phrasal Verbs', 9],
    ['Word Order, Pronouns and Possessives', 10], ['Confusable Words', 11], ['Spelling', 18],
  ]],
  ['C', 'Oral Forms', [
    ['Vowel Sounds', 12], ['Consonant Sounds', 13], ['Rhymes', 14], ['Word Stress', 15], ['Emphatic Stress', 16],
  ]],
])

// Oral Forms chapters and the lessons in lessons-bank/english-oral.json that teach them.
// Rhymes (14) has no lesson yet, so it stays out of Study.
export const ENGLISH_ORAL_LESSONS: Record<string, string[]> = {
  12: ['english-oral-1', 'english-oral-2'], 13: ['english-oral-3'], 15: ['english-oral-4'], 16: ['english-oral-5'],
}

export const ENGLISH_CARD_TOPICS: Record<string, string> = {
  4: 'synonyms', 5: 'antonyms', 6: 'idioms', 7: 'grammar-rules',
  9: 'phrasal-verbs-prepositions', 11: 'confusable-words', 18: 'spelling',
}

// Biology has no syllabus file yet, so its JAMB sections live here.
const biology: { subject: string; sections: SyllabusSection[] } = {
  subject: 'biology',
  sections: [
    { id: 'A', title: 'Variety of Organisms', chapters: [
      { id: '1', number: 1, title: 'Living Organisms and the Cell', concepts: [] },
      { id: '2', number: 2, title: 'Classification and Evolution', concepts: [] },
    ] },
    { id: 'B', title: 'Form and Functions', chapters: [
      { id: '3', number: 3, title: 'Nutrition', concepts: [] },
      { id: '4', number: 4, title: 'Transport', concepts: [] },
      { id: '5', number: 5, title: 'Respiration', concepts: [] },
      { id: '6', number: 6, title: 'Excretion', concepts: [] },
      { id: '7', number: 7, title: 'Coordination', concepts: [] },
      { id: '8', number: 8, title: 'Reproduction', concepts: [] },
    ] },
    { id: 'C', title: 'Ecology', chapters: [
      { id: '9', number: 9, title: 'Ecology', concepts: [] },
    ] },
    { id: 'D', title: 'Heredity and Variation', chapters: [
      { id: '10', number: 10, title: 'Genetics and Heredity', concepts: [] },
    ] },
  ],
}

const syllabi: Record<string, { sections: SyllabusSection[] }> = { chemistry, physics, mathematics, biology }

export function syllabusSections(subject: string, study = false): SyllabusSection[] {
  if (subject === 'english') return english.sections
  return syllabi[subject]?.sections ?? []
}

// Questions without a chapter id are placed by topic. The part in brackets is only a subtopic label.
const topicChapters: Record<string, Record<string, string>> = {
  physics: {
    'Vectors and scalars': '1', 'Kinematics': '2', 'Motion': '2',
    'Circular motion and gravitation': '4', 'Gravitational field': '4',
    'Work, energy and power': '5', 'Machines': '5', 'Simple machines': '5',
    'Friction': '6', 'Elasticity': '6', 'Pressure': '7', 'Liquids at rest': '7',
    'Heat and thermometry': '8', 'Thermal expansion': '8', 'Vapours': '10', 'Vapours and humidity': '10',
    'Heat transfer': '11', 'Waves': '12', 'Waves and sound': '12', 'Propagation of sound': '13',
    'Optics': '14', 'Reflection': '14', 'Optical instruments': '15', 'Dispersion of light': '16',
    'Capacitors': '17', 'Electrostatics': '17', 'Electrostatics and electromagnetism': '17',
    'Current electricity': '18', 'Electric cells': '18', 'Electrical energy and power': '19',
    'Conduction of electricity through liquids': '22', 'Atomic and nuclear physics': '23',
    'Introductory electronics': '25',
  },
  mathematics: {
    'Number bases': '1', 'Approximation': '2', 'Financial arithmetic': '2', 'Ratio': '2', 'Simple interest': '2',
    'Indices': '3', 'Logarithms': '3', 'Indices and logarithms': '3', 'Surds': '3', 'Standard form': '3',
    'Sets': '4', 'Sets and logic': '4', 'Algebra and equations': '5', 'Change of subject of formula': '5',
    'Factorisation': '5', 'Simultaneous equations': '5', 'Quadratic equations and inequalities': '5',
    'Variation': '6', 'Inequalities': '7', 'Sequences and series': '8',
    'Mensuration and geometry': '12', 'Coordinate geometry': '14', 'Calculus': '16',
    'Statistics': '20', 'Probability and combinatorics': '23',
  },
  chemistry: {
    'Mole concept': '2', 'Gas laws': '3', 'Gases': '3', 'Atomic structure': '4', 'Chemical bonding': '5',
    'Rates and equilibrium': '8', 'Solutions': '11', 'Water': '11', 'Acids and bases': '13',
    'Acids, bases and salts': '13', 'Ion tests': '13', 'Tests': '13', 'Electrolysis': '15',
    'Non-metals': '16', 'Metals': '17', 'Transition metals': '17', 'Alloys': '17',
    'Organic chemistry': '18', 'Industrial chemistry': '21',
  },
  english: {
    'Synonyms': '4', 'Antonyms': '5', 'Idioms and figurative usage': '6', 'Concord and grammar': '7',
  },
  biology: {
    'Cell biology': '1', 'Evolution & classification': '2', 'Nutrition': '3', 'Transport': '4',
    'Respiration': '5', 'Excretion': '6', 'Coordination': '7', 'Reproduction': '8', 'Ecology': '9',
    'Genetics & heredity': '10',
  },
}

export function chapterForTopic(subject: string, topic: string): string | undefined {
  const map = topicChapters[subject]
  if (!map) return undefined
  return map[topic] ?? map[topic.replace(/\s*\(.*\)\s*$/, '')]
}

export function subtopicLabel(topic: string): string | undefined {
  return topic.match(/\(([^)]+)\)\s*$/)?.[1]
}

// Study routes with content. Tests keep the maps in step with the activities and decks.
export const STUDY_TOPICS: Record<string, string[]> = {
  chemistry: ['2', '3', '11', '13', '14', '15'],
  physics: ['2', '5', '17', '14', '18', '12'],
  biology: ['1', '4', '6', '10'],
  mathematics: ['1', '3'],
  english: [...Object.keys(ENGLISH_CARD_TOPICS), ...Object.keys(ENGLISH_ORAL_LESSONS)],
}

export function conceptLessonTopic(subject: string, chapter: string) {
  if (subject === 'biology') return ({ 4: 'biology-heart', 6: 'biology-nephron', 10: 'biology-inheritance' } as Record<string, string | undefined>)[chapter]
  if (subject === 'physics' && chapter === '12') return 'physics-12-waves'
  if (subject === 'chemistry' && chapter === '2') return 'chemistry-2-mole'
  if (subject === 'english' && ENGLISH_ORAL_LESSONS[chapter]) return 'english-oral'
}

// Lessons to show for a chapter when its file covers more than one chapter.
export function conceptLessonIds(subject: string, chapter: string): string[] | undefined {
  if (subject === 'english') return ENGLISH_ORAL_LESSONS[chapter]
}

// Try it ids per topic (null is the first card, saved under the topic key). Kept in step with
// the Try it list by a test, so the Study page can show progress without loading Try it code.
export const STUDY_TRY_IDS: Record<string, Record<string, (string | null)[]>> = {
  chemistry: { '2': [null, 'limiting'], '3': [null, 'diffusion', 'partial-pressure'], '11': ['freezing'], '13': [null], '14': [null], '15': [null] },
  physics: { '2': ['relative-velocity', 'free-fall'], '5': ['pulley'], '17': ['capacitors'], '14': [null], '18': [null], '12': [null] },
  biology: { '1': [null], '10': ['punnett'] },
  mathematics: { '1': [null], '3': ['indices'] },
}
