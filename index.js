var Path = require('path');
var FS = require('fs');
var startServer = require('rbs/lib/server').startServer;
var RBS = require('rbs/lib/rbs').RBS;
var rbs = new RBS();
var setupJSRequire = require('jsi').setupJSRequire;
var setupCS = require('./lib/compiler').setupCS;
setupJSRequire(rbs,'/static/');
setupCS(rbs,/\.css$/i,/\.html?$/i);
var exampleMap = {}
var config = JSON.parse(FS.readFileSync(require.resolve('cs/package.json')));

console.log('welcome to test cs: '+config.version);

['index.html','index.css','default.css',
	'static/cs.js',
	'static/gitbug.js',
	'static/cs.htc','example/test.css','example/test.html'].forEach(function(path){
	var file = require.resolve('cs/'+path);
	var expect = FS.readFileSync(file);
	exampleMap[path]=expect;
});
if(require.resolve('cs/lib/runtime/cs-exported.js') != Path.resolve('./lib/runtime/cs-exported.js')){
	exampleMap['static/cs.js']=FS.readFileSync(require.resolve('cs/lib/runtime/cs-exported.js'));
}
var testServer = startServer(rbs);
require('./lib/server/export').init(testServer,exports);
testServer.post(/\/css-temp/,require('./lib/server/css-temp.js').createCSSTemp(rbs,'/static/css-temp.css'))
testServer.complete = function(){
	var root = testServer.root;
	var webURL = 'http://127.0.0.1:'+testServer.port+'/';
	console.log('rbs test server is started success!!\nfile :\t'+root+
			'\nurl :\t'+webURL );
	require('./lib/server/example').init(testServer,exampleMap);
}

//var s = rbs.getContentAsBinary("/-webkit-index.css").toString();//console.log(s);
//var s = require('http').get("http://localhost:2012/rbs/test.php",function(res){
//	console.log("Got response: " + res.statusCode);
//	//res.on('data',function(data){console.log('data:',data+'')})
//});


