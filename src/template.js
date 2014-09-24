var path = require('path');
var fs = require('fs.extra');
var dot = require('dot');

function Template(){
	
	var that = this;	
	var templateDir = '';
	var templateFunc = function(data) {return data;}
	
	function loadTemplates(){
		var currentFolder = process.cwd();
		
		var parents = currentFolder.split(path.sep);
		
		for(var i=0; i< parents.length; i++){
			var tplDir = path.join(currentFolder, 'qdoc_templates');
			if(fs.existsSync(tplDir)){
				
				var templateContent = fs.readFileSync(path.join(tplDir,'index.html'), 'utf8');
				templateFunc = dot.template(templateContent);
				
				templateDir = tplDir;
				
				break ;
			}else{
				currentFolder = path.join(currentFolder, '..');
			}
		}
	}
	
	this.apply = function(file, data, targetDir){
		if(templateDir === '')
			return data;
		if(file.target.ext != 'html')
			return data;
		
		data = templateFunc({content: data, path: targetDir});
		
		return data;
	}
	
	this.getTemplateDir = function(){
		return templateDir;
	}
	
	/////INIT//////
	loadTemplates();	
}

module.exports = Template;