var Path = require('path');
var FS = require('fs');
var webURL ;
exports.init =initExample;
function initExample(testServer,exampleMap){
	webURL = 'http://127.0.0.1:'+testServer.port+'/';
	//var exampleStatus = checkExample('static/cs.js','static/cs.htc','example/test.css','example/test.html');
	var missed =[];
	var changed = [];
	for(var path in exampleMap){
		try{
			var source = FS.readFileSync(Path.resolve(path));
			var expect = exampleMap[path]
			if(source+'' != expect+''){
				//console.log(path,(source+'').substr(0,100) , ''+(expect+'').substr(0,100))
				missed.push(path);//changed
			}
		}catch(e){
			if(e.code == 'ENOENT'){
				changed.push(path);//missed
			}
		}
	}
	if(missed.length){
		console.log('missed example files:\n',missed);
		testServer.console.question('add it? (yes|no)', function(v) {
			if(/yes/i.test(v)){
				writeExample(missed)
			}
		});
	}
	if(changed.length){
		console.log('changed example files:\n',changed);
		testServer.console.question('replace it ? (yes|no)', function(v) {
			if(/yes/i.test(v)){
				writeExample(changed)
			}
		});
	}
	var openURL = require('openurl')
	testServer.console.question('open default web browser for test ? (yes|no)', function(v) {
		if(/yes/i.test(v)){
			openURL.open(webURL)
		}
	});
	
	function writeExample(files){
		for(var i = 0;i<files.length;i++){
			var path = files[i];
			//需要部署示例
			var dir = path.replace(/[^\/]+$/,'');
			mkdirSync(Path.resolve(dir))
			console.log('copy file:',path)
			var content = exampleMap[path];
			FS.writeFile(path, content);
		}
	}
}


function mkdirSync(dir){
	try{
		FS.readFileSync(dir);
	}catch(e){
		if(e.code == 'ENOENT'){
			//需要创建目录
			console.log('mkdir:',dir)	
			mkdirSync(Path.dirname(dir))
			FS.mkdirSync(dir);
		}
	}
}
