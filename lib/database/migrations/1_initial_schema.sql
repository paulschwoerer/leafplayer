CREATE TABLE `users` (
  `id` char(36) not null,
  `username` varchar(255) not null,
  `displayName` varchar(255) not null,
  `password` varchar(255) not null,
  `createdAt` datetime not null default CURRENT_TIMESTAMP,
  `updatedAt` datetime not null default CURRENT_TIMESTAMP,
  primary key (`id`)
);

CREATE UNIQUE INDEX `users_username_unique` on `users` (`username`);

CREATE TABLE `sessions` (
  `id` char(36) not null,
  `userId` char(36) not null,
  `token` CHAR(24) not null,
  `browser` varchar(255) default 'unknown',
  `os` varchar(255) default 'unknown',
  `lastUsedAt` datetime not null,
  `expiresAt` datetime not null,
  foreign key (`userId`) references `users` (`id`) on delete CASCADE on update CASCADE,
  primary key (`id`)
);

CREATE UNIQUE INDEX `sessions_token_unique` on `sessions` (`token`);

CREATE TABLE `invitations` (
  `id` integer not null primary key autoincrement,
  `code` varchar(16),
  `used` boolean default '0',
  `comment` varchar(255),
  `expiresAt` datetime not null,
  `createdAt` datetime not null default CURRENT_TIMESTAMP,
  `updatedAt` datetime not null default CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX `invitations_code_unique` on `invitations` (`code`);

CREATE TABLE `artists` (
  `id` char(36) not null,
  `name` varchar(255) not null,
  `createdAt` datetime not null default CURRENT_TIMESTAMP,
  `updatedAt` datetime not null default CURRENT_TIMESTAMP,
  primary key (`id`)
);

CREATE TABLE `albums` (
  `id` char(36) not null,
  `artistId` char(36) not null,
  `name` varchar(255) not null,
  `year` integer,
  `createdAt` datetime not null default CURRENT_TIMESTAMP,
  `updatedAt` datetime not null default CURRENT_TIMESTAMP,
  foreign key (`artistId`) references `artists` (`id`),
  primary key (`id`)
);

CREATE TABLE `audio_files` (
  `id` char(36) not null,
  `path` varchar(255) not null,
  `format` varchar(255) not null,
  `filesize` integer not null,
  `lastModified` integer not null,
  primary key (`id`)
);

CREATE TABLE `songs` (
  `id` char(36) not null,
  `fileId` char(36) not null,
  `albumId` char(36) not null,
  `artistId` char(36) not null,
  `title` varchar(255) not null,
  `duration` float not null,
  `track` integer,
  `disk` integer,
  `createdAt` datetime not null default CURRENT_TIMESTAMP,
  `updatedAt` datetime not null default CURRENT_TIMESTAMP,
  foreign key (`fileId`) references `audio_files` (`id`) on delete CASCADE on update CASCADE,
  foreign key (`albumId`) references `albums` (`id`),
  foreign key (`artistId`) references `artists` (`id`),
  primary key (`id`)
);

CREATE TABLE `media_folders` (
  `id` char(36) not null,
  `path` varchar(255) not null,
  `enabled` boolean default '1',
  primary key (`id`)
);
