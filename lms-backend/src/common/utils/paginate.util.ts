import { Model } from 'mongoose';
import { PaginationDto } from '../dto/pagination.dto';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export async function paginate<T>(
  model: Model<any>,
  filter: Record<string, any> = {},
  paginationDto?: PaginationDto,
  options?: {
    populate?: any;
    sort?: any;
    select?: any;
  },
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, Number(paginationDto?.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(paginationDto?.limit) || 10));
  const skip = (page - 1) * limit;

  let query = model.find(filter).skip(skip).limit(limit);

  if (options?.sort) {
    query = query.sort(options.sort);
  }
  if (options?.populate) {
    query = query.populate(options.populate);
  }
  if (options?.select) {
    query = query.select(options.select);
  }

  const [items, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter).exec(),
  ]);

  return {
    items,
    total,
    page,
    limit,
  };
}
