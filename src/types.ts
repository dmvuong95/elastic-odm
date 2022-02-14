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
}

export type CreateOptions = Omit<RequestParams.Create, 'index' | 'id' | 'body'>
export type UpdateOptions = Omit<RequestParams.Update, 'index' | 'id' | 'body'>
export type DeleteOptions = Omit<RequestParams.Delete, 'index' | 'id'>

export type SearchOptions = Omit<RequestParams.Search, 'index' | 'body'>
export type CountOptions = Omit<RequestParams.Count, 'index' | 'body'>
export type DeleteByQueryOptions = Omit<RequestParams.DeleteByQuery, 'index' | 'body'>
export type BulkOptions = Omit<RequestParams.Bulk, 'index' | 'body'>

export type BulkItem<TMapping = any> = {
  type: 'create';
  _id: string;
  doc: TMapping;
} | {
  type: 'update';
  _id: string;
  doc: Partial<TMapping>;
} | {
  type: 'delete';
  _id: string;
}

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
