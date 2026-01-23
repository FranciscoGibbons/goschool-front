/**
 * Fetches all pages from a paginated endpoint.
 * Use this for dropdowns/selectors where all data is needed upfront.
 *
 * @param baseUrl - The API endpoint URL (without query params)
 * @param params - Additional query parameters
 * @param limit - Items per page (default 100, max allowed by backend)
 * @returns All items combined from all pages
 */
export async function fetchAllPages<T>(
  baseUrl: string,
  params: Record<string, string | number> = {},
  limit = 100
): Promise<T[]> {
  // Build query string with params
  const buildUrl = (page: number) => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(page));
    searchParams.set('limit', String(limit));

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${searchParams.toString()}`;
  };

  // First fetch to get total_pages
  const firstResponse = await fetch(buildUrl(1), { credentials: 'include' });

  if (!firstResponse.ok) {
    console.error(`fetchAllPages error: ${firstResponse.status} ${firstResponse.statusText}`);
    throw new Error(`HTTP error ${firstResponse.status}`);
  }

  const firstData = await firstResponse.json();

  // Handle both paginated and non-paginated responses
  if (!firstData || typeof firstData !== 'object') {
    return [];
  }

  // If not paginated response, return as-is
  if (!('data' in firstData) || !('total_pages' in firstData)) {
    return Array.isArray(firstData) ? firstData : [];
  }

  const { data, total_pages } = firstData;

  // If only one page, return immediately
  if (total_pages <= 1) {
    return data;
  }

  // Fetch remaining pages in parallel
  const promises: Promise<T[]>[] = [];
  for (let page = 2; page <= total_pages; page++) {
    promises.push(
      fetch(buildUrl(page), { credentials: 'include' })
        .then(r => {
          if (!r.ok) throw new Error(`HTTP error ${r.status}`);
          return r.json();
        })
        .then(json => json.data)
    );
  }

  const results = await Promise.all(promises);

  // Combine all data
  return [...data, ...results.flat()];
}

/**
 * Axios version of fetchAllPages for components using axios
 */
export async function fetchAllPagesAxios<T>(
  axios: { get: (url: string, config?: object) => Promise<{ data: unknown }> },
  baseUrl: string,
  params: Record<string, string | number> = {},
  limit = 100
): Promise<T[]> {
  // Build query string with params
  const buildParams = (page: number) => ({
    page,
    limit,
    ...params,
  });

  // First fetch to get total_pages
  const firstResponse = await axios.get(baseUrl, {
    params: buildParams(1),
    withCredentials: true,
  });

  const firstData = firstResponse.data;

  // Handle both paginated and non-paginated responses
  if (!firstData || typeof firstData !== 'object') {
    return [];
  }

  // If not paginated response, return as-is
  if (!('data' in (firstData as object)) || !('total_pages' in (firstData as object))) {
    return Array.isArray(firstData) ? firstData as T[] : [];
  }

  const { data, total_pages } = firstData as { data: T[]; total_pages: number };

  // If only one page, return immediately
  if (total_pages <= 1) {
    return data;
  }

  // Fetch remaining pages in parallel
  const promises: Promise<{ data: { data: T[] } }>[] = [];
  for (let page = 2; page <= total_pages; page++) {
    promises.push(
      axios.get(baseUrl, {
        params: buildParams(page),
        withCredentials: true,
      }) as Promise<{ data: { data: T[] } }>
    );
  }

  const results = await Promise.all(promises);

  // Combine all data
  return [...data, ...results.flatMap(r => r.data.data)];
}
