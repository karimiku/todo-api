import { Hono } from "hono";
import { jwt } from "hono/jwt";
import mysql from "mysql2/promise";
import {
  createTodo,
  deleteTodo,
  updateTodo,
  getTodosByUserId,
} from "../db/todos_sql";

type Variables = {
  db: mysql.Pool;
  jwtPayload: {
    id: string;
    email: string;
  };
};

const todoRoutes = new Hono<{ Variables: Variables }>();

// JWTミドルウェア
todoRoutes.use("*", jwt({ secret: process.env.JWT_SECRET! }));

todoRoutes.get("/", async (c) => {
  const db = c.get("db");
  const user = c.get("jwtPayload");
  const todos = await getTodosByUserId(db, { userId: user.id });
  return c.json({ todos });
});

todoRoutes.post("/", async (c) => {
  const db = c.get("db");
  const user = c.get("jwtPayload");
  const { title, description, isDone, priority, dueDate } = await c.req.json();
  console.log(title, description, isDone, priority, dueDate);
  await createTodo(db, {
    id: crypto.randomUUID(),
    userId: user.id,
    title,
    description,
    isDone: isDone ? 1 : 0, //SQL側でBOOLEAN型使ってても、MySQLが内部的にTINYINT(1)として扱ってるから、sqlcがそれをnumberの解釈している
    priority,
    dueDate,
  });

  return c.text("TODOを作成しました", 201);
});

todoRoutes.put("/:id", async (c) => {
  const db = c.get("db");
  const user = c.get("jwtPayload");
  const todoId = c.req.param("id");
  const { title, description, isDone, priority, dueDate } = await c.req.json();

  await updateTodo(db, {
    id: todoId,
    userId: user.id,
    title,
    description,
    isDone,
    priority,
    dueDate,
  });

  return c.body(null, 204);
});

todoRoutes.delete("/:id", async (c) => {
  const db = c.get("db");
  const user = c.get("jwtPayload");
  const todoId = c.req.param("id");

  await deleteTodo(db, {
    id: todoId,
    userId: user.id,
  });
  console.log("削除対象ID:", todoId);
  console.log("ユーザーID:", user.id);

  return c.body(null, 204);
});

export { todoRoutes };
