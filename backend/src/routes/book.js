export const book = async (fastify) => {
  await fastify.get(
    '/',
    {
      schema: {
        description:
          'Get all books',
        response: {
          '2xx': {
            description: 'Success',
            type: 'object',
            properties: {
              books: {
                type: 'array',
                items: {
                  $ref: 'Book#',
                },
              },
            },
            required: ['books'],
          },
          default: {
            description: 'Error',
            $ref: 'Error#',
          },
        },
      },
    },
    async (request, reply) => {
      return { books: [] };
    }
  );
}