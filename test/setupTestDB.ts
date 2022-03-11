import anyTest, { TestFn } from 'ava';
import { Knex } from 'knex';

import { setupInMemorySQLiteDB } from './testHelpers';

const test = anyTest as TestFn<{
  db: Knex;
}>;

test.beforeEach(async t => {
  t.context.db = await setupInMemorySQLiteDB();
});
test.afterEach(async t => {
  await t.context.db.destroy();
});

export default test;
