import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { makeApiGetRequest } from '.';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('makeApiGetRequest', () => {
  it('parses a successfull request without a response body', async () => {
    server.use(
      http.get('/api/endpoint', () => {
        return new HttpResponse(null, { status: 201 });
      }),
    );

    const response = await makeApiGetRequest<string>('endpoint');

    expect(response).toBe('');
  });

  it('parses a successfull request with a response body', async () => {
    server.use(
      http.get('/api/endpoint', () => {
        return HttpResponse.json({ data: 'test' });
      }),
    );

    const response = await makeApiGetRequest<{ data: string }>('endpoint');

    expect(response).toStrictEqual({ data: 'test' });
  });

  it('parses an erroneous request without a response body', async () => {
    server.use(
      http.get('/api/endpoint', () => {
        return new HttpResponse(null, { status: 401 });
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
      http.get('/api/endpoint', () => {
        return HttpResponse.json(
          {
            statusCode: 400,
            error: 'BadRequest',
            message: "don't do that",
          },
          { status: 400 },
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
