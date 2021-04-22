const chai = require('chai')
const expect = chai.expect
const assert = chai.assert
const dao = require('../src/dao')

describe('validator should return true for numbers > 70', () => {
    it('', () => {
        expect(dao.isNumValid(80)).to.be.true
    })
});

describe('validator should return false for numbers < 70', () => {
    it('', () => {
        expect(dao.isNumValid(39)).to.be.false
    })
});

describe('execute query', () => {
    it('', async () => {
        const name = await dao.query();
        assert.equal(name, 'BAYARD (1972)');
    })
});
