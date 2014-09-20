var fs = require('fs.extra');
var path = require('path');

var Template = require('./template');

function Builder(targetDir){
	
	var that = this;
	
	var mapping = new Array();
	this.targetDir = targetDir;
	var template = new Template();
		
	
	function loadConverters(){
		var walker = fs.walk(__dirname+path.sep+'converters');
		
		walker.on('file', function(root, stat, next){
			var Converter = require(root+path.sep+stat.name);
			var converter = new Converter();
			
			if(converter.srcExt && converter.targetExt && converter.conv){
				mapping[converter.srcExt] = {ext: converter.targetExt, conv: converter.conv};
			}
			
			next();
		});
	}
	
	function writeTarget(file,data){
		fs.writeFile(file.target.name, data, function(err){
			if(err) console.log("Can't write "+file.target.name +" !");
		});
	}
	
	this.processSourceFilename = function(targetDir,filename) {
		var file = {src:{}, target:{}};
		
		file.src.name = filename;
		
		filename = filename.substr(4); //remove 'src'
		
	    var str = path.extname(filename||'').split('.'); //split extension
	    file.src.ext = str[str.length - 1]||''; //extract extension
	   
	    if(file.src.ext != '')
	    	file.base = filename.substr(0, filename.length - file.src.ext.length - 1); //remove extension frome original file
	    else
	    	file.base = filename;

	    var map = mapping[file.src.ext];
	    
	    if(map){
	    	file.target.ext = map.ext;
	    	file.target.name = targetDir+path.sep+file.base+'.'+file.target.ext;    	
	    }else{
	    	file.target.ext = file.src.ext;
	    	if(file.src.ext != '')
	    		file.target.name = targetDir+path.sep+file.base+'.'+file.src.ext;
	    	else
	    		file.target.name = targetDir+path.sep+file.base;
	    }
	    
	    return file;    
	};

	
	this.copy = function(filename){
		fs.copyRecursive(filename, targetDir, function(err){
			if(err) console.log("Can't copy "+filename+" to "+targetDir+" !");
		});
	};
	
	
	this.buildTargetFile = function(file){
		
		console.log("Building "+file.target.name+" from "+file.src.name+"...");
		
		var map = mapping[file.src.ext];
		if(map){
			map.conv(file, function(err, data){
				if(err) console.log("Can't convert "+file.src.name +" !");
				else{
					data = template.apply(file, data, that.targetDir);
					writeTarget(file, data);
				}
					
			});
		}else{
			fs.copy(file.src.name, file.target.name, function(err){
				if(err) console.log("can't copy "+file.src.name+" to "+file.target.name+ " !");
			});
		}
	}
	
	this.buildTargetDirectory = function(file, recursive){
		
		console.log("Building "+file.target.name+" directory...");
		
		fs.exists(file.target.name, function(exists){
			if(!exists){
				fs.mkdir(file.target.name,function(err){
					if(err) console.log("can't create "+file.target.name+" !");
				
					if(recursive){
						that.make(file.src.name);
					}
				});
			}else{
				console.log("wtf");
			}
		});
	};
	
	this.deleteTarget = function(file){
		console.log("Deleting "+file.target.name+"...");
		fs.rmrfSync(file.target.name);
	}
	
	this.make = function(srcDir){
		var walker = fs.walk(srcDir);
		
		walker.on('directory', function(root, stat, next){
			var dirname = root+path.sep+stat.name;
			var file = that.processSourceFilename(that.targetDir, dirname);		
			that.buildTargetDirectory(file);
			next();
		});
		
		walker.on('file', function(root, stat, next){
			var filename = root+path.sep+stat.name;
			var file = that.processSourceFilename(that.targetDir, filename);
			that.buildTargetFile(file);
			next();
		});
	}
	
	
	///////INIT//////////
	
	loadConverters();
	
	fs.rmrfSync(targetDir);
	fs.mkdir(targetDir);
	console.log("Target directory : "+targetDir);
	
	
}


module.exports = Builder;
