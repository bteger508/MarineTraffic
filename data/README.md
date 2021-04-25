# Installation

1. Check to see if data folder is as follows:

  ### Data subfolder:

|  Size| File                            | Description                                                               | 
|-----:|---------------------------------|---------------------------------------------------------------------------| 
|  23M | aisdk_20201118_1000000.json.gz  | 1M messages, for read ops tests                                           |          
|   4K | mapviews.json.gz                | Tile metadata                                                             |
|   5K | ports.json.gz                   | Port descriptions (only within the geographical area covered by the tiles)|
|   8M | vessels.json.gz                 | Vessel descriptions                                                       |
|   1K | install.js                      | Script that unzips gz files and prepares it for download.                 |


2. Open cmd prompt or powershell.

3. Use 'cd' to parse to your downloaded work folder 'MarineTraffic-main'
   and then parse into the subfolder 'data':

	~~~~~~~~~~~~~~{.bash}
	C:\Users\Name> cd .\MarineTraffic-main\data\
	~~~~~~~~~~~~~~~~~~~

3. Then, run 'install.js' in node.js to unzip the json.gz files:

	~~~~~~~~~~~~~~{.bash}
	node install.js
	~~~~~~~~~~~~~~~~~~~
	
4. Finally, use the following mongodb scripts to create a database.

	~~~~~~~~~~~~~~{.bash}
   mongoimport --drop -d AISTestData -c vessels --maintainInsertionOrder vessels.json
   mongoimport --drop -d AISTestData -c mapviews --maintainInsertionOrder mapviews.json
   mongoimport --drop -d AISTestData -c ports --maintainInsertionOrder ports.json
   mongoimport --drop -d AISTestData -c aisdk_20201118 --maintainInsertionOrder aisdk_20201118_sliced_1000000.json
   ~~~~~~~~~~~~~~~~~~~
   
5. Check to see if the database is correctly installed.

	~~~~~~~~~~~~~~{.bash}
	mongo AISTestData
	~~~~~~~~~~~~~~~~~~~

6. Then:

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
 
