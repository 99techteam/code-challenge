import { mount } from 'svelte'
import App from './App.svelte'
import './assets/styles.css'
import './index.css'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
