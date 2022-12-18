FROM node:12
WORKDIR /usr/src/app
COPY . .
RUN npm install && \
    npx greenlock init --config-dir ./greenlock.d --maintainer-email ${GREENLOCK_EMAIL} && \
    npx greenlock add --subject ${GREENLOCK_SUBJECT} --altnames ${GREENLOCK_SUBJECT}
EXPOSE 80 443
CMD [ "node", "server.js" ]