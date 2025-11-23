// Global cache for promises and resolved data
const fetchCache: Record<string, any> = {}
const promiseCache: Record<string, Promise<any>> = {}

export function useFetchSuspense<T = any>(url: string): T {
  // If data already cached, return immediately
  if (fetchCache[url]) return fetchCache[url]

  // If fetch is already in progress, throw the promise (suspends)
  if (!promiseCache[url]) {
    promiseCache[url] = fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then(json => {
        fetchCache[url] = json // cache resolved data
        return json
      })
  }

  // Suspend by throwing the promise
  throw promiseCache[url]
}
