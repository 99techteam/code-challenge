

export function sumToNLoop(n) {
  if(n<0){
    return
  }

  let sum = 0
  for (let number = 1; number <= n; number += 1) {
    sum += number
  }

  return sum
}

export function sumToNRecursive(n) {
  if(n<0){
    return
  }

  if (n === 0) return 0
  return n + sumToNRecursive(n - 1)
}

export function sumToNFormula(n) {
  if(n<0){
    return
  }
  return (n * (n + 1)) / 2
}
