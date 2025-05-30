// server.js
import * as express from 'express';
import dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import indexRouter from "./routes/index";
import staffRouter from "./routes/staff";
import loginRouter from './routes/login';
import shiftRouter from './routes/shift';

var app = express();

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
app.user("/api/staff", staffRouter);


// Start server
const PORT = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port} here`);
});

module.exports = {
  pool: pool
}