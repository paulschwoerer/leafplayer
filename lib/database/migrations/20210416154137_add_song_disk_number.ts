import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('songs', table => {
    table.integer('disk');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('songs', table => {
    table.dropColumn('disk');
  });
}
