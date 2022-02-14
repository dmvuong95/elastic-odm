import { expect } from 'chai'
import * as utils from '../src/utils'
import { properties, data, convertedData, jsonData } from './data.mock'

const obj = utils.getRawObj.call({}, data, properties)

describe('Test function getRawObj', () => {
  it('Input data should deep equal to converted data', () => {
    expect(obj, 'getRawObj failed').to.deep.equal(convertedData)
  })
})

describe('Test function toJSON', () => {
  it('The return object should deep equal to json data', () => {
    const json = utils.toJSON.call(obj, properties)
    expect(json, 'toJSON failed').to.deep.equal(jsonData)
  })
})
