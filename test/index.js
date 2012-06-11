process.chdir(__dirname)
var rbs = require('jsi/test').rbs
var setupCS = require('../lib/compiler/cs-filter').setupCS;
exports.setHtcPath = function(path){
	console.log('htc file is reset as: ',path,'\nhtc mimeType is required as: text/x-component')
	rbs.config.cs.htcPath = path;
}
setupCS(rbs,/\.css$/,/\.html?$/);
//var s = rbs.getContentAsBinary("/example/selector/-ie6-not.css").toString();
//var s = rbs.getContentAsBinary("/static/cs.js").toString();
//console.log('\ncontents:\n',s.slice(-200))
