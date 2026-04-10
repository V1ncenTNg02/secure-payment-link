const path = require('path')

module.exports = async function () {
  require('dotenv').config({ path: path.join(__dirname, '../../../.env') })
}
