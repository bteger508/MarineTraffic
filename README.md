# MarineTraffic
Final project for CS 418

To set up the project, add the MarineTraffic-main folder to your work directory. 

Then, unzip the MarineTraffic-main folder to reveal all of the subfolders. 


## Root Directiory 

|  Size| File                 |   Description                              | 
|-----:|----------------------|--------------------------------------------| 
|   1K | package.json         | Contains specific dependencies             |
|  80K | package-lock.json    | Contains all dependencies in the project   |
|   1K | README.md            | README file that contains instructions     |

## Data subfolder:

|  Size| File                            | Description                                                               | 
|-----:|---------------------------------|---------------------------------------------------------------------------| 
|  28M | aisdk_20201118_1000000.json     | 1M messages, for read ops tests                                           |          
|  47M | AISTestData.bson.gz             | Entire test database, in binary form                                      |
|  48K | mapviews.json                   | Tile metadata                                                             |
|  33K | ports.json                      | Port descriptions (only within the geographical area covered by the tiles)|
| 8.5M | vessels.json                    | Vessel descriptions                                                       |
|  36M | AISDispatcher.bson.gz           |                                                                           |


## Node_Modules subfolder:

Contains all modules and dependencies for project.


## Src subfolder:

|  Size| File   | Description                            | 
|-----:|--------|----------------------------------------| 
|   1K | dao.js | The data access object for the project |          


## Test subfolder:

|  Size| File    | Description                                                | 
|-----:|---------|----------------------------------------------------------- | 
|  1K  | test.js | Test scipt that checks the queries created in the 'dao.js' |


## Installation

Once all of the files are properly downloaded. Open the command prompt or powershell.

Use the 'cd' command to parse to your work folder. 
	Example: PS C:\User\Name\Documents> cd .\MarineTraffic-main\data\
	Hint: use 'cd ..\' to reverse your file parse.
	
Once inside the downloaded foler MarineTraffic-main, use the following script to install the database.

	mongorestore --drop --gzip --archive=AISTestData.bson.gz 
	
To check if installation is correct, use 'mongo AISTestData' to open mongodb.
	- Then use 'show collections' to list the database collections.
	- The database collections should be listed as follows.

> show collections
 ----------------
| aisdk_20201118 |
| mapviews       |
| ports          |
| vessels        |
 ---------------- 