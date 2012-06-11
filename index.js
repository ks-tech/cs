var Path = require('path');
var FS = require('fs');
var startServer = require('rbs/lib/server').startServer;
var RBS = require('rbs/lib/rbs').RBS;
var rbs = new RBS();
var setupJSRequire = require('jsi').setupJSRequire;
var setupCS = require('./lib/compiler/cs-filter').setupCS;
var addExample = require('rbs/lib/server-ext').addExample;
setupJSRequire(rbs,'/static/');
setupCS(rbs,/\.css$/i,/\.html?$/i);



['static/cs.js',
'static/cs.htc','example/test.css','example/test.html'].forEach(function(path){
	var file = require.resolve('cs/'+path);
	var expect = FS.readFileSync(file);
	addExample(path,expect);
});
if(require.resolve('cs/lib/runtime/cs-exported.js') != Path.resolve('./lib/runtime/cs-exported.js')){
	addExample('static/cs.js',FS.readFileSync(require.resolve('cs/lib/runtime/cs-exported.js')));
}
startServer(rbs);

exports.setHtcPath = function(path){
	console.log('htc path is reset as: ',path,'\nhtc mimeType is required as: text/x-component')
	rbs.config.cs.htcPath = path;
	addExample(path.replace(/^\//,''),FS.readFileSync(require.resolve('cs/static/cs.htc')));
	return exports;
}
exports.setScriptPath = function(path){
	console.log('script path is reset as: ',path)
	rbs.config.cs.scriptPath = path;
	if(!path.match(/^https?\:\/\//)){
		addExample(path.replace(/^\//,''),FS.readFileSync(require.resolve('cs/lib/runtime/cs-exported.js')));
	}
	return exports;
}