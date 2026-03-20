<script setup>
import { ref } from 'vue'
import { useGameStore } from './stores/game'
import StatHeader from './components/StatHeader.vue'
import LicensePanel from './components/LicensePanel.vue'
import KeyerArea from './components/KeyerArea.vue'
import ClickIndicator from './components/ClickIndicator.vue'
import FactoryList from './components/FactoryList.vue'
import GameLoop from './components/GameLoop.vue'

const clickIndicatorRef = ref(null)

const handleLicenseUpgrade = () => {
  const store = useGameStore()
  if (store.licenseLevel === 1 && store.qsos >= 500n) {
    store.licenseLevel = 2
    store.qsos -= 500n
  } else if (store.licenseLevel === 2 && store.qsos >= 5000n) {
    store.licenseLevel = 3
    store.qsos -= 5000n
  }
}

const handleFactoryBuy = ({ factory, count }) => {
  const store = useGameStore()
  store.buyFactory(factory.id, count)
}

const handleKeyerTap = (value) => {
  if (clickIndicatorRef.value) {
    clickIndicatorRef.value.addIndicator(value)
  }
}
</script>

<template>
  <div class="min-h-screen p-8 max-w-4xl mx-auto">
    <StatHeader />
    <LicensePanel @upgrade="handleLicenseUpgrade" />
    <main class="space-y-6">
      <div class="flex gap-4">
        <div class="flex-1">
          <KeyerArea @tap="handleKeyerTap" />
        </div>
        <ClickIndicator ref="clickIndicatorRef" />
      </div>
      
      <FactoryList @buy="handleFactoryBuy" />
    </main>
    <GameLoop />
  </div>
</template>
