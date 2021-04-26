const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

stub = false

// Database Name
const dbName = 'AISTestData';


// A dummy query for reference
exports.query = async function (){
	const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology: true});
	
	try {
        await client.connect();
        
	    const vessels = client.db(dbName).collection('vessels')
		var docs = await vessels.aggregate([
		    {$match: {IMO: 1000007}}, 
		    {$project: {_id:0, Name: 1}}
		]).toArray();
    
    // return the last former name from the list
    return docs[0].Name

	} finally { client.close(); }
}

// Insert an array of json AIS documents into the mongo database
exports.insert = async function(data){
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