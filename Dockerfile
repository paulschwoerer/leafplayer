ARG IMAGE_VERSION=14.16-alpine

# --------------------------
# FRONTEND BUILD
# --------------------------
FROM node:${IMAGE_VERSION} as builder

ENV SASS_PATH=node_modules:src

RUN npm install --global gulp-cli

COPY . /app

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

WORKDIR /app

COPY package*.json ./
RUN npm ci --quiet --only=production

COPY --from=builder /app/build .

RUN mkdir -p /var/lib/leafplayer && \
  chown -R node:node /var/lib/leafplayer

VOLUME /var/lib/leafplayer

USER node

EXPOSE 3000/tcp

ENTRYPOINT ["node", "main.js"]
CMD ["serve"]
