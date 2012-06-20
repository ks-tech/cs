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
		if(path.indexOf('/static/')!=0){
			var content = rbs.getContentAsBinary('/static/cs/lib/runtime/cs-exported.js').toString()
		}else{
			content = FS.readFileSync(require.resolve('cs/lib/runtime/cs-exported.js'));
		}
		addExample(path.replace(/^\//,''),content);
	}
	return exports;
}

var querystring = require('querystring');  
var http = require('http');  

  
exports.exportTo = function(output,options){
	var postData = genPostData(options)
	var options = {
		host: '127.0.0.1',
		port: 2012,
		"user-agent":'nodejs',
		'path':'/--export.zip',
 		method: 'POST',
		headers: {  
			'Content-Type': 'application/x-www-form-urlencoded',  
			'Content-Length': postData.length  
		}  
	};

	var post = http.request(options,function(res){
		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		console.log('write to:',output)
		var out = FS.createWriteStream(output);
		res.pipe(out);
		res.on('end',function(){
			console.log('close output:',output)
			//out.close()
		})
	});
	post.on('error', function(e) {
		console.dir(e)
		console.log("error: "+e.message,'\n',postData,postData.length );
	});
//	post.on('data', function (chunk) {
//		console.log('BODY: ' + chunk);
//	});
	post.write(postData);
	post.end();
}
function genPostData(options){
	if(options && options.branch){
		var postData = {  
		}; 
		if(options.branch.css){
			postData.cssBranch = true;
		}
		if(options.branch.js){
			postData.jsBranch = true;
		}
		if(options.branch.jsi){
			postData.jsiClosure = true;
		}
		return querystring.stringify(postData)
	}else{
		return "cssBranch=true"
	}
}
//var s = rbs.getContentAsBinary("/test/-ie6-test.css").toString();console.log(s);