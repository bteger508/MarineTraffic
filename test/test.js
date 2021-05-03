const chai = require('chai')
const assert = chai.assert
const dao = require('../src/dao')
const sample_input = require('../data/sample_input.json')


/*
*  Unit Tests
*/

/*
* insert() is called either with an array of AIS json docs or a single ais json doc
*/ 

// insert() can be called with an array of json ais docs and adds the following
describe('insert() called with array of JSON AIS docs inserts mapview properties to position report docs', () => {
    it('', async () => {
        const parameter = await dao.insert(sample_input, true)
        
        // parameter[0] is the first AIS message in the array and is a position report 
        assert.property(parameter[0], "mapview_1")
        assert.property(parameter[0], "mapview_2")
        assert.property(parameter[0], "mapview_3")
    })
});

// insert() can be called with an array of json ais docs and adds properties corresponding
// to the 3 tile ids for the three zoom levels (only for position reports)
describe('insert() called with an array of JSON AIS documents does not add mapview properties to position report docs', () => {
    it('', async () => {
        const parameter = await dao.insert(sample_input, true)

        var static_data = null
        
        // find the first static data object in the array of JSON AIS docs
        for (elt in parameter) {
            if (parameter[elt]["MsgType"] === "static_data") {
                static_data = parameter[elt]
                break
            }
        }
        
        assert.notProperty(static_data, "mapview_1")
        assert.notProperty(static_data, "mapview_2")
        assert.notProperty(static_data, "mapview_3")
    })
});

