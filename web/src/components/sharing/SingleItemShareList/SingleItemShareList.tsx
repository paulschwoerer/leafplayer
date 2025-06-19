import { ClipboardIcon, DeleteIcon } from 'components/icons';
import IconButton from 'components/icons/IconButton/IconButton';
import { buildShareLink } from 'components/sharing/link';
import { Share } from 'leafplayer-common';
import { NotificationContext } from 'modules/notifications/NotificationContext';
import React, { useContext } from 'react';
import styles from './SingleItemShareList.module.scss';

type Props = {
  shares: Share[];
  onDeleteShare: (id: string) => void;
};

export function SingleItemShareList({ shares, onDeleteShare }: Props) {
  const { showNotification } = useContext(NotificationContext);

  async function copyShareLink(share: Share) {
    await navigator.clipboard.writeText(buildShareLink(share));

    showNotification({
      title: 'Link copied',
      message: 'The share link was copied to your clipboard',
    });
  }

  return (
    <ol className={styles.list}>
      {shares.map(share => (
        <li key={share.id}>
          <span>Created on {share.createdAt}</span>
          <IconButton
            ariaLabel="Copy share link"
            icon={<ClipboardIcon />}
            onClick={() => copyShareLink(share)}
          />
          <IconButton
            ariaLabel="Delete this share link"
            icon={<DeleteIcon />}
            onClick={() => onDeleteShare(share.id)}
          />
          {share.note !== '' ? (
            <small>&quot;{share.note}&quot;</small>
          ) : (
            <small>
              <i>No note added</i>
            </small>
          )}
        </li>
      ))}
    </ol>
  );
}
