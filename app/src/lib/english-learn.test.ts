import { describe, expect, it } from 'vitest'
import { englishLearnLink } from './englishLearn'

describe('englishLearnLink', () => {
  it('sends oral questions to the oral lesson', () => {
    expect(englishLearnLink('15')).toEqual({ href: '#/study?subject=english&chapter=15', label: 'Hear the oral lesson →' })
  })
  it('opens the matching card deck directly', () => {
    expect(englishLearnLink('4')?.href).toBe('#/study?subject=english&chapter=4&cards=1')
    expect(englishLearnLink('6')?.label).toBe('Practise idiom cards →')
  })
  it('sends grammar chapters 8 and 10 to the grammar rule deck', () => {
    expect(englishLearnLink('10')?.href).toBe('#/study?subject=english&chapter=7&cards=1')
  })
  it('gives no link where nothing teaches the chapter yet', () => {
    expect(englishLearnLink('14')).toBeUndefined()
  })
})
