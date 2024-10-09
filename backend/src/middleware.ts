import { Hono } from "hono";
import { verify } from "hono/jwt";

export function initMiddleware(app : Hono<{Bindings: {JWT_SECRET : string}}>){
    app.use('api/v1/blog/*', async (c, next) => {
        const header = c.req.header("authorization") || "";
        const token = header.split(" ")[1];

        const response = await verify(token, c.env.JWT_SECRET);
        if(response.id){
            await next();
        }
        else{
            c.status(403);
            return c.json({error : "unauthorized"});
        }
    })
}