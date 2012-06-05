var Path = require('path')
process.chdir(Path.dirname(__dirname))

var rbs = require('jsi/test').rbs
var setupCS = require('../lib/compiler/cs-filter').setupCS;
setupCS(rbs,'/');

//var s = rbs.getContentAsBinary("/example/selector/-ie6-not.css").toString();
var s = rbs.getContentAsBinary("/static/cs.js").toString();
//console.log('\ncontents:\n',s.slice(-200))
