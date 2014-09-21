#! /usr/bin/env node

var path = require('path');
var os = require('os');
var util = require('util');
var open = require('open');

var Builder = require('./builder');
var Watcher = require('./watcher');
var Template = require('./template');
var Common = require('./common');
var Reloader = require('./reloader');
var Explorer = require('./editor/explorer');

process.title = 'qdoc';

var targetDir;
if(process.argv[2]){
	targetDir = process.argv[2];
}else{
	targetDir = os.tmpdir()+path.sep+'qdoc-target-'+Common.randomInt(0, 99999999);
}

var builder = new Builder(targetDir);
var reloader = new Reloader();

var watcher = new Watcher("src");

watcher.on('fileChanged', function(filename){
	var file = builder.processSourceFilename(targetDir, filename);
	builder.buildTargetFile(file, function(){
		reloader.reload();		
	});
});

watcher.on('dirChanged', function(filename){
	var file = builder.processSourceFilename(targetDir, filename);
	builder.buildTargetDirectory(file, true, function(){		
		reloader.reload();
	});
});

watcher.on('fileDeleted', function(filename){
	var file = builder.processSourceFilename(targetDir, filename);
	builder.deleteTarget(file);
	reloader.reload();
});


builder.make("src");

builder.copy(path.join(__dirname,"_autoreload.js"));

reloader.start();
watcher.start();

var explorer = new Explorer(targetDir);
explorer.start();

open(path.join(__dirname,'editor/client/viewer.html'));

console.log('qdoc started !');
