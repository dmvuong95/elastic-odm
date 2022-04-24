# Elasticsearch ODM
## _Installation_
```bash
$ npm i elastic-odm
```
## _Using_
```typescript
import { Client, ElasticModel } from 'elastic-odm'
const client = new Client({ node: 'http://localhost:9200' })

interface IBook {
  name: string;
  price: number;
  isStocking: boolean;
  createdAt: Date;
  otherInfo: {
    author: string;
  };
}

const bookIndex = 'books'
// Declare model
const Books = client.models[bookIndex] as ElasticModel<IBook> ||
  client.createModel<IBook>(bookIndex, {
    mappings: {
      properties: {
        name: { type: 'text' },
        price: { type: 'float' },
        isStocking: { type: 'boolean' },
        createdAt: { type: 'date' },
        otherInfo: {
          type: 'nested',
          properties: {
            author: { type: 'keyword' }
          }
        }
      }
    },
    settings: {
      index: {
        max_result_window: 500000,
        number_of_shards: 5,
        number_of_replicas: 2,
      }
    }
  })
// Get book by _id
const book = await Books.get('1')
// Get books by list of _id
const books = await Books.mget(['1', '2', '3'])
// Search books
const { total, hits: books } = await Books.search({
  query: { ... },
  sort: [{ price: { order: 'desc' } }]
})
// Bulk API
await Books.bulk([
  { 
    type: 'create',
    _id: '1',
    doc: {
      name: 'Book 1',
      price: 2.5,
      isStocking: true,
      createdAt: new Date(),
      otherInfo: {
        author: 'author1'
      }
    }
  }, {
    type: 'update',
    _id: '1',
    doc: {
      isStocking: false
    }
  }, {
    type: 'delete',
    _id: '1'
  }
])
// Count books
const total = await Books.count({
  match: { name: 'foo' }
})
// Delete book by _id
await Books.delete('1')
// Delete books by query
await Books.deleteByQuery({
  match: { name: 'baz' }
})
// Declare a book
const book = new Books('1', {
  name: 'Book 1',
  price: 2.5,
  isStocking: true,
  createdAt: new Date(),
  otherInfo: {
    author: 'author1'
  }
})
// Create, update and delete this book
await book.create()
book.price = 3
await book.update()
await book.delete()
// Get JSON data
const jsonData = book.toJSON()
```
