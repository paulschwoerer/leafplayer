import anyTest, { TestFn } from 'ava';

import { DB } from '@/database';

import { setupInMemorySQLiteDB } from './testHelpers';

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
