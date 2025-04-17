import { v4 as uuidv4 } from 'uuid';
import { getFirestore } from "firebase-admin/firestore"
import { BookFormatOptions, DatabaseID } from '../lib/constants.js';

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

  await fastify.post(
    '/add',
    {
      schema: {
        description:
          'Add a book',
        body: {
          type: 'object',
          properties: {
            title: {
              type: 'string'
            },
            author: {
              type: 'string'
            },
            format: {
              type: 'string',
              enum: BookFormatOptions,
            },
            publishedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Datetime of publication in ISO 8601'
            },
          },
          required: ['title', 'author']
        },
        response: {
          '2xx': {
            description: 'Book added successfully',
            $ref: 'Book#',
          },
          default: {
            description: 'Error',
            $ref: 'Error#',
          },
        },
      },
    },
    async (request, reply) => {
      const { title, author, format, publishedAt: publishedAtStr } = request.body;
      // TODO: validate args

      const bookCollection = getFirestore(DatabaseID).collection('books');

      const id = uuidv4();
      const bookData = {
        id,
        title,
        author,
        format,
        publishedAt: Date.parse(publishedAtStr),
        createdAt: Date.now()
      }

      await bookCollection.doc(id).set(bookData);

      // optimistic return to save a db fetch
      return {
        id,
        ...bookData,
      }
    }
  );
}