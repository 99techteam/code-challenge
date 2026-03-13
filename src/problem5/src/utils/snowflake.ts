const EPOCH = 1700000000000n // custom epoch (Nov 14, 2023)
const MACHINE_ID = 1n
const SEQUENCE_BITS = 12n
const MACHINE_BITS = 10n

let sequence = 0n
let lastTimestamp = -1n

export class Snowflake {
  static generate(): string {
    let timestamp = BigInt(Date.now())

    if (timestamp === lastTimestamp) {
      sequence = (sequence + 1n) & ((1n << SEQUENCE_BITS) - 1n)
      if (sequence === 0n) {
        while (timestamp <= lastTimestamp) {
          timestamp = BigInt(Date.now())
        }
      }
    } else {
      sequence = 0n
    }

    lastTimestamp = timestamp

    const id =
      ((timestamp - EPOCH) << (MACHINE_BITS + SEQUENCE_BITS)) |
      (MACHINE_ID << SEQUENCE_BITS) |
      sequence

    return id.toString()
  }
}
