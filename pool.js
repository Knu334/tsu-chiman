const { Pool } = require("pg");

const pool = new Pool({
    user: "",
    host: "127.0.0.1",
    database: "",
    password: "",
    port: 5432
});

module.exports = pool;