var WebSocketServer = require('ws').Server;

function Reloader(){
	var reloadSockets= new Array();
	
	
	this.reload = function(){
		for(var i=0;i<reloadSockets.length; i++){
			reloadSockets[i].send('reload');
		}
	}

	this.start = function(){
		
		return ;
		var ws = new WebSocketServer({port:9876});
		ws.on('connection', function(socket){
			reloadSockets.push(socket);
			socket.on('close',function(){
				var index = reloadSockets.indexOf(socket);
				if(index > -1){
					reloadSockets.splice(index,1);
				}
			});
		});
	}
}


module.exports = Reloader;