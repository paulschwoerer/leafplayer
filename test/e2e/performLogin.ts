import { FastifyInstance, LightMyRequestResponse } from 'fastify';

export async function performLogin(
  server: FastifyInstance,
  username: string,
  password: string,
): Promise<string> {
  const response = await server.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      username,
      password,
    },
  });

  if (response.statusCode === 401) {
    throw new Error('unauthorized');
  }

  const sessionToken = extractSessionTokenFromResponse(response);

  if (sessionToken === null) {
    throw new Error('cannot find session token in login response');
  }

  return sessionToken;
}

function extractSessionTokenFromResponse(
  response: LightMyRequestResponse,
): string | null {
  type Cookie = {
    name: string;
    value: string;
  };

  const cookies = response.cookies as Cookie[];

  const sessionCookie = cookies.find(cookie => cookie.name === 'id');

  return sessionCookie?.value || null;
}
