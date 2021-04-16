import React, { ReactElement } from 'react';

type Props = {
  count: number;
};

export function SongCount({ count }: Props): ReactElement {
  return (
    <>
      {count} {count === 1 ? 'Song' : 'Songs'}
    </>
  );
}

export function AlbumCount({ count }: Props): ReactElement {
  return (
    <>
      {count} {count === 1 ? 'Album' : 'Albums'}
    </>
  );
}
