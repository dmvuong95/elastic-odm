import { RequestParams } from '@elastic/elasticsearch'

export type QueryDSL = any

export interface SearchBody {
  sort?: any;
  from?: number;
  size?: number;
  query?: QueryDSL;
  aggs?: any;
  _source?: false | string | string[] | {
    includes?: string | string[];
    excludes?: string | string[];
  };
  /**
   * @default true
   */
  track_total_hits?: boolean;
  /**
   * Point in time
   */
  pit?: {
    id: string;
    keep_alive?: string;
  };
}

export type CreateOptions = Omit<RequestParams.Create, 'index' | 'id' | 'body'>
export type UpdateOptions = Omit<RequestParams.Update, 'index' | 'id' | 'body'>
export type DeleteOptions = Omit<RequestParams.Delete, 'index' | 'id'>

export type SearchOptions = Omit<RequestParams.Search, 'index' | 'body'>
export type CountOptions = Omit<RequestParams.Count, 'index' | 'body'>
export type DeleteByQueryOptions = Omit<RequestParams.DeleteByQuery, 'index' | 'body'>
export type BulkOptions = Omit<RequestParams.Bulk, 'index' | 'body'>
export type OpenPointInTimeOptions = Omit<RequestParams.OpenPointInTime, 'index'>

export type AnyKeys<T> = { [P in keyof T]?: any } & { [k: string]: any }

export type BulkItem<TMapping = any> = {
  type: 'create' | 'update';
  _id: string;
  doc: AnyKeys<TMapping>;
} | {
  type: 'delete';
  _id: string;
}
export type BulkItems<TMapping = any> = BulkItem<TMapping>[]

export type Properties = Record<string, {
  type?: string;
  index?: boolean;
  properties?: Properties;
}>

export interface IndicesCreateBody {
  aliases?: any;
  mappings?: {
    properties?: Properties;
    [key: string]: any;
  };
  settings?: any;
}

export interface Hit {
  _index: string;
  // _type: string;
  _id: string;
  _score?: number;
  _source?: any;
}