// insert() can be called with a single JSON AIS doc
describe('insert() called with a single JSON AIS document', () => {
    it('', async () => {
        const parameter = await dao.insert({"Timestamp":"2020-11-18T00:00:00.000Z",
                                                    "Class":"Class A","MMSI":304858000,
                                                    "MsgType":"position_report",
                                                    "Position": {"type":"Point","coordinates":[55.218332, 13.371672]},
                                                    "Status":"Under way using engine","SoG":10.8,
                                                    "CoG":94.3,"Heading":97}, true)
                                                    
        assert.deepEqual(parameter, {"Timestamp":"2020-11-18T00:00:00.000Z",
                                            "Class":"Class A","MMSI":304858000,
                                            "MsgType":"position_report",
                                            "Position": {"type":"Point","coordinates":[55.218332, 13.371672]},
                                            "Status":"Under way using engine","SoG":10.8,
                                            "CoG":94.3,"Heading":97, "mapview_1": null, "mapview_2": null, "mapview_3": null})
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

// dao.get_tile() is called with proper parameter
describe('dao.get_mapviews() is called with proper parameters', () => {
    it('', async () => {
        var lat = 51
        var long = 13
        const return_value = await dao.get_mapviews(long, lat, true)
        assert.deepEqual(return_value, {'lat': 51, 'long': 13})
    })
});

// call dao.get_tile() with latitude: 13.371... and longitude: 55.218... (out of bounds!)
describe('dao.get_mapviews() called with lat: 13.371..., long: 55.218...', () => {
    it('', async () => {
        var lat = 55.218332
        var long = 13.371672
        const mapview_ids = await dao.get_mapviews(long, lat)
        
        assert.deepEqual(mapview_ids, {'mapview_1': null, 'mapview_2': null, 'mapview_3': null})
    })
});

// call dao.get_tile with lat: 54.76 and long: 12.42 (in bounds)
describe('call dao.get_mapviews() with lat: 54.76 and long: 12.42 (in bounds)', () => {
    it('', async () => {
        var lat = 54.763183
        var long = 12.415067
        const mapview_ids = await dao.get_mapviews(long, lat)
        
        assert.deepEqual(mapview_ids, {'mapview_1': 1, 'mapview_2': 5526, 'mapview_3': 55261})
    })
});

// call dao.get_tile with lat: 55.00316, 12.809015 (in bounds)
describe('call dao.get_mapviews() with lat: 55.00316 and long: 12.809015 (in bounds)', () => {
    it('', async () => {
        var lat = 55.00316
        var long = 12.809015
        const mapview_ids = await dao.get_mapviews(long, lat)
        
        assert.deepEqual(mapview_ids, {'mapview_1': 1, 'mapview_2': 5527, 'mapview_3': 55274})
    })
});

describe('dao.isOutOfBounds() called with lat: 13.371..., long: 55.218...', () => {
    it('', async () => {
        var lat = 55.218332
        var long = 13.371672
        assert.equal(dao.isOutOfBounds(long, lat), true)
    })
});

describe('dao.isOutOfBounds() called with lat: 13, long: 57.5 ', () => {
    it('', async () => {
        var lat = 57.5
        var long = 13
        assert.equal(dao.isOutOfBounds(long, lat), false)
    })
});

describe('dao.isOutOfBounds() called with lat: 13.5, long: 57.5', () => {
    it('', async () => {
        var lat = 57.5
        var long = 13.5
        assert.equal(dao.isOutOfBounds(long, lat), true)
    })
});

// read_position() is called with proper parameter
describe('read_postition() is called with a 9 digit integer MMSI', () => {
    it('', async () => {
        var MMSI = 265177000
        const parameter = await dao.read_position(MMSI, true)
        assert.strictEqual(parameter, MMSI)
    })
});

// read_position returns a position document in the correct format
describe('read_postition() returns a position doc in the correct format', () => {
    it('', async () => {
        var MMSI = 265177000
        const position_report = await dao.read_position(MMSI)
        assert.property(position_report, "MMSI")
        assert.property(position_report, "lat")
        assert.property(position_report, "long")
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

// read_ShipPositions() is called with proper parameter
describe('read_ShipPositions() is called with a string port name', () => {
    it('', async () => {
        var timestamp = "2020-11-18T00:00:00Z"
        const parameter = await dao.read_ShipPositions(timestamp, true)
        assert.strictEqual(parameter, timestamp)
    })
});

// read_ShipPositions() returns an array of ship position documents
describe('read_ShipPositions() returns an array of ship position documents', () => {
    it('', async () => {
        var timestamp = "2020-11-18T00:00:00Z"
        const array = await dao.read_ShipPositions(timestamp)
        assert.deepEqual(array, 116);
    })
});

// read_PortName() is called with proper parameter
describe('read_PortName() is called with a string port name', () => {
    it('', async () => {
        var portname = "Frederikshavn"
        const parameter = await dao.read_PortName(portname, true)
        assert.strictEqual(parameter, portname)
    })
});

// read_PortName() returns an array of port documents in the correct format
describe('read_PortName() returns an array of port documents in the correct format', () => {
    it('', async () => {
        var portname = "Frederikshavn"
        const array = await dao.read_PortName(portname)
        assert.deepEqual(array, [{ "id" : "1221", "un/locode" : "DKFDH", "port_location" : "Frederikshavn", 
		"country" : "Denmark", "longitude" : "10.546111", "latitude" : "57.437778", "website" : "www.frederikshavnhavn.dk", 
		"mapview_1" : 1, "mapview_2" : 5335, "mapview_3" : 53352}]);
    })
});

// read_LastFivePositions() is called with proper parameter
describe('read_LastFivePositions() is called with a 9 digit integer MMSI', () => {
    it('', async () => {
        var MMSI = 311000929
        const parameter = await dao.read_LastFivePositions(MMSI, true)
        assert.strictEqual(parameter, MMSI)
    })
});

// read_LastFivePositions() returns the last five vessel position documents in the correct format
describe('read_LastFivePositions() returns the last five vessel position documents in the correct format', () => {
    it('', async () => {
        var MMSI = 311000929
        const data = await dao.read_LastFivePositions(MMSI)
		assert.deepEqual("Documents returned: "+data, "Documents returned: "+5);
    })
});

// read_PositionWithPortID() is called with proper parameter
describe('read_PositionWithPortID() is called with a string portID', () => {
    it('', async () => {
        var portID = "2966"
        const parameter = await dao.read_PositionWithPortID(portID, true)
        assert.strictEqual(parameter, portID)
    })
});

// read_PositionWithPortID() returns the last five vessel positions headed to a given port using port ID
describe('read_PositionWithPortID() returns the last five vessel positions headed to a given port using port ID', () => {
    it('', async () => {
        var portID = "2966"
        const data = await dao.read_PositionWithPortID(portID)
		assert.deepEqual("Documents returned: "+data, "Documents returned: "+5);
    })
});

// read_PositionWithPortName() returns with the last five vessel positions headed to port using port name
describe('read_PositionWithPortName() returns with the last five vessel positions headed to port using port name', () => {
    it('', async function () {
        var portName = "Assens"
        const data = await dao.read_PositionWithPortName(portName, Country = null)
		assert.deepEqual("Documents returned: "+data, "Documents returned: "+5);
    })
});

// read_PositionWithPortName() returns with an array of all port documents in the country of Denmark
describe('read_PositionWithPortName() returns with an array of all port documents in the country of Denmark', () => {
    it('', async () => {
        var Country = "Denmark"
        const data = await dao.read_PositionWithPortName(portName = null, Country)
		assert.deepEqual("Documents returned: "+data, "Documents returned: "+139);
    })
});

// read_PositionWithPortName() returns with the last five vessel positions headed to port using port name and country
describe('read_PositionWithPortName() returns with the last five vessel positions headed to port using port name and country', () => {
    it('', async () => {
        var portName = "Assens"
		var Country = "Denmark"
        const data = await dao.read_PositionWithPortName(portName,Country)
		assert.deepEqual("Documents returned: "+data, "Documents returned: "+5);
    })
});

// read_PositionWithPortName() returns a message that neither a port name or country was selected
describe('read_PositionWithPortName() returns a message that neither a port name or country was selected', () => {
    it('', async () => {
        const message = await dao.read_PositionWithPortName()
		assert.deepEqual(message, "Neither a port name or country was selected.");
    })
});

// findTiles() is called with proper parameter
describe('findTiles() is called with an int tileID', () => {
    it('', async () => {
        var tileID = 5237
        const parameter = await dao.findTiles(tileID, true)
        assert.strictEqual(parameter, tileID)
    })
});

// findTiles() returns the 4 tiles of zoom level 2 related to a given tile ID
describe('findTiles() returns the 4 tiles of zoom level 2 related to a given tile ID', () => {
    it('', async () => {
        var tileID = 5237
        const data = await dao.findTiles(tileID)
		assert.deepEqual("Documents returned: "+data, "Documents returned: "+4);
    })
});

// findTiles() returns an error message if the tile ID given is in the wrong zoom level
describe('findTiles() returns an error message if the tile ID given is in the wrong zoom level', () => {
    it('', async () => {
        var tileID = 52371
        const data = await dao.findTiles(tileID)
		assert.deepEqual(data, "The tile ID chosen is not in zoom level one.");
    })
});

// findTiles() returns an error message if the tile ID given is null
describe('findTiles() returns an error message if the tile ID given is null', () => {
    it('', async () => {
        var tileID = null;
        const data = await dao.findTiles(tileID)
		assert.deepEqual(data, "Choose a tile ID to find tiles.");
    })
});

// getPNG() is called with proper parameter
describe('getPNG() is called with an int tileID', () => {
    it('', async () => {
        var tileID = 5237
        const parameter = await dao.getPNG(tileID, true)
        assert.strictEqual(parameter, tileID)
    })
});

// getPNG() returns binary data of a PNG file from a given map tile ID
describe('getPNG() returns binary data of a PNG file from a given map tile ID', () => {
    it('', async () => {
        var tileID = 5237;
        const data = await dao.getPNG(tileID)
		assert.deepEqual("Binary length: "+data, "Binary length: "+892444);
    })
});

// getPNG() returns error message if tile ID is null
describe('getPNG() getPNG() returns error message if tile ID is null', () => {
    it('', async () => {
        var tileID = null;
        const data = await dao.getPNG(tileID)
		assert.deepEqual(data, "Choose a tile ID to find tiles.");
    })
});
