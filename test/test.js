const chai = require('chai')
const assert = chai.assert
const dao = require('../src/dao')

describe('execute query', () => {
    it('', async () => {
        const name = await dao.query();
        assert.equal(name, 'Athina');
    })
});
