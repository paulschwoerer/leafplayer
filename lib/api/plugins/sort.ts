import { RouteHandler } from 'fastify';
import fp from 'fastify-plugin';

import { ValidationError } from '@/errors/ValidationError';
import { SortParam } from '@/typings/SortParam';

type SortParamDecorator = (allowedFields: string[]) => RouteHandler<{
  Querystring: {
    sort?: string;
  };
}>;

declare module 'fastify' {
  interface FastifyInstance {
    sortParam: SortParamDecorator;
  }

  interface FastifyRequest {
    sort?: SortParam;
  }
}

export const sortPlugin = fp(async function (server) {
  server.decorate<SortParamDecorator>('sortParam', allowedFields => {
    return async request => {
      const sort = request.query.sort;

      if (!sort) {
        return undefined;
      }

      const param = parseSortParam(sort);

      if (param instanceof Error) {
        throw new ValidationError(param.message);
      }

      if (!allowedFields.includes(param.field)) {
        throw new ValidationError(
          `invalid sort field, valid fields are [${allowedFields.join(',')}]`,
        );
      }

      request.sort = param;
    };
  });
});

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
