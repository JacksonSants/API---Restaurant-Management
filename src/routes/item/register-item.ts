import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../lib/prisma";

export async function registerItem(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>()
        .post(`/register/registeritem`, {
            schema : {
                body: z.object({
                    items: z.array(z.object({
                        productId: z.string().uuid(),
                        createdAt: z.date().nullish(),
                        ammountProduct: z.number().int().min(1),
                    }))
                }),
                response: {
                    201: z.object({
                        
                    })
                }
            }
        }, async (request, reply) => {
            const { items } = request.body;

            const createItems = [];
            for (const item of items) {
                const product = await prisma.product.findUnique({
                    where: {
                        id: item.productId
                    }
                })

                if (!product) {
                    return new Error("Product not found")
                }

                const totalPrice = product.price * item.ammountProduct;

                const newItem = await prisma.item.create({
                    data: {
                        productId: item.productId,
                        amountProduct: item.ammountProduct,
                        createdAt: new Date(),
                        totalPrice: totalPrice,
                    }
                })

                createItems.push(newItem)
            }

            return reply.status(201).send({
                data: createItems.map(item => ({
                    id: item.id,
                    createdAt: item.createdAt.toISOString(),
                    productId: item.productId,
                    amountProduct: item.amountProduct,
                    totalPrice: item.totalPrice
                }))
            })
        })
}