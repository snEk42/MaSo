module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
    name: { type: DataTypes.STRING, allowNull: false, field: 'name' },
    number: { type: DataTypes.INTEGER, allowNull: true, field: 'number' },
    DR_ID: { type: DataTypes.INTEGER, allowNull: true, field: 'DR_ID' },
    arrived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'arrived' },
    solvedProblems: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'solved_problems' },
  }, {
    tableName: 'Teams',
    timestamps: true,
  })

  Team.associate = models => {
    Team.hasMany(models.TeamMember, {
      as: 'members',
      foreignKey: { name: 'teamId', field: 'team_id' },
      onDelete: 'RESTRICT',
    })
    Team.belongsTo(models.Teacher, {
      as: 'teacher',
      foreignKey: { name: 'teacherId', field: 'teacher_id' },
      onDelete: 'RESTRICT',
    })
    Team.belongsTo(models.School, {
      as: 'school',
      foreignKey: { name: 'schoolId', field: 'school_id' },
      onDelete: 'RESTRICT',
    })
    Team.belongsTo(models.CompetitionVenue, {
      as: 'competitionVenue',
      foreignKey: { name: 'competitionVenueId', field: 'competition_venue_id' },
      onDelete: 'RESTRICT',
    })
    Team.belongsTo(models.CompetitionVenueRoom, {
      as: 'competitionVenueRoom',
      foreignKey: { name: 'competitionVenueRoomId', field: 'competition_venue_room_id' },
      onDelete: 'RESTRICT',
    })
  }

  return Team
}