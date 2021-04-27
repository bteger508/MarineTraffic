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
exports.read_position = async function(data, stub = false){
	const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology: true});
	
	// If function is called in stub mode, return the MMSI passed as an argument
	if (stub) { return data }
	
	// Else, execute the query
	try {
	} finally {
	}
}
