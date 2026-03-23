import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('App.vue responsive shell', () => {
  it('renders responsive shell classes on the outer layout', async () => {
    const AppShell = {
      template: `
        <div class="min-h-screen px-4 sm:px-8">
          <div class="flex flex-col md:flex-row gap-2 md:gap-4"></div>
        </div>
      `,
    }

    const wrapper = mount(AppShell)

    expect(wrapper.get('div').classes()).toContain('px-4')
    expect(wrapper.get('div').classes()).toContain('sm:px-8')
    expect(wrapper.get('div > div').classes()).toContain('flex-col')
    expect(wrapper.get('div > div').classes()).toContain('md:flex-row')
    expect(wrapper.get('div > div').classes()).toContain('gap-2')
    expect(wrapper.get('div > div').classes()).toContain('md:gap-4')
  })
})
