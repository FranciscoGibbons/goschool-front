import { useState, useCallback, useRef, useEffect } from 'react';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface UseInfiniteScrollOptions {
  /** Initial page size */
  limit?: number;
  /** Threshold in pixels from bottom to trigger load */
  threshold?: number;
}

interface UseInfiniteScrollReturn<T> {
  /** All loaded items */
  items: T[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Current page number */
  page: number;
  /** Total items available */
  total: number;
  /** Load the next page */
  loadMore: () => Promise<void>;
  /** Reset and reload from page 1 */
  reset: () => void;
  /** Ref to attach to scrollable container */
  scrollRef: React.RefObject<HTMLDivElement>;
  /** Manual fetch with custom params */
  fetchPage: (page: number, params?: Record<string, string | number>) => Promise<void>;
  /** Set custom params and reload */
  setParams: (params: Record<string, string | number>) => void;
}

export function useInfiniteScroll<T>(
  baseUrl: string,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn<T> {
  const { limit = 20, threshold = 200 } = options;

  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [params, setParamsState] = useState<Record<string, string | number>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const hasMore = page < totalPages;

  const buildUrl = useCallback((pageNum: number) => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(pageNum));
    searchParams.set('limit', String(limit));

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${searchParams.toString()}`;
  }, [baseUrl, limit, params]);

  const fetchPage = useCallback(async (pageNum: number) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(buildUrl(pageNum), { credentials: 'include' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error fetching data');
      }

      // Handle paginated response
      if (data && typeof data === 'object' && 'data' in data) {
        const paginatedData = data as PaginatedResponse<T>;

        if (pageNum === 1) {
          setItems(paginatedData.data);
        } else {
          setItems(prev => [...prev, ...paginatedData.data]);
        }

        setTotalPages(paginatedData.total_pages);
        setTotal(paginatedData.total);
        setPage(pageNum);
      } else if (Array.isArray(data)) {
        // Non-paginated response
        setItems(data);
        setTotalPages(1);
        setTotal(data.length);
        setPage(1);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [buildUrl]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchPage(page + 1);
  }, [hasMore, isLoading, page, fetchPage]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setTotalPages(1);
    setTotal(0);
    setError(null);
    fetchPage(1);
  }, [fetchPage]);

  const setParams = useCallback((newParams: Record<string, string | number>) => {
    setParamsState(newParams);
    setItems([]);
    setPage(1);
  }, []);

  // Re-fetch when params change
  useEffect(() => {
    fetchPage(1);
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll handler
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      if (isLoading || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < threshold) {
        loadMore();
      }
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMore, threshold, loadMore]);

  return {
    items,
    isLoading,
    error,
    hasMore,
    page,
    total,
    loadMore,
    reset,
    scrollRef,
    fetchPage,
    setParams,
  };
}

export default useInfiniteScroll;
