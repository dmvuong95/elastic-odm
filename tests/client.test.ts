import { expect } from 'chai'
import {
  data,
  convertedData,
  jsonData,
  indexName,
  id,
  bodyCreateIndices,
  IDocumentTest,
} from './data.mock'
import Client from '../src/client'

const client = new Client({
  node: process.env.ELASTICSEARCH_URI || 'http://localhost:9200',
})

const ElasticModelTest = client.createModel<IDocumentTest>(indexName, bodyCreateIndices)

describe('Test ElasticModel', () => {
  const item = new ElasticModelTest(id, data)
  // it('Test constructor', () => {
  //   console.log(JSON.stringify(item), item);
  //   expect(item, 'Constructor failed').to.deep.equal(Object.assign({
  //     _index: indexName,
  //     _id: id,
  //   }, convertedData))
  // })
  describe('Test prototype', () => {
    // it('Test prototype.set', () => {})
    it('Test prototype.toJSON', () => {
      expect(item.toJSON(), 'toJSON failed').to.deep.equal(jsonData)
    })
    it('Test prototype.create', () => {
      return item.create({ refresh: 'wait_for' })
    })
    it('Test prototype.update', () => {
      item.stringField = '123123'
      return item.update({ refresh: 'wait_for' })
    })
    it('Test prototype.delete', () => {
      return item.delete({ refresh: 'wait_for' })
    })
  })
  describe('Test static methods', () => {
    it('Model has correct indexName', () => {
      expect(ElasticModelTest.indexName, 'indexName is incorrect').to.equal(indexName)
    })
    it('Client must exist in model', () => {
      expect(ElasticModelTest.client, 'client is incorrect').to.equal(client)
    })
  })
  describe('Test multiple request at a moment', function() {
    this.timeout(0)
    it('Test multiple request at a moment', () => {
      return Promise.all([
        new ElasticModelTest('456', data).create({ refresh: 'wait_for' }),
        new ElasticModelTest('789', data).create({ refresh: 'wait_for' }),
        new ElasticModelTest('987', data).create({ refresh: 'wait_for' }),
      ]).then(r => {
        return Promise.all(r.map(item => item.delete({ refresh: 'wait_for' })))
      })
    })
  })
  describe('Test PIT', function() {
    this.timeout(0)
    const item = new ElasticModelTest('111', data);
    let pitId: string;
    before(async () => {
      await ElasticModelTest.deleteByQuery({
        match_all: {},
      })
      await item.create({ refresh: 'wait_for' })
    })
    it('Test open PIT', async () => {
      pitId = await ElasticModelTest.openPointInTime({ keep_alive: '1m' })
    })
    it('Test search with PIT', async () => {
      const rs = await ElasticModelTest.search({
        pit: {
          id: pitId,
          keep_alive: '1m',
        },
      })
      expect(rs.total, 'Total is not equal to 1').to.equal(1)
      expect(rs.hits[0]._id, '_id is not equal to item._id').to.equal(item._id)
    })
    it('Test close PIT', () => ElasticModelTest.closePointInTime(pitId))
    after(() => item.delete())
  })
})
