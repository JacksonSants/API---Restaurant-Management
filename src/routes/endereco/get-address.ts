import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z, { number } from "zod";
import { prisma } from "../../lib/prisma";

export async function getUseradresses(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>()
        .get('/userAdress/:userId/getAddress', {
            schema: {
                params: z.object({
                    userId: z.string().uuid(),
                }),
                querystring: z.object({
                    pageIndex: z.string().nullable().default('0').transform(Number),
                    query: z.string().nullish(),
                }),
                response: {
                    200: z.object({
                        user: z.object({
                            id: z.string(),
                            addresses: z.array(z.object({
                                id: z.number(),
                                street: z.string(),
                                number: z.number(),
                                neighborhood: z.string(),
                                complement: z.string().nullable(),
                                referencePoint: z.string().nullable(),
                            }))
                        }).nullable(),
                    }),
                    404: z.object({
                        error: z.string(),
                    }),
                },
            }
        }, async (request, reply) => {
            const { userId } = request.params;
            const { pageIndex, query } = request.query;

            const user = await prisma.user.findUnique({
                select: {
                    id: true,
                    address: {
                        select: {
                            id: true,
                            street: true,
                            number: true,
                            neighborhood: true,
                            complement: true,
                            referencePoint: true,
                        }
                    }
                },
                where: query ? {
                    id: userId,
                    name: {
                        contains: query,
                    }
                } : {
                    id: userId
                },
            });

            if (user === null) {
                throw new Error ('Address not found.')
            }

            return reply.status(200).send({
                user: {
                    id: user.id,
                    addresses: user.address.map(addr => ({
                        id: addr.id,
                        street: addr.street,
                        number: addr.number,
                        neighborhood: addr.neighborhood,
                        complement: addr.complement,
                        referencePoint: addr.referencePoint,
                    })),
                }
            });
        });
}
