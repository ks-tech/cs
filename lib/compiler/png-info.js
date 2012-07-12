var fs = require('fs');
exports.getPngInfo = getPngInfo;
//signal 8
//IHDR leng 4   
//IHDR 4
//Width 	4 bytes
//Height 	4 bytes
//Bit depth 	1 byte  
//Colour type 	1 byte
//Compression method 	1 byte
//Filter method 	1 byte
//Interlace method 	1 byte
function getPngInfo(file){
	try{
		if(Buffer.isBuffer(file)){
			buf = file;
		}else{
			var fd = fs.openSync(file,'r');
			var buf = new Buffer(29);
			read(fd, buf, 0, 29);
			//read tRNS block
		}
		if(buf[0] == 137){
			var trns = false;
			var info = {
				width:buf.readUInt32BE(16),
				height:buf.readUInt32BE(20),
				depth:buf[24],
				type:buf[25],
				compression:buf[26],
				filter:buf[27],
				interlace:buf[28],
			}
			var position = 33;
			while(read(fd, buf, position, 18)){
				var offset = fd?0:position;
				var len = buf.readUInt32BE(offset);
				var next = buf.toString('ascii',offset+4,offset+8);
				//console.log(len,next)
				if(next == 'IDAT'){
					break;
				}else if(next == 'tRNS'){
					//console.log(len,buf[offset+8],buf.toString('ascii',offset+9,offset+18))
					var alpha = buf[offset+8];
					trns = len>1 || alpha!=0 && alpha!=255;
				}
				position += (len+12);
			}
			info.alpha = trns || info.type>4
			return info;
		}
	}finally{
		if(fd){fs.close(fd);}
	}
}
function read(fd,buf,offset,count){
	if(fd){
		var len = 1;
		while(count>0 && len>0){
			len = fs.readSync(fd, buf, 0, count, offset)
			//console.log(len)
			offset+=len;
			count-=len;
		}
		return count ==0;
	}
	return offset+count<=buf.length;
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
//				var inf = getPngInfo(fs.readFileSync(file))
//				//var inf = getPngInfo(fs.readFileSync(file))
//				if(inf ){//&& inf.type>4){//|^474946
//					if(inf.type<7 && inf.alpha){
//						//console.log(file)
//						console.log(inf.type,inf.alpha)
//					}
//					//console.dir(inf)
//				}
//			}
//		}
//	})
//}
//walkFile('d:/workspace/mybaidu/');