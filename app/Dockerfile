FROM node:22.14.0-bookworm-slim
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 443
CMD [ "/bin/bash", "entrypoint.sh" ]
