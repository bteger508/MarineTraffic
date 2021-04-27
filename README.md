# MarineTraffic
Final project for CS 418

To set up the project, add the MarineTraffic-main folder to your work directory. 

Then, unzip the MarineTraffic-main folder to reveal all of the subfolders and files. 


## Root Directiory 

|  Size| File                 |   Description                              | 
|-----:|----------------------|--------------------------------------------| 
|   1K | package.json         | Contains specific dependencies             |
|  80K | package-lock.json    | Contains all dependencies in the project   |
|   3K | README.md            | README file that contains instructions     |

## Data subfolder:

|  Size| File                            | Description                                                               | 
|-----:|---------------------------------|---------------------------------------------------------------------------| 
|  23M | aisdk_20201118_1000000.json.gz  | 1M messages, for read ops tests                                           |          
|   4K | mapviews.json.gz                | Tile metadata                                                             |
|   5K | ports.json.gz                   | Port descriptions (only within the geographical area covered by the tiles)|
|   8M | vessels.json.gz                 | Vessel descriptions                                                       |
|   1K | install.js                      | Script that unzips gz files and prepares it for download.                 |

## Node_Modules subfolder:

Contains all modules and dependencies for the project and Node.js.


## Src subfolder:

|  Size| File   | Description                            | 
|-----:|--------|----------------------------------------| 
|   1K | dao.js | The data access object for the project |          


## Test subfolder:

|  Size| File    | Description                                                | 
|-----:|---------|----------------------------------------------------------- | 
|  1K  | test.js | Test scipt that checks the queries created in the 'dao.js' |


## Installation

1. Unzip the node_modules folder to reveal all of the project dependencies.

2. Open cmd prompt or powershell.

3. Use 'cd' to parse to your downloaded work folder 'MarineTraffic-main'
   and then parse into the subfolder 'data':

	~~~~~~~~~~~~~~{.bash}
	cd .\MarineTraffic-main\data\
	~~~~~~~~~~~~~~~~~~~

4. Use node's package manager to install gunzip-file dependancy:
        
        ~~~~~~~~~~~~~~{.bash}
        npm install gunzip-file
        ~~~~~~~~~~~~~~~~~~~~~

5. Then, run 'install.js' in node.js to unzip the json.gz files:

	~~~~~~~~~~~~~~{.bash}
	node install.js
	~~~~~~~~~~~~~~~~~~~
	
6. Finally, use the following mongodb scripts to create a database.

	~~~~~~~~~~~~~~{.bash}
     mongoimport --drop -d AISTestData -c vessels --maintainInsertionOrder vessels.json
     mongoimport --drop -d AISTestData -c mapviews --maintainInsertionOrder mapviews.json
     mongoimport --drop -d AISTestData -c ports --maintainInsertionOrder ports.json
     mongoimport --drop -d AISTestData -c aisdk_20201118 --maintainInsertionOrder aisdk_20201118_sliced_1000000.json
     ~~~~~~~~~~~~~~~~~~~
   
7. Check to see if the database is correctly installed.

     mongo AISTestData
	
8. Then:

	~~~~~~~~~~~~~~{.mongodb}
	use AISTestData
	show collections
	~~~~~~~~~~~~~~~~~~~

| mongodb commands          |
|--------------------------:|
|>use AISTestData           |
|switched to db AISTestData |
|>show collections          |

|show collections|
|---------------:|
| aisdk_20201118 |
| mapviews       |
| ports          | 
| vessels        |
 
