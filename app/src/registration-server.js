const express = require('express');
const helmet = require('helmet')
const webPush = require('web-push');
const jwt = require('jsonwebtoken');
const parser = require('ua-parser-js');
const app = express();
const pool = require('./pool');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/resources'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "script-src": ["'self'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net']
        }
    }
}));

if (process.env.MODE === 'local') {
    var server = app.listen(3000, function () {
        console.log("Node.js is listening to PORT:" + server.address().port);
    });
}

webPush.setVapidDetails('mailto:example@example.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

const auth = (req, res, next) => {
    const token = req.query.token;

    jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
        if (err) {
            res.sendStatus(403)
        } else {
            res.locals.serverId = decoded.serverId;
            next();
        }
    });
}

app.use((err, req, res, next) => {
    res.sendStatus(500);
})

app.get("/", (req, res) => {
    res.redirect(301, '/tsu-chiman');
});

app.get("/tsu-chiman", auth, (req, res) => {
    res.render("index", {});
});

app.post('/tsu-chiman/subscribe', auth, async (req, res) => {
    const pushSubscription = req.body;

    if (!res.locals.serverId || !pushSubscription) {
        res.sendStatus(500);
        return;
    }

    const ua = parser(req.headers['user-agent']);

    let osFlag = 0;
    if (ua.os.name === 'Android') {
        osFlag = 1;
    } else if (ua.os.name === 'iOS') {
        osFlag = 2;
    }

    const query = {
        text:
            "INSERT INTO push_subscription (serverid, subscription, os) \
            SELECT * FROM (SELECT $1::text as serverid, $2::jsonb as subscription, $3::integer as os) as tmp \
            WHERE NOT EXISTS (SELECT * FROM push_subscription WHERE serverid=$1::text AND subscription=$2::jsonb)",
        values: [res.locals.serverId, pushSubscription, osFlag]
    };

    try {
        const qres = await pool.query(query);
        if (qres.rowCount === 0) {
            console.log('Subscription has been exist.');
        } else {
            console.log('Subscription insert completed.');
        }
        res.sendStatus(200);
    } catch (e) {
        console.error(e.stack);
        res.sendStatus(500);
        return;
    }
});

app.post('/tsu-chiman/unsubscribe', auth, async (req, res) => {
    const pushSubscription = req.body;

    if (!res.locals.serverId || !pushSubscription) {
        res.sendStatus(500);
        return;
    }

    const query = {
        text: "DELETE FROM push_subscription WHERE serverid=$1::text AND subscription=$2::jsonb",
        values: [res.locals.serverId, pushSubscription]
    };

    try {
        await pool.query(query);
        res.sendStatus(200);
    } catch (e) {
        console.error(e.stack);
        res.sendStatus(500);
        return;
    }
});

app.get('/tsu-chiman/vapid-pub-key', auth, (req, res) => {
    const response = { 'publicKey': process.env.VAPID_PUBLIC_KEY };
    res.type('application/json');
    res.send(JSON.stringify(response));
});

module.exports = app;