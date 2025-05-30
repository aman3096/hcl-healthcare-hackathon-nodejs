// server.js
import express from 'express';
var express = require('express');
var jwt = require('jsonwebtoken');
import { Pool } from 'pg';
var dotenv = require('dotenv');
var bodyParser= requuire('body-parser');
var loginRouter = require("./routes/index");
var staffRouter = require("./routes/staff");
var loginRouter = require('./routes/login');
var shiftRouter = require('./routes/shift');

var app = express();

dotenv.config();

const app = express();
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

app.use("/api", loginRouter);
app.use("/api/staff", staffRouter);
app.use("/api/shifts", shiftRouter);
app.user("/api/staff", staffRouter);


// Start server
const PORT = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port} here`);
});

module.exports = {
  pool: pool
}