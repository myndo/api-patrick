import { Prisma } from '../../database/prisma';
import { SortType } from './request-pagination.dto';

type OrderBy = { [field: string]: 'asc' | 'desc' };

export type PrismaPagination = {
  take: number;
  skip: number;
  page: number;
  orderBy?: OrderBy;
};

export type PaginationType = {
  page: number;
  take: number;
  skip?: number;
  limit?: number;
  offset?: number;
  cursor?: string;
  orderBy?: any;
  sortBy?: string;
  sort: SortType;
};

export type WithPaginationRequest = {
  pagination?: PrismaPagination;
  value: any;
  rowCount?: number;
};

export type WithPaginationResponse<Value = null> = {
  total: number;
  per_page: number;
  current_page: number;
  next_page: number;
  prev_page: number;
  last_page: number;
  sort: SortType;
  total_page: number;
  total_value: number;
  value: Value;
};

export const addPagination = (options: PaginationType) => {
  const pagination = {} as any;

  const { page, take, sort, sortBy } = options;
  const takePage = Number(page);
  const currentTake = Number(take);
  const takeSkip = (Number(page) - 1) * currentTake;
  const pageTakeSkip = {
    page: takePage <= 0 ? 1 : takePage,
    take: currentTake,
    skip: takeSkip < 0 ? takeSkip * -1 : takeSkip,
  };
  if (sortBy) {
    pagination.orderBy = { [sortBy as string]: sort as Prisma.SortOrder };
  }
  pagination.sort = sort;
  pagination.offset = takeSkip;
  pagination.page = pageTakeSkip?.page;
  pagination.limit = pageTakeSkip?.take;
  pagination.take = pageTakeSkip?.take;
  pagination.skip = pageTakeSkip?.skip;

  return pagination;
};

export const withPagination = <V>({
  value,
  rowCount,
  pagination,
}: WithPaginationRequest): WithPaginationResponse<V> => {
  const n_pages = Math.ceil(Number(rowCount) / Number(pagination?.take));

  const next_page =
    pagination?.page && pagination?.page < n_pages
      ? pagination?.page + 1
      : undefined;

  const prev_page =
    pagination?.page && pagination?.page > 1 ? pagination?.page - 1 : undefined;

  return {
    total: rowCount,
    next_page: next_page,
    prev_page: prev_page,
    total_page: n_pages,
    per_page: pagination?.take ?? 0,
    current_page: pagination?.page,
    last_page: n_pages ? n_pages : undefined,
    sort: pagination.orderBy.sort as SortType,
    total_value: Array.isArray(value) ? value.length : 0,
    value,
  };
};
