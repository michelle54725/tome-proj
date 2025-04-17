
import Fastify from 'fastify';
import { initializeApp } from 'firebase-admin/app';
import { BookSchema, ErrorSchema } from './lib/schema.js'
import { book } from './routes/book.js';
import fastifyOpenapiDocs from 'fastify-openapi-docs'


export const fastify = Fastify({
  trustProxy: true,
  logger: true
})

const build = async () => {
  initializeApp();

  await fastify.register(fastifyOpenapiDocs, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'Tome Proj API',
        description: 'REST API for Tome Take Home Challenge',
        contact: {
          name: 'Michelle',
          email: 'michelle54725@gmail.com'
        },
        version: '1.0.0'
      },
      servers: [
        { url: 'https://tome-backend-477723450381.us-east1.run.app', description: 'Server' },
      ],
      tags: [{ name: 'service', description: 'Service' }],
      components: {
        securitySchemes: {
          jwtBearer: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  })

  fastify.addHook('preHandler', async (req) => {
    const { body, params, log } = req;
    const { userId } = req.user || {};
    try {
      log.info({ body, params, userId });
    } catch (err) {
      log.error({ err, userId, body, params });
    }
  });

  fastify.addSchema(ErrorSchema)
  fastify.addSchema(BookSchema);

  await fastify.register(book, { prefix: '/book' });

  return fastify
}

async function start() {
  // Google Cloud Run will set this environment variable for you, so
  // you can also use it to detect if you are running in Cloud Run
  const IS_GOOGLE_CLOUD_RUN = process.env.K_SERVICE !== undefined;

  // You must listen on the port Cloud Run provides
  const port = process.env.PORT || 3000;

  // You must listen on all IPV4 addresses in Cloud Run
  const host = IS_GOOGLE_CLOUD_RUN ? '0.0.0.0' : undefined;

  try {
    const server = await build();
    const address = server.listen({ port, host });
    console.log(`Listening on ${address}`);
  } catch (err) {
    console.error(err);
    exit(1);
  }
}

start();