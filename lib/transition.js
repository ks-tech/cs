var CS = require('./core').CS
var ieTrans = /^(?:margin|padding)\-?|^(?:zoom|left|right|top|bottom)$|-?(?:width|height|color|size|weight|indent|spacing)$/
CS.addPlugin({id:'trans',//attribute query plugin
	setup:function(el,config){//可选
		config.inc = 0;
	},
	visit:function(el,config){
		if(config.run){
			return;
		}
		var ps = config.properties;
		var cs = el.currentStyle;
		if(ps){
			var backup = config.backup ;
			if(backup){
				var i = ps.length;
				var transitionMap = {};
				var runtimeStyle = el.runtimeStyle;
				for(var p in backup){
					var op = backup[p];
					if(p in el.style){
						runtimeStyle[p] = '';
						var np = cs[p];
						runtimeStyle[p] = op;
					}else{
						var np = cs[p];
					}
					if(np!=op){
						config.run = true;
						console.log('diff:',p,op,np)
						transitionMap[p] = buildOffsetImpl(p,op,np);
					}
				}
				while(i--){
					var p = ps[i];
					
				}
				if(config.run){
					config.backup = null;
					
					//console.time('start')
					//set runtimeStyle 值，最终等同于 置空runtimeStyle 后的 currentStyle
					startTransition(runtimeStyle,config,transitionMap,
						cs['transition-timing-function'],
						cs['transition-duration'],
						cs['transition-delay']
					)
				}
			}else{
				copy(ps,cs,config.backup = {})
				//console.timeEnd('start')
			}
		}else{
			var ps = config.properties = cs['transition-property'].split(',');
			copy(ps,cs,config.backup = {})
		}
	},
	expression:'layoutFlow'
})


/* ============= impl util =============== */
function copy(ps,from,to,exists){
	var i = ps.length;
	while(i--){
		var p = ps[i];
		to[p] = from[p]
	}
}
function get(ps,source){
	var out = [];
	var i = ps.length;
	while(i--){
		out[i] = source[ps[i]]
	}
	return out;
}
function buildOffsetImpl(p,op,np){
	//console.info('diff',p,op,np)
	if(/[Cc]olor/.test(p)){
		var v1 = colorToRgba(op),v2=colorToRgba(np);
		var offset = merge(v2,v1,-1);
		return function(rate){
			if(rate == 1){
				return np;
			}else{
				var r =  merge(v1,offset,rate)
				r = parseInt(0x1000000 + (r[0]<<16) + (r[1]<<8) + r[2]).toString(16).replace(1,'#');
				//console.log(r)
				return r
			}
		};
	}else{
		var postfix = np.replace(/[\d\.]+/,'');
		var v1 = parseFloat(op),v2 = parseFloat(np)
		var offset = v2 - v1;
		if(Math.abs(v1-v2)<=1 || np.indexOf('.')>=0){
			//float
			return function(rate){
				return v1 + offset *rate+postfix;
			}
		}else{
			return function(rate){
				return parseInt(v1 + offset *rate)+postfix;
			}
		}
		
	}
}
function merge(a1,a2,rate){
	var out = [];
	var i = a1.length;
	while(i--){
		out[i] = a1[i] + a2[i] *rate;
	}
	return out
}
function colorToRgba(c){
	if(c.charAt() =='#'){
		c = c.substr(1);
	}
	if(c.length<6){
		c = c.replace(/\w/g,'$&$&')
	}
	c = parseInt(c,16);
	return [c>>16,c>>8&0xFF,c&0xFF];
}
function startTransition(runtimeStyle,config,map,transform,duration,delay){
	//interval
	//console.dir(map)
	if(config.task){
		config.task[0](1);
		config.task[1](); 
	}
	function step(rate){
		for(var n in map){
			var v = map[n](rate)
			if(n == 'opacity'){
				runtimeStyle.filter = 'Alpha(opacity='+parseInt(v * 100)+')'
				//console.log(runtimeStyle.filter)
			}else{
				runtimeStyle[n] = v;
			}
		}
	}
	function complete(){
		config.task = null;
		config.run = false;
	}
	config.task = [step,complete];
	start(step,complete,
		//function(x){return x*x},
		//function(x){return x*(x-0.4)},backIn
		function(x){return Math.pow(x,0.5)}
	    ,parseFloat(duration)*1000 || 4000
	   )
}
function start(onStep,onComplete,transform,duration){
//	console.log(duration)
    function callback(){//hack: 移动到上面，避免断开var系列，影响压缩比例
    
        t+=interval;
        var x = t/duration;
        if(x>=1){
            clearInterval(task);
            onStep(1);
            onComplete();
        }else{
            onStep(transform(x)/end);
        }
    }
    var interval = 200; 
    var end = transform(1);
    var t = 0;
    var task = setInterval(callback,interval);
    return task;
}

