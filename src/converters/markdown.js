var marked = require('marked');
var fs = require('fs.extra');

marked.setOptions({
	renderer: new marked.Renderer(),
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


