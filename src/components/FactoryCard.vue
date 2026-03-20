<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'

/**
 * Props for the FactoryCard component.
 */
const props = defineProps({
  factory: {
    type: Object,
    required: true
  }
})

/**
 * Emits events from the component.
 */
const emit = defineEmits(['buy'])

const store = useGameStore()

/**
 * Calculates the current cost of this factory.
 */
const currentCost = computed(() => {
  const owned = store.factoryCounts[props.factory.id] || 0
  return store.getFactoryCost(props.factory.id, owned)
})

/**
 * Determines if the user can afford this factory.
 */
const canAfford = computed(() => {
  return store.qsos >= currentCost.value
})

/**
 * Gets the number of factories currently owned.
 */
const ownedCount = computed(() => {
  return store.factoryCounts[props.factory.id] || 0
})

/**
 * Handles the buy button click.
 */
const handleBuy = () => {
  if (canAfford.value) {
    emit('buy', { factory: props.factory, count: 1 })
  }
}
</script>

<template>
  <div class="border-2 border-terminal-green bg-terminal-bg p-4 rounded">
    <div class="flex justify-between items-start mb-2">
      <h3 class="text-xl font-bold text-terminal-green">{{ factory.name }}</h3>
      <span class="text-sm text-terminal-amber">[Tier {{ factory.tier }}]</span>
    </div>
    
    <p class="text-sm text-gray-400 mb-3">{{ factory.description }}</p>
    
    <div class="flex justify-between items-center">
      <div class="text-terminal-green">
        <span class="mr-4">{{ factory.qsosPerSecond }}/sec</span>
        <span>Cost: {{ currentCost }}</span>
      </div>
      
      <div class="flex items-center gap-2">
        <span v-if="ownedCount > 0" class="text-terminal-amber text-sm">
          Owned: {{ ownedCount }}
        </span>
        <button
          @click="handleBuy"
          :disabled="!canAfford"
          class="px-4 py-1 rounded font-bold transition-colors"
          :class="{
            'bg-terminal-green text-terminal-bg hover:bg-green-600': canAfford,
            'bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed': !canAfford
          }"
        >
          Buy
        </button>
      </div>
    </div>
  </div>
</template>
