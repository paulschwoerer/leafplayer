import { ValidationError } from '@/errors/ValidationError';
import { SortParam } from '@/typings/SortParam';

type QueryWithOptionalSortParam = {
  sort?: string;
};

export function getSortParam(
  query: QueryWithOptionalSortParam,
  allowedFields: string[],
): SortParam | undefined {
  if (query.sort === undefined) {
    return undefined;
  }

  const sort = parseQueryParam(query.sort);

  if (sort instanceof Error) {
    throw new ValidationError(sort.message);
  }

  if (!allowedFields.includes(sort.field)) {
    throw new ValidationError(
      `invalid sort field, valid fields are [${allowedFields.join(',')}]`,
    );
  }

  return sort;
}

function parseQueryParam(param: string): SortParam | Error {
  const matches = /^(desc|asc)\(([a-zA-Z]+)\)$/.exec(param);

  if (!matches) {
    return Error('cannot parse sort params');
  }

  const direction = matches[1];

  if (direction !== 'asc' && direction !== 'desc') {
    return Error('cannot parse sort params');
  }

  const field = matches[2];

  if (!field) {
    return Error('cannot parse sort params');
  }

  return {
    field,
    direction,
  };
}
