import { ButtonPrimary } from 'components/form/Button/Button';
import Input from 'components/form/Input/Input';
import ApiLoader from 'components/layout/ApiLoader';
import { buildShareLink } from 'components/sharing/link';
import { SingleItemShareList } from 'components/sharing/SingleItemShareList/SingleItemShareList';
import {
  CreateShareRequestDto,
  CreateShareResponseDto,
  FindSharesResponseDto,
} from 'leafplayer-common';
import {
  isApiError,
  makeApiDeleteRequest,
  makeApiPostRequest,
} from 'modules/api';
import { NotificationContext } from 'modules/notifications/NotificationContext';
import React, { useContext, useState } from 'react';
import styles from './SharingDialog.module.scss';

type Props = {
  forType: 'artist' | 'album' | 'song';
  forId: string;
};

export function SharingDialog({ forType, forId }: Props) {
  const { showNotification } = useContext(NotificationContext);

  const [note, setNote] = useState('');

  return (
    <ApiLoader<FindSharesResponseDto>
      slug={`shares/${forType}/${forId}`}
      renderContent={({ shares }, { setData }) => {
        async function createShareAndCopyLink() {
          const response = await makeApiPostRequest<
            CreateShareResponseDto,
            CreateShareRequestDto
          >('shares', {
            forType,
            forId,
            note,
          });

          if (isApiError(response)) {
            showNotification({
              title: 'Error',
              message: 'Could not create share',
            });
          } else {
            setData({ shares: [response.share, ...shares] });
            setNote('');

            await navigator.clipboard.writeText(buildShareLink(response.share));

            showNotification({
              title: 'Link copied',
              message: 'The share link was copied to your clipboard',
            });
          }
        }

        async function deleteShare(id: string) {
          await makeApiDeleteRequest(`shares/${id}`);

          setData({ shares: shares.filter(share => share.id !== id) });
        }

        return (
          <section className={styles.wrapper}>
            <h2>Sharing this Album</h2>

            <p>
              Share this album with your friends or family. Shares will
              automatically expire after 30 days.
            </p>

            {shares.length > 0 && (
              <>
                <h4>Existing shares</h4>
                <SingleItemShareList
                  shares={shares}
                  onDeleteShare={deleteShare}
                />
              </>
            )}

            <h4>Create new share</h4>

            <form
              onSubmit={ev => {
                ev.preventDefault();
                void createShareAndCopyLink();
              }}
            >
              <Input
                value={note}
                name="note"
                onInput={ev => setNote(ev.currentTarget.value)}
                placeholder="Leave a note for the recipient"
              ></Input>

              <ButtonPrimary type="submit">Share & Copy link</ButtonPrimary>
            </form>

            <p>
              <small>
                Please ensure your local laws actually permit you to share this
                music.
              </small>
            </p>
          </section>
        );
      }}
    />
  );
}
