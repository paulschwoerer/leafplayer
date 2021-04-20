import * as Knex from 'knex';

function addTimestamps(knex: Knex, table: Knex.TableBuilder) {
  table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
  table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
}

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable('users', table => {
      table.uuid('id').primary().notNullable();
      table.string('username').unique().notNullable();
      table.string('displayName').notNullable();
      table.string('password').notNullable();
      addTimestamps(knex, table);
    })
    .createTable('sessions', table => {
      table.uuid('id').primary().notNullable();
      table
        .uuid('userId')
        .notNullable()
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table.specificType('token', 'CHAR(24)').unique().notNullable();
      table.string('browser').defaultTo('unknown');
      table.string('os').defaultTo('unknown');
      table.timestamp('lastUsedAt').notNullable();
      table.timestamp('expiresAt').notNullable();
    })
    .createTable('invitations', table => {
      table.increments('id').primary();
      table.string('code', 16).unique();
      table.boolean('used').defaultTo(false);
      table.string('comment');
      table.timestamp('expiresAt').notNullable();
      addTimestamps(knex, table);
    })
    .createTable('artists', table => {
      table.uuid('id').primary().notNullable();
      table.string('name').notNullable();
      addTimestamps(knex, table);
    })
    .createTable('albums', table => {
      table.uuid('id').primary().notNullable();
      table.uuid('artistId').notNullable().references('artists.id');
      table.string('name').notNullable();
      table.integer('year');
      addTimestamps(knex, table);
    })
    .createTable('audio_files', table => {
      table.uuid('id').primary().notNullable();
      table.string('path').notNullable();
      table.string('format').notNullable();
      table.integer('filesize').notNullable();
      table.integer('lastModified').notNullable();
    })
    .createTable('songs', table => {
      table.uuid('id').primary().notNullable();
      table
        .uuid('fileId')
        .notNullable()
        .references('audio_files.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table.uuid('albumId').notNullable().references('albums.id');
      table.uuid('artistId').notNullable().references('artists.id');
      table.string('title').notNullable();
      table.float('duration').notNullable();
      table.integer('track');
      table.integer('disk');
      addTimestamps(knex, table);
    })
    .createTable('media_folders', table => {
      table.uuid('id').primary().notNullable();
      table.string('path').notNullable();
      table.boolean('enabled').defaultTo(true);
    });
}

export function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('users')
    .dropTableIfExists('sessions')
    .dropTableIfExists('invitations')
    .dropTableIfExists('albums')
    .dropTableIfExists('artists')
    .dropTableIfExists('audio_files')
    .dropTableIfExists('songs');
}
