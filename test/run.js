var Path = require('path')
process.chdir(Path.dirname(__dirname))

var rbs = require('jsi/test/run').rbs
var setupCS = require('../lib/compiler/cs-filter').setupCS;
setupCS(rbs,'/');

var s = rbs.getContentAsBinary("/test/-ie6-test.css").toString();
console.log('\ncontents:\n',s)
