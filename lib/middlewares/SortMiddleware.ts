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

    let param: SortParam;

    try {
      param = parseSortParam(sort);
    } catch (e) {
      return sendBadRequestError(reply, e.message);
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

function parseSortParam(param: string): SortParam {
  const matches = /^(desc|asc)\(([a-zA-Z]+)\)$/.exec(param);

  if (!matches) {
    throw Error('cannot parse sort params');
  }

  const direction = matches[1];

  if (direction !== 'asc' && direction !== 'desc') {
    throw Error('cannot parse sort params');
  }

  const field = matches[2];

  if (!field) {
    throw Error('cannot parse sort params');
  }

  return {
    field,
    direction,
  };
}
