const log = require('../../../core/logger').logger
const responseErrors = require('../../../core/errors/response')
const { authorizeToken } = require('../utils/authorize')

function authenticateTokenJWT(ctx) {
  if (!ctx) {
    throw new Error('Context is missing in authenticateToken function!')
  }
  const parsedAuthHeader = parseAuthHeader(ctx.header.authorization)
  if (!parsedAuthHeader || !parsedAuthHeader.value
    || !parsedAuthHeader.scheme || parsedAuthHeader.scheme.toLowerCase() !== 'jwt') {
    return null
  }
  return authorizeToken(parsedAuthHeader.value, ctx)
}

async function authenticateTeacher(ctx, next) {
  const data = await authenticateTokenJWT(ctx)
  if (!data || !data.teacher || !data.teacher.id) {
    throw new responseErrors.UnauthorizedError()
  }
  ctx.state.teacher = data.teacher
  return next()
}

async function authenticateOrganizer(ctx, next) {
  const data = await authenticateTokenJWT(ctx)
  if (!data || !data.organizer || !data.organizer.id || data.organizer.disabled) {
    throw new responseErrors.UnauthorizedError()
  }
  log.info(`Organizer id: ${data.organizer.id}`)
  log.info(`Organizer email: ${data.organizer.email}`)
  ctx.state.organizer = data.organizer
  return next()
}

function parseAuthHeader(hdrValue) {
  const re = /(\S+)\s+(\S+)/
  if (!hdrValue || typeof hdrValue !== 'string') {
    return null
  }
  const matches = hdrValue.match(re)
  return matches && { scheme: matches[1], value: matches[2] }
}

module.exports = {
  authenticateTeacher,
  authenticateOrganizer,
  parseAuthHeader,
}