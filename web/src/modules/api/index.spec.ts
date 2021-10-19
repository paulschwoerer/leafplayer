import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { makeApiGetRequest } from '.';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('makeApiGetRequest', () => {
  it('parses a successfull request without a response body', async () => {
    server.use(
      rest.get('/api/endpoint', (req, res, ctx) => {
        return res(ctx.status(201));
      }),
    );

    const response = await makeApiGetRequest<string>('endpoint');

    expect(response).toBe('');
  });

  it('parses a successfull request with a response body', async () => {
    server.use(
      rest.get('/api/endpoint', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: 'test' }));
      }),
    );

    const response = await makeApiGetRequest<{ data: string }>('endpoint');

    expect(response).toStrictEqual({ data: 'test' });
  });

  it('parses an erroneous request without a response body', async () => {
    server.use(
      rest.get('/api/endpoint', (req, res, ctx) => {
        return res(ctx.status(401));
      }),
    );

    const response = await makeApiGetRequest<string>('endpoint');

    expect(response).toStrictEqual({
      statusCode: 401,
      error: 'Unauthorized',
      message: `Unexpected status: Unauthorized`,
    });
  });

  it('parses an erroneous request with a response body', async () => {
    server.use(
      rest.get('/api/endpoint', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            statusCode: 400,
            error: 'BadRequest',
            message: "don't do that",
          }),
        );
      }),
    );

    const response = await makeApiGetRequest<{ data: string }>('endpoint');

    expect(response).toStrictEqual({
      statusCode: 400,
      error: 'BadRequest',
      message: "don't do that",
    });
  });
});
