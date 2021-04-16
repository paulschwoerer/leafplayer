import 'module-alias/register';
import anyTest, { TestInterface } from 'ava';
import jwt from 'jsonwebtoken';
import { afterEachHook, beforeEachHook, TestContext } from './testContext';
import { createServerFromTestContext } from './testHelpers';

const test = anyTest as TestInterface<TestContext>;

test.beforeEach(beforeEachHook);
test.afterEach(afterEachHook);

test('when omiting token, expect an error', async t => {
  const server = await createServerFromTestContext(t);

  const response = await server.inject({
    method: 'GET',
    url: '/api/artworks/album/a3347ad5-8374-4e18-8d94-257b3ca802bb?size=64',
  });

  t.is(response.statusCode, 400);
});

test('when supplying empty token, expect an error', async t => {
  const server = await createServerFromTestContext(t);

  const response = await server.inject({
    method: 'GET',
    url:
      '/api/artworks/album/a3347ad5-8374-4e18-8d94-257b3ca802bb?size=64&token=',
  });

  t.is(response.statusCode, 400);
});

test('when supplying invalid token, expect an error', async t => {
  const invalidToken = jwt.sign('', 'invalidSecret');
  const server = await createServerFromTestContext(t);

  const response = await server.inject({
    method: 'GET',
    url: `/api/artworks/album/a3347ad5-8374-4e18-8d94-257b3ca802bb?size=64&token=${invalidToken}`,
  });

  t.is(response.statusCode, 401);
});

test('when supplying valid token, expect authentication to succeed', async t => {
  const server = await createServerFromTestContext(t);
  const token = jwt.sign(
    {
      exp: Number.MAX_SAFE_INTEGER,
    },
    t.context.config.security.secret,
  );

  const response = await server.inject({
    method: 'GET',
    url: `/api/artworks/album/a3347ad5-8374-4e18-8d94-257b3ca802bb?token=${token}`,
  });

  t.is(response.statusCode, 404);
});
