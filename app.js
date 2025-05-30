// server.js
var express = require('express');
var dotenv = require('dotenv');
var bodyParser = require('body-parser');
const pg = require('pg');
var indexRouter = require("./routes/index.js");
var staffRouter = require("./routes/staff.js");
var loginRouter = require("./routes/login.js");
var shiftRouter = require("./routes/shift.js");

var app = express();
const { Pool } = pg

dotenv.config();

app.use(bodyParser.json());

// Setup PostgreSQL pool

const pool = new Pool({
  user: process.env.DB_USERNAME, 
  host: process.env.DB_HOST,
  database: process.env.DB_NAME, 
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
// JWT secret
const port = process.env.PORT || 3000;

app.use("/", indexRouter);
app.use("/api", loginRouter);
app.use("/api/staff", staffRouter);
app.use("/api/shifts", shiftRouter);
app.use("/api/staff", staffRouter);


// Start server
const PORT = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port} here`);
});

module.exports = {
  pool: pool,
  app
}