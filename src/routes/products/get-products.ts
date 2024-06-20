import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

export async function getProdutos(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>()
       .get('/products/getAllProdutos', {
            schema: {
                querystring: z.object({
                    pageIndex: z.string().nullable().default('0').transform(Number),
                    query: z.string().nullish(),
                }),
                response: {
                    200: z.object({
                        products: z.array(z.object({
                            id: z.string(),
                            name: z.string(),
                            price: z.number(),
                            description: z.string(),
                            category: z.string(),
                            image: z.string().nullable(),
                        }))
                    })
                }
            }
        }, async (request, reply) => {
            const { pageIndex, query } = request.query;

            const products = await prisma.product.findMany({
                select: {
                    id: true,
                    name: true,
                    price: true,
                    description: true,
                    category: true,
                    image: true,
                },
                where: query? {
                    name: {
                        contains: query,
                    }
                } : {},
                skip: pageIndex * 10,
                take: 10,
                orderBy: {
                    name: 'desc'
                }
            });

            if (products.length === 0) {
                throw new Error("No products found")
            }

            reply.status(200).send({
                products: products
            });
        });
}