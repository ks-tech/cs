var fs = require('fs');
exports.getPngInfo = getPngInfo;
//signal 8
//IHDR leng 4
//IHDR 4
//Width 	4 bytes  16
//Height 	4 bytes  20
//Bit depth 	1 byte  
//Colour type 	1 byte
//Compression method 	1 byte
//Filter method 	1 byte
//Interlace method 	1 byte
function getPngInfo(file){
	if(Buffer.isBuffer(file)){
		buf = file;
	}else{
		var fd = fs.openSync(file,'r');
		var buf = new Buffer(29);
		fs.readSync(fd, buf, 0, 29, 0);
		fs.close(fd);
	}
	if(buf[0] == 137){
		return {
			width:buf.readUInt32BE(16),
			height:buf.readUInt32BE(20),
			depth:buf[24],
			type:buf[25],
			compression:buf[26],
			filter:buf[27],
			interlace:buf[28],
		}
	}
}
//function walkFile(file){
//	fs.stat(file,function(err,stat){
//		//console.log(path,file,stat.isDirectory())
//		if(stat.isDirectory()){
//			fs.readdir(file,function(err,files){
//				var i = files.length;
//				while(i--){
//					var n = files[i];
//					if(n.charAt() !== '.'){
//						walkFile(file+'/'+n)
//					}
//				}
//			});
//		}else{
//			if(file.match(/\.png$/i)){
//				
//				var inf = getPngInfo(file)
//					
//				if(inf ){//&& inf.type>4){//|^474946
//					console.log(file)
//					console.log(inf.type)
//					console.dir(inf)
//				}
//			}
//		}
//	})
//}
//walkFile('d:/workspace/mybaidu/');