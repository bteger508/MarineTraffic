const chai = require('chai')
const expect = chai.expect

const validator = require('../src/dao')

describe('validator should return true for numbers > 70', () => {
    it('', () => {
        expect(validator.isNumValid(80)).to.be.true
    })
});

describe('validator should return false for numbers < 70', () => {
    it('', () => {
        expect(validator.isNumValid(39)).to.be.false
    })
});