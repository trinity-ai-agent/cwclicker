import { defineStore } from 'pinia'
import { ref } from 'vue'
import { FACTORIES } from '../constants/factories'

/**
 * Manages the game's core state and progression.
 */
export const useGameStore = defineStore('game', () => {
  /**
 * @returns {bigint} QSO value as BigInt
 */
const qsos = ref(0n)
  const licenseLevel = ref(1)
  const factoryCounts = ref({})

  /**
   * Processes a keyer tap to add QSOs.
   * @param {('dit'|'dah')} type - The type of keyer tap.
   */
  function tapKeyer(type) {
    if (type === 'dit') {
      qsos.value += 1n
    } else if (type === 'dah') {
      qsos.value += 2n
    } else {
      console.warn(`Invalid keyer tap type: ${type}`)
    }
  }

  /**
   * Adds passive QSOs from factories to the total.
   * @param {number} amount - The amount of QSOs to add (will be floored).
   */
  function addPassiveQSOs(amount) {
    qsos.value = qsos.value + BigInt(Math.floor(amount))
  }

  /**
   * Gets the tier multiplier for cost calculation.
   * @param {number} tier - The factory tier (1-7).
   * @returns {number} The multiplier for cost calculation.
   */
  function getTierMultiplier(tier) {
    if (tier >= 1 && tier <= 2) {
      return 1.10
    } else if (tier >= 3 && tier <= 5) {
      return 1.07
    } else if (tier >= 6 && tier <= 7) {
      return 1.05
    }
    return 1.10
  }

  /**
   * Calculates the cost of a factory based on owned count.
   * @param {string} factoryId - The factory ID.
   * @param {number} owned - The number of factories currently owned.
   * @returns {number} The cost of the next factory.
   */
  function getFactoryCost(factoryId, owned) {
    const factory = FACTORIES.find(f => f.id === factoryId)
    if (!factory) {
      console.warn(`Factory not found: ${factoryId}`)
      return 0
    }
    
    const multiplier = getTierMultiplier(factory.tier)
    return factory.baseCost * Math.pow(multiplier, owned)
  }

  /**
   * Calculates the bulk cost for buying multiple factories.
   * @param {string} factoryId - The factory ID.
   * @param {number} count - The number of factories to buy.
   * @returns {number} The total cost with 5% discount.
   */
  function getBulkCost(factoryId, count) {
    const factory = FACTORIES.find(f => f.id === factoryId)
    if (!factory) {
      console.warn(`Factory not found: ${factoryId}`)
      return 0
    }
    
    const currentOwned = factoryCounts.value[factoryId] || 0
    let totalCost = 0
    
    for (let i = 0; i < count; i++) {
      totalCost += getFactoryCost(factoryId, currentOwned + i)
    }
    
    return totalCost * 0.95 // 5% discount
  }

  /**
   * Buys factories and deducts QSOs.
   * @param {string} factoryId - The factory ID.
   * @param {number} count - The number of factories to buy (default 1).
   * @returns {boolean} True if purchase succeeded, false otherwise.
   */
  function buyFactory(factoryId, count = 1) {
    const factory = FACTORIES.find(f => f.id === factoryId)
    if (!factory) {
      console.warn(`Factory not found: ${factoryId}`)
      return false
    }
    
    const cost = getBulkCost(factoryId, count)
    
    if (qsos.value < BigInt(Math.floor(cost))) {
      return false
    }
    
    qsos.value -= BigInt(Math.floor(cost))
    factoryCounts.value[factoryId] = (factoryCounts.value[factoryId] || 0) + count
    
    return true
  }

  /**
   * Saves the current game state to localStorage.
   */
  function save() {
    try {
      const state = {
        qsos: qsos.value.toString(),
        licenseLevel: licenseLevel.value,
        factoryCounts: factoryCounts.value
      }
      localStorage.setItem('cw-keyer-game', JSON.stringify(state))
    } catch (e) {
      console.warn('Failed to save game state:', e)
    }
  }

  /**
   * Loads the game state from localStorage.
   */
  function load() {
    try {
      const saved = localStorage.getItem('cw-keyer-game')
      if (saved) {
        const state = JSON.parse(saved)
        qsos.value = BigInt(state.qsos || '0')
        licenseLevel.value = state.licenseLevel || 1
        factoryCounts.value = state.factoryCounts || {}
      }
    } catch (e) {
      console.warn('Failed to load game state:', e)
    }
  }

  /**
   * Calculates the total QSOs per second from all owned factories.
   * @returns {number} The total QSOs per second.
   */
  function getTotalQSOsPerSecond() {
    let total = 0
    
    for (const [factoryId, count] of Object.entries(factoryCounts.value)) {
      const factory = FACTORIES.find(f => f.id === factoryId)
      if (factory) {
        total += factory.qsosPerSecond * count
      }
    }
    
    return total
  }

  return {
    qsos,
    licenseLevel,
    factoryCounts,
    tapKeyer,
    addPassiveQSOs,
    getFactoryCost,
    getBulkCost,
    buyFactory,
    getTotalQSOsPerSecond,
    save,
    load
  }
})