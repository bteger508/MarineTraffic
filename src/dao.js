const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'AISTestData';


// Insert an array of json AIS documents into the mongo database
exports.insert = async function(data, stub = false){
    
    // If function is called in stub mode, return the array of JSON AIS docs passed as an argument
    if (stub) { return data }
    
	const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology: true});
	
	try {
	    await client.connect();
	    const ais_messages = client.db(dbName).collection('ais_messages')
	    let out = await ais_messages.insertMany(data, {forceServerObjectId: true})
	    
	    // Respond with a count of successful insertions
	    return { "Inserted": out.insertedCount};
	} finally {
	    await client.close()
	}
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
	                    
	    let imo = await ais_messages.aggregate([{$match: {IMO: {$gte: 0}, MMSI: mmsi}}, {$project: {_id:0, IMO:1}}, {$sort: {Timestamp: -1}}, {$limit:1}]).toArray()
	    
         if (imo.length === 0) {
            console.log("checking vessel collection for a matching IMO")
            const vessels = client.db(dbName).collection('vessels')
            imo = await vessels.aggregate([{$match: {IMO: {$gte: 0}, MMSI: mmsi}}, {$project: {_id:0, IMO:1}}, {$limit:1}]).toArray()
         }
        
	    return {"MMSI": position[0].MMSI, 'Lat': position[0].Position.coordinates[0], 'Long': position[0].Position.coordinates[0], 'IMO': imo[0].IMO}
	} finally {
	    client.close()
	}
}
