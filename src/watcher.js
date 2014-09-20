var fs = require('fs.extra');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var watch = require('node-watch');

function Watcher(watchedDir){
	var that = this;
	
	function onChange(filename){
				
		fs.exists(filename, function(exists){
			
			if(exists){
				fs.lstat(filename, function(err, stats){
					
					if(err) return ;
					
					if(stats.isFile()){
						that.emit('fileChanged',filename);
					}else if(stats.isDirectory()){
						that.emit('dirChanged', filename);
					}
				});
			}else{
				that.emit('fileDeleted', filename);
			}
		});
	}

	this.start = function(){
		watch(watchedDir, function(filename){
			onChange(filename);
		});
	}
}

util.inherits(Watcher, EventEmitter);

module.exports = Watcher;