FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
COPY src ./
ARG GREENLOCK_EMAIL
ARG GREENLOCK_SUBJECT
RUN npm install && \
    npx greenlock init --config-dir ./greenlock.d --maintainer-email ${GREENLOCK_EMAIL} && \
    npx greenlock add --subject ${GREENLOCK_SUBJECT} --altnames ${GREENLOCK_SUBJECT} && \
    npx greenlock defaults --store greenlock-store-fs --store-base-path ./greenlock.d
EXPOSE 80 443
CMD [ "node", "server.js" ]