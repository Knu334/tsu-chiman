import express from "express";
import helmet from "helmet";
import webPush from "web-push";
import jwt from "jsonwebtoken";
import parser from "ua-parser-js";

import { AddressInfo } from "net";
import { PrismaClient } from "@prisma/client";

const app: express.Express = express();
const prisma = new PrismaClient();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/resources"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://cdn.jsdelivr.net",
        ],
      },
    },
  })
);

if (process.env.MODE === "local") {
  var server = app.listen(3000, function () {
    const serverAddress = server.address() as AddressInfo;
    console.log("Node.js is listening to PORT:" + serverAddress.port);
  });
}

webPush.setVapidDetails(
  "mailto:example@example.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const auth: express.RequestHandler = (req, res, next) => {
  const token = req.query.token as string;

  jwt.verify(token, process.env.JWT_SECRET_KEY!, function (
    err: jwt.VerifyErrors,
    decoded: jwt.JwtPayload
  ) {
    if (err) {
      res.sendStatus(403);
    } else {
      res.locals.serverId = decoded.serverId;
      res.locals.userId = decoded.userId;
      next();
    }
  } as jwt.VerifyCallback);
};

app.use(
  (
    err: express.ErrorRequestHandler,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.sendStatus(500);
  }
);

app.get("/", (req, res) => {
  res.redirect(301, "/tsu-chiman");
});

app.get("/tsu-chiman", auth, (req, res) => {
  res.render("index", {});
});

app.post("/tsu-chiman/subscribe", auth, async (req, res) => {
  if (!res.locals.serverId || !res.locals.userId || !req.body) {
    res.sendStatus(500);
    return;
  }
  const bodyJson = req.body as webPush.PushSubscription;

  const ua = parser(req.headers["user-agent"]);

  let osFlag = 0;
  if (ua.os.name === "Android") {
    osFlag = 1;
  }

  const query = {
    text: "INSERT INTO push_subscription (serverid, bodyJson, os) \
            SELECT * FROM (SELECT $1::text as serverid, $2::jsonb as bodyJson, $3::integer as os) as tmp \
            WHERE NOT EXISTS (SELECT * FROM push_subscription WHERE serverid=$1::text AND bodyJson=$2::jsonb)",
    values: [res.locals.serverId, bodyJson, osFlag],
  };

  try {
    const qres = await prisma.subscription.upsert({
      where: {
        serverid_userid_endpoint_auth_p256dh: {
          serverid: res.locals.serverId as string,
          userid: res.locals.userId as string,
          endpoint: bodyJson.endpoint,
          auth: bodyJson.keys.auth,
          p256dh: bodyJson.keys.p256dh,
        },
      },
      update: {},
      create: {
        serverid: res.locals.serverId as string,
        userid: res.locals.userId as string,
        endpoint: bodyJson.endpoint,
        auth: bodyJson.keys.auth,
        p256dh: bodyJson.keys.p256dh,
        os: osFlag,
      },
    });

    if (qres) {
      console.log("Subscription has been exist.");
    } else {
      console.log("Subscription insert completed.");
    }
    res.sendStatus(200);
  } catch (e: any) {
    console.error(e.stack);
    res.sendStatus(500);
    return;
  }
});

app.post("/tsu-chiman/unsubscribe", auth, async (req, res) => {
  if (!res.locals.serverId || !res.locals.userId || !req.body) {
    res.sendStatus(500);
    return;
  }
  const bodyJson = req.body as webPush.PushSubscription;

  const query = {
    text: "DELETE FROM push_subscription WHERE serverid=$1::text AND bodyJson=$2::jsonb",
    values: [res.locals.serverId, bodyJson],
  };

  try {
    await prisma.subscription.delete({
      where: {
        serverid_userid_endpoint_auth_p256dh: {
          serverid: res.locals.serverId as string,
          userid: res.locals.userId as string,
          endpoint: bodyJson.endpoint,
          auth: bodyJson.keys.auth,
          p256dh: bodyJson.keys.p256dh,
        },
      },
    });
    res.sendStatus(200);
  } catch (e: any) {
    console.error(e.stack);
    res.sendStatus(500);
    return;
  }
});

app.get("/tsu-chiman/vapid-pub-key", auth, (req, res) => {
  const response = { publicKey: process.env.VAPID_PUBLIC_KEY };
  res.type("application/json");
  res.send(JSON.stringify(response));
});

export = app;
