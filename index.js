var Path = require('path');
var FS = require('fs');
var startRbsServer = require('rbs/lib/server').startRbsServer;
var rbs = startRbsServer();
var setupJSRequire = require('jsi').setupJSRequire;
var setupCS = require('./lib/compiler/cs-filter').setupCS;
setupJSRequire(rbs,'/static/');
setupCS(rbs,'/');

function checkExample(){
	var statusMap = {};
	for(var i = 0;i<arguments.length;i++){
		var path = arguments[i];
		var file = require.resolve('cs/'+path);
		var expect = FS.readFileSync(file);
		try{
			var source = FS.readFileSync(Path.resolve(path));
			if(source+'' != expect+''){
				//console.log(path,(source+'').substr(0,100) , ''+(expect+'').substr(0,100))
				statusMap[path] = [expect,1];
			}
		}catch(e){
			if(e.code == 'ENOENT'){
				statusMap[path] = [expect,0];
			}else{
				throw e;
			}
		}
	}
	return statusMap;
}

function writeExample(path,content){
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
	console.log('copy file:',path)
	FS.writeFile(path, content);
}
var exec = require('child_process').exec;
var libpath = require.resolve('cs/lib/runtime/index.js');
var filepath = Path.resolve('./lib/runtime/index.js');
//console.log(libpath != filepath,libpath,filepath)
function openBlowser(){
	if(process.platform == 'win32'){
		var intv = setInterval(function(){
			var ad = rbs.server.address()
			if(ad){
				clearInterval(intv);
				exec('explorer http://127.0.0.1:'+ad.port,function (error, stdout, stderr) {}); 
			}
		},300)
	}
}

	

setTimeout(function(){
	var readline = require('readline');
	var rl = readline.createInterface(process.stdin, process.stdout);

	var exampleStatus = checkExample('static/cs.js','example/test.css','example/test.html');
	function addQuestion(n){
		var status_ = exampleStatus[n];
		var message = status_[1]?' is changed. replace?':' is not exist. copy?';
		delete exampleStatus[n];
		rl.question('file '+n+message+' (yes|no)', function(v) {
			//console.log('answer',v)
			if(/yes/i.test(v)){
				writeExample(n,status_[0]);
			}
			for(var n in exampleStatus){
				addQuestion(n);
				return;
			}
			startNext()
		});
		
	}
	var flag = false;
	for(var n in exampleStatus){
		addQuestion(n);
		flag = true;
		break;
	}
	if(!flag){
		startNext();
	}
	function startNext(){
		if(libpath != filepath){//if start from cs project ignore browser;
			openBlowser()
			startJSConsole()
		}else{
			rl.question('open your browser? (yes|no)', function(v) {
				//console.log('answer',v)
				if(/yes/i.test(v)){
					console.log('try to open your blowser...')
					openBlowser();
				}
				startJSConsole()
			});
		}
	}
	function startJSConsole(){
		rl.setPrompt('js>');
		rl.prompt();
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
	}
	//rl.close();
},500);
