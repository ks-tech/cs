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
if(process.platform == 'win32'){
	var exec = require('child_process').exec;
	var libpath = require.resolve('cs/lib/runtime/index.js');
	var filepath = Path.resolve('./lib/runtime/index.js');
	//console.log(libpath != filepath,libpath,filepath)
	function openBlowser(){
		var intv = setInterval(function(){
			var ad = rbs.server.address()
			if(ad){
				clearInterval(intv);
				exec('explorer http://127.0.0.1:'+ad.port,function (error, stdout, stderr) {}); 
			}
		},300)
	}
	if(libpath != filepath){//if start from cs project ignore browser;
		openBlowser()
	}else{
		setTimeout(function(){
			var readline = require('readline');
			var rl = readline.createInterface(process.stdin, process.stdout);
			rl.prompt();
			rl.question('open your browser? (yes|no)', function(v) {
				//console.log('answer',v)
				if(/yes/i.test(v)){
					console.log('try to open your blowser...')
					openBlowser();
				}
				rl.setPrompt('js>');
				rl.prompt();
			});
			rl.on('line', function(line) {
				switch(line.trim()) {
				case 'help':
					console.log('exit!');
					break;
				default:
					try{
						var v = eval(line);
						if(/^[\._\w]+$/.test(line)){
							v = require('util').inspect(v,true);
						}
						console.log(v);
					}catch(e){
						console.log(e);
					}
				}
				rl.setPrompt('js>');
				rl.prompt();
			}).on('close', function() {
				process.exit(0);
			});
			//rl.close();
		},500);
	}
}
