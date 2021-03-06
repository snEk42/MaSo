import React from 'react'
import PropTypes from 'prop-types'
import { getRowLetter } from '../utils/position'
import Field from './Field'

function Grid({ size, fields }) {
  const rows = []
  for (let rowIndex = 0; rowIndex < size.height; rowIndex++) {
    const row = []
    for (let collIndex = 0; collIndex < size.width; collIndex++) {
      const index = (rowIndex * size.width) + collIndex
      row.push(<Field key={index} field={fields[index]} />)
    }
    rows.push(<tr key={rowIndex}><td>{getRowLetter(rowIndex + 1)}&nbsp;&nbsp;</td>{row}</tr>)
  }
  const colNumbers = [<td key={0}></td>]
  for (let i = 1; i <= size.width; i++) {
    colNumbers.push(<td key={i}>{i}</td>)
  }
  return (
    <table className="grid">
      <tbody>
        <tr>{colNumbers}</tr>
        {rows}
      </tbody>
    </table>
  )
}

Grid.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.number)).isRequired,
  size: PropTypes.objectOf(PropTypes.number).isRequired,
}

export default Grid
