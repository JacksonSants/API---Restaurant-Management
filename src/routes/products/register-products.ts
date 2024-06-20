import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { object, z } from "zod";
import { prisma } from "../../lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function registerProduct(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>()
    .post('/register/registerProduct', {
      schema: {
        body: z.object({
          name: z.string(),
          image: z.string(),
          description: z.string(),
          price: z.number(),
          category: z.string(),
        }),
        response: {
          201: object({
            data: z.object({
              id: z.string(),
              name: z.string(),
              image: z.string(),
              description: z.string(),
              price: z.number(),
              category: z.string(),
            })
          })
        }
      },
    }, async (request, reply) => {
      const { name, image, description, price, category } = request.body;

      const productId = uuidv4();

      const product = await prisma.product.create({
        data: {
          id: productId,
          name: name,
          image: image,
          description: description,
          price: price,
          category: category,
        }
      });

      return reply.status(201).send({
        data: product
      });
    });
}
