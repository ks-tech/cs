var Path = require('path')
process.chdir(Path.dirname(__dirname))

var rbs = require('jsi/test/run').rbs
var setupCS = require('../lib/compiler/cs-filter').setupCS;
setupCS(rbs,'/');

var s = rbs.getContentAsBinary("/static/cs/-ie7-index__define__.js").toString();
console.log(s)
