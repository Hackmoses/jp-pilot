import { describe, expect, it } from 'vitest'
import bank from '../../../../../lessons-bank/english-foundations.json'
import dictionary from '../../../../../lessons-bank/english-oral-words.json'
import spellingCards from '../../../../../cards-bank/spelling.json'
import { isSolved } from './EnglishActivity'
import { placeTile } from './DragTiles'
import { soundCounts } from './sound-counter'
import { syllableSplits, toggleCut } from './syllable-splitter'
import { vowelSorts } from './sound-sorter'
import { silentLetters } from './silent-letter-hunter'
import { assembledWord, wordBuilds } from './word-builder'
import { ruleExamples, ruleResult } from './rule-machine'
import { endingTrials } from './ending-chooser'
import { sentences } from './sentence-fixer'
import { alignSpellings, spellingTrials } from './spot-the-difference'
import { stressTrials } from './stress-tapper'

const words = Object.fromEntries(dictionary.map((word) => [word.id, word]))
const ipa = (id: string) => words[id].ipa.replace(/[\/ˈˌ.]/g, '')
const byWord = new Set(dictionary.map(({ word }) => word))

describe('English Try it answer logic', () => {
  it('counts the checked phonemes, including an x split and a vowel glide', () => {
    for (const { word, sounds, answer, goal, hint } of soundCounts) {
      expect(sounds.join('')).toBe(ipa(word))
      expect(isSolved({ answer, goal, hint }, String(sounds.length))).toBe(true)
    }
    expect(soundCounts[0].answer).toBe('4')
    expect(soundCounts[2].answer).toBe('3')
  })

  it('accepts only the checked syllable cuts, including two cuts in recipe', () => {
    for (const trial of syllableSplits) {
      const { word, phones, parts } = trial
      expect(words[word].ipa.replace(/[\/ˈ]/g, '').split('.')).toEqual(phones)
      let value = ''
      let position = word.length
      for (const part of [...parts].reverse().slice(0, -1)) {
        position -= part.length
        value = toggleCut(value, position)
      }
      expect(isSolved(trial, value)).toBe(true)
      expect(isSolved(trial, toggleCut(value, Number(value.split(',')[0])))).toBe(false)
    }
  })

  it('places each vowel into the group documented by the checked pronunciation', () => {
    for (const trial of vowelSorts) {
      let value = ''
      trial.tiles.forEach((tile, i) => {
        const matching = trial.groups.map((group) => ipa(tile).includes(group.slice(1, -1)))
        expect(matching.filter(Boolean)).toHaveLength(1)
        value = placeTile(value, i, String(matching.indexOf(true) + 1), trial.tiles.length, false)
      })
      expect(isSolved(trial, value)).toBe(true)
    }
  })

  it('hunts silent letters at the right spelling position', () => {
    expect(silentLetters.map(({ word, answer }) => word[Number(answer)])).toEqual(['k', 'b', 'g', 'h'])
    for (const trial of silentLetters) {
      expect(ipa(trial.word)).not.toContain(trial.word[Number(trial.answer)].replace('g', 'ɡ'))
      expect(isSolved(trial, trial.answer)).toBe(true)
      expect(isSolved(trial, String(Number(trial.answer) + 1))).toBe(false)
    }
  })

  it('assembles verified words and sends a displaced tile back to the tray', () => {
    for (const trial of wordBuilds) {
      const value = [1, 2, 3].reduce((previous, group) =>
        placeTile(previous, [3, 0, 1][group - 1], String(group), trial.tiles.length, true), '')
      expect(isSolved(trial, value)).toBe(true)
      expect(assembledWord(trial.tiles, value)).toBe(trial.word)
      expect(byWord.has(trial.word)).toBe(true)
    }
    expect(placeTile('2|3||1', 2, '2', 4, true)).toBe('|3|2|1')
  })

  it('produces the checked British spellings and keeps e in dyeing', () => {
    const outputs = ruleExamples.map(({ base, suffix, rule }) => ruleResult(base, suffix, rule))
    expect(outputs).toEqual(['running', 'making', 'happiness', 'travelled', 'dyeing', 'helpful'])
    expect(outputs.every((word) => byWord.has(word))).toBe(true)
  })

  it('chooses the checked endings and never treats another offered suffix as correct', () => {
    const solutions = endingTrials.map((trial) => {
      expect(trial.options.filter((option) => isSolved(trial, option))).toEqual([trial.answer])
      return trial.stem + trial.answer
    })
    expect(solutions).toEqual(['drinkable', 'flexible', 'confidence', 'musician'])
    expect(solutions.every((word) => byWord.has(word))).toBe(true)
  })

  it('fits the checked confusable to each context', () => {
    expect(sentences.map((sentence) => sentence.options.find((option) => isSolved(sentence, option))))
      .toEqual(['stationery', 'principle', "they're", 'advise'])
    for (const s of sentences) expect(s.options.every((word) => byWord.has(word))).toBe(true)
  })

  it('uses four verified spellings per comparison and highlights precisely the unequal columns', () => {
    for (const [i, trial] of spellingTrials.entries()) {
      const questions = [bank.lessons[8].pastQuestion, bank.lessons[6].pastQuestion, undefined, bank.lessons[5].pastQuestion]
      const source = questions[i]
      if (source) {
        expect(trial.options).toEqual(source.options)
        expect(trial.answer).toBe(source.options['ABCD'.indexOf(source.answer)])
      } else {
        const card = spellingCards.cards.find(({ front }) => front === trial.answer)!
        expect(trial.answer).toBe(card.front)
        // JAMB 2011 Q69 includes forthnight, a different distractor from the word card.
        expect(trial.options).toEqual(['fourtnight', 'fortnight', 'fourthnight', 'forthnight'])
      }
      const { rows, different } = alignSpellings(trial.answer, trial.options)
      expect(rows.map((row) => row.join(''))).toEqual(trial.options)
      for (const [column, marked] of different.entries()) expect(marked).toBe(new Set(rows.map((row) => row[column])).size > 1)
    }
    expect(alignSpellings('eclectic', ['eclectic', 'ecletic']).rows[1]).toEqual(['e', 'c', 'l', 'e', '', 't', 'i', 'c'])
  })

  it('taps the stress position in the word bank and preserves the noun–verb contrast', () => {
    const trials = stressTrials(words)
    expect(trials.map(({ answer }) => answer)).toEqual(['0', '1', '2', '1'])
    for (const trial of trials) {
      const pronunciation = words[trial.id]
      expect(trial.parts.join('')).toBe(pronunciation.word)
      expect(trial.parts.length).toBe(pronunciation.ipa.split(/[.ˈˌ]/).filter((part) => part !== '/').length)
      expect(isSolved(trial, String(pronunciation.stress - 1))).toBe(true)
    }
  })
})
