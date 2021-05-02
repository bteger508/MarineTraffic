const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const tile_map = require('./tile_map')

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'AISTestData';


// Insert an array of json AIS documents into the mongo database
exports.insert = async function(data, stub = false){

    if (Array.isArray(data)) {
        for (elt in data) {
            ais_message = data[elt]

            // If it's a position report, we query the database for the ids of the corresponding mapviews for zoom level 2 and 3
            if (ais_message["MsgType"] === "position_report") {
                let long = ais_message.Position.coordinates[1]
                let lat = ais_message.Position.coordinates[0]
                let mapviews = await get_mapviews(long, lat)
                ais_message['mapview_1'] = mapviews.mapview_1
                ais_message['mapview_2'] = mapviews.mapview_2
                ais_message['mapview_3'] = mapviews.mapview_3
            }
        }
    } else if (data["MsgType"] === "position_report") {
        let long = data.Position.coordinates[1]
        let lat = data.Position.coordinates[0]
        let mapviews = await get_mapviews(long, lat)
        data['mapview_1'] = mapviews.mapview_1
        data['mapview_2'] = mapviews.mapview_2
        data['mapview_3'] = mapviews.mapview_3
    }
    
    // If function is called in stub mode, return the array of JSON AIS docs passed as an argument
    if (stub) { return data }
    
    const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology: true});
	
	try {
	    await client.connect();
	    const ais_messages = client.db(dbName).collection('ais_messages')
	    if (Array.isArray(data)) {
	        var out = await ais_messages.insertMany(data, {forceServerObjectId: true})
	    } else {
	        var out = await ais_messages.insertOne(data, {forceServerObjectId: true})
	    }
	    
	    // Respond with a count of successful insertions
	    return { "Inserted": out.insertedCount};
	    
	} finally {
	    await client.close()
	}
}



async function get_mapviews(long, lat, stub = false) {
    
    //If function is called in stub mode, return the arguments as an object
    if (stub) { return {'lat': lat, 'long': long}}
    
    // If the position is off of the map, there will be no matching mapview ids for the position
    if (isOutOfBounds(long, lat)) {
        return  {'mapview_1': null, 'mapview_2': null, 'mapview_3': null};
    }
    
    const tile = tile_map.get_tile(3, long, lat)
    
    const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology: true});
	
	try {
	    await client.connect();
	    const mapviews = client.db(dbName).collection('mapviews')
	    var mapview_3 = await mapviews.aggregate([{$match: tile}]).toArray()	    
	    
	    // extract the mapview object from the Array
	    mapview_3 = mapview_3[0]
	    
	    // if the query came back with no matches, set the mapview ids to null
	    if (mapview_3 === undefined) {
            return  {'mapview_1': null, 'mapview_2': null, 'mapview_3': null};
	    }
	    
	    return {'mapview_1': 1, 'mapview_2': mapview_3.contained_by, 'mapview_3': mapview_3.id};
	    
	} finally {
	    await client.close()
	}
    
}

function isOutOfBounds(long, lat) {
    var outOfBounds = true
    if (long <= tile_map.EAST && long >= tile_map.WEST) {
        if (lat <= tile_map.NORTH && lat >= tile_map.SOUTH) {
            outOfBounds = false
        }
    }
    return outOfBounds
}


// Retrieve position information for a given MMSI 
exports.read_position = async function(mmsi, stub = false){
	const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology: true});
	
	// If function is called in stub mode, return the MMSI passed as an argument
	if (stub) { return mmsi }
	
	// Else, execute the query
	try {
	    await client.connect();
	    const ais_messages = client.db(dbName).collection('ais_messages')
	    let position = await ais_messages.aggregate([{$match: {"MMSI": mmsi}},
	                    {$project: {_id:0, MMSI:1, "Position.coordinates": 1}},
	                    {$sort: {Timestamp: -1}},
	                    {$limit: 1}]).toArray()
	    position = position[0]
	    
        // Try to get the imo matching the MMSI from the most recent AIS message
	    let imo = await ais_messages.aggregate([{$match: {IMO: {$gte: 0}, MMSI: mmsi}}, 
	                    {$project: {_id:0, IMO:1}}, 
	                    {$sort: {Timestamp: -1}},
	                    {$limit:1}]).toArray()
	    imo = imo[0]
	    
	    // If none of the AIS messages have an IMO that matches the MMSI, query the vessels collection
         if (imo === undefined) {
            const vessels = client.db(dbName).collection('vessels')
            imo = await vessels.aggregate([{$match: {IMO: {$gte: 0}, MMSI: mmsi}}, {$project: {_id:0, IMO:1}}, {$limit:1}]).toArray()
            imo = imo[0]
         }
        
	    return {"MMSI": position.MMSI, 'lat': position.Position.coordinates, 'long': position.Position.coordinates, 'IMO': imo.IMO}
	} finally {
	    client.close()
	}
}


// Delete AIS Messages that are older than 5 minutes
exports.delete_messages = async function(stub = false){
	const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology: true});
	
	// Creating todays date in JSON format
	var today = new Date();
	var date = '"'+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var oldTime = 'T'+today.getHours() + ":" + (today.getMinutes()-5) 
		+ ":" + today.getSeconds() + '.' + today.getMilliseconds() + '"';
		
	var five_minutes_old = date + oldTime;
	 
	// Deleting the old timestamps
	try {
	    await client.connect();
	    const ais_messages = client.db(dbName).collection('ais_messages')
		
	    var deletion = await ais_messages.deleteMany({"Timestamp" : {"$lt" : Date(five_minutes_old)}});
	    
	    // Respond with a count of successful deletions
	    return deletion;
	} finally {
	    await client.close()
	}
}


// Retrieve permanent vessel information for a given MMSI
exports.permanent_data = async function(mmsi, stub = false){
	const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology: true});
	
	// If function is called in stub mode, return the MMSI passed as an argument
	if (stub) { return mmsi }
	
	// Else, execute the query
	try {
	    await client.connect();
		
		const vessels = client.db(dbName).collection('vessels')
	    const query = {"MMSI" : mmsi};
		const project = {projection: {_id:0}};
		
		const permanent_data = await vessels.findOne(query,project);
		
	    return permanent_data;
	} finally {
	    client.close()
	}
}

// Retrieve transient vessel information for a given MMSI
exports.transient_data = async function(mmsi, stub = false){
	const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology: true});
	
	// If function is called in stub mode, return the MMSI passed as an argument
	if (stub) { return mmsi }
	
	// Else, execute the query
	try {
	    await client.connect();
		
	    const aisdk_20201118 = client.db(dbName).collection('aisdk_20201118')
		const query = {"MMSI": mmsi};
		const project = {projection: {_id:0}};
		
	    const temp_data = await aisdk_20201118.findOne(query,project);
	    		
	    return temp_data;
	} finally {
	    client.close()
	}
}

exports.get_mapviews = get_mapviews
exports.isOutOfBounds = isOutOfBounds