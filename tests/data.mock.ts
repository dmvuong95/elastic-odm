
export const indexName = 'index-for-unit-test'
export const id = '123'

export interface IDocumentTest {
  stringField: string;
  numberField: number;
  boolField: boolean;
  dateField: Date;
  dateField1: Date;
  objField: any;
  nestedField: {
    stringField: string;
    numberField: number;
    boolField: boolean;
    dateField: Date;
    objField: any;
  };
}

export const properties = {
  stringField: {
    type: 'text'
  },
  numberField: {
    type: 'long'
  },
  boolField: {
    type: 'boolean'
  },
  dateField: {
    type: 'date'
  },
  dateField1: {
    type: 'date'
  },
  objField: {
    type: 'object'
  },
  nestedField: {
    type: 'nested',
    properties: {
      stringField: {
        type: 'text'
      },
      numberField: {
        type: 'long'
      },
      boolField: {
        type: 'boolean'
      },
      dateField: {
        type: 'date'
      },
      objField: {
        type: 'object'
      },
    }
  }
}

const now = new Date()
export const data = {
  stringField: 'abc',
  numberField: '23',
  boolField: 1,
  dateField: now.toISOString(),
  dateField1: 'failed date',
  objField: {
    field1: 'a',
    field2: 2
  },
  nestedField: {
    stringField: 1,
    numberField: '3',
    boolField: null,
    dateField: undefined,
    objField: {
      field1: 'a',
      field2: 2
    },
  },
  fieldNotInProperties: '123abc'
}
export const convertedData = {
  stringField: 'abc',
  numberField: 23,
  boolField: true,
  dateField: now,
  dateField1: null,
  objField: {
    field1: 'a',
    field2: 2
  },
  nestedField: {
    stringField: '1',
    numberField: 3,
    boolField: null,
    dateField: undefined,
    objField: {
      field1: 'a',
      field2: 2
    },
  }
}
export const jsonData = {
  stringField: 'abc',
  numberField: 23,
  boolField: true,
  dateField: now,
  dateField1: null,
  objField: {
    field1: 'a',
    field2: 2
  },
  nestedField: {
    stringField: '1',
    numberField: 3,
    boolField: null,
    // dateField: undefined,
    objField: {
      field1: 'a',
      field2: 2
    },
  }
}

export const bodyCreateIndices = {
  mappings: {
    properties
  },
  settings: {
    index: {

    }
  }
}
