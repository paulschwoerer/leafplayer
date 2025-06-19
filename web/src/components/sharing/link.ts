import { Share } from 'leafplayer-common';

export function buildShareLink(share: Share): string {
  return `${window.location.origin}/s/${share.id}`;
}
