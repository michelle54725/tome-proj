import { v4 as uuidv4 } from 'uuid';
import { getFirestore } from "firebase-admin/firestore"
import { BookFormatOptions, DatabaseID } from '../lib/constants.js';
import fuzzysort from 'fuzzysort'

export const book = async (fastify) => {
  await fastify.get(
    '/',
    {
      schema: {
        description: 'Get books',
        querystring: {
          type: 'object',
          properties: {
            limit: {
              type: 'integer',
            },
            search: {
              type: 'string',
            },
          },
        },
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
      const { limit: limitParam, search: searchParam } = request.query;

      // Sanitize query params (limits chosen arbitrarily)
      const limit = limitParam ? parseInt(limitParam) : 10;
      const search = searchParam.length > 60 ? searchParam.slice(0, 60) : searchParam;

      // If no search string then just return the first N (where N = limit)
      if (!search) {
        const bookCollection = await getFirestore(DatabaseID).collection('books').limit(limit).get();
        const books = bookCollection.docs.map((doc) => doc.data());
        return { books: books.slice(0, limit) };
      }

      /**
       * Tradeoff made here between latency+cost (fetching all books from db) and user 
       * experience (fuzzy search). If this becomes a problem then we can implement
       * advanced search features (by title, author, etc) to allow for specific queries
       * e.g. `...whereGreaterThan("author", authorSearch.slice(0,1)).get()`
       */
      const bookCollection = await getFirestore(DatabaseID).collection('books').get()
      const books = bookCollection.docs.map((doc) => doc.data());

      const booksFiltered = fuzzysort.go(search, books, {
        keys: ["title", "author"],
        limit,
      }).map((result) => result.obj)

      return { books: booksFiltered };
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
            coverPhoto: {
              type: 'string',
              description: 'URL of cover photo'
            }
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
      const { title, author, format, publishedAt: publishedAtStr, coverPhoto } = request.body;
      // TODO: validate args

      const bookCollection = getFirestore(DatabaseID).collection('books');

      const id = uuidv4();
      const bookData = {
        id,
        title,
        author,
        format,
        coverPhoto,
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