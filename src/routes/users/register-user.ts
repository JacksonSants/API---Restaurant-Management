import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { v4 as uuidv4 } from 'uuid';

export async function createUser(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>()
    .post('/register/registerUser', {
        schema: {
            body: z.object({
                name: z.string(),
                email: z.string().email(),
                phone: z.coerce.string(),
                password: z.string(),
            }),
            response: {
                201: z.object({
                    data: z.object({
                        id: z.string().uuid(),
                        name: z.string(),
                        createdAt: z.date().nullish(),
                    })
                })
            }
        }
    }, async (request, reply) => {
        const { name, email, phone, password } = request.body;

        const userlFromEmail = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (userlFromEmail) {
            throw new Error("This email is the already registered");
        }

        const userId = uuidv4();

        const user = await prisma.user.create({
            data: {
                id: userId,
                name,
                email,
                phone,
                password,
                createdAt: new Date()
            }
        })

        return reply.status(201).send({
            data: {
                id: user.id,
                name: user.name,
                createdAt: user.createdAt
            }
        })
    })
}