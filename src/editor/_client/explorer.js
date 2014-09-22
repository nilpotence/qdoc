window.WebSocket = window.WebSocket || window.MozWebSocket;

if(!qdoc) var qdoc = {};

qdoc.explorer = function(open_cb){
	
	var socket;
	var files = {};
	var currentDir = '';
	
	function updateFiles(remoteFiles, curDir){
		files = remoteFiles;
		currentDir = curDir;
		
		remoteFiles.push({name: '..', type: 'dir'});
		
		remoteFiles.sort(function(f1,f2){
			if(f1.name === '..') return -1;
			if(f2.name === '..') return 1;
			if(f1.type === f2.type) return 0;
			if(f1.type === 'dir') return -1;
			return 1;
		});
		
		updateDisplay();
	}
	
	function onFileClicked(file){
		if(file.type === 'dir'){
			go(currentDir+'/'+file.name);
		}else{
			open(file.name);
		}
	}
	
	function open(file){
		var o = currentDir+'/'+file;
		openURL(o);
		if(open_cb) open_cb(o);
	}
	
	///////////////DISPLAY/////////////////
	var explorerDiv = $('#explorer');
	var explorerContentDiv = $('#explorer-content');
	var viewerFrame = $('#viewer iframe');
	var explorerURL = $('#explorer h2');
	
	
	var HOVER_THRESHOLD = 50;
	var hoverTimestamp = 0;
	explorerDiv.hover(function(evt){
		if( (new Date().getTime()) - hoverTimestamp > HOVER_THRESHOLD){
			explorerDiv.addClass('open');
			hoverTimestamp = new Date().getTime();
		}
	},
	function(zvt){
		if( (new Date().getTime()) - hoverTimestamp > HOVER_THRESHOLD){
			explorerDiv.removeClass('open');
			hoverTimestamp = new Date().getTime();
		}
	});
	
	function openURL(url){
		viewerFrame.attr('src', url);
	}
	
	function updateDisplay(){
		
		cleanDisplay();
		
		explorerURL.append(currentDir);
		
		for(var i=0; i<files.length; i++){
			
			if(files[i].name.charAt(0) === '_') continue ;
			
			if(files[i].type === 'dir'){
				addDir(files[i]);
			}else{
				addFile(files[i]);
			}
		}
	}
	
	function cleanDisplay(){
		explorerContentDiv.empty();
		explorerURL.empty();
	}
	
	function addDir(file){
		var dirDiv = $('<div class="item dir">'+file.name+'</div>');
		addItem(dirDiv, file);
	}
	
	function addFile(file){
		var fileDiv = $('<div class="item file">'+file.name+'</div>');
		addItem(fileDiv, file);
	}
	
	function addItem(item, file){
		
		item.click(function(event){
			onFileClicked(file);
		});
		
		explorerContentDiv.append(item);
	}
	///////////////////////////////////////
	
	///////////////SOCKET//////////////////
	function connect(){
		socket = new WebSocket("ws://"+window.location.hostname+":8765");
		
		socket.onmessage = function(message){
			console.log("message received : "+message.data)
			parseMessage(message);
		};
	}
	/////////////////IO////////////////////
	function parseMessage(message){
		try{
			var remoteFiles = JSON.parse(message.data);
			parseFiles(remoteFiles);
		}catch(e){
			console.log("Can't parse received message");
		}
	}
	function parseFiles(remoteFiles){
		updateFiles(remoteFiles.files, remoteFiles.currentDir);
	}
	function update(){
		socket.send(JSON.stringify({action: 'update'}));
	}
	function go(dir){
		socket.send(JSON.stringify({action: 'go', dir: dir}));
	}
	//////////////////////////////////////
	
	connect();
};

