const AbstractService = require('../../../../core/services/AbstractService')
const venueRepository = require('./../../repositories/venue')

module.exports = class GetAllByCompetitionService extends AbstractService {
  schema() {
    return {
      type: 'Object',
      properties: {},
    }
  }

  async run() {
    const compVenues = await venueRepository.findCompetitionVenues(this.competitionId)
    return compVenues.map(compVenue => ({
      id: compVenue.venue.id,
      name: compVenue.venue.name,
      capacity: compVenue.capacity,
      rooms: compVenue.cvrooms.map(cvroom => ({
        ...cvroom.room,
        capacity: cvroom.capacity,
        teams: cvroom.teams,
      })),
    }))
  }
}