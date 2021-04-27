const chai = require('chai')
const assert = chai.assert
const dao = require('../src/dao')
const sample_input = require('../data/sample_input.json')


/*
*  Unit Tests
*/

// insert() is called with proper parameters
describe('insert() is called with an array of JSON AIS documents', () => {
    it('', async () => {
        const parameter = await dao.insert(sample_input, true)
        assert.deepEqual(parameter, sample_input)
    })
});


// Unit test for insert() method using sample AIS json docs
describe('insert() 500 sample AIS JSON docs into the mongo DB', () => {
    it('', async () => {
        const response = await dao.insert(sample_input);
        assert.deepEqual(response, {"Inserted": 500});
    })
});

// read_position() is called with proper parameter
describe('read_postition is called with a 9 digit integer MMSI', () => {
    it('', async () => {
        var MMSI = 265177000
        const parameter = await dao.read_position(MMSI, true)
        assert.strictEqual(parameter, MMSI)
    })
});