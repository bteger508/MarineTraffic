# test.js Contents

This script uses the Assert API provided by the chai framework to test our DAO. The script uses two basic types of tests: tests that verify the types of parameters used to call each function and tests that verify that the function behaves as expected with test data. 

For our purposes, a function that supports stub mode will run as normal but without actually making sending any queries to the database. 


## insert()
### insert() called with an array of JSON AIS documents
This test verifies that insert() can be called with an array of 500 JSON AIS documents. In this case, insert() is called in stub mode, which simply returns the array of documents passed as an argument without any modifications. The test asserts that the array returned by the function matches the original array passed as an argument. (In future updates, insert() will be modified to associate AIS documents with GUI tiles at insertion time. Stub mode will also be updated to test that AIS documents are properly associated with GUI tiles.)

### insert() called with a single JSON AIS document
This test verifies that insert() can be called with a single JSON AIS document passed into the function as an object. In this case, insert() is called in stub mode, which simply returns the object passed as an argument without any modifications. The test asserts that the object returned by the function matches the original object passed as an argument. (In future updates, insert() will be modified to associate AIS documents with GUI tiles at insertion time. Stub mode will also be updated to test that AIS documents are properly associated with GUI tiles.)

### insert() 500 sample AIS JSON docs into the mongo DB
This test verifies that insert() behaves as expected when an array of 500 JSON AIS documents is passed to the function as an argument. The test asserts that the number of documents successfully inserted equals 500. 

### insert() 1 AIS JSON docs into the mongo DB
This test verifies that insert() behaves as expected when a single JSON AIS document is passed to the function as an argument. The test asserts that the number of documents successfully inserted equals 1.

## read_postition()
### read_postition() is called with a 9 digit integer MMSI
This test verifies that read_position() is called with a 9-digit MMSI number. In this case, read_position() is called in stub mode, which simply returns the MMSI number passed as an argument without any modifications. The test asserts that the number returned by the function matches the original MMSI number passed as an argument. 

### read_postition() returns a position doc in the correct format
This test verifies that read_position() behaves as expected when an arbitrary MMSI number (265177000) is passed as an argument. The test asserts that object returned by read_position() matches the proper format: {"MMSI": ..., "lat": ..., "long": ..., "IMO": ...}
