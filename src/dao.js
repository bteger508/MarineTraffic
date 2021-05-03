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


// Read all most recent ship positions
exports.read_ShipPositions = async function(timestamp, stub = false){
	const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology: true});
	
	// If function is called in stub mode, return the timestamp passed as an argument
	if (stub) { return timestamp }
	
	// Else, execute the query
	try {
	    await client.connect();
	    const aisdk_20201118 = client.db(dbName).collection('aisdk_20201118')
		var ship_positions = await aisdk_20201118.find({"Timestamp":new Date(timestamp),"MsgType":"position_report"})
		.project({"MMSI":1,"Position":{"coordinates":1},"IMO":1,"Name":1,_id:0})
		.toArray();
		
		return ship_positions.length;
	} finally {
	    client.close()
	}
}


// Read all ports matching the given name and optional country
exports.read_PortName = async function(portname, stub = false){
	const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology: true});
	
	// If function is called in stub mode, return the portname passed as an argument
	if (stub) { return portname }
	
	// Else, execute the query
	try {
	    await client.connect();
	    const ports = client.db(dbName).collection('ports')
		var port_docs = await ports.find({"port_location":portname})
		.project({"_id":0})
		.toArray();
		
		return port_docs;
	} finally {
	    client.close()
	}
}


// Read last 5 positions of a given MMSI
exports.read_LastFivePositions = async function(mmsi, stub = false){
	const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology: true});
	
	// If function is called in stub mode, return the MMSI passed as an argument
	if (stub) { return mmsi }
	
	// Else, execute the query
	try {
	    await client.connect();
		const aisdk_20201118 = client.db(dbName).collection('aisdk_20201118')
		
		let five_positions = await aisdk_20201118.find({"MMSI":mmsi,"MsgType":"position_report"})
			.project({_id:0,"Timestamp":0,"Class":0,"MsgType":0})
			.sort({"_id":-1})
			.limit(5)
			.toArray();
		
		let object = await Object.assign({},five_positions);
		var objectSize = Object.keys(object).length;
		
	    return objectSize;
	} finally {
	    client.close()
	}
}


// Read most recent position of ships headed to port with given Port Id
exports.read_PositionWithPortID = async function(portID, stub = false){
	const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology: true});
	
	// If function is called in stub mode, return the portID passed as an argument
	if (stub) { return portID }
	
	// Else, execute the query
	try {
	    await client.connect();
		
		// Creates the destination in var port_nameString()
		const ports = client.db(dbName).collection('ports')
		var port = await ports.find({"id":portID})
			.project({"_id":0,"port_location":1})
			.toArray();
		var port_nameArray = new Array();
		for (x of port){port_nameArray.push(x.port_location)};
		var port_nameString = port_nameArray.toString().toUpperCase();
		
		// Creates the vessel MMSI in var static_mmsiInt
		const aisdk_20201118 = client.db(dbName).collection('aisdk_20201118')
		var static_data = await aisdk_20201118.find({"Destination":port_nameString,"MsgType":"static_data"})
			.project({"_id":0,"MMSI":1})
			.sort({"_id":-1})
			.limit(1)
			.toArray();
		var static_mmsiArray = new Array();
		for (x of static_data){static_mmsiArray.push(x.MMSI)};
		var static_mmsiInt = parseInt(static_mmsiArray.toString());
		
		// Creates the vessel position array in var position
		var position = await aisdk_20201118.find({"MMSI":static_mmsiInt,"MsgType":"position_report"})
			.project({"_id":0,"MMSI":1,"Position":{"coordinates":1},"Status":1,"RoT":1,"SoG":1,"CoG":1,"Heading":1})
			.sort({"_id":-1})
			.limit(5)
			.toArray();
		
		return position.length;
	} finally {
	    client.close()
	}
}


// Read most recent positions of ships headed to given port (as read from static data, or user input)
 exports.read_PositionWithPortName = async function (portName, Country){
	const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology: true});
	try {
		await client.connect();
	
		// Port name only
		if ( (portName != null && Country == null) || (portName != null && Country != null) ) { 
				
			const aisdk_20201118 = client.db(dbName).collection('aisdk_20201118')
			var portNameUPPER = portName.toUpperCase();
				
			// Creates the vessel MMSI in var static_mmsiInt
			var static_data = await aisdk_20201118.find({"Destination":portNameUPPER,"MsgType":"static_data"})
				.project({"_id":0,"MMSI":1})
				.sort({"_id":-1})
				.limit(1)
				.toArray();
			var static_mmsiArray = new Array();
			for (x of static_data){static_mmsiArray.push(x.MMSI)};
			var static_mmsiInt = parseInt(static_mmsiArray.toString());
				
			// Creates the vessel position array in var position
			var position = await aisdk_20201118.find({"MMSI":static_mmsiInt,"MsgType":"position_report"})
				.project({"_id":0,"MMSI":1,"Position":{"coordinates":1},"Status":1,"RoT":1,"SoG":1,"CoG":1,"Heading":1})
				.sort({"_id":-1})
				.limit(5)
				.toArray();
			
			return position.length;
	
		// Country name only
		} else if (Country != null && portName == null){
		
			const ports = client.db(dbName).collection('ports')
			var portArray = await ports.find({"country":Country})
				.project({"_id":0})
				.toArray();
			
			return portArray.length;
		
		// No names passed
		} else {
			return "Neither a port name or country was selected.";
		}

	} finally {
		await client.close()
	}
	
}


/** Given a background map tile for zoom level 1 (2),
 find the 4 tiles of zoom level 2 (3) that are contained in it */
 exports.findTiles = async function(tileID, stub = false){
	const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology: true});
 
    // If function is called in stub mode, return the tileID passed as an argument
	if (stub) { return tileID }
	
	// Else, execute the query
	try {
	    await client.connect();
		
		if ( tileID != null ){
			
			
			// Creates the tile scale zoom in var tileScale_Int
			const mapviews = client.db(dbName).collection('mapviews')
			var tileScale = await mapviews.find({"id":tileID}).project({"scale":1,"_id":0}).toArray();
			var tileScale_Array = new Array();
			for (x of tileScale){tileScale_Array.push(x.scale)};
			var tileScale_Int = parseInt(tileScale_Array.toString());
			
			// Checks tileID if zoom level one
			if ( tileScale_Int == 2 ){
				var levelTwoTiles = await mapviews.find({"contained_by":tileID}).project({"_id":0}).toArray();
				return levelTwoTiles.length;
			}else {
				return "The tile ID chosen is not in zoom level one.";
			}
			
		}else{
			return "Choose a tile ID to find tiles.";
		}
		
	} finally {
	    client.close()
	}
}

exports.get_mapviews = get_mapviews
exports.isOutOfBounds = isOutOfBounds
