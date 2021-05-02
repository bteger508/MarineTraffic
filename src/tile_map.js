const [SOUTH, NORTH, WEST, EAST]=[54.5,57.5,7.0,13.0];



/**
 *
 * Get the tile of scale 2 or 3 that contains the given position.
 *
 * @scale {Number} - zoom level (2 or 3) 
 * @long {Number} - longitude
 * @param {Number} - latitude
 * @return {object} - Object describing the tile boundaries.
 */
function get_tile(scale, long, lat){

	let s,n,w,e;
	if (scale===2){
		[s,n,w,e] = [ Math.floor(lat*2)/2, Math.ceil(lat*2)/2, Math.floor(long), Math.ceil(long)];
	} else if (scale===3) {
		[s,n,w,e] = [ Math.floor(lat*4)/4, Math.ceil(lat*4)/4, Math.floor(long*2)/2, Math.ceil(long*2)/2 ];
	} else {
		[s,n,w,e] = [ max_south, max_north, max_west,max_east ];
	}
	
	 return { 'south': s, 'north': n, 'west': w, 'east': e };

}




exports.get_tile = get_tile

exports.SOUTH = SOUTH;
exports.NORTH = NORTH;
exports.WEST = WEST;
exports.EAST = EAST;



