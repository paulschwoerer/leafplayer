CREATE TABLE `search_history` (
  `id` char(36) not null,
  `userId` char(36) not null,
  `artistId` varchar(255) null,
  `albumId` varchar(255) null,
  `songId` varchar(255) null,
  `createdAt` datetime not null default CURRENT_TIMESTAMP,
  foreign key (`userId`) references `users` (`id`) on delete CASCADE on update CASCADE,
  foreign key (`artistId`) references `artists` (`id`) on delete CASCADE on update CASCADE,
  foreign key (`albumId`) references `albums` (`id`) on delete CASCADE on update CASCADE,
  foreign key (`songId`) references `songs` (`id`) on delete CASCADE on update CASCADE,
  primary key (`id`)
);
