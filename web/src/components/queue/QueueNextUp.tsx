import If from 'components/If';
import { SongRowWithArtwork } from 'components/media/SongRow/SongRow';
import OptionsDropdown from 'components/OptionsDropdown/OptionsDropdown';
import { QueueItem } from 'modules/player/types';
import React, { ReactElement } from 'react';

type Props = {
  queue: QueueItem[];
  onPlay?: (index: number) => void;
  onRemove?: (index: number) => void;
};

function QueueNextUp({ queue, onPlay, onRemove }: Props): ReactElement {
  return (
    <div>
      <If condition={queue.length === 0}>
        <p>No more songs</p>
      </If>
      <If condition={queue.length > 0}>
        {queue.map((item, i) => (
          <SongRowWithArtwork
            key={i}
            song={item.song}
            onPlay={() => onPlay && onPlay(i)}
            options={
              <OptionsDropdown align="right">
                <OptionsDropdown.Option onClick={() => onRemove && onRemove(i)}>
                  Remove from Queue
                </OptionsDropdown.Option>
                <OptionsDropdown.Option to={`/artist/${item.song.artist.id}`}>
                  Open Artist Page
                </OptionsDropdown.Option>
              </OptionsDropdown>
            }
          />
        ))}
      </If>
    </div>
  );
}

export default QueueNextUp;
