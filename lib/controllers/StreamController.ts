import { createReadStream, statSync } from 'fs';

import { FastifyPluginAsync } from 'fastify';

import { FileFormat } from '@/scanner/types';
import { AudioFilesService } from '@/services/AudioFilesService';
import { sendNotFoundError } from '@/helpers/responses';

const CHUNK_SIZE = 1024 * 1024;

type Range = {
  start: number;
  end: number;
};

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
    case FileFormat.MP3:
      return 'audio/mpeg';
    case FileFormat.OPUS:
      return 'audio/opus';
    case FileFormat.FLAC:
      return 'audio/flac';
    default:
      return '';
  }
}

type Injects = {
  audioFilesService: AudioFilesService;
};

export function StreamController({
  audioFilesService,
}: Injects): FastifyPluginAsync {
  return async router => {
    router.get<{ Params: { songId: string } }>(
      '/song/:songId',
      async (request, reply) => {
        const { songId } = request.params;

        const audioFile = await audioFilesService.findBySongId(songId);

        if (!audioFile) {
          return sendNotFoundError(reply);
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
  };
}
