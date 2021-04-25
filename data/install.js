// Unzips the json.gz files

'use strict'

const gunzip = require('gunzip-file')

// 'example.json.gz' - source file
// 'example.json'    - destination file
// () => { ... }    - notification callback

gunzip('aisdk_20201118_sliced_1000000.json.gz', 'aisdk_20201118_sliced_1000000.json', () => {
  console.log('aisdk_20201118_sliced_1000000.json done!')
})

gunzip('mapviews.json.gz', 'mapviews.json', () => {
  console.log('mapviews.json done!')
})

gunzip('ports.json.gz', 'ports.json', () => {
  console.log('ports.json done!')
})

gunzip('vessels.json.gz', 'vessels.json', () => {
  console.log('vessels.json done!')
})