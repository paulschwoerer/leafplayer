import anyTest, { type TestFn } from 'ava';

import { type DB } from '../lib/database/index.ts';

import { setupInMemorySQLiteDB } from './testHelpers.ts';

const test = anyTest as TestFn<{
  db: DB;
}>;

test.beforeEach(async t => {
  t.context.db = await setupInMemorySQLiteDB();
});
test.afterEach(t => {
  t.context.db.close();
});

export default test;
