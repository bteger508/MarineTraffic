# dao.js Script

## insert()
parameters: 
- AIS JSON object or an array of AIS JSON objects,
- Optional boolean flag to run the function in stub mode for testing purposes. 

return value:
- {"Inserted": count} where count is the number of documents successfully inserted into the database. If the insertion fails, the count should equal 0. 

description:
- When insert() is called with an array of JSON AIS messages, the function inserts all of the documents with the insertMany() function provided by the Mongodb API.
- When insert() is called with a single JSON AIS message, the function uses insertOne() (also from mongodb API) to insert the document. 
- When the insert() function inserts position reports, it adds the following properties to the position report objects: mapview_1, mapview_2, mapview_3. These properties map to the IDs of the each map view a ship is associated with at the time of the position report. 
	- If the coordinates of the position report are outside of the GUI map, then each of the position report's mapview properties are set to null. 


## get_mapviews()
parameters:
- Longitude (number)
- Latitude (number)
- Optional boolean flag to run the function in stub mode for testing purposes. 

return value:
- {'mapview_1': id_1, 'mapview_2': id_2, 'mapview_3': id_3}, where the three IDs correspond to the IDs of the mapviews at zoom levels 1,2 and 3 respectively that encapsulate the coordinates passed into get_mapviews(). If the query fails or the coordinates are outside of the bounds of the GUI map, then the IDs will be set to null.

description:
- get_mapviews() first checks to see if the coordinates lie within the boundaries of the GUI map. If not, get_mapviews() returns {'mapview_1': null, 'mapview_2': null, 'mapview_3': null}.
- Otherwise, the function calculates the boundaries of the zoom level 3 tile that encapsulates the coordinates.
- The function then attempts to query the 'mapviews' collection to find the ID of the zoom level 3 mapview that encapsulates the coordinates.
- The function then returns the IDs as an object as described above.

## isOutOfBounds()
parameters:
- Longitude (number)
- Latitude (number)

return value:
- outOfBounds boolean:
	- true => the coordinates are outside the bounds of the GUI map
	- false => the coordinates lie within the bounds of the GUI map 

description:
- isOutOfBounds compares the coordinates passed as arguments against the boundaries of the GUI mapview. If the the coordinates are inside the GUI mapview, the function returns false; otherwise, the function returns true.

## read_position() Ben update
parameters:
- 9 digit integer MMSI of the ship whose position is being queried
- An optional boolean flag to run the function in stub mode for testing purposes.

return value:
- An object in the form of {"MMSI": ..., "lat": ..., "long": ..., "IMO": ...}

description:
- read_position() first queries the ais_messages collection for the coordinates matching the MMSI provided.
- Then, the function queries the ais_messages collection for an IMO number that corresponds to the given MMSI number.
- If the collection does not contain any static data that matches with the given MMSI, then the function queries the vessel collection to find a corresponding IMO. 


## read_positions_from_tile()
parameters:
- A tile boundary object in the form of {'north': ..., 'south': ..., 'east': ..., 'west': ...}

return value:
- A list of position report objects whose coordinates are within the tile boundary

description:
This function first queries the mapviews collection to find the id of the mapview that matches the tile boundaries. Then the function queries ais_messages to find all of the position reports that have a matching mapview id value. 


## delete_messages()
parameters:
- An optional boolean flag to run the function in stub mode for testing purposes.

return value:
- An object count of the number of documents deleted

description:
delete_messages() first creates a new timestamp based off the local machines current time, minus 5 minutes, according
  to JSON format. Then, the function queries ais_messages and uses the deleteMany method to delete
  all timestamps that are less than the generated timestamp. ais_messages that are >5 minutes will be deleted.
  The function returns an object of the deleted documents.


## Permanent and Transient data

### permanent_data()
parameters:
- 9 digit integer MMSI of the ship whose position is being queried
- An optional boolean flag to run the function in stub mode for testing purposes.

return value:
- A vessel document in the correct format

description:
permanent_data() queries the vessels collection and then projects the "_id" off to create the permanent vessel document.

### transient_data()
parameters:
- 9 digit integer MMSI of the ship whose position is being queried
- An optional boolean flag to run the function in stub mode for testing purposes.

return value: 
- A vessel document in the correct format

description:
permanent_data() queries the aisdk_20201118 collection and then projects the "_id" off to create the transient vessel document.


## read_ShipPositions()
parameters:
- JSON formated timestamp to obtain documents
- An optional boolean flag to run the function in stub mode for testing purposes.

return value:
- The length of the array of ship documents.

description:
read_ShipPositions() first queries the aisdk_20201118 collection to find the timestamp given as a parameter. Then it projects
  the returned data into the correct format: {"MMSI":1,"Position":{"coordinates":1},"IMO":1,"Name":1,_id:0}. Finally, the 
  query converts the data into an array. The function returns the length of the array of ship documents.
  

## read_PortName()
parameters:
- User given string port name
- An optional boolean flag to run the function in stub mode for testing purposes.

return value:
- A port document inside an array.

description:
read_PortName() initially queries the ports collection to find the ports that match the user given port name. Then the query
  projects the returned data to throw out the object id. Next, the query turns the returned port document into an array. This
  port array document is then returned to the function.


## read_LastFivePositions()
parameters:
- 9 digit integer MMSI of the ship whose position is being queried
- An optional boolean flag to run the function in stub mode for testing purposes.

