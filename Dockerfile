ARG IMAGE_VERSION=14.16-alpine

# --------------------------
# BUILD
# --------------------------
FROM node:${IMAGE_VERSION} as builder

ENV SASS_PATH=node_modules:src

RUN npm install --global gulp-cli ts-patch

COPY --chown=node:node . /app

USER node

WORKDIR /app/web

RUN npm ci --quiet

WORKDIR /app

RUN npm ci --quiet

RUN gulp build

# --------------------------
# PRODUCTION IMAGE
# --------------------------
FROM node:${IMAGE_VERSION}

LABEL maintainer="hello@paulschwoerer.de"

ENV NODE_ENV=production
ENV HOST 0.0.0.0
ENV PORT 3000

RUN mkdir -p /var/lib/leafplayer && \
  chown -R node:node /var/lib/leafplayer

WORKDIR /app
RUN chown node:node /app

USER node

COPY --from=builder /app/build .
COPY --chown=node:node package-lock.json .

RUN npm ci --quiet --only=production

RUN rm package-lock.json

VOLUME /var/lib/leafplayer

EXPOSE 3000/tcp

ENTRYPOINT ["node", "main.js"]
CMD ["serve"]
