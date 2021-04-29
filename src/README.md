# dao.js Script

## insert()
parameters: 
- AIS JSON object or an array of AIS JSON objects,
- An optional boolean parameter to run the function in stub mode for testing purposes.

return value:
- {"Inserted": count} where count is the number of documents successfully inserted into the database. If the insertion fails, the count should equal 0. 

description:

When insert() is called with an array of JSON AIS messages, the function inserts all of the documents with the insertMany() function provided by the Mongodb API. When insert() is called with a single JSON AIS message, the function uses insertOne() (also from mongodb API) to insert the document. 


## read_position()
parameters:
- 9 digit integer MMSI of the ship whose position is being queried
- An optional boolean flag to run the function in stub mode for testing purposes.

return value:
- An object in the form of {"MMSI": ..., "lat": ..., "long": ..., "IMO": ...}

description:

read_position() first queries the ais_messages collection for the coordinates matching the MMSI provided. Then the function queries the ais_messages collection for an IMO number that corresponds to the given MMSI number. If the collection does not contain any static data that matches with the given MMSI, then the function queries the vessel collection to find a corresponding IMO. 
