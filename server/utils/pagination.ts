import { Model, Document } from 'mongoose';

interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  filter?: Record<string, any>;
  sort?: Record<string, any>;
  populate?: any;
}

/**
 * Paginate any Mongoose collection
 * @param model Mongoose model
 * @param options Pagination options
 * @returns Paginated result
 */
async function paginate<T extends Document>(
  model: Model<T>,
  options: PaginationOptions = {}
): Promise<PaginationResult<T>> {
  const {
    page = 1,
    limit = 10,
    filter = {},
    sort = {},
    populate = '',
  } = options;

  const skip = (page - 1) * limit;

  // Get total count of documents
  const total = await model.countDocuments(filter);

  // Fetch paginated data
  let query = model.find(filter).sort(sort).skip(skip).limit(limit);

  // Apply population if necessary
  if (populate) {
    query = query.populate(populate);
  }

  const data = await query.exec();

  return {
    data,
    total,
    page,
    pages: Math.ceil(total / limit),
    limit,
  };
}

export default paginate;
