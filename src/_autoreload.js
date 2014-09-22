window.WebSocket = window.WebSocket || window.MozWebSocket;

(function(){
	var socket = new WebSocket("ws://"+window.location.hostname+":9876");
	
	socket.onmessage = function(message){
		if(message.data == 'reload'){
			window.location.reload();
		}
	};
})();
