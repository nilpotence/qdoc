window.WebSocket = window.WebSocket || window.MozWebSocket;

(function(){
	var socket = new WebSocket("ws://localhost:8765");
	
	socket.onmessage = function(message){
		if(message.data == 'reload'){
			window.location.reload();
		}
	};
})();
