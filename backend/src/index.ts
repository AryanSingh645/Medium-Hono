import { Hono } from "hono";
import { userRouter } from "./routes/userRouter";
import { blogRouter } from "./routes/blogRouter";

export const app = new Hono<{
  Bindings: {
    JWT_SECRET : string,
    DATABASE_URL : string
  }
}>();

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

export default app;
