import { BookFormatOptions } from "./constants.js";

export const BookSchema = {
  type: ['object'],
  $id: 'Book',
  description: 'Book object',
  properties: {
    id: {
      type: 'string',
      description: 'The unique identifier of the book',
      format: 'uuid'
    },
    title: {
      type: 'string',
    },
    author: {
      type: 'string',
    },
    format: {
      type: 'string',
      enum: BookFormatOptions,
      description: `One of the emotion options: ${BookFormatOptions.join(', ')}.`,
      nullable: true
    },
    coverPhoto: {
      type: 'string',
      description: 'URL of cover photo',
      nullable: true
    },
    publishedAt: {
      type: 'integer',
      nullable: true
    },
    createdAt: {
      type: 'integer',
      nullable: true
    },
  },
  required: ['id', 'title', 'author'],
  additionalProperties: false,
};

export const ErrorSchema = {
  type: 'object',
  $id: 'Error',
  description: 'General error model for all failed requests.',
  properties: {
    message: {
      type: 'string',
      description: 'Descriptive error for the client',
    },
  },
  additionalProperties: false,
};