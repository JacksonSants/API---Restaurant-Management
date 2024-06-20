import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prisma";

export async function getItems(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>()
        .get('/items/getItems', {
            schema: {
                querystring: z.object({
                    pageIndex: z.string().nullable().default('0').transform(Number),
                    query: z.string().nullish(),
                })
            }
        }, async (request, reply) => {
            const { pageIndex, query} = request.query;

            const items = await prisma.item.findMany({
                select: {
                    id: true,
                    amountProduct: true,
                    totalPrice: true,
                    createdAt: true,
                    itens: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            description: true,
                            price: true,
                            category: true,
                        }
                    }
                },
                where: query ? {
                    itens: {
                        name: {
                            contains: query,
                        }
                    }
                } : {
                    itens: {
                    }
                },

                skip: pageIndex * 10,
                take: 10,
                orderBy: {
                    createdAt: 'desc'
                },
            })

            if (items === null) {
                throw new Error('No items found.')
            }
            
            reply.status(200).send({
                items: items,
            })
        })
}