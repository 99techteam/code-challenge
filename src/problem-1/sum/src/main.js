import './style.css'
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './sum'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <h1>Sum to N Demo</h1>

    <div class="input-section">
      <input id="numberInput" type="number" placeholder="Enter a number..." />
    </div>

    <div class="buttons">
      <button id="btnA">Formula O(1)</button>
      <button id="btnB">Iterative O(n)</button>
      <button id="btnC">Recursive O(n)</button>
    </div>

    <div class="results">
      <div class="result-card">
        <h3>Formula Result</h3>
        <p id="resultA">-</p>
        <span id="timeA"></span>
      </div>

      <div class="result-card">
        <h3>Iterative Result</h3>
        <p id="resultB">-</p>
        <span id="timeB"></span>
      </div>

      <div class="result-card">
        <h3>Recursive Result</h3>
        <p id="resultC">-</p>
        <span id="timeC"></span>
      </div>
    </div>
  </div>
`

const input = document.querySelector('#numberInput')

function measure(fn, n) {
  const start = performance.now()
  const result = fn(n)
  const end = performance.now()
  return {
    result,
    time: (end - start).toFixed(4)
  }
}

document.querySelector('#btnA').addEventListener('click', () => {
  const n = Number(input.value)
  if (!n) return

  const { result, time } = measure(sum_to_n_a, n)
  document.querySelector('#resultA').textContent = result
  document.querySelector('#timeA').textContent = `Time: ${time} ms`
})

document.querySelector('#btnB').addEventListener('click', () => {
  const n = Number(input.value)
  if (!n) return

  const { result, time } = measure(sum_to_n_b, n)
  document.querySelector('#resultB').textContent = result
  document.querySelector('#timeB').textContent = `Time: ${time} ms`
})

document.querySelector('#btnC').addEventListener('click', () => {
  const n = Number(input.value)
  if (!n) return

  if (n > 3000) {
    alert('Recursive version may cause stack overflow if n > 3000')
    return
  }

  const { result, time } = measure(sum_to_n_c, n)
  document.querySelector('#resultC').textContent = result
  document.querySelector('#timeC').textContent = `Time: ${time} ms`
})