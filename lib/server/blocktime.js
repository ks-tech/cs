var blockTimes = [];
var traceRequest = false

exports.getBlockTime =getBlockTime;


//	this.add(/^block\s+(.*?)\s+(\d+)$/,function(cmd,block){
//		if(block[2] == 0){
//			removeBlock(block[1]);
//		}else{
//			addBlockn(block[1],block[2]);
//		}
//	})
//	this.add(/^trace(?:\s+(\w+))?$/,function(cmd,trace){
//		if(trace[1]){
//			traceRequest = /true|yes|1/i.test(trace[1])
//		}else{
//			console.log('trace:',traceRequest)
//		}
//	})

function addBlock(pattern,time1,time2){
	pattern = new RegExp(pattern);
	var source = pattern+'';
	var i = blockTimes.length;
	while(i--){
		var item = blockTimes[i];
		if(item[0] == source){
			return blockTimes[i] = [pattern,time1,time2]
		}
	}
	blockTimes.push([pattern,time1,time2])
}
addBlock('\/wait\.js\\b',1000,1000)
function getBlockTime(req){
	var i = blockTimes.length;
	var url = req.url;
	if(traceRequest){
		console.log('request:',url,req.headers['host'])
	}
	while(i--){
		var item = blockTimes[i];
		if(item[0].test(url)){
			return item[1] + parseInt(Math.random() * item[2] || 0);
		}
	}
}
function removeBlock(pattern){
	pattern = new RegExp(pattern)+'';
	var i = blockTimes.length;
	while(i--){
		if(blockTimes[i][0] == pattern){
			return blockTimes.splice(i,1)[0]
		}
	}
}
function listBlock(){
	return blockTimes.join('\n')
}