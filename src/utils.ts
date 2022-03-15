import _ from 'lodash'
import moment from 'moment'

export function getRawObj(data: any, properties: any) {
  for (const field of Object.keys(properties)) {
    let v
    switch (properties[field].type) {
      case 'text':
      case 'binary':
      case 'keword':
        Object.defineProperty(this, field, {
          set: val => (v = isNullish(val) ? val : String(val)),
          get: () => v,
          enumerable: true,
        })
        break
      case 'long':
      case 'integer':
      case 'short':
      case 'byte':
      case 'double':
      case 'float':
      case 'half_float':
      case 'scaled_float':
      case 'unsigned_long':
        Object.defineProperty(this, field, {
          set: val => (v = isNullish(val) ? val : Number(val)),
          get: () => v,
          enumerable: true,
        })
        break
      case 'boolean':
        Object.defineProperty(this, field, {
          set: val => (v = isNullish(val) ? val : Boolean(val)),
          get: () => v,
          enumerable: true,
        })
        break
      case 'date':
        Object.defineProperty(this, field, {
          set: val => {
            if (isNullish(val)) return (v = val)
            const mv = moment(val)
            // if (!mv.isValid()) console.warn(`Field ${field} has invalid value ${val}`);
            v = mv.isValid() ? mv.toDate() : null
          },
          get: () => v,
          enumerable: true,
        })
        break
      case 'nested':
      case 'object':
        const nestedProperties = properties[field].properties
        if (nestedProperties) {
          Object.defineProperty(this, field, {
            set: val => {
              v = isNullish(val)
                ? val
                : getRawObj.call(this[field] ?? {}, val, nestedProperties)
            },
            get: () => v,
            enumerable: true,
          })
        }
        break
    }
    this[field] = data[field]
  }
  return this
}

/* export function setObject(data: any, properties: any) {
  const fields = _.intersection(Object.keys(data), Object.keys(properties))
  for (const field of fields) {
    const v = data[field]
    if (v === void 0) continue
    this[field] = v
  }
  return this
} */

export function toJSON(properties: any) {
  const obj: any = {}
  for (const field of Object.keys(properties)) {
    const v = this[field]
    if (v === void 0) continue
    if (v === null) {
      obj[field] = v
      continue
    }
    switch (properties[field].type) {
      case 'date':
        obj[field] = moment(v).toDate()
        break
      case 'nested':
      case 'object':
        const nestedProperties = properties[field].properties
        if (nestedProperties) {
          obj[field] = toJSON.call(v, nestedProperties)
        } else {
          obj[field] = _.cloneDeep(v)
        }
        break
      default:
        obj[field] = v
    }
  }
  return obj
}

export const isNullish = (v: any) => v === null || v === void 0
