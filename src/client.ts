import { Client as BaseClient } from '@elastic/elasticsearch'
import _ from 'lodash'
import { getRawObj, toJSON } from './utils'
import type {
  QueryDSL,
  SearchBody,
  CreateOptions,
  UpdateOptions,
  DeleteOptions,
  DeleteByQueryOptions,
  BulkItems,
  CountOptions,
  SearchOptions,
  BulkOptions,
  IndicesCreateBody,
  AnyKeys,
  Hit,
  OpenPointInTimeOptions,
} from './types'

export interface ElasticDocument<TMapping = any> extends Hit {
  readonly _index: string;
  readonly _id: string;
  readonly _score?: number;
  _source?: any;
  // set(data: AnyKeys<TMapping>): this;
  toJSON(): TMapping;
  create(opts?: CreateOptions): Promise<this>;
  update(opts?: UpdateOptions): Promise<this>;
  delete(opts?: DeleteOptions): Promise<void>;
}

export type ElasticEnforceDocument<TMapping = any> = TMapping & ElasticDocument<TMapping>;

export interface ElasticModel<TMapping = any> {
  new(_id: string, data?: AnyKeys<TMapping>): ElasticEnforceDocument<TMapping>;
  readonly client: Client;
  readonly indexName: string;
  search(body?: SearchBody, opts?: SearchOptions): Promise<{
    total: number;
    hits: ElasticEnforceDocument<TMapping>[];
    aggregations?: any;
  }>;
  count(query?: QueryDSL, opts?: CountOptions): Promise<number>;
  get(_id: string): Promise<ElasticEnforceDocument<TMapping> | null>;
  mget(ids: string[]): Promise<ElasticEnforceDocument<TMapping>[]>;
  delete(_id: string, opts?: DeleteOptions): Promise<void>;
  deleteByQuery(query: QueryDSL, opts?: DeleteByQueryOptions): Promise<any>;
  bulk(items: BulkItems<TMapping>, opts?: BulkOptions): Promise<any>;
  openPointInTime(opts?: OpenPointInTimeOptions): Promise<string>;
  closePointInTime(id: string): Promise<any>;
}

export default class Client extends BaseClient {
  readonly models: Record<string, ElasticModel> = {}

