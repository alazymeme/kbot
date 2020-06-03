const fs = require('fs')
const isStream = require('./stream')
const split = require('./split')

module.exports = function(filename, cb) {
  let count = 0
  const stream = isStream(filename) ? filename : fs.createReadStream(filename)

  stream
    .once('error', cb)
    .pipe(split())
    .on('data', function () {
      count++
    })
    .on('end', function () {
      cb(null, count)
    })
}
