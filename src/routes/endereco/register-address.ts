import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prisma";

export async function registerAdress(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>()
        .post('/register/:userId/registerAdress', {
            schema: {
                body: z.object({
                    street: z.string(),
                    number: z.number().int(),
                    neighborhood: z.string(),
                    complement: z.string(),
                    referencePoint: z.string(),
                }),
                params: z.object({
                    userId: z.string().uuid(),
                }),
                response: {
                    201: z.object({
                        street: z.string(),
                        number: z.number(),
                        neighborhood: z.string(),
                        complement: z.string(),
                        referencePoint: z.string(),
                    }),
                }
            }
        }, async (request, reply) => {
            const { street, number, neighborhood, complement, referencePoint } = request.body;
            const { userId } = request.params;

            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                throw new Error('User not found')
            }

            const address = await prisma.address.create({
                data: {
                    userId,
                    street,
                    number,
                    neighborhood,
                    complement,
                    referencePoint,
                }
            });

            reply.status(201).send({
                street: address.street,
                number: address.number,
                neighborhood: address.neighborhood,
                complement: address.complement,
                referencePoint: address.referencePoint,
            });
        });
}
