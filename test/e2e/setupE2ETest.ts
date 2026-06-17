import fs from 'fs';

import anyTest, { TestFn } from 'ava';
import {
  asFunction,
  asValue,
  AwilixContainer,
  createContainer,
  Lifetime,
} from 'awilix';
import { FastifyInstance } from 'fastify';

import { initServer } from '../../lib/api/server.ts';
import { DB } from '../../lib/database/index.ts';
import { LeafplayerConfig } from '../../lib/config/index.ts';
import {
  createLeafplayerConfig,
  setupInMemorySQLiteDB,
} from '../testHelpers.ts';

const test = anyTest as TestFn<{
  db: DB;
  config: LeafplayerConfig;
  server: FastifyInstance;
  container: AwilixContainer;
}>;

test.beforeEach(async t => {
  const config = createLeafplayerConfig();
  const db = await setupInMemorySQLiteDB();
  const container = createContainer();

  fs.mkdirSync(config.storageDir);

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
    config,
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
