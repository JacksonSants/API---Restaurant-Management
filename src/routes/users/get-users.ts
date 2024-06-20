import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z, number, string } from "zod";
import { prisma } from "../../lib/prisma";

export async function getUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>()
    .get('/user/getuser', {
      schema: {
        querystring: z.object({
          pageIndex: z.string().nullable().default('0').transform(Number),
          query: z.string().nullish(),
        }),
        response: {
        },
      },
    }, async (request, reply) => {
      const { pageIndex, query } = request.query;

      const user = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          address: {
            select: {
              street: true,
              number: true,
              neighborhood: true,
              complement: true,
            }
          }
        },
        where: query ?{
          name: {
            contains: query,
          }
        } : {
        },
        
        skip: pageIndex * 10,
        take: 10,
      });

      if (!user) {
        throw new Error("No user found");
      }

      reply.status(200).send({
        data: user,
      });
    });
}
