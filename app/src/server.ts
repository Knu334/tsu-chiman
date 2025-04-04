"use strict";

import app from "#/app";

import fs from "fs";
import https from "https";
const options = {
  key: fs.readFileSync(process.env.SSL_KEY || ""),
  cert: fs.readFileSync(process.env.SSL_CERT || ""),
};
const server = https.createServer(options, app);
server.listen(Number(process.env.REGIST_PAGE_PORT) || 443);
