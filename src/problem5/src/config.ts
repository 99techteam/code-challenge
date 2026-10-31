function readPort(value: string | undefined, name: string, fallback: number): number {
  if (value === undefined || value === '') return fallback;
  if (!/^\d+$/.test(value)) throw new Error(`${name} must be an integer between 1 and 65535`);
  const port = Number(value);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535`);
  }
  return port;
}

export const port = readPort(process.env.PORT, 'PORT', 3000);
export const socketPort = readPort(process.env.PGLITE_SOCKET_PORT, 'PGLITE_SOCKET_PORT', 0);
