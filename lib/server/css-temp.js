var querystring = require("querystring");
var FS = require('fs');
exports.createCSSTemp =createCSSTemp;
function createCSSTemp(rbs,tempPath){
	var root = rbs.root ;
	var filePath = require('path').resolve(root,tempPath.replace(/^[\\\/]/,'./'));
	var dir = require('path').dirname(filePath);
	
    if(!FS.existsSync(dir)) {
    	FS.mkdirSync(dir);
    }
	return function (req, res,next) {
            //add by NE for post data recive
            var postData = '';
            req.on('data', function (chunk){
                postData += chunk;
            });
            req.on('end', function() {
                var jsonData = querystring.parse(postData);
                var code = jsonData.code;
                if(code) {
                    FS.writeFileSync(filePath, code);
                    console.log('It\'s saved!');
                    res.write(tempPath);
                } else {
                    console.info('temp-css got empty post!');
                }
                res.end();
            });
	}
}

