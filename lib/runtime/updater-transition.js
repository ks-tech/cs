//var ieTrans = /^(?:margin|padding)\-?|^(?:zoom|left|right|top|bottom)$|-?(?:width|height|color|size|weight|indent|spacing)$/
var extStyleMap = {'opacity':0}
var ElementExtension = require('./element').ElementExtension
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
		if(transitionConfig.backup){
			tryTransition(el,currentStyle,transitionConfig);
		}else{
			transitionConfig.backup = backupProperties(transitionProperty.split(/\s*,\s*/),currentStyle,el.runtimeStyle);
		}
	}
}
function backupProperties(ps,currentStyle,runtimeStyle){
	var i = ps.length;
	var dest = {}
	while(i--){
		var p = ps[i];
		var v = currentStyle[p];
		if(p in document.documentElement.style){
			runtimeStyle[p] =  v
		}else{
			//console.log('ext:',p)
			extStyleMap[p] = 1;
		}
		dest[p] = v;
	}
	return dest;
}

function tryTransition(el,currentStyle,config){
	if(config.task){//不支持已起动的动画更改.
		return;
	}
	var runtimeStyle = el.runtimeStyle;
	var changeMap;
	var transitionMap = {};
	var waiting = config.waiting;
	var backup = config.backup;
	var currentMap = waiting&&waiting.currentMap || backup

	for(var p in currentMap){
		if(p in extStyleMap){
			var np = currentStyle[p];
		}else{
			runtimeStyle[p] = '';
			var np = currentStyle[p];
			runtimeStyle[p] = backup[p];
		}
		
		if(np!=currentMap[p]){
			//console.log('diff:',p,op,np,currentStyle.opacity,backup.opacity)
			changeMap = changeMap||{};
			changeMap[p] = np;
		}
	}
	if(changeMap){
		if(waiting){
			clearTimeout(waiting.timeout);
			copy(changeMap,changeMap = waiting.changeMap)
		}else{
			currentMap = {}
			copy(config.backup,currentMap)
		}
		copy(changeMap,currentMap)
		config.waiting = {changeMap:changeMap,currentMap:currentMap}
		var timing = currentStyle['transition-timing-function']
		var duration = currentStyle['transition-duration']
		var delay= currentStyle['transition-delay']||250;
		waitTransition(el,runtimeStyle,changeMap,config,timing,duration,delay)
	}
}
function waitTransition(el,runtimeStyle,changeMap,config,timing,duration,delay){
	//console.log('new....');
	//console.dir(changeMap)
	var transitionMap = {};
	var fadeMap;
	var backup = config.backup;
	var waiting = config.waiting;
	for(var p in changeMap){
		if(/^(?:width|height)$|^padding-|^border-[\w\-]*width|transform/.test(p)){
			var disableFade = true;
		}
	}
	for(var p in changeMap){
		var v = changeMap[p];
		//console.log('diff:',backup[p],v);
		//console.dir(backup)
		if(disableFade || /\b(?:-width|top|bottom|left|right)$/.test(p)){
			transitionMap[p] = buildOffsetImpl(p,backup[p],v);
		}else{
			(fadeMap || (fadeMap={}))[p] = v;
		}
	}
	if(!waiting.fade && fadeMap){
		var ext = ElementExtension(el).setFilter('Fade(duration='+duration+')')
		var fade = el.filters["DXImageTransform.Microsoft.Fade"];
		
		if(fade){
			waiting.fade = true; 
			fade.apply();
		}
	}

	
	waiting.timeout = setTimeout(function(){
		config.waiting = null;
		//console.log('start....');
		//console.dir(changeMap);
		//console.log('!')
		for(var p in changeMap){
			backup[p] = changeMap[p]
		}
		//console.log('endBackup',noFade,hasFade)
		function onComplete(){
			config.task = null;
			
		}
		if(waiting.fade){
			//console.log('before',el.filters["DXImageTransform.Microsoft.Alpha"].opacity+'')
			//console.log(fadeMap)
			for(var p in fadeMap){
				var v = fadeMap[p];
				backup[p]=v;
				try{
					if(p == 'opacity'){
						(ext||ElementExtension(el)).setOpacity(v||1);
					}else{
						runtimeStyle[p] = v;
					}
				}catch(e){console.log(p,v);throw e;}
			}
			//ext.setOpacity(0);
			(fade || el.filters["DXImageTransform.Microsoft.Fade"]).play();
			//console.log('after',el.filters["DXImageTransform.Microsoft.Alpha"].opacity+'')
		}
		config.task = startTransition(bindTransitionMap(transitionMap,el),
			onComplete,timing,duration)
	},delay);
	
}


/**
 * delay 之后，如果值又恢复，是否因该取消动画？
 */
function startTransition(transitionMap,onComplete,
	transform,duration){
	//console.dir(transitionMap);
	function step(rate){
		for(var n in transitionMap){
			transitionMap[n](rate,n)
		}
	}
    var interval = 64; 
    if('transform' in transitionMap){
    	interval += 200;
    }
    if('opacity' in transitionMap){
    	interval += 50;
    }
	return start(step,onComplete,
			//function(x){return x*x},
			//function(x){return x*(x-0.4)},backIn
			function(x){return Math.pow(x,0.5)}
	   	 ,parseFloat(duration)*1000 || 4000,interval
	  	 );
}


function start(onStep,onComplete,transform,duration,interval){
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
    var end = transform(1);
    var t = 0;
    var task = setInterval(callback,interval);
    return function(){
    	if(task){
    		t = 1;
    		callback()
    		task = null;
    	}
    };
}


/* ============= impl util =============== */
function bindTransitionMap(map,el){
	var newMap = {}
	var runtimeStyle = el.runtimeStyle;;
	var ee;
	for(var n in map){
		if(n == 'opacity'){
			ee = ee || ElementExtension(el);
			newMap[n] = bindTransition(map[n],function(v){ee.setOpacity(v)})
		}else if(n == 'transform'){
			//console.log('transform init')
			ee = ee || ElementExtension(el);
			newMap[n] = bindTransition(map[n],function(v){
				//runtimeStyle.transform = "matrix("+v.join(',')+")"
				ee.setTransform(v)}
			)
		}else{
			newMap[n] = bindTransition(map[n],function(v,n){return runtimeStyle[n] = v})
		}
	}
	return newMap;
}
function bindTransition(fn,op){
	return function(rate,n){
		try{
			op(fn(rate),n)
		}catch(e){console.log('transition error:',rate,fn(rate));throw e;}
	}
}
function buildOffsetImpl(p,op,np){
	//console.info('diff',p,op,np)
	if(/transform/.test(p)){
		var defaultMatrix = "matrix(1,0,0,1,0,0)"
		var empty = [0,0,0,0,0,0]
		var ov = merge(empty,(op||defaultMatrix).match(/[\d\.\-]+/g),1)
		var nv = merge(empty,(np||defaultMatrix).match(/[\d\.\-]+/g),1)
		var offset = merge(nv,ov,-1);
		return function(rate){
			return merge(ov,offset,rate)
		}
	}else if(/[Cc]olor/.test(p)){
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
		var v1 = parseFloat(op)||0,v2 = parseFloat(np)||0
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
function copy(s,t){
	for(var n in s){t[n] = s[n]}
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
