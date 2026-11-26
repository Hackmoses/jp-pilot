export const foundationSection = {
  id: 'foundations',
  title: 'Spelling and Sounds',
  chapters: [
    'Letters, sounds and the dictionary',
    'Hear and split syllables',
    'Vowel sounds and their spellings',
    'Consonants and silent letters',
    'Build words from parts',
    'Five spelling rules worth knowing',
    'Tricky endings and British spelling',
    'Confusing pairs and homophones',
    'Spot a misspelt word',
    'From syllables to stress',
  ].map((title, i) => ({ id: 'english-foundations-' + (i + 1), title, number: i + 1, concepts: [] })),
}
