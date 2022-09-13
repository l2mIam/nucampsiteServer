const cors = require('cors')
require('dotenv').config()

const whitelist = [`http://${process.env.HOSTNAME}:${process.env.PORT}`, `https://${process.env.HOSTNAME}:${process.env.SEC_PORT}`]
const corsOptionsDelegate = (req, callback) => {
  console.log(req.header('Origin'))
  // if Origin found (not not found)
  const corsOptions = (whitelist.indexOf(req.header('Origin')) !== -1)
    ? { origin: true }
    : { origin: false }
  callback(null, corsOptions)
}

// will return function configured to set a cors header of access control allow origin on a response object
// with a '*' as its value (will allow cors for all origins) 
exports.cors = cors()
// will check if in our whitelist
exports.corsWithOptions = cors(corsOptionsDelegate)