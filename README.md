# MarineTraffic
Final project for CS 418
By: Austin Hespe && Ben Eger

To set up the project, add the MarineTraffic-main folder to your work directory. 

Then, unzip the MarineTraffic-main folder to reveal all of the subfolders and files. 


## Root Directiory 

|  Size| File                 |   Description                              | 
|-----:|----------------------|--------------------------------------------| 
|   1K | package.json         | Contains specific dependencies             |
|  81K | package-lock.json    | Contains all dependencies in the project   |
|   4K | README.md            | README file that contains instructions     |

## Data subfolder:
	Includes denmark_tiles subfolder.
|  Size| File                            | Description                                                               | 
|-----:|---------------------------------|---------------------------------------------------------------------------| 
|  23M | aisdk_20201118_1000000.json.gz  | 1M messages, for read ops tests                                           |          
|   4K | mapviews.json.gz                | Tile metadata                                                             |
|   5K | ports.json.gz                   | Port descriptions (only within the geographical area covered by the tiles)|
|  14K | sample_input.json.gz            | Contains sample ais_message data.             							 |
|   8M | vessels.json.gz                 | Vessel descriptions                                                       |
|   1K | install.js                      | Script that unzips gz files and prepares it for download.                 |
|   3K | README.md						 | README file that contains repeated instructions data installation.		 |

## Node_Modules subfolder:

Contains all modules and dependencies for the project and a README.md file.


## Src subfolder:

|  Size| File        | Description                               | 
|-----:|-------------|-------------------------------------------| 
|  16K | dao.js      | The data access object for the project    | 
|   2K | README.md   | Contains descriptions of the DAO queries. |
|   1K | tile_map.js | Contains a script file to get mapviews.   |  


## Test subfolder:

|  Size| File      | Description                                                | 
|-----:|-----------|----------------------------------------------------------- | 
|   3K  | README.md | Contains descriptions of the tests used with the DAO.    |
|  16K  | test.js   | Test scipt that checks the queries created in the 'dao.js' |


## Installation

1. Unzip the node_modules folder to reveal all of the project dependencies.

2. Open cmd prompt or powershell.

3. Use 'cd' to parse to your downloaded work folder 'MarineTraffic-main'
   and then parse into the subfolder 'data':

	~~~~~~~~~~~~~~{.bash}
	cd .\MarineTraffic-main\data\
	~~~~~~~~~~~~~~~~~~~

4. Then, run 'install.js' in node.js to unzip the json.gz files:

	~~~~~~~~~~~~~~{.bash}
	node install.js
	~~~~~~~~~~~~~~~~~~~
	
5. Check the data folder to see if the json files unzipped correctly. 

| File 								 |
|-----------------------------------:|
| aisdk_20201118_sliced_1000000.json |
| mapviews.json  					 |
| ports.json					     | 
| sample_input.json					 |
| vessels.json 						 |

6. Then, you may either delete the old .json.gz files or keep them as a back up.
	
7. Finally, use the following mongodb scripts to create a database.

	~~~~~~~~~~~~~~{.bash}
     mongoimport --drop -d AISTestData -c vessels --maintainInsertionOrder vessels.json
     mongoimport --drop -d AISTestData -c mapviews --maintainInsertionOrder mapviews.json
     mongoimport --drop -d AISTestData -c ports --maintainInsertionOrder ports.json
     mongoimport --drop -d AISTestData -c aisdk_20201118 --maintainInsertionOrder aisdk_20201118_sliced_1000000.json
     ~~~~~~~~~~~~~~~~~~~
   
8. Check to see if the database is correctly installed.
	
	~~~~~~~~~~~~~~{.bash}
     mongo AISTestData
	 ~~~~~~~~~~~~~~~~~~~
	
9. Then:

	~~~~~~~~~~~~~~{.mongodb}
	show collections
	~~~~~~~~~~~~~~~~~~~

|show collections|
|---------------:|
| aisdk_20201118 |
| mapviews       |
| ports          | 
| vessels        |
 
