// src/routes/auth.ts
import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sign } from "hono/jwt";
import type mysql from "mysql2/promise";
import { getUserByEmail, createUser } from "../db/users_sql";

type Variables = { db: mysql.Pool };
type Env = { Variables: Variables };

export const authRoutes = new Hono<Env>();

const isStrongPassword = (password: string) => {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return pattern.test(password);
};

authRoutes.post("/signup", async (c) => {
  try {
    const raw = await c.req.text();
    const { email, password } = JSON.parse(raw);

    if (!email || !password) {
      return c.json(
        { error: "メールアドレスとパスワードを入力してください。" },
        400
      );
    }

    if (!isStrongPassword(password)) {
      return c.json(
        {
          error:
            "パスワードは8文字以上で、大文字・小文字・数字をすべて含めてください。",
        },
        400
      );
    }

    const db = c.get("db");

    const existingUser = await getUserByEmail(db, { email }).catch(() => null);
    if (existingUser) {
      return c.json({ error: "既に登録済みのメールアドレスです。" }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser(db, {
      id: uuidv4(),
      email,
      password: hashedPassword,
    });

    return c.text("ユーザー登録完了", 201);
  } catch (err) {
    console.error("[POST /auth/signup] エラー:", err);
    return c.text("Internal Server Error", 500);
  }
});

authRoutes.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  const db = c.get("db");

  const user = await getUserByEmail(db, { email }).catch(() => null);
  if (!user) {
    return c.json({ error: "存在しないユーザーです。" }, 401);
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    return c.json({ error: "パスワードが間違っています。" }, 401);
  }

  const token = await sign({ userId: user.id }, process.env.JWT_SECRET!);
  return c.json({ token });
});
