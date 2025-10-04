import pg from 'pg'

export default function setupTypeParser(pgClient: typeof pg) {
  const setTypeParser: (oid: any, format: any, parseFn?: any) => void =
    pgClient.types.setTypeParser

  setTypeParser(pg.types.builtins.TIMESTAMP, 'text')
  setTypeParser(pg.types.builtins.TIMESTAMPTZ, 'text')
  setTypeParser(pg.types.builtins.DATE, 'text')
  setTypeParser(pg.types.builtins.TIME, 'text')
}
