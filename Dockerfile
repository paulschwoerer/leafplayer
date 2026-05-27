# 20.20.2-alpine3.23
ARG IMAGE=node@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293

# --------------------------
# BUILD
# --------------------------
FROM ${IMAGE} as builder

# TODO: can be remove, once prebuilt binaries are available
# for used combination of Node and better-sqlite3 versions
RUN apk --no-cache add python3 make build-base

ENV SASS_PATH=node_modules:src

COPY --chown=node:node . /app

USER node

WORKDIR /app/web

RUN npm ci --quiet

WORKDIR /app

RUN npm ci --quiet

RUN npm run build

# --------------------------
# PRODUCTION IMAGE
# --------------------------
FROM ${IMAGE}

LABEL maintainer="hello@paulschwoerer.de"

ENV NODE_ENV=production
ENV HOST 0.0.0.0
ENV PORT 3000

RUN mkdir -p /var/lib/leafplayer && \
  chown -R node:node /var/lib/leafplayer

WORKDIR /app
RUN chown node:node /app

USER node

COPY --from=builder /app/dist .
COPY --chown=node:node package-lock.json .

RUN npm ci --quiet --only=production

RUN rm package-lock.json

VOLUME /var/lib/leafplayer

EXPOSE 3000/tcp

ENTRYPOINT ["node", "main.js"]
CMD ["serve"]
