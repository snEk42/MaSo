'use strict'

const request = require('supertest')
const app = require('../../../src/app')

module.exports = {
  loginUser,
  loginOrganizer,
}

async function loginUser(body) {
  console.log(body) // eslint-disable-line no-console
  const response = await request(app)
    .post('/api/session/user')
    .send(body)
    .expect('Content-Type', /json/u)
    .expect(200)
  return response.body
}

async function loginOrganizer(body) {
  const response = await request(app)
    .post('/api/session/admin')
    .send(body)
    .expect('Content-Type', /json/u)
    .expect(200)
  return response.body
}
