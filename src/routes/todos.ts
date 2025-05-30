import { Hono } from "hono";
import mysql from "mysql2/promise";
import {
  createTodo,
  deleteTodo,
  updateTodo,
  getTodosByUserId,
  getTodoById,
} from "../db/todos_sql";

type Variables = {
  db: mysql.Pool;
  userId: string;
};

const todoRoutes = new Hono<{ Variables: Variables }>();

function ensureAuthenticated(c: any) {
  const userId = c.get("userId");
  if (!userId) {
    c.status(401);
    throw new Error("未認証");
  }
  return userId;
}

todoRoutes.get("/", async (c) => {
  try {
    const db = c.get("db");
    const userId = ensureAuthenticated(c);
    const todos = await getTodosByUserId(db, { userId });
    return c.json({ todos });
  } catch (err) {
    console.error("[GET /todos] エラー:", err);
    return c.text("TODO取得失敗", 500);
  }
});

todoRoutes.get("/:id", async (c) => {
  try {
    const db = c.get("db");
    const userId = ensureAuthenticated(c);
    const todoId = c.req.param("id");
    const todo = await getTodoById(db, { id: todoId, userId });

    if (!todo) return c.text("Todoが見つかりません", 404);
    return c.json({ todo });
  } catch (err) {
    console.error(`[GET /todos/:id] エラー:`, err);
    return c.text("TODO取得失敗", 500);
  }
});

todoRoutes.post("/", async (c) => {
  try {
    const db = c.get("db");
    const userId = ensureAuthenticated(c);
    const { title, description, isDone, priority, dueDate } =
      await c.req.json();

    await createTodo(db, {
      id: crypto.randomUUID(),
      userId,
      title,
      description,
      isDone: isDone ? 1 : 0,
      priority,
      dueDate,
    });

    return c.text("TODOを作成しました", 201);
  } catch (err) {
    console.error("[POST /todos] エラー:", err);
    return c.text("TODO作成失敗", 500);
  }
});

todoRoutes.put("/:id", async (c) => {
  try {
    const db = c.get("db");
    const userId = ensureAuthenticated(c);
    const todoId = c.req.param("id");
    const { title, description, isDone, priority, dueDate } =
      await c.req.json();

    await updateTodo(db, {
      id: todoId,
      userId,
      title,
      description,
      isDone,
      dueDate,
      priority,
    });

    return c.body(null, 204);
  } catch (err) {
    console.error("[PUT /todos/:id] エラー:", err);
    return c.text("TODO更新失敗", 500);
  }
});

todoRoutes.put("/:id/toggle", async (c) => {
  try {
    const db = c.get("db");
    const userId = ensureAuthenticated(c);
    const id = c.req.param("id");
    const { isDone } = await c.req.json();

    await db.execute(
      `UPDATE todos SET is_done = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
      [isDone ? 1 : 0, id, userId]
    );
    return c.text("OK", 200);
  } catch (err) {
    console.error("[PUT /todos/:id/toggle] エラー:", err);
    return c.text("更新失敗", 500);
  }
});

todoRoutes.delete("/:id", async (c) => {
  try {
    const db = c.get("db");
    const userId = ensureAuthenticated(c);
    const todoId = c.req.param("id");

    await deleteTodo(db, { id: todoId, userId });
    return c.body(null, 204);
  } catch (err) {
    console.error("[DELETE /todos/:id] エラー:", err);
    return c.text("TODO削除失敗", 500);
  }
});

export { todoRoutes };
