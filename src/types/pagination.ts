export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function createPaginationParams(
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_LIMIT
): PaginationParams {
  return {
    page: Math.max(1, page),
    limit: Math.min(Math.max(1, limit), MAX_LIMIT),
  };
}

export function getPaginationQueryString(params: PaginationParams): string {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }
  return searchParams.toString();
}
