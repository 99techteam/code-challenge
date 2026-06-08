const httpClient = {
  get: async <T>(url: string): Promise<T> => {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  },
};

export default httpClient;
