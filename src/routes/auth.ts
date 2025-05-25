import { Hono } from "hono";
import { getUserByEmail, createUser } from "../db/users_sql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import type mysql from "mysql2/promise";

type Variables = { db: mysql.Connection };
type Env = { Variables: Variables };

export const authRoutes = new Hono<Env>();

authRoutes.post("/signup", async (c) => {
  const { email, pw } = await c.req.json();
  console.log(email, pw);
  const db = c.get("db");

  const exists = await getUserByEmail(db, { email });
  if (exists) return c.json({ error: "既に登録済み" }, 400);

  const password = await bcrypt.hash(pw, 10);

  await createUser(db, { id: uuidv4(), email, password });

  return c.text("ユーザー登録完了", 201);
});

authRoutes.post("/login", async (c) => {
  const { email, pw } = await c.req.json();
  const db = c.get("db");

  const user = await getUserByEmail(db, { email });
  if (!user) return c.json({ error: "存在しないユーザー" }, 401);

  const valid = await bcrypt.compare(pw, user.password);
  if (!valid) return c.json({ error: "パスワード不一致" }, 401);

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  return c.json({ token });
});