  createModel<TMapping = any>(indexName: string, body: IndicesCreateBody): ElasticModel<TMapping> {
    const client = this
    const properties = body.mappings?.properties ?? {}
    let isCreatedIndex = false
    let isCreatingIndex = false
    async function waitCreateIndex() {
      while (isCreatingIndex) {
        await new Promise(r => setTimeout(r, 100))
      }
      if (isCreatedIndex) return
      isCreatingIndex = true
      await createIndices(client, indexName, body).finally(() => {
        isCreatingIndex = false
      })
      isCreatedIndex = true
    }
    function ElasticModel(_id: string, data?: AnyKeys<TMapping>) {
      Object.defineProperty(this, '_index', {
        value: indexName,
        writable: false,
        enumerable: true,
      })
      Object.defineProperty(this, '_id', {
        value: _id,
        writable: false,
        enumerable: true,
      })
      getRawObj.call(this, data ?? {}, properties)
    }
    /* prototype members */
    // ElasticModel.prototype.set = function (data: AnyKeys<TMapping>) {
    //   return setObject.call(this, data, properties)
    // }
    ElasticModel.prototype.toJSON = function () {
      return toJSON.call(this, properties)
    }
    ElasticModel.prototype.create = async function (opts?: CreateOptions) {
      await waitCreateIndex()
      await client.create({
        ...opts,
        index: indexName,
        id: this._id,
        body: this.toJSON(),
      })
      return this
    }
    ElasticModel.prototype.update = async function (opts?: UpdateOptions) {
      await waitCreateIndex()
      await client.update({
        ...opts,
        index: indexName,
        id: this._id,
        body: { doc: this.toJSON() },
      })
      return this
    }
    ElasticModel.prototype.delete = async function (opts?: DeleteOptions) {
      await waitCreateIndex()
      await client.delete({
        ...opts,
        index: indexName,
        id: this._id,
      })
    }
    /* static members */
    Object.defineProperty(ElasticModel, 'client', {
      value: client,
      writable: false,
      enumerable: true,
    })
    Object.defineProperty(ElasticModel, 'indexName', {
      value: indexName,
      writable: false,
      enumerable: true,
    })
    ElasticModel.search = async function (body?: SearchBody, opts?: SearchOptions) {
      await waitCreateIndex()
      return client.search({
        ...opts,
        body: {
          ...body,
          track_total_hits: body?.track_total_hits ?? true,
        },
        index: body?.pit ? void 0 : indexName,
      }).then((result) => {
        const hits = _.get(result, 'body.hits.hits', [])
        const total = _.get(result, 'body.hits.total.value', 0)
        const aggregations = _.get(result, 'body.aggregations')
        return {
          total,
          hits: hits.map((h) => {
            const obj = new ElasticModel(h._id, h._source)
            Object.defineProperty(obj, '_source', {
              value: h._source,
              enumerable: false,
            })
            Object.defineProperty(obj, '_score', {
              value: h._score,
              writable: false,
              enumerable: true,
            })
            return obj
          }),
          ...(aggregations ? { aggregations } : {}),
        }
      })
    }
    ElasticModel.count = async function (query?: QueryDSL, opts?: CountOptions) {
      await waitCreateIndex()
      return client.count({
        ...opts,
        ...(query ? { body: { query } } : {}),
        index: indexName,
      }).then(e => e.body.count)
    }
    ElasticModel.get = async function (_id: string) {
      await waitCreateIndex()
      return client.get({
        index: indexName,
        id: _id,
      }).then((result) => {
        if (result.body.found) {
          const { _source } = result.body
          return Object.defineProperty(new ElasticModel(_id, _source), '_source', {
            value: _source,
            enumerable: false,
          })
        }
        return null
      })
    }
    ElasticModel.mget = async function (ids: string[]) {
      await waitCreateIndex()
      return client.mget({
        index: indexName,
        body: { ids },
      }).then((result) => {
        const docs: any[] = (result.body.docs || []).filter(e => e.found)
        return docs.map(doc => Object.defineProperty(
          new ElasticModel(doc._id, doc._source),
          '_source',
          { value: doc._source, enumerable: false },
        ))
      })
    }
    ElasticModel.delete = async function (_id: string, opts?: DeleteOptions) {
      await waitCreateIndex()
      await client.delete({
        ...opts,
        index: indexName,
        id: _id,
      })
    }
    ElasticModel.deleteByQuery = async function (query: QueryDSL, opts?: DeleteByQueryOptions) {
      await waitCreateIndex()
      return client.deleteByQuery({
        ...opts,
        index: indexName,
        body: { query },
      }).then(r => r.body)
    }
    ElasticModel.bulk = async function (items: BulkItems<TMapping>, opts?: BulkOptions) {
      await waitCreateIndex()
      const body = items.flatMap<any>((e) => {
        switch (e.type) {
          case 'delete':
            return { delete: { _id: e._id } }
          case 'update':
            const doc = new ElasticModel(e._id, e.doc).toJSON()
            if (!Object.keys(doc).length) return []
            return [
              { update: { _id: e._id } },
              { doc },
            ]
          case 'create':
            return [
              { create: { _id: e._id } },
              new ElasticModel(e._id, e.doc).toJSON(),
            ]
          default:
            return []
        }
      })
      return client.bulk({
        ...opts,
        body,
        index: indexName,
      }).then(r => r.body)
    }
    ElasticModel.openPointInTime = async function (opts?: OpenPointInTimeOptions) {
      await waitCreateIndex()
      const { body } = await client.openPointInTime({
        ...opts,
        index: indexName,
      })
      return body.id
    }
    ElasticModel.closePointInTime = function (id: string) {
      return client.closePointInTime({ body: { id } }).then(r => r.body)
    }
    client.models[indexName] = ElasticModel as any as ElasticModel<TMapping>
    return ElasticModel as any as ElasticModel<TMapping>
  }
}

function createIndices(client: Client, indexName: string, body: IndicesCreateBody) {
  return client.indices.get({ index: indexName }).then(async (resultGetIndexInfo) => {
    // put settings
    const excludeKeys = [
      'number_of_shards',
      'number_of_routing_shards',
      'codec',
      'routing_partition_size',
      'soft_deletes',
      'load_fixed_bitset_filters_eagerly',
      'shard',
    ]
    const indexSettingsKeys = Object.keys(body?.settings?.index || {})
      .filter(k => !excludeKeys.includes(k))
    if (indexSettingsKeys.length) {
      await client.indices.putSettings({
        index: indexName,
        body: {
          index: _.omit(body.settings.index, excludeKeys),
        },
      })
    }
    const properties = body.mappings?.properties ?? {}
    const currentProps = _.get(resultGetIndexInfo.body[indexName], 'mappings.properties', {})
    await Promise.all(Object.keys(properties).map((field) => {
      if (_.isEqual(properties[field], currentProps[field])) return
      return client.indices.putMapping({
        index: indexName,
        body: {
          properties: {
            [field]: properties[field],
          },
        },
      })
    }))
  }).catch((e) => {
    if (e.message === 'index_not_found_exception') {
      return client.indices.create({
        index: indexName,
        body,
      })
    } else throw e
  })
}
