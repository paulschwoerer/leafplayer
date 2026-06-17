import { createReadStream, statSync } from 'fs';

import { type FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { NotFoundError } from '../../errors/NotFoundError.ts';
import { type FileFormat } from '../../scanner/types.ts';
import { type AudioFilesService } from '../../services/AudioFilesService.ts';

type Injects = {
  audioFilesService: AudioFilesService;
};

const CHUNK_SIZE = 1024 * 1024;

type Range = {
  start: number;
  end: number;
};

export function getAudioStream({
  audioFilesService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get<{ Params: { songId: string } }>(
      '/stream/song/:songId',
      async (request, reply) => {
        const { songId } = request.params;

        const audioFile = audioFilesService.findBySongId(songId);

        if (!audioFile) {
          throw new NotFoundError();
        }

        const stat = statSync(audioFile.path);
        const range = computeRange(stat.size, request.headers.range);

        const stream = createReadStream(audioFile.path, range);

        const mimeType = mapFileFormatToMimeType(audioFile.format);

        return reply
          .status(206)
          .headers({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: 0,
            connection: 'keep-alive',
            'Content-Type': mimeType,
            'Accept-Ranges': 'bytes',
            'Content-Length': range.end - range.start + 1,
            'Content-Range': `bytes ${range.start}-${range.end}/${stat.size}`,
          })
          .send(stream);
      },
    );
  });
}

function computeRange(fileSize: number, rangeHeader?: string): Range {
  if (!rangeHeader) {
    return { start: 0, end: CHUNK_SIZE - 1 };
  }

  const headerParts = rangeHeader.replace(/bytes=/, '').split('-');

  const start = headerParts[0] ? parseInt(headerParts[0]) : 0;
  const end = headerParts[1]
    ? parseInt(headerParts[1])
    : start + CHUNK_SIZE - 1;

  return {
    start: Math.max(0, start),
    end: Math.min(fileSize - 1, end),
  };
}

function mapFileFormatToMimeType(format: FileFormat) {
  switch (format) {
    case 'mp3':
      return 'audio/mpeg';
    case 'opus':
      return 'audio/opus';
    case 'flac':
      return 'audio/flac';
    default:
      return '';
  }
}
