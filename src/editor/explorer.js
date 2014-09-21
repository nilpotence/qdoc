var WebSocketServer = require('ws').Server;
var util = require('util');
var fs = require('fs.extra');
var path = require('path');

function Explorer(root){
		
	var socketHandlers = new Array();
	
	function parseCommand(cmd, socketHandler){
		if(cmd.action === 'go'){
			socketHandler.dir = cmd.dir;
			sendFiles(socketHandler);
		}else if(cmd.action === 'update'){
			sendFiles(socketHandler);
		}
	}
	
	
	function getFiles(dir, callback){
		fs.readdir(dir, function(err, files){
			if(err) console.log("Can't list files in "+dir+"!");
			else{
				filesDesc = new Array();
				for(var i=0; i<files.length;i++){
					var desc = {name: files[i]};
					var stat = fs.statSync(path.join(dir,desc.name));
					if(stat.isDirectory()){
						desc.type = 'dir';
					}else{
						desc.type = 'file';
					}
					filesDesc.push(desc);
				}
			
				
				callback(filesDesc);
			}
		});
	}
	
	
	////////////SOCKET///////////////////////////:
	function sendFiles(socketHandler){
		
		getFiles(socketHandler.dir, function(files){
			if(files){
				socketHandler.socket.send(JSON.stringify({files: files, currentDir: path.resolve(socketHandler.dir)}));
			}	
		});
	}
	
	function onMessage(message, socketHandler){
		try{
			var cmd = JSON.parse(message);
			parseCommand(cmd, socketHandler);
		}catch(e){
			console.log("Can't parse "+message);
			return ;
		}
	}
	
	function addClient(socket){
		socketHandler = {socket: socket, dir: root}; 
		socketHandlers.push(socketHandler);
		
		socket.on('message', function(message){
			onMessage(message, socketHandler);
		});
		
		sendFiles(socketHandler);
	}
	/////////////////////////////////////////////
	
	
	
	
	//////////////////////////////////////
	this.start = function(){
		
		console.log('Starting explorer ws server...');
		
		var ws = new WebSocketServer({port:9876});
		ws.on('connection', function(socket){
			addClient(socket);
		});
	}
	
	
}



module.exports = Explorer;

