import dotenv from 'dotenv'
dotenv.config()
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
  const item = new ElasticModelTest(id, data as any)
  it('Test constructor', () => {
    // console.log(JSON.stringify(item), item);
    expect(item, 'Constructor failed').to.deep.equal(Object.assign({
      _index: indexName,
      _id: id,
    }, convertedData))
  })
  describe('Test prototype', () => {
    it('Test prototype.set', () => {})
    it('Test prototype.toJSON', () => {
      expect(item.toJSON(), 'toJSON failed').to.deep.equal(jsonData)
    })
    it('Test prototype.create', () => {
      return item.create({ refresh: 'wait_for' })
    })
    it('Test prototype.update', () => {
      return item.set({
        stringField: '3543453',
      }).create({ refresh: 'wait_for' })
    })
    it('Test prototype.delete', () => {
      return item.delete({ refresh: 'wait_for' })
    })
  })
  describe('Test class methods', () => {

  })
})
