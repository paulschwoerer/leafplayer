import QueueCurrent from 'components/queue/QueueCurrent/QueueCurrent';
import QueueEmpty from 'components/queue/QueueEmpty/QueueEmpty';
import QueueNextUp from 'components/queue/QueueNextUp';
import { PlayerContext } from 'modules/player/context';
import React, { ReactElement, useContext } from 'react';

function Queue(): ReactElement {
  const [{ queue, current }, { goToQueueIndex, removeQueueItem }] = useContext(
    PlayerContext,
  );

  if (current === null) {
    return <QueueEmpty />;
  }

  return (
    <>
      {current && <QueueCurrent current={current} />}

      <QueueNextUp
        queue={queue}
        onPlay={goToQueueIndex}
        onRemove={removeQueueItem}
      />
    </>
  );
}

export default Queue;
