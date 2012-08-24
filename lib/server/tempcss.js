var querystring = require("querystring");
var FS = require('fs');
exports.create =create;
function create(rbs){
	var root = rbs.root ;
	return function (req, res,next) {
            //add by NE for post data recive
            var postData = '';
            req.on('data', function (chunk){
                postData += chunk;
            });
            req.on('end', function() {
                if(req.url == '/temp-css') {
                    var jsonData = querystring.parse(postData);
                    var code = jsonData.code;
                    if(code) {
                        //write a file for css [code]
                        //mkdir
                        var tempCssPath = './tmpcss/';
                        if(!FS.existsSync(tempCssPath)) {
                            FS.mkdirSync(tempCssPath);
                        }
                        //var fileName = (new Date).getTime().toString(36)+Math.round(Math.random()*10000).toString(36)+'.css';
                        //TODO 为避免生成太多临时css，暂固定生成一个css的文件
                        var fileName = '00000fffff.css';
                        FS.writeFileSync(tempCssPath+fileName, code);
                        console.log('It\'s saved!');
                        res.write('/tmpcss/'+fileName);
                    } else {
                        console.info('temp-css got empty post!');
                    }
                    res.end();
            }
            });
        if(next){
            next(req,res);
        }else{
        }
	}
}

