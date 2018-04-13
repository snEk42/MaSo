require('chai').should()
const AbstractService = require('../../../server/services/AbstractService')
const appErrors = require('../../../server/utils/errors/application')

describe('Abstract service', () => {
  it('should run correctly on valid input data', () => {
    const TestService = class extends AbstractService {
      schema() {
        return {
          type: 'Object',
          required: true,
          additionalProperties: false,
          properties: {
            data: { type: 'string', required: true },
          },
        }
      }

      run() {
        return this.requestData
      }
    }
    const service = new TestService()
    const stubData = { data: 'input data' }
    return service.execute(stubData)
      .then(result => {
        result.should.be.equal(stubData)
      })
  })

  it('should fail on invalid input data', () => {
    const TestService = class extends AbstractService {
      schema() {
        return {}
      }

      run() {
        return this.requestData
      }
    }
    const service = new TestService()
    return service.execute({ data: 'anything not valid' })
      .then(() => {
        throw new Error('It should not go to this scope')
      }).catch(err => {
        err.should.be.an.instanceof(appErrors.ValidationError)
      })
  })

  it('should fail on empty string in input data', () => {
    const TestService = class extends AbstractService {
      schema() {
        return {
          type: 'Object',
          required: true,
          additionalProperties: false,
          properties: {
            name: { type: 'string', required: true },
          },
        }
      }

      run() {
        return this.requestData
      }
    }
    const service = new TestService()
    return service.execute({ name: '' })
      .then(() => {
        throw new Error('It should not go to this scope')
      })
      .catch(err => {
        err.should.be.an.instanceof(appErrors.ValidationError)
      })
  })

  it('should fail on white string in input data', () => {
    const TestService = class extends AbstractService {
      schema() {
        return {
          type: 'Object',
          required: true,
          additionalProperties: false,
          properties: {
            name: { type: 'string', required: true },
          },
        }
      }

      run() {
        return this.requestData
      }
    }
    const service = new TestService()
    return service.execute({ name: '  ' })
      .then(() => {
        throw new Error('It should not go to this scope')
      })
      .catch(err => {
        err.should.be.an.instanceof(appErrors.ValidationError)
      })
  })
})