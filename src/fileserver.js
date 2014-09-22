var connect = require('connect');
var serveStatic = require('serve-static');

function FileServer(targetDir){
	
	var server = connect();
	
	this.start = function(){
		server.use(serveStatic(targetDir));
		server.listen(8080);
	}
	
	this.getHTTPServer = function(){
		return server;
	}
}


module.exports = FileServer;