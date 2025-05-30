import { MiddlewareHandler } from "hono";
import { parse } from "cookie";
import { verify } from "hono/jwt";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const cookieHeader = c.req.header("cookie");
  const cookies = parse(cookieHeader || "");
  const token = cookies.token;

  if (!token) {
    console.error("[authMiddleware] トークンが存在しません");
    return c.json({ error: "未認証 (トークンなし)" }, 401);
  }

  try {
    const payload = await verify(token, process.env.JWT_SECRET!);

    if (!payload || typeof payload !== "object" || !payload.userId) {
      console.error(
        "[authMiddleware] トークンはあるが payload.userId が無効",
        payload
      );
      return c.json({ error: "無効なトークン" }, 401);
    }

    console.log("[authMiddleware] 認証成功", payload.userId);
    c.set("userId", payload.userId);
    await next();
  } catch (err) {
    console.error("[authMiddleware] JWT 検証エラー:", err);
    return c.json({ error: "トークン検証失敗" }, 401);
  }
};
