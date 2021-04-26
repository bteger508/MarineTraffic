const chai = require('chai')
const assert = chai.assert
const dao = require('../src/dao')
const sample_input = require('../data/sample_input.json')

describe('execute query', () => {
    it('', async () => {
        const name = await dao.query();
        assert.equal(name, 'Athina');
    })
});

// Unit test for insert() method using sample AIS json docs
describe('execute insert', () => {
    it('', async () => {
        const response = await dao.insert(sample_input);
        assert.deepEqual(response, {"Inserted": 500});
    })
});