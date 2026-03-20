<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from './stores/game'
import { audioService } from './services/audio'
import StatHeader from './components/StatHeader.vue'
import LicensePanel from './components/LicensePanel.vue'
import KeyerArea from './components/KeyerArea.vue'
import ClickIndicator from './components/ClickIndicator.vue'
import AudioPanel from './components/AudioPanel.vue'
import RareDxBonus from './components/RareDxBonus.vue'
import UpgradePanel from './components/UpgradePanel.vue'
import FactoryList from './components/FactoryList.vue'
import GameLoop from './components/GameLoop.vue'

const store = useGameStore()
const clickIndicatorRef = ref(null)
const audioPanelRef = ref(null)

onMounted(() => {
  // Load audio settings from store after game is loaded
  store.load()
  if (audioPanelRef.value && store.audioSettings) {
    audioPanelRef.value.loadSettings(store.audioSettings)
    // Also apply to audio service directly
    audioService.setVolume(store.audioSettings.volume)
    audioService.setFrequency(store.audioSettings.frequency)
    if (store.audioSettings.isMuted) {
      audioService.toggleMute(true)
    }
  }
})

const handleLicenseUpgrade = () => {
  if (store.licenseLevel === 1 && store.qsos >= 500n) {
    store.licenseLevel = 2
    store.qsos -= 500n
  } else if (store.licenseLevel === 2 && store.qsos >= 5000n) {
    store.licenseLevel = 3
    store.qsos -= 5000n
  }
}

const handleFactoryBuy = ({ factory, count }) => {
  store.buyFactory(factory.id, count)
}

const handleKeyerTap = (value) => {
  if (clickIndicatorRef.value) {
    clickIndicatorRef.value.addIndicator(value)
  }
}

const handleAudioSettingsChange = (settings) => {
  store.updateAudioSettings(settings)
}

const handleLotteryActivated = (factory) => {
  // Bonus is already activated in the store
  // This is just for any additional UI feedback if needed
  console.log(`Lottery boost activated for ${factory.name}!`)
}

const handleSolarStormStarted = () => {
  // Solar storm is already activated in the store
  console.log('Solar Storm started! All factories output reduced by 50%')
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
      
      <AudioPanel 
        ref="audioPanelRef" 
        @settings-change="handleAudioSettingsChange" 
      />
      
      <RareDxBonus 
        @lottery-activated="handleLotteryActivated"
        @solar-storm-started="handleSolarStormStarted"
      />
      
      <UpgradePanel />
      
      <FactoryList @buy="handleFactoryBuy" />
    </main>
    
    <footer class="mt-12 pt-6 border-t border-terminal-green text-center text-sm text-gray-500">
      <p>
        Made with ❤️ in Macomb, MI - Inspired by 
        <a 
          href="https://orteil.dashnet.org/cookieclicker/" 
          target="_blank" 
          rel="noopener noreferrer"
          class="text-terminal-green hover:text-terminal-amber transition-colors underline"
        >
          Cookie Clicker
        </a>
      </p>
    </footer>
    
    <GameLoop />
  </div>
</template>
