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
        
	    return {"MMSI": position.MMSI, 'Lat': position.Position.coordinates, 'Long': position.Position.coordinates, 'IMO': imo.IMO}
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
