'use strict'

import { describe, it, expect } from 'vitest'
import { UPGRADES } from '../upgrades'

describe('UPGRADES', () => {
  it('keeps late-game upgrade costs exact as bigint values', () => {
    const upgrade = UPGRADES.find(u => u.id === 'alternate-dimension-dxcc-upgrade-8')

    expect(upgrade).toBeDefined()
    expect(typeof upgrade.baseCost).toBe('bigint')
    expect(upgrade.baseCost).toBe(500000000000000000n)
  })
})
