var marked = require('marked');
var fs = require('fs.extra');


var renderer = new marked.Renderer();

renderer.heading = function (text, level) {
	  var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

	  return '<h' + level + '><a name="' +
	                escapedText +
	                 '" class="anchor" href="#' +
	                 escapedText +
	                 '"><span class="header-link"></span></a>' +
	                  text + '</h' + level + '>';
	};

var marked = require('marked');
marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});


function Markdown(){
	
	this.srcExt = 'md';
	this.targetExt = 'html';
	
	this.conv = function(file, callback){
		
		fs.readFile(file.src.name, 'utf8', function(err, data){
			if(err){
				callback("can't read "+file.src.name+" !");
				
			}
			
			var html = marked(data);
			
			callback(undefined, html);
		});
	};
}


module.exports = Markdown;


