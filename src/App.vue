<script setup>
import { useGameStore } from './stores/game'
import StatHeader from './components/StatHeader.vue'
import LicensePanel from './components/LicensePanel.vue'
import KeyerArea from './components/KeyerArea.vue'
import FactoryList from './components/FactoryList.vue'
import GameLoop from './components/GameLoop.vue'

const handleLicenseUpgrade = () => {
  const store = useGameStore()
  if (store.licenseLevel === 1 && BigInt(store.qsos) >= 500n) {
    store.licenseLevel = 2
  } else if (store.licenseLevel === 2 && BigInt(store.qsos) >= 5000n) {
    store.licenseLevel = 3
  }
}

const handleFactoryBuy = ({ factory, count }) => {
  const store = useGameStore()
  store.buyFactory(factory.id, count)
}
</script>

<template>
  <div class="min-h-screen p-8 max-w-4xl mx-auto">
    <StatHeader />
    <LicensePanel @upgrade="handleLicenseUpgrade" />
    <main>
      <KeyerArea />
      <FactoryList @buy="handleFactoryBuy" />
    </main>
    <GameLoop />
  </div>
</template>
