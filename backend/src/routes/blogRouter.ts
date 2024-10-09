import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    },
    Variables: {
        userId: string
    }
}>();

blogRouter.use("/*", async(c, next) => {
    const authHeader = c.req.header("authorization") || "";
    const user = await verify(authHeader, c.env.JWT_SECRET);
    if(user){
        c.set("userId", user.id as string);
        await next();
    }
    else {
        c.status(403);
        return c.json({ message : "You are not logged in"})
    }
})

blogRouter.post("/", async(c) => {
    const body = await c.req.json();
    const authorId = c.get("userId");

    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        const blog = await prisma.post.create({
            data:{
                title: body.title,
                content: body.content,
                authorId: authorId
            }
        })
        return c.json({id: blog.id});
    } catch (e) {
        c.status(411);
        return c.json({ error: "Invalid"});
    }
})

blogRouter.put("/", async(c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const blog = await prisma.post.update({
        where: {
            id: body.id
        },
        data: {
            title: body.title,
            content: body.content
        }
    })
    return c.json({id: blog.id});
})

blogRouter.get("/bulk", async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    const blogs = await prisma.post.findMany();
    return c.json({blogs});
})

blogRouter.get("/:id", async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const id = c.req.param("id");
    const blog = await prisma.post.findFirst({
        where: {id}
    })
    if(!blog){
        c.status(404);
        return c.json({error : "Blog not found"});
    }
    return c.json({blog});
})

