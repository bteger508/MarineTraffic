const chai = require('chai')
const assert = chai.assert
const dao = require('../src/dao')
const sample_input = require('../data/sample_input.json')


/*
*  Unit Tests
*/

/*
* insert() is called either with an array or a single ais json doc
*/ 
// insert() can be called with an array of json ais docs
describe('insert() called with an array of JSON AIS documents', () => {
    it('', async () => {
        const parameter = await dao.insert(sample_input, true)
        assert.deepEqual(parameter, sample_input)
    })
});

// insert() can be called with a single JSON AIS doc
describe('insert() called with a single JSON AIS doc', () => {
    it('', async () => {
        const parameter = await dao.insert({"Timestamp":"2020-11-18T00:00:00.000Z",
                                                    "Class":"Class A","MMSI":304858000,
                                                    "MsgType":"position_report",
                                                    "Position": {"type":"Point","coordinates":[55.218332,13.371672]},
                                                    "Status":"Under way using engine","SoG":10.8,
                                                    "CoG":94.3,"Heading":97}, true)
                                                    
        assert.deepEqual(parameter, {"Timestamp":"2020-11-18T00:00:00.000Z",
                                            "Class":"Class A","MMSI":304858000,
                                            "MsgType":"position_report",
                                            "Position": {"type":"Point","coordinates":[55.218332,13.371672]},
                                            "Status":"Under way using engine","SoG":10.8,
                                            "CoG":94.3,"Heading":97})
    })
});


// Unit test for insert() method using sample AIS json docs
describe('insert() 500 sample AIS JSON docs into the mongo DB', () => {
    it('', async () => {
        const response = await dao.insert(sample_input);
        assert.deepEqual(response, {"Inserted": 500});
    })
});


// Unit test for insert() method using a single json AIS doc
describe('insert() 1 sample AIS JSON docs into the mongo DB', () => {
    it('', async () => {
        const response = await dao.insert({"Timestamp":"2020-11-18T00:00:00.000Z",
                                                    "Class":"Class A","MMSI":304858000,
                                                    "MsgType":"position_report",
                                                    "Position": {"type":"Point","coordinates":[55.218332,13.371672]},
                                                    "Status":"Under way using engine","SoG":10.8,
                                                    "CoG":94.3,"Heading":97})
        assert.deepEqual(response, {"Inserted": 1});
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

// read_position returns a position document in the correct format
describe('read_postition returns a position doc in the correct format', () => {
    it('', async () => {
        var MMSI = 265177000
        const position_report = await dao.read_position(MMSI)
        assert.property(position_report, "MMSI")
        assert.property(position_report, "Lat")
        assert.property(position_report, "Long")
        assert.property(position_report, "IMO")
    })
});



// Unit test for delete_messages() method using sample AIS json docs
describe('delete_messages() deletes 501 AIS messages older than 5 minutes', () => {
    it('', async () => {
        const response = await dao.delete_messages();
        assert.isObject( response );
		assert.deepEqual( 'Deleted '+response.deletedCount+' item(s).', 'Deleted 501 item(s).');
    })
});



// permanent_data() is called with proper parameter
describe('permanent_data() is called with a 9 digit integer MMSI', () => {
    it('', async () => {
        var MMSI = 210169000
        const parameter = await dao.permanent_data(MMSI, true)
        assert.strictEqual(parameter, MMSI)
    })
});

// permanent_data() returns a vessel document in the correct format
describe('permanent_data() returns a vessel doc in the correct format', () => {
    it('', async () => {
        var MMSI = 210169000
        const data = await dao.permanent_data(MMSI)
        assert.deepEqual(data.MMSI, MMSI);
    })
});



// transient_data() is called with proper parameter
describe('transient_data() is called with a 9 digit integer MMSI', () => {
    it('', async () => {
        var MMSI = 210169000
        const parameter = await dao.transient_data(MMSI, true)
        assert.strictEqual(parameter, MMSI)
    })
});

// transient_data() returns a vessel document in the correct format
describe('transient_data() returns a vessel doc in the correct format', () => {
    it('', async () => {
        var MMSI = 210169000
        const data = await dao.transient_data(MMSI)
        assert.deepEqual(data.MMSI, MMSI);
    })
});