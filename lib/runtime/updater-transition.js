//var ieTrans = /^(?:margin|padding)\-?|^(?:zoom|left|right|top|bottom)$|-?(?:width|height|color|size|weight|indent|spacing)$/
var extStyleMap = {'opacity':0}
var transitionPlugin = {
	id:'update-transition',
	parentId:'update',
	update:function(el,config){
		var currentStyle = el.currentStyle;
		var transitionProperty = currentStyle['transition-property']
		var transitionConfig = config.transition;;
		if(!transitionConfig){
			//delay
			config.transition = {}
			return;
		}
		if(transitionConfig.task){
			//break;
			return;
		}
		var backup = transitionConfig.backup ;
		if(backup){
			tryTransition(el,currentStyle,backup,transitionConfig);
		}else{
			transitionConfig.backup = backupProperties(transitionProperty.split(','),currentStyle)
		}
	}
}
function backupProperties(ps,currentStyle){
	var i = ps.length;
	var dest = {}
	while(i--){
		var p = ps[i];
		if(!(p in document.documentElement.style)){
			extStyleMap[p] = 1;
		}
		dest[p] = currentStyle[p]
	}
	return dest;
}

function tryTransition(el,currentStyle,backup,config){
	var transitionMap = {};
	var runtimeStyle = el.runtimeStyle;
	for(var p in backup){
		var op = backup[p];
		if(p in extStyleMap){
			var np = currentStyle[p];
		}else{
			runtimeStyle[p] = '';
			var np = currentStyle[p];
			runtimeStyle[p] = op;
		}
		if(np!=op){
			var running = true;
			//console.log('diff:',p,op,np)
			transitionMap[p] = buildOffsetImpl(p,op,np);
		}
	}
	if(running){
		config.backup = null;
		
		if(config.task){
    		//console.log(config.task)
			config.task(); 
		}
		function onComplete(){
			config.task = null;
		}
		//console.time('start')
		//set runtimeStyle 值，最终等同于 置空runtimeStyle 后的 currentStyle
		//if('opacity' in transitionMap){
		
	
		//config.task = startFadeTransition(el,runtimeStyle,transitionMap,onComplete);
		//return;
		//}
		
		config.task = startTransition(runtimeStyle,transitionMap,onComplete,
			currentStyle['transition-timing-function'],
			currentStyle['transition-duration'],
			currentStyle['transition-delay']
		)
	}
}

function startFadeTransition(el,runtimeStyle,transitionMap,onComplete){
	var el = el.parentNode;
	el.runtimeStyle.filter = 'progid:DXImageTransform.Microsoft.Fade(duration=2)';
	el.filters[0].apply();
	el.style.backgroundColor = 'red';
	for(var n in transitionMap){
		var v = transitionMap[n](1)
		try{
			runtimeStyle[n] = v;
		}catch(e){console.log(n,v);throw e;}
	}
	el.filters[0].play();
	function complete(){
		if(onComplete){
			onComplete();
			onComplete = null;
			el.filters[0].stop();
			el.filters[0].enabled = false;
			console.info(el.tagName)
		}
	}
	setTimeout(complete,2000)
	return complete
}
/**
 * delay 之后，如果值又恢复，是否因该取消动画？
 */
function startTransition(runtimeStyle,transitionMap,onComplete,transform,duration,delay){
	function step(rate){
		for(var n in transitionMap){
			var v = transitionMap[n](rate)
			if(n == 'opacity'){
				runtimeStyle.filter = 'Alpha(opacity='+parseInt(v * 100)+')'
				//console.log(runtimeStyle.filter)
			}else{
				try{
				runtimeStyle[n] = v;
				}catch(e){console.log(n,v);throw e;}
			}
		}
	}
	return start(step,onComplete,
			//function(x){return x*x},
			//function(x){return x*(x-0.4)},backIn
			function(x){return Math.pow(x,0.5)}
	   	 ,parseFloat(duration)*1000 || 4000
	  	 );
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
    var interval = 80; 
    var end = transform(1);
    var t = 0;
    var task = setInterval(callback,interval);
    return function(){
    	if(task){
    		console.log(t)
    		t = 1;
    		callback()
    		task = null;
    	}
    };
}


/* ============= impl util =============== */

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
		var postfix = np.replace(/[\d\.\-]+/,'');
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
exports.transitionPlugin = transitionPlugin;
