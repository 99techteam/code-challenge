export default async function apiCaller(
  url: string,
  { noParse, signal }: { noParse?: boolean; signal?: AbortSignal | null } = {},
) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error('Unable to load live prices right now.');
  }

  return noParse ? response : response.json();
}
