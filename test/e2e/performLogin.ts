import { FastifyInstance } from 'fastify';

type Cookie = {
  name: string;
  value: string;
};

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

  const sessionToken = (response.cookies as Cookie[]).find(
    c => c.name === 'id',
  )?.value;

  if (sessionToken === undefined) {
    throw new Error('cannot find session token in login response');
  }

  return sessionToken;
}
