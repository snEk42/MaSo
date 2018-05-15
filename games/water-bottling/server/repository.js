const _ = require('lodash')
const db = require('../../../server/database')
const appErrors = require('../../../server/utils/errors/application')

async function getGrid(competitionId, dbTransaction) {
  const query = `
  SELECT
     COUNT(team_id)-1 AS "teamCount",
     SUM(power) AS "combinedPower",
     SUM(water_flow) AS "waterFlow",
     horizontal,
     vertical
   FROM (
     SELECT *
     FROM public."WatterBottlingCurrentTeamPositions" positions
   UNION
     SELECT
       0 AS team_id,
       grid."water_flow" AS water_flow,
       0 AS power,
       grid."horizontal" AS horizontal,
       grid."vertical" AS vertical
     FROM public."WatterBottlingGrid" grid
   ) AS currentPositions
   GROUP BY "horizontal", "vertical"
   ORDER BY "vertical" DESC, "horizontal" ASC`
  const grid = await db.sequelize.query(query, {
    type: db.sequelize.QueryTypes.SELECT,
    replacements: { competitionId },
    raw: true,
    transaction: dbTransaction,
  })
  return parseGrid(grid)
}

async function getCurrentTeamPositions(competitionId, dbTransaction) {
  const query = `
  SELECT
    currentPositions."team_id"    AS "teamId",
    currentPositions."power"      AS "power",
    grid."water_flow"             AS "waterFlow",
    currentPositions."horizontal" AS "horizontal",
    currentPositions."vertical"   AS "vertical"
  FROM
    public."WatterBottlingCurrentTeamPositions" AS currentPositions
    INNER JOIN public."WatterBottlingGrid" AS grid
      ON currentPositions."horizontal" = grid."horizontal"
        AND currentPositions."vertical" = grid."vertical"
  ORDER BY
    currentPositions."vertical" DESC,
    currentPositions."horizontal" ASC`
  const positions = await db.sequelize.query(query, {
    type: db.sequelize.QueryTypes.SELECT,
    replacements: { competitionId },
    raw: true,
    transaction: dbTransaction,
  })
  return parseCurrentTemPositions(positions)
}

async function addTeamPosition(position, dbTransaction) {
  const result = await db.WatterBottlingTeamPosition.create(position, {
    returning: true,
    transaction: dbTransaction,
  })
  return parseTeamPosition(result)
}

async function createTeamPositions(positions, dbTransaction) {
  await db.WatterBottlingTeamPosition.bulkCreate(positions, { transaction: dbTransaction })
  return true
}

async function createTeamScores(scores, dbTransaction) {
  await db.WatterBottlingTeamScore.bulkCreate(scores, { transaction: dbTransaction })
  return true
}

async function findTeamPosition(competitionId, teamId, dbTransaction) {
  const position = await db.WatterBottlingTeamPosition.findOne({
    where: { competitionId, teamId, reverted: false },
    order: [['createdAt', 'DESC']],
    transaction: dbTransaction,
  })
  if (!position) {
    throw new appErrors.NotFoundError()
  }
  return parseTeamPosition(position)
}

async function findTeamPositionById(possitionId, dbTransaction) {
  const position = await db.WatterBottlingTeamPosition.findById(
    possitionId,
    { transaction: dbTransaction },
  )
  if (!position) {
    throw new appErrors.NotFoundError()
  }
  return parseTeamPosition(position)
}

function revertTeamPositionById(possitionId, organizerId, dbTransaction) {
  return db.WatterBottlingTeamPosition.update(
    {
      reverted: true,
      revertedById: organizerId,
    },
    {
      where: {
        id: possitionId,
      },
      transaction: dbTransaction,
    },
  )
}

async function getTeamScore(competitionId, teamId, dbTransaction) {
  if (!competitionId || !teamId) {
    throw new Error('competitionId and teamId are required')
  }
  const score = await db.WatterBottlingTeamScore.sum('score', {
    where: { competitionId, teamId },
    transaction: dbTransaction,
  })
  return score || 0
}

async function createGrid(grid, dbTransaction) {
  await db.WatterBottlingGrid.bulkCreate(grid, { transaction: dbTransaction })
  return true
}

function clearGameData(competitionId, dbTransaction) {
  return Promise.all([
    db.WatterBottlingGrid.destroy({ where: { competitionId }, transaction: dbTransaction }),
    db.WatterBottlingTeamScore.destroy({ where: { competitionId }, transaction: dbTransaction }),
    db.WatterBottlingTeamPosition.destroy({ where: { competitionId }, transaction: dbTransaction }),
  ])
}


/* PRIVATE PARSING METHODS */
function parseGrid(grid) {
  return grid ? _.map(grid, parseField) : []
}

function parseField(field) {
  if (!field) {
    return field
  }
  const parsed = {}
  parsed.horizontal = field.horizontal
  parsed.vertical = field.vertical
  parsed.teamCount = field.teamCount
  parsed.combinedPower = field.combinedPower
  parsed.waterFlow = field.waterFlow
  return parsed
}

function parseTeamPosition(teamPos) {
  if (!teamPos) {
    return teamPos
  }
  const parsed = {}
  parsed.id = teamPos.id
  parsed.horizontal = teamPos.horizontal
  parsed.vertical = teamPos.vertical
  parsed.power = teamPos.power
  parsed.teamId = teamPos.teamId
  parsed.competitionId = teamPos.competitionId
  parsed.organizerId = teamPos.organizerId
  parsed.previousPositionId = teamPos.previousPositionId
  parsed.createdAt = teamPos.createdAt
  parsed.updatedAt = teamPos.updatedAt
  return parsed
}

function parseCurrentTemPositions(positions) {
  const rows = _.groupBy(positions, 'vertical')
  const fields = []
  _.forOwn(rows, (row, vertical) => {
    const rowFields = _.groupBy(row, 'horizontal')
    _.forOwn(rowFields, (fieldContent, horizontal) => {
      const teams = fieldContent.map(team => ({
        id: team.teamId,
        power: team.power,
      }))
      fields.push({
        vertical,
        horizontal,
        waterFlow: fieldContent[0].waterFlow,
        teams,
      })
    })
  })
  return fields
}


module.exports = {
  getGrid,
  createGrid,
  clearGameData,
  findTeamPosition,
  findTeamPositionById,
  revertTeamPositionById,
  addTeamPosition,
  createTeamPositions,
  createTeamScores,
  getTeamScore,
  getCurrentTeamPositions,
}
