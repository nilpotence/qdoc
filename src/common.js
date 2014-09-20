var path = require('path');

var common = {}


common.randomInt = function(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}


/*=============================*/

common.memwatch = function(){

	var memwatch = require('memwatch');
	
	memwatch.on('leak', function(info){
		console.log(util.inspect(info));
	});
	memwatch.on('stats', function(stats){
		console.log(util.inspect(stats));
	});
	
	
	var hd = null;
	
	function memdiff(){
	
		
		var heapused = process.memoryUsage().heapUsed / 1000000.0;
		var heaptotal = process.memoryUsage().heapTotal / 1000000.0;
		
		console.log();
		console.log();
		console.log();
		console.log("HEAP USED = " + heapused + ", HEAP TOTAL = "+ heaptotal);
		console.log();
		console.log();
		console.log();
		
		setTimeout(memdiff, 10000);
	}
	
	memdiff();
	
	/*=============================*/
};

module.exports = common;
