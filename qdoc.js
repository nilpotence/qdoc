var path = require('path');
var os = require('os');

var Builder = require('./builder');
var Watcher = require('./watcher');
var Template = require('./template');
var Common = require('./common');
var Reloader = require('./reloader');



var targetDir;
if(process.argv[2]){
	targetDir = process.argv[2];
}else{
	targetDir = os.tmpdir()+path.sep+'qdoc-target-'+Common.randomInt(0, 99999999);
}

var builder = new Builder(targetDir);
var Reloader = new Reloader();


var watcher = new Watcher("src");

watcher.on('fileChanged', function(filename){
	var file = builder.processSourceFilename(targetDir, filename);
	builder.buildTargetFile(file);
});

watcher.on('dirChanged', function(filename){
	var file = builder.processSourceFilename(targetDir, filename);
	builder.buildTargetDirectory(file, true);
});

watcher.on('fileDeleted', function(filename){
	var file = builder.processSourceFilename(targetDir, filename);
	builder.deleteTarget(file);
});


builder.make("src");
watcher.start();



console.log('qdoc started !');
