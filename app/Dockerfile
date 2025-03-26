FROM node:22.14.0-bookworm-slim
WORKDIR /usr/src/app
COPY . .
RUN npm install && \
    apt-get update && \
    apt-get install -y openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
EXPOSE 443
CMD [ "/bin/bash", "entrypoint.sh" ]
