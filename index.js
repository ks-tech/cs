var Path = require('path');
var FS = require('fs');
var startRbsServer = require('rbs/lib/server').startRbsServer;
var rbs = startRbsServer();
var setupJSRequire = require('jsi').setupJSRequire;
var setupCS = require('./lib/compiler/cs-filter').setupCS;
setupJSRequire(rbs,'/static/');
setupCS(rbs,'/');



writeExample('static/cs.js')
writeExample('example/test.css')
writeExample('example/test.html')

function writeExample(path){
	try{
		FS.readFileSync(Path.resolve(path));
	}catch(e){
		if(e.code == 'ENOENT'){
			//需要部署示例
			var dir = path.replace(/[^\/]+$/,'')
			try{
				FS.readFileSync(Path.resolve(dir));
			}catch(e){
				if(e.code == 'ENOENT'){
					//需要创建目录
					console.log('mkdir:',dir)	
					FS.mkdirSync(dir);
				}
			}
			var file = require.resolve('cs/'+path);
			var content = FS.readFileSync(file)
			console.log('copy file:',path)
			FS.writeFile(path, content);
		}
	}
}