return value:
- Returns the length of an array of position documents in the format
  {MMSI: ..., Positions: [{"lat": ..., "long": ...}, "IMO": ... ]}

description:
read_LastFivePositions() starts by quering through the aisdk_20201118 collection to find the mmsi that matches the mmsi parameter
  and it finds only position reports. Next, the query uses project to correctly format the position data and sort to sort the data
  from newest to oldest. Then, the query limits the data to five documents and turns it into an array. The array length is returned
  to the function.


## read_PositionWithPortID()
parameters:
- A user given port ID number in string format
- An optional boolean flag to run the function in stub mode for testing purposes.

return value:
- Returns the length of an array of position documents in the format
  {"MMSI": ..., "lat": ..., "long": ..., "IMO": ...}

description:
read_PositionWithPortID() has three seperate queries to create the final vessel position array.

1) The first query uses the ports collection to find matching ports that have the same given port ID. The query then uses project 
	   to turn off the object id, turning on the port_location, and turning the document into an array. Then, a for loop is created to 
	   parse through the new port array to extract the port name in a string format, the port name is stored in var port_nameString().
	   
2) In the second query, the aisdk_20201118 collection is used to find vessel static data documents that have a destination equal to
	   the generated port_nameString. The query then projects the data to turn off the object id and turns on the MMSI. It sorts the data
	   from newest to oldest and then limits a single document to be converted into an array. Next, a similar for loop is used as before
	   to extract the MMSI in the static data array. The extracted MMSI is stored in the var static_mmsiInt.
	   
3) The last query uses the aisdk_20201118 collection again, but this time searches for position reports. It uses the static_mmsiInt to 
	   find position reports that have the same MMSI. The query then uses project to get the correct document format. Then, the query sorts
	   the data from newest to oldest, limits the documents returned to 5, and converts the data to an array. This final vessel position array
	   is returned to the function by array.length.


## read_PositionWithPortName()
parameters:
- A user given port name in string format
- A user given country name is string format

return value:
- if ( (portName != null && Country == null) || (portName != null && Country != null) )
	returns the length of an array of position documents in the format
	{"MMSI": ..., "lat": ..., "long": ..., "IMO": ...}
- else if (Country != null && portName == null)
	returns the length of an array of port documents
- else 
	returns an error message: "Neither a port name or country was selected."

description:
read_PositionWithPortName() has three queries, two in the if statement and one in the else if statement.

- if statement
	1) The first query uses the aisdk_20201118 collection to find destinations that matched the user given port name and static data messages.
		   Then the query uses project to turn off the object id and turn on the MMSI. It then sorts the data from newest to oldest, limits the 
		   data to a single document, and coverts the document into an array. The same for loop structure is used from the read_PositionWithPortID
		   query to extract the static data MMSI in the array. The MMSI is stored in var static_mmsiInt.
		
	2) The second query uses the aisdk_20201118 collection to find position reports with an MMSI that matches the static_mmsiInt. The query 
		   then ueses project to format the documents correctly. Then the documents are sorted from newest to oldest, limited to 5 documents, and
		   converted into an array. The length of the vessel position array is returned to the function.
		
- else if statement
	3) If the user did not give any port name or country, then this query will provide an array of port names. The query uses the ports collection
		   to find all ports in the country of Denmark. It uses project to turn off the object id and then turns the returned documents into an array.
		   The length of the port document array is returned to the function.
		

## findTiles()
parameters:
- A tile ID in integer format
- An optional boolean flag to run the function in stub mode for testing purposes.

return value:
- if ( tileID != null )
	if ( tileScale_Int == 2 )
		returns the length of an array of level two mapview tiles

- if ( tileID != null )
	else
		returns an error message: "The tile ID chosen is not in zoom level one."
		
- else
	returns an error message: "Choose a tile ID to find tiles."

description:
	findTiles() has two queries.
	
1) If the given tile ID is not null then the first query will be executed. The first query uses the mapviews collection to find mapview tiles that 
	   have an ID that matches the given tile ID. The query then uses project to turn on the scale field only and then converts the document into an array.
	   A for loop is used to parse through the tile scale array and extract the scale integer. The tile scale integer is stored in var tileScale_Int.
	
2) tileScale_Int is used to verify that the given tile ID is indeed in zoom level one. If it is, then the second query will be executed. The second 
	   query uses the mapviews collection to find mapview tiles that are contained_by the given tile ID. Then the query projects the document into the correct
	   format and converts it into an array. The tiles in the array are level two tiles. The length of this array is returned to the function.
	
	
## getPNG()
parameters:
- A tile ID in integer format
- An optional boolean flag to run the function in stub mode for testing purposes.

return value:
- if( tileID != null )
	returns the length of a PNG base64 array.
	
- else
	returns an error message "Choose a tile ID to find tiles."

description:
	getPNG() uses the mapviews collections to find mapview tiles that have an ID that matches the given tile ID. The query then uses project to only document
	the filename. This mapview tile filename is then stored in an array. Like before, a for loop is used to parse through the array to extract the mapview
	filename value. The filename is stored inside the var filenameString. 
	The file PATH is then found using var PATH = path.resolve('data','denmark_tiles',filenameString). 
	A function is created to return file binary and encode it into easily storable base64. var bitmap = fs.readFileSync(file) reads the file. var base64 creates
	a new buffer from bitmap and converts it into a base64 string. Then the base64 string is converted into an array and the length is returned to the function.
	Finally the PNG encoder function is returned to the async function.
