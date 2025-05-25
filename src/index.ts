import { Hono } from "hono";
import { authRoutes } from "./routes/auth";
import { todoRoutes } from "./routes/todos";
import mysql from "mysql2/promise";

type Variables = {
  db: mysql.Pool;
};

type Env = {
  Variables: Variables;
};

const app = new Hono<Env>();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(async (c, next) => {
  c.set("db", pool);
  await next();
});

authRoutes.get("/ping", async (c) => {
  const res = await fetch("https://ifconfig.me/ip");
  const ip = await res.text();
  return c.text(`Outbound IP: ${ip}`);
});

app.route("/auth", authRoutes);
app.route("/todos", todoRoutes);

export default app;
