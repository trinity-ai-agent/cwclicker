import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import App from '../../App.vue'

vi.mock('../../stores/game', () => ({
  useGameStore: vi.fn(() => ({
    audioSettings: { volume: 0.5, frequency: 600, isMuted: false },
    factoryCounts: {},
    getTotalQSOsPerSecond: () => 0,
    licenseLevel: 1,
    load: vi.fn(),
    qsos: 0n,
    save: vi.fn(),
    totalQsosEarned: 0n,
  })),
}))

vi.mock('../../services/audio', () => ({
  audioService: {
    setFrequency: vi.fn(),
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
  },
}))

describe('App.vue responsive shell', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders responsive shell classes on the outer layout', () => {
    const wrapper = shallowMount(App, {
      global: {
        stubs: {
          ClickIndicator: true,
          ErrorBoundary: { template: '<div><slot /></div>' },
          KeepAlive: { template: '<slot />' },
          FactoryCard: true,
          GameLoop: true,
          KeyerArea: true,
          LicensePanel: true,
          MigrationNotification: true,
          MultiBuyPanel: true,
          OfflineProgressNotification: true,
          RareDxBonus: true,
          SettingsPanel: true,
          StatHeader: true,
        },
      },
    })

    expect(wrapper.get('.min-h-screen').classes()).toContain('px-4')
    expect(wrapper.get('.min-h-screen').classes()).toContain('max-w-4xl')
    expect(wrapper.get('main').classes()).toContain('space-y-6')
    expect(wrapper.get('main + footer').exists()).toBe(true)
  })
})
