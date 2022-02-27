import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('search_history', table => {
    table.uuid('id').primary().notNullable();
    table
      .uuid('userId')
      .references('users.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .notNullable();
    table
      .string('artistId')
      .references('artists.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .nullable();
    table
      .string('albumId')
      .references('albums.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .nullable();
    table
      .string('songId')
      .references('songs.id')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      .nullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('search_history');
}
