# test.js Contents

This script uses the Assert API provided by the chai framework to test our DAO. The script uses two basic types of tests: tests that verify the types of parameters used to call each function and tests that verify that the function behaves as expected with test data. 

For our purposes, a function that supports stub mode will run as normal but without actually making sending any queries to the database. 


### insert() Ben update - 5 tests

#### insert() called with an array of JSON AIS documents
This test verifies that insert() can be called with an array of 500 JSON AIS documents. In this case, insert() is called in stub mode, which simply returns the array of documents passed as an argument without any modifications. The test asserts that the array returned by the function matches the original array passed as an argument. (In future updates, insert() will be modified to associate AIS documents with GUI tiles at insertion time. Stub mode will also be updated to test that AIS documents are properly associated with GUI tiles.)

#### insert() called with a single JSON AIS document
This test verifies that insert() can be called with a single JSON AIS document passed into the function as an object. In this case, insert() is called in stub mode, which simply returns the object passed as an argument without any modifications. The test asserts that the object returned by the function matches the original object passed as an argument. (In future updates, insert() will be modified to associate AIS documents with GUI tiles at insertion time. Stub mode will also be updated to test that AIS documents are properly associated with GUI tiles.)

#### insert() 500 sample AIS JSON docs into the mongo DB
This test verifies that insert() behaves as expected when an array of 500 JSON AIS documents is passed to the function as an argument. The test asserts that the number of documents successfully inserted equals 500. 

#### insert() 1 AIS JSON docs into the mongo DB
This test verifies that insert() behaves as expected when a single JSON AIS document is passed to the function as an argument. The test asserts that the number of documents successfully inserted equals 1.


### get_tile() Ben update - 4 tests


### isOutOfBounds() Ben update - 3 tests 


### read_postition()

#### read_postition() is called with a 9 digit integer MMSI
This test verifies that read_position() is called with a 9-digit MMSI number. In this case, read_position() is called in stub mode, which simply returns the MMSI number passed as an argument without any modifications. The test asserts that the number returned by the function matches the original MMSI number passed as an argument. 

#### read_postition() returns a position doc in the correct format
This test verifies that read_position() behaves as expected when an arbitrary MMSI number (265177000) is passed as an argument. The test asserts that object returned by read_position() matches the proper format: {"MMSI": ..., "lat": ..., "long": ..., "IMO": ...}


### delete_messages()

#### delete_messages() returns the number of AIS messages deleted
Asserts that 501 items will be deleted from the ais_messages collection after the two previous insertions.


### permanent_data()

#### permanent_data() is called with a 9 digit integer MMSI
Asserts that permanent_data() is called with a 9-digit MMSI number when stub mode is true.

#### permanent_data() returns a vessel doc in the correct format
This test verifies that a MMSI will be returned in a vessel static data document object when given a proper MMSI integer (210169000).


### transient_data()

#### transient_data() is called with a 9 digit integer MMSI
Asserts that transient_data() is called with a 9-digit MMSI number when stub mode is true.

#### transient_data() returns a vessel document in the correct format
This test verifies that a MMSI will be returned in a vessel position report document object when given a proper MMSI integer(210169000).


### read_ShipPositions()

#### read_ShipPositions() is called with a JSON string timestamp
This test asserts that read_ShipPositions() is called with a JSON string timestamp in the correct format "2020-11-18T00:00:00Z".

#### read_ShipPositions() returns the length of an array of ship position documents
In this test, it will assert that the correct number of ship position documents are returned with the given JSON timestamp "2020-11-18T00:00:00Z".


### read_PortName()

#### read_PortName() is called with a string port name
Given a string port name, to mimic a user specified port name, the test will check if the port name parameter was passed in the correct string format.

#### read_PortName() returns the length of an array of port documents in the correct format
This test asserts that read_PortName() will return a port document array if the given port name matches any port_locations in the ports collection.


### read_LastFivePositions()

#### read_LastFivePositions() is called with a 9 digit integer MMSI
Given a integer MMSI, to mimic a user specified MMSI, the test will check if the MMSI parameter was passed in the correct integer format.

#### read_LastFivePositions() returns the length of an array containing the last five vessel position documents in the correct format
This test assets that read_LastFivePositions() will return the length of a vessel document array that contains the last five documents.


### read_PositionWithPortID()

#### read_PositionWithPortID() is called with a string port ID
Given a port ID, to mimic a user specified port ID, the test will check if the port ID parameter was passed in the correct string format.

#### read_PositionWithPortID() returns an array of five vessel position documents headed to port
This test asserts that read_PositionWithPortID() will return an array of five vessel position documents that are headed to a given port ID.


### read_PositionWithPortName() 

#### read_PositionWithPortName() returns an array with the last five vessel positions using a port name only
This test asserts that an array of five vessel position documents in the correct format will be returned if given a string port name.

#### read_PositionWithPortName() returns an array of all port documents 
For this test, it asserts that an array of port documents will be returned in the correct format if given a string country name.

#### read_PositionWithPortName() returns an array with the last five vessel position using both a port name and country
This test asserts that an array of five vessel position documents in the correct format will be returned if given both a string port name and country name.

#### read_PositionWithPortName() returns an error message if no port name or country was selected
Asserts an error message if neither a string port name or country name was given.


### findTiles()

#### findTiles() is called with an integer tile ID
In this test, findTiles() asserts that a given integer tile ID, to mimic a user specified tile ID, was passed in the correct integer format.

#### findTiles() returns the four tiles of zoom level two related to a given tile ID
This test asserts that an array of mapview tiles, that are related to the given tile ID, will return the needed four mapview tile documents.
 
#### findTiles() returns an error message if given tile ID is in the wrong zoom level
This test will assert an error message if the given tile ID is in the wrong zoom level. The mapview tile must be in zoom level two to extract the four zoom level three tiles.

#### findTiles() returns an error message if the tile ID is null
Asserts an error message if the given tile ID is null.


### getPNG()

#### getPNG() is called with an integer tile ID
In this test, getPNG() asserts that a given tile ID, to mimic a user specified tile ID, was passed in the correct integer format.

#### getPNG() returns binary data converted into a base64 array
This test asserts that binary data was correctly read from a PNG file with a given tile ID, and then the binary data was converted into a base64 array for easy storage.

#### getPNG() returns an error message if the given tile ID is null
Asserts an error message if the given tile ID is null.
