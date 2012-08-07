var fs = require('fs');
fs.readdir(__dirname,function(error,files){
	var i = files.length;
	while(i-->0){
		var file = files[i];
		if(/\.html$/.test(file) && files.indexOf(file.replace(/\.html$/,'.css'))<0){
			processFile(file)
		}
	}
})
function processFile(file){
	fs.readFile(__dirname+'/'+file,'utf-8',function(error,content){
		var style;
		var css = file.replace(/\.html$/,'.css');
		var content2 = content.replace(/<style>([\s\S]+?)<\/style>/,function(a,s){
			if(style){
				console.log('muti style print!!!',file)
			}
			style = s;
			return '<link rel="stylesheet" href="'+css+'"/>'
			
		})
		if(style){
			fs.writeFile(__dirname+'/'+file,content2);
			fs.writeFile(__dirname+'/'+css,style);
			console.log('write async:',file)
		}else{
			console.log('no style print!!!',file)
		}
	});
}
