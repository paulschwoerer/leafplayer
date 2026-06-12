import anyTest, { TestFn } from 'ava';
import {
  asFunction,
  asValue,
  AwilixContainer,
  createContainer,
  Lifetime,
} from 'awilix';
import { FastifyInstance } from 'fastify';

import { initServer } from '@/api/server';
import { DB } from '@/database';

import { createLeafplayerConfig, setupInMemorySQLiteDB } from '../testHelpers';

const test = anyTest as TestFn<{
  db: DB;
  server: FastifyInstance;
  container: AwilixContainer;
}>;

test.beforeEach(async t => {
  const config = createLeafplayerConfig();
  const db = await setupInMemorySQLiteDB();
  const container = createContainer();

  container.register({
    config: asValue(config),
    db: asValue(db),
  });

  container.loadModules(['lib/services/*.ts'], {
    resolverOptions: {
      register: asFunction,
      lifetime: Lifetime.SINGLETON,
    },
    formatName: 'camelCase',
  });

  const server = await initServer(container);

  t.context = {
    db,
    server,
    container,
  };
});

test.afterEach(async t => {
  const { db, server, container } = t.context;

  db.close();
  await server.close();
  await container.dispose();
});

export default test;
