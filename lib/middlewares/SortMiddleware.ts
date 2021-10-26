import { SortParam } from '@/typings/SortParam';
import { sendBadRequestError } from '@/helpers/responses';

import { Middleware } from './Middleware';

declare module 'fastify' {
  interface FastifyRequest {
    sort?: SortParam;
  }
}

type SortRequestParams = {
  Querystring: {
    sort?: string;
  };
};

export function useSortMiddleware(
  allowedFields: string[],
): {
  preHandler: Middleware<SortRequestParams>;
} {
  return {
    preHandler: createSortMiddleware(allowedFields),
  };
}

export function withTimestamps(...allowedFields: string[]): string[] {
  return ['createdAt', 'updatedAt', ...allowedFields];
}

function createSortMiddleware(
  allowedFields: string[],
): Middleware<SortRequestParams> {
  return async function (request, reply) {
    const sort = request.query.sort;

    if (!sort) {
      return undefined;
    }

    const param = parseSortParam(sort);

    if (param instanceof Error) {
      return sendBadRequestError(reply, param.message);
    }

    if (!allowedFields.includes(param.field)) {
      return sendBadRequestError(
        reply,
        `invalid sort field, valid fields are [${allowedFields.join(',')}]`,
      );
    }

    request.sort = param;
  };
}

function parseSortParam(param: string): SortParam | Error {
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
