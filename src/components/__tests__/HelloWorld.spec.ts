import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })

  it('渲染属性', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Hello Vitest' } })
    console.log(wrapper.html())
    expect(wrapper.find('h1').text()).toContain('Hello Vitest')
  })
})
