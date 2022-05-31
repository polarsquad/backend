FROM node:18.0.0-alpine
LABEL maintainer "Polar Squad <https://www.polarsquad.com/>"

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY --chown=node ./ /app

# Install required system packages and dependencies

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/main' >> /etc/apk/repositories && \
    echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/community' >> /etc/apk/repositories && \
    apk update && \
    apk add mongodb mongodb-tools --no-cache && \
    rm -rf /var/cache/apk/*

USER node

WORKDIR /app

RUN npm install

RUN cp ./dpd/ic-actions.js /app/dpd/node_modules/ic-actions.js && \
    rm ./dpd/ic-actions.js && \
    cp ./dpd/ic-meta.js /app/dpd/node_modules/ic-meta.js && \
    rm ./dpd/ic-meta.js

RUN npm run setup -- config/default-item-config.js
