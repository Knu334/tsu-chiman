const express = require("express");
const helmet = require('helmet')
const webPush = require('web-push');
const jwt = require("jsonwebtoken");
const app = express();
const pool = require('./pool');

var server = app.listen(3000, function () {
    console.log("Node.js is listening to PORT:" + server.address().port);
});

app.use(express.static('resources'));
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(express.json());
app.set('view engine', 'ejs');

const authTokens = require('./auth.json');
webPush.setVapidDetails('mailto:example@example.com', authTokens.publicKey, authTokens.privateKey);

const auth = (req, res, next) => {
    const token = req.query.token;

    jwt.verify(token, authTokens.jwtSecretKey, function (err) {
        if (err) {
            next(err.message);
        } else {
            next();
        }
    });
}

app.use((err, req, res, next) => {
    res.send(500, err)
})

app.get("/tsu-chiman", auth, (req, res) => {
    res.render("index", {});
});

app.post('/subscribe', auth, async (req, res) => {
    const pushSubscription = req.body;

    if (!pushSubscription) {
        res.send(500);
        return;
    }

    const query = {
        text:
            "INSERT INTO push_subscription (serverid, subscription) \
            SELECT * FROM (SELECT $1::text as serverid, $2::jsonb as subscription) as tmp \
            WHERE NOT EXISTS (SELECT * FROM push_subscription WHERE serverid=$1::text AND subscription=$2::jsonb)",
        values: [req.query.serverId, pushSubscription]
    };

    try {
        const qres = await pool.query(query);
        if (qres.rowCount === 0) {
            console.log('Subscription has been exist.');
        } else {
            console.log('Subscription insert completed.');
        }
        res.json({ result: 'OK' });
    } catch (e) {
        console.error(e.stack);
        res.send(500);
        return;
    }
});