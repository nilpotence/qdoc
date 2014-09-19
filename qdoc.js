var watch = require('node-watch');
var path = require('path');
var fs = require('fs.extra');
var os = require('os');
var dot = require('dot');
var WebSocketServer = require('ws').Server;

var mapping = new Array();
var templateDir = '';
var templateFunc;
var targetDir;
var reloadSockets = new Array();

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

function loadTemplates(){
	var currentFolder = process.cwd();
	
	var parents = currentFolder.split(path.sep);
	
	for(var i=0; i< parents.length; i++){
		templateDir = path.join(currentFolder, 'qdoc_templates');
		if(fs.existsSync(templateDir)){
			
			var templateContent = fs.readFileSync(path.join(templateDir,'index.html'), 'utf8');
			templateFunc = dot.template(templateContent);
			
			break ;
		}else{
			currentFolder = path.join(currentFolder, '..');
		}
	}
}


function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}


function processSourceFilename(targetDir,filename) {
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
}

function buildTargetDirectory(dirname){
	fs.exists(dirname, function(exists){
		if(!exists){
			fs.mkdir(dirname,function(err){
				if(err) console.log("can't create "+dirname+" !");
			});
		}
	});
}

function buildTargetFile(file){
	
	console.log("Building "+file.target.name+" from "+file.src.name+"...");
	
	var map = mapping[file.src.ext];
	if(map){
		map.conv(file, function(err, data){
			if(err) console.log("Can't convert "+file.src.name +" !");
			else{
				data = applyTemplates(file, data);
				writeTarget(file, data);
			}
				
		});
	}else{
		fs.copy(file.src.name, file.target.name, function(err){
			if(err) console.log("can't copy "+file.src.name+" to "+file.target.name+ " !");
		});
	}
}

function buildAutoReload(targetDir){
	fs.copy(path.join(__dirname, 'autoreload.js'), path.join(targetDir, 'autoreload.js'), function(err){
		if(err) console.log("Can't copy autoreload.js to target !");
	});
}


function buildTargetTemplate(targetDir){
	if(templateDir == '') return ;
	fs.copyRecursive(path.join(templateDir,'_res'), path.join(targetDir,'_res'), function(err){
		if(err) console.log("Can't copy template to target !");
	});
}

function applyTemplates(file, data){
	if(templateDir == '')
		return data;
	if(file.target.ext != 'html')
		return data;
	
	data = templateFunc({content: data, path: targetDir});
		
	return data;
}


function writeTarget(file,data){
	fs.writeFile(file.target.name, data, function(err){
		if(err) console.log("Can't write "+file.target.name +" !");
	});
}


function onChange(targetDir, filename){
	var file = processSourceFilename(targetDir, filename);
	
	fs.lstat(file.src.name, function(err, stats){
		
		if(err) return ;
		
		if(stats.isFile()){
			buildTargetFile(file);
		}else if(stats.isDirectory()){
			buildTargetDirectory(file.src.name);
		}
		
		reloadClients();
	});
}


function make(targetDir){
	var walker = fs.walk('src');
	
	walker.on('directory', function(root, stat, next){
		var dirname = root+path.sep+stat.name;
		var file = processSourceFilename(targetDir, dirname);
		buildTargetDirectory(file.target.name);
		next();
	});
	
	walker.on('file', function(root, stat, next){
		var filename = root+path.sep+stat.name;
		var file = processSourceFilename(targetDir, filename);
		buildTargetFile(file);
		next();
	});
	
	buildTargetTemplate(targetDir);
	buildAutoReload(targetDir);
}


function watchSource(targetDir){
	watch('src', function(filename){
		onChange(targetDir, filename);
	});
}

function reloadClients(){
	for(var i=0;i<reloadSockets.length; i++){
		reloadSockets[i].send('reload');
	}
}

function startWebSocketReloadServer(){
	var ws = new WebSocketServer({port:8765});
	ws.on('connection', function(socket){
		console.log('autoreload client connected !');
		reloadSockets.push(socket);
		socket.on('close',function(){
			var index = reloadSockets.indexOf(socket);
			if(index > -1){
				reloadSockets.splice(index,1);
			}
		});
	});
}


loadConverters();
loadTemplates();

startWebSocketReloadServer();

if(process.argv[2]){
	targetDir = process.argv[2];
}else{
	targetDir = os.tmpdir()+path.sep+'qdoc-target-'+randomInt(0, 99999999);
}

fs.rmrfSync(targetDir);

fs.mkdir(targetDir);
console.log(targetDir);

make(targetDir);
watchSource(targetDir);

console.log('qdoc started !');