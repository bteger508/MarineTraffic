const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

stub = false

// Database Name
const dbName = 'AISTestData';

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

exports.isNumValid = function(num) {
    return num > 70
}


