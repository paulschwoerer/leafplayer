# 22.22.3-alpine3.24
ARG IMAGE=node@sha256:e58326d0d441090181ac150dc2078d3e2cf6a0d42e809aebba3ef5880935ffdd

# --------------------------
# BUILD
# --------------------------
FROM ${IMAGE} as builder

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
