import axios from 'axios';

/**
 * The HTTP client the app reaches the network through.
 *
 * An instance rather than the bare `axios` export so request policy lives in
 * one place instead of being restated, or forgotten, at each call site. Today
 * that policy is a timeout; a base URL, auth header or interceptor would go
 * here too.
 */
export const http = axios.create({
  // A request that has not answered in ten seconds is not going to. Failing
  // hands it back to React Query, which retries once and then says so — `fetch`
  // had no timeout at all, so a hung request left the card reading "Updating…"
  // for as long as the socket stayed open.
  timeout: 10_000,
});
