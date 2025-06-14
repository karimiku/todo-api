import { serve } from "@hono/node-server";
import app from "./index";

app.get("/healthz", (c) => c.text("OK", 200));
const port = Number(process.env.PORT) || 3000;

serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0", // これが重要！
});
