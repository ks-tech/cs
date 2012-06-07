var Path = require('path');
var FS = require('fs');
var startServer = require('rbs/lib/server').startServer;
var RBS = require('rbs/lib/rbs').RBS;
var rbs = new RBS();
var setupJSRequire = require('jsi').setupJSRequire;
var setupCS = require('./lib/compiler/cs-filter').setupCS;
var addExample = require('rbs/lib/server-ext').addExample;
setupJSRequire(rbs,'/static/');
setupCS(rbs,'/',true);

['static/cs.js','static/cs.htc','example/test.css','example/test.html'].forEach(function(path){
	var file = require.resolve('cs/'+path);
	var expect = FS.readFileSync(file);
	addExample(path,expect);
});

startServer(rbs);