// src/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

import { authRoutes } from "./routes/auth";
import { todoRoutes } from "./routes/todos";
import { authMiddleware } from "./middlewares/authMiddleware";

type Variables = { db: mysql.Pool };
type Env = { Variables: Variables };

const app = new Hono<Env>();

const dbPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use("*", async (c, next) => {
  c.set("db", dbPool);
  await next();
});

app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  })
);

app.route("/auth", authRoutes);

app.use("/todos/*", authMiddleware);
app.route("/todos", todoRoutes);

const port = Number(process.env.PORT) || 8080;

export default app;
