var require;
var $JSI = function(cachedMap){//path=>[impl,dependences...],//只在define中初始化。存在(包括空数组)说明当前script已在装载中，不空说明已经装载完成，depengdences为空，说明依赖已经装载。
	var exportMap = {}//path=>exports// 存在说明已经载入【并初始化】
	var taskMap = {};//path=>[task...]
	var notifyMap = {};//dep=>[waitingList]
	var loading = 0;
	var async;//is async load model?
	var script = document.scripts[document.scripts.length-1];
	var scriptBase = script.src.replace(/[^\/]+$/,'');	
	var asyncInterval;
	var asyncWaitList = [];
	var syncWaitList = [];
	var syncWaitInc = 0;
	function addWait(path,callback,async){
		if(async){
			asyncWaitList.push(arguments);
			asyncInterval = asyncInterval || setInterval(asyncWait,300)
		}else{
			if(syncWaitList.push(arguments)<2){
				document.write('<script src="'+scriptBase+'block.js"><\/script>')
			}
		}
	}
	function asyncWait(args){
		if(loading == 0){
			clearInterval(asyncInterval);
			while(args = asyncWaitList.pop()){
				_load.apply(this,args)
			}
		}
	}
	/**
	 * @param path
	 * @param target||callback (optional)
	 * @param nextTagLazySync (optional)
	 */
	function load(path){
		var end = arguments.length-2;
		if(end>1){
			while(typeof arguments[end] == 'string'){end++};
		}else{
			end = 1;
		}
		var target = arguments[end];
		var callback =  function(result){
			copy(result,target||this);
		}
		if(typeof target == 'boolean'){
			var async = !target
			target = this;
		}else{
			var async = !arguments[end+1];
			if('function' == typeof target){
				callback = target;
			}
		}
		if(end>1){
			var i = 0;
			var all = {};
			var end2 = end;
			while(i<end){
				_load(arguments[i++],function(result){
					copy(result,all)
					--end2 || callback(all);
				},async);
			}
		}else{
			_load(path,callback,async);
		}
	}
	function _load(path,callback,thisAsync){
		path = path.replace(/\\/g,'/')
		if(path in exportMap){
			return callback(exportMap[path])
		}
		var cached = cachedMap[path];
		if(cached){
			push(taskMap,path,callback)
			if(cached.length === 1){//only impl no dependence
				onComplete(path);
				async = thisAsync;
			}else{
				if(async !== thisAsync && loading){// assert(sync!=null)
					addWait(path,taskMap[path].pop(),thisAsync);
				}//else{fired by previous loading}
			}
		}else{
			if(loading==0 || async === thisAsync ){//if(sync===null) assert(inc ==0) 
				async = thisAsync;
				taskMap[path] = [callback];
				loadScript(path);
			}else{
				addWait(path,callback,thisAsync);
			}
		}
	}
	function loadScript(path){//call by _load and onDefine
		//console.assert(cachedMap[path] == null,'redefine error')
		loading++;
		cachedMap[path] = [];//已经开始装载了，但是还没有值
		path = $JSI.realpath(path);//.replace(/[^\/]+$/,uar));
		if(async){
			var s = document.createElement('script');
			s.setAttribute('src',path);
			script.parentNode.appendChild(s);
		}else{
			document.write('<script src="'+path+'"><\/script>');
		}
	}
	/**
	 * @arguments implMap
	 * 		允许外部调用，缓存装载单元（该调用方式下不触发计数器）。
	 * @arguments path,dependences,impl
	 * 		添加缓存,计数器的因素，只能通过 loadScript 触发，禁止外部调用。
	 */
	function define(path,dependences,impl){
		if(impl){
			var implAndDependence = cachedMap[path];
			var i = dependences.length;
			var newScripts = [];
			//console.assert(implAndDependence.length==0,'redefine error')}
			implAndDependence.push(impl);
			while(i--){
				var dep = normalizeModule(dependences[i],path);
				var depCache = cachedMap[dep];;
				//>1:self loaded but dependence not loaded
				//=1:self and dependence loaded
				//=0:script added but not load
				//=undefined: not added
				if(depCache){
					if(depCache.length==1){
						continue;
					}
				}else{
					newScripts.push(dep)
				}
				push(notifyMap,dep,path)
				implAndDependence.push(dep);
			}
			if(implAndDependence.length == 1){
				onComplete(path);
			}else{
				while(dep = newScripts.pop()){
					loadScript(dep);
				}
			}
			if(--loading<1){
				onComplete()
			}
			//else{//loaded before}
		}else{
			for(i in path){
				cachedMap[i] = cachedMap[i] || path[i]
			}
		}
	}

	function onComplete(path){//逻辑上不应该被多次调用【除非有bug】
		if(path){
			var task = taskMap[path];
			if(task && task.length){
				var result = _require(path);
				var item;
				while(item = task.pop()){//每个task只能被调用一次！！！
					item.call(this,result)
				}
			}
			var targets = notifyMap[path]
			if(targets){
				var i = targets.length;
				while(i--){
					var target = cachedMap[targets[i]];
					var j = target.length;
					//if(j){}//没必要了，j必然>=1
					while(--j){
						if(target[j] === path){
							target.splice(j,1)
						}
					}
					if(target.length == 1){
						//console.info('immediate trigger:',targets[i])
						onComplete(targets[i])
					}
				}
			}
			//console.info('trigger:',path)
		}else{
			for(path in taskMap){
				//if(!exportMap[path]){console.info('complete trigger:',path);	}
				onComplete(path)
			}
		}
	}
	
	function _require(path){
		try{
			if(path in exportMap){
				return exportMap[path];
			}else{
				var requireCache = {};
				var result = exportMap[path] = {}
				//console.warn(path)
				cachedMap[path][0].call(this,function(path2){
					if(path2 in requireCache){
						return requireCache[path2];
					}
					return requireCache[path2] = _require(normalizeModule(path2,path));
				},result);
				return result;
			}
		}catch(e){
			var buf = []
			var ss = document.scripts;
			for(var i=0;i<ss.length;i++){
				buf.push(ss[i].src);
			}
			buf.push('\n');
			for(var i in cachedMap){
				buf.push(i,!!cachedMap[i][0])
			}
			console.error('require error:',path,e.message,buf)
		}
	}
	//utils...
	function copy(src,dest){
		for(var p in src){
			dest[p] = src[p]
		}
	}
	function push(map,key,value){
		if(key in map){
			map[key].push(value)
		}else{
			map[key] = [value]
		}
	}
	function normalizeModule(url,base){
        if(url.charAt(0) == '.'){
        	url = base.replace(/[^\/]+$/,'')+url
        	while(url != (url =url.replace( /[^\/]+\/\.\.\/|(\/)?\.\//,'$1')));
        }
        return url;
    }
	require = _require;

	return {
		realpath:function(path){
			return scriptBase+path+'__define__'+(this.hash[path]||'')+'.js';////scriptBase:/scripts/,
		},
		hash	: {},
		copy	: copy,
		/**
		 * @param path...
		 * @param callback
		 * @param block
		 */
		load : load,
		block : function(current){
			if(loading == 0){
				while(current = syncWaitList.pop()){
					_load.apply(this,current)
				}
			}else{
				current = document.scripts[document.scripts.length-1];
				//console.log(current.src,this._last - (this._last = +new Date()))
				document.write('<script src="'+current.src.replace(/\?token=.*$|$/,'?token='+ +new Date)+'&inc='+ ++syncWaitInc+'"><\/script>');
				//current.parentNode.removeChild(current);
			}
			//notify sync task 
		},
		define : define			// $JSI.define('path',['deps'],function(require,exports){...}) || $JSI.define({path:impl})
	}
}({"cs/lib/runtime/index":[function(require,exports){var CS = require('./core').CS;
var nthPlugin = require("./updater-nth").nthPlugin
var boxPlugin = require("./updater-box").boxPlugin
var refPlugin = require("./updater-ref").refPlugin
//var transitionPlugin = require('./updater-transition').transitionPlugin
var ElementExtension = require('./element').ElementExtension
var latestHash ='';
function hashchanged(){
	var hash = location.hash;
	if(hash!=latestHash){
		var el = /^#[\w\-\$_]+$/.test(latestHash) && document.all[latestHash.slice(1)];
		if(el){
			el.className = el.className.replace(/(?:^|\s+|\S+--)target__(\s+|--\S+|$)/,' ')
		}
		latestHash = hash;
		if(el = /^#[\w\-\$_]+$/.test(latestHash)&& document.all[latestHash.slice(1)]){
			el.className += ' target__'
		}
	}
}
//放最前面,在其他变化生效前.
//CS.addPlugin(transitionPlugin,'onexist','transition-property')

//prompt('',navigator.userAgent + '\n'+navigator.userAgent.replace(/^.*(?:; MSIE ([6-8])).*$|.*/,'$1'))
switch(navigator.userAgent.replace(/^.*(?:; MSIE ([6-9])).*$|.*/,'$1')){
case '6':
	if('CSS1Compat' !== document.compatMode){
		alert('IE6 BackCompat Mode is not support')
	}
	CS.addPlugin({id:'png-alpha',
		update: function(el,config,flag,inc){
			if(inc%4){return}
			if(flag){
				el.runtimeStyle.backgroundImage = '';
				var png = el.currentStyle.backgroundImage.replace(/^url\((.+?)\)$/,'$1').replace(/['"]/g,'')
				el.runtimeStyle.backgroundImage = 'none'
				if(config.pngAlpha != png && png.match(/#alpha$/)){
					ElementExtension(el).setAlphaPng(config.pngAlpha = png);
				}
			}else{
				if(config.pngAlpha){
					el.runtimeStyle.backgroundImage = '';
					ElementExtension(el).setAlphaPng(config.pngAlpha = null);
				}
			}
			
		}
	},'onexist','cs-png-alpha')
	CS.addPlugin(require("./plugin-muti-class").mutiClassPlugin);
	//采用监听方式更靠谱把?
	CS.addPlugin(
		require("./updater-fixed").fixedPlugin
		,'onexist','cs-position-fixed')
case '7':
	CS.addPlugin(require("./plugin-dynamic-class").dynamicClassPlugin);// ie67()
	CS.addPlugin(require("./plugin-attr").attributePlugin);// ie67()
//	CS.addPlugin({
//		id:'update-gen-before',
//		update:function(el,config,content){
//			ElementExtension(el).setBefore(content);
//		}
//	},'onchange','cs-gen-before')
//	CS.addPlugin({
//		id:'update-gen-after',
//		update:function(el,config,content){
//			ElementExtension(el).setAfter(content);
//		}
//	},'onchange','cs-gen-after');
	setInterval(hashchanged,512)
	break;
case '8':
	CS.addPlugin(require("./plugin-attr").attributePlugin);// ie8()
	window.attachEvent('onload',hashchanged);//readyState for oncontenload is better
	window.attachEvent('onhashchange',hashchanged);
}

//document.body.onclick=function(){
//	document.body.className +=''
//}
//CS.addPlugin(boxPlugin,'onexist',"border-radius")
//

//if(all){
CS.addPlugin(nthPlugin,'onexist','cs-update-nth')
CS.addPlugin(refPlugin,'onexist',"cs-ref")

//CS.addPlugin({
//	id:'update-box-shadow',
//	update:function(el,config,shadow){
//		//console.log(shadow)
//		ElementExtension(el).setBoxShadow(shadow);
//	}
//},'onexist','box-shadow')

CS.addPlugin({
	id:'update-mimax-size',
	update:function(el,config,v,inc){
		if(/img/i.test(el.tagName)){
			
		}
		//TODO:...
		var size = config.mimaxSize
		var rs = el.runtimeStyle;
		if(size){
			if(v){
				if(inc%10){
					return;
				}
			}
			if(size.width!=null){rs.width = ''};
			if(size.height!=null){rs.height = ''};
		}else{
			size = config.mimaxSize = {}
		}
		var currentStyle = el.currentStyle;
		var width = inside(el.clientWidth,currentStyle['min-width'],currentStyle['max-width'])
		var height = inside(el.clientHeight,currentStyle['minHeight'],currentStyle['max-height']);
		if(size.width = width){rs.width = width+'px'};
		if(size.height = height){rs.height = height+'px'};
	}
},'onexist','cs-update-mimax')


CS.addPlugin({id:'update-transform',
	update: function(el,config,transform,inc){
		//if(inc%4){return}
		if(config.transition && config.transition.task){
			//ignore transition 
			return
		}
		var m = transform && transform.match(/[\d\.\-]+/g);
		//var m = transform && /matrix\(([\d\.\-]+),([\d\.\-]+),([\d\.\-]+),([\d\.\-]+),([\d\.\-]+),([\d\.\-]+)\)/.exec(transform.replace(/\s+|px/g,''))
		ElementExtension(el).setTransform(m);
	}
},'onchange','transform')


CS.addPlugin({
	id:'update-opacity',
	update:function(el,config,opacity,inc){
		//if(inc%4){return}
		ElementExtension(el)
			.setOpacity(opacity||1);
	}
},'onchange','opacity')


function inside(value,min,max){
	if(min && value<(min = parseInt(min))){
		return min;
	}else if(max && value>(max = parseInt(max))){
		return max;
	}
}


CS.addPlugin({id:'update-cs-background-rgba',
	update:function(el,config,rgba,inc){
		//if(inc%4){return}
		ElementExtension(el).setRgba(rgba);
		//rgba && ElementExtension(el).setGradient(['linear',0,rgba,rgba])
		//console.log(['rgba',rgba,rgba])
//		setTimeout(function(){
//			console.log(el.currentStyle.filter)
//			for(var i = el.filters.length-1;i--;){
//				var f = el.filters && el.filters.item(i)
//				if(f)try{console.log(f.StartColorStr,f.EndColorStr)}catch(e){}
//			}
//			
//			
//			},300)
	}
},'onchange','cs-background-rgba')
//CS.addPlugin({id:'update-cs-linear-gradient',
//	update:function(el,config,image){
//		if(image !==  (config.image || 'none')){
//			config.image = image
//			var image2 = image.replace(/^url\("about:blank#(linear),(.*)"\)$/,'$1,$2')
//			if(image2 == image){
//				image2 = null;
//			}
//			//el.runtimeStyle.backgroundImage = 'none';
//			//console.log(image2,image2.match(/\d+(?=(?:deg)?,)|#?\b\w+(?=,|$)/g).join('\n'))
//			image2 = image2 && image2.match(/\d+(?=(?:deg)?,)|#?\b\w+(?=,|$)/g);
//			ElementExtension(el).setGradient(image2);
//			//console.log(image2)
//		}
////		ElementExtension(el).setGradient(image);
//	}
//},'onchange','backgroundImage')

exports.CS = CS;
}],"cs/lib/runtime/core":[function(require,exports){var pluginMap = require('./plugin-update').pluginMap
var styleInfos = [];
var setupKeyMap = {
	mc:'textKashida',
	dc:'textKashidaSpace',
	attr:'pageBreakBefore',
	fixed:'pageBreakAfter',
	//??:'textUnderlinePosition',
	//not:'rubyOverhang',//merge to update 
	update:'layoutFlow'
}
//Mozilla/5.0 (Windows NT 5.1) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11
//Opera/9.80 (Windows NT 5.1; U; Edition IBIS; zh-cn) Presto/2.10.229 Version/11.60
//Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; .NET CLR 3.0.04506.648; .NET CLR 3.5.21022; InfoPath.2)
//Mozilla/5.0 (Windows NT 5.1; rv:10.0.2) Gecko/20100101 Firefox/10.0.2
//webkit,moz,ie,o
var uar = /^o(?=pera)|msie [6-8]|ms(?=ie \d+)|webkit|^moz(?=.+firefox)|khtml/.exec(typeof navigator == 'object' && navigator.userAgent.toLowerCase());
if(uar){
	uar = '-'+uar[0].replace(/msie (\d)/,'ie$1')+'-$&';
}else{
	uar = '-ie6-$&';
}
function CS(el,pid){
	try{
		var plugin = pluginMap[pid];
		if(plugin){
			var key = 'cs-plugin-'+pid;
			var runtimeStyle  = el.runtimeStyle;
			var expressionStyleKey = setupKeyMap[pid];
			if(expressionStyleKey){
				//if(inc++>1)测试一下
				runtimeStyle[expressionStyleKey] =  el.currentStyle[expressionStyleKey]
					||el.parentNode.currentStyle[expressionStyleKey];
				if(runtimeStyle[key]){
					console.error('插件:'+pid+'被多次初始化了'+runtimeStyle[key])
					return;
				}
				runtimeStyle[key] = 1;
				plugin.update(el,{})
			}
			//console.log(key,el.tagName,!!pplm[pid])
		}
	}catch(e){
		console.error('plugin init failed:',pid,el.id || el.tagName,e.message||e)
	}
}
if(0 === uar.indexOf('-ie')){
	try{
		//see https://github.com/aFarkas/html5shiv
(function(m,c){var z="abbr|article|aside|audio|canvas|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video";function n(d){for(var a=-1;++a<o;)d.createElement(i[a])}function p(d,a){for(var e=-1,b=d.length,j,q=[];++e<b;){j=d[e];if((a=j.media||a)!="screen")q.push(p(j.imports,a),j.cssText)}return q.join("")}var g=c.createElement("div");g.innerHTML="<z>i</z>";if(g.childNodes.length!==1){var i=z.split("|"),o=i.length,s=RegExp("(^|\\s)("+z+")",
"gi"),t=RegExp("<(/*)("+z+")","gi"),u=RegExp("(^|[^\\n]*?\\s)("+z+")([^\\n]*)({[\\n\\w\\W]*?})","gi"),r=c.createDocumentFragment(),k=c.documentElement;g=k.firstChild;var h=c.createElement("body"),l=c.createElement("style"),f;n(c);n(r);g.insertBefore(l,
g.firstChild);l.media="print";m.attachEvent("onbeforeprint",function(){var d=-1,a=p(c.styleSheets,"all"),e=[],b;for(f=f||c.body;(b=u.exec(a))!=null;)e.push((b[1]+b[2]+b[3]).replace(s,"$1.iepp_$2")+b[4]);for(l.styleSheet.cssText=e.join("\n");++d<o;){a=c.getElementsByTagName(i[d]);e=a.length;for(b=-1;++b<e;)if(a[b].className.indexOf("iepp_")<0)a[b].className+=" iepp_"+i[d]}r.appendChild(f);k.appendChild(h);h.className=f.className;h.innerHTML=f.innerHTML.replace(t,"<$1font")});m.attachEvent("onafterprint",
function(){h.innerHTML="";k.removeChild(h);k.appendChild(f);l.styleSheet.cssText=""})}})(this,document);

		document.execCommand("BackgroundImageCache",false,true);
	}catch(e){}
	CS.config= function(){
		var styleSheets = document.styleSheets;
		var end = styleSheets.length;
		var i = styleInfos.length-1;
		while(++i<end){
			//alert(i)
			var rules = styleSheets[i].rules;
			if(rules && rules.length){
				var s = rules[rules.length-1]
				//alert([i,s&&s.selectorText,rules.length,'$'])
				styleInfos.push(s)
				//console.log(s.selectorText)
				if(s.selectorText.toLowerCase() == 'head cs-config'){
					for(var n in pluginMap){
						var plugin = pluginMap[n];
						if(plugin.config){
							plugin.config(s.style,n);
						}
					}
				}
			}else{
				//TODO:... to support muti link pre script
				//console.log('not loaded!',rules == null,rules&&rules.length)
				styleInfos.push(null)
			}
		}
		//prompt([styleInfos.length,styleSheets.length])
	}
	
	CS.addPlugin = function(impl,parentId,args){
		if(parentId){
		//if(parentId!='onexist' && false)
		{
			var parentPlugin = pluginMap[parentId];
			parentPlugin.appendChild(impl,args)
		}
		}
		pluginMap[impl.id] = impl;
	}
}else{
	CS.addPlugin = CS.config= Function.prototype;
}
CS.link = function(href,extAttr){
	href = href.replace(/[^\/]+$/,uar);
	var l = ['<link rel="stylesheet" type="text/css" onload="CS.config()" href="',href,'" ',extAttr,'/>'];
	document.write(l.join(''))
	return this;
}

exports.setupKeyMap = setupKeyMap;
exports.CS = CS;

/**
0,1,textKashida,0pt
;0,1,textKashidaSpace,0pt
;0,1,layoutFlow,horizontal
;0,1,pageBreakAfter,auto
;0,1,pageBreakBefore,auto

* The property has a default value of above. The Cascading Style Sheets (CSS) attribute is not inherited. 
only for ruly element
;0,1,rubyAlign,
;0,1,rubyOverhang,
;0,1,rubyPosition,
* 
;0,1,textJustify,auto
;0,1,tableLayout,auto
;0,1,layoutGridChar,none
;0,1,layoutGridLine,none
;0,1,layoutGridMode,both
;0,1,layoutGridType,loose
*0,2,textUnderlinePosition auto
;0,1,scrollbarArrowColor,#000000
;0,1,scrollbarBaseColor,#000000
;0,1,scrollbarFaceColor,#ece9d8
;0,1,scrollbarHighlightColor,#ffffff
;0,1,scrollbarShadowColor,#aca899
;0,1,lineBreak,normal
;0,1,unicodeBidi,normal
;0,1,whiteSpace,normal
;0,1,wordBreak,normal
;0,1,wordSpacing,normal
;0,1,writingMode,lr-tb
*/
}],"cs/lib/runtime/updater-nth":[function(require,exports){//var updateClasses = require('./plugin-muti-class').updateClasses;

var nthClassMap = {};
var cachedNthInfo = {}
var nthPlugin = {
	id:'update-nth',
	config:function(style){
		//console.log('config',style['nth-classes']);
		configNth(style['nth-classes']);
	},
	update:function(el,config,value,inc){//可选
		var cn = el.className;
		if(inc % 128 ==0 ){
			var nth = computeNth(el)
			if(config.lastedNth!=(config.lastedNth=nth)){
				el.className = cn.replace(/(^|\s+)nth-[^ ]__(?:\s+|$)/g,'$1')+' nth-'+nth+'__';
			}
		}
		//updateClasses(cn,el)
	}
}
function computeNth(el){
	var nthInfo = new CachedNthInfo(el);
	var out=[]
	for(var type in nthClassMap){
		var map = nthClassMap[type];
		var index = nthInfo.getIndex(el,type);
		//applyClass(map,'nth-',index,out);
		for(var c in map){
			if(map[c](index)){ //&& el.currentStyle['nth-'+c]
				out.push(c);
			}
		}
	}
	return out.join('__ nth-')
}
function configNth(value){
	if(value){
		value = value.split(/\s*,\s*/);
		var len = value.length;
		while(len--){
			var v = value[len];
			var type = v.replace(/_.*/,'');
			var map = nthClassMap[type] ;
			if(!map){
				 map = nthClassMap[type] = {}
			}
			map[v]=nthChecker(type,v.substr(type.length+1))
		}
	}
}

function CachedNthInfo(el){
	var parentNode = el.parentNode;
	var pid = parentNode.uniqueID;
	if(pid in cachedNthInfo){
		return cachedNthInfo[pid];
	}
	this.pid = pid;
	this.reset(parentNode.children||[]);
}
CachedNthInfo.prototype = {
	getIndex:function(el,type){
		var children = el.parentNode.children || [];
		var uniqueID = el.uniqueID;
		if(children.length != this.length || !(uniqueID in this.indexMap)){
			this.reset(children);
		}
		var index = this.indexMap[uniqueID]
		switch(type){
		case 'child':
			return index+1;
		case 'last-child':
			return this.length-index;
		case 'last-of-type'://index+1->end
			var end = this.length;
		case 'of-type'://0->index
			var tag = this.tags[index];
			var inc = 0;
			if(!end){
				end = index;
				index = -1;
			}
			while(++index<end){
				if(this.tags[index]==tag){
					inc++;
				}
			}
			return inc+1;
		}
	},
	reset:function(children){
		var indexMap = this.indexMap = {}
		var tags = this.tags = [];
		var ids = this.ids = [];
		var len = this.length = children.length;
		while(len--){
			var el = children[len]
			tags[len] = el.tagName;
			indexMap[ids[len] = el.uniqueID] = len
		}
	}
}
function nthChecker(type,nth){
	nth = nth.split('_');
	var n1 = +nth[0];
	var n2 = +nth[1];
	return function(index){
		var i = index-n2;
		return n1==0 && n2==index||i%n1==0 && i/n1>=0;
		
		//return index == n2 || n1 && !((index-n2)%n1)
	}
}

exports.nthPlugin = nthPlugin;

}],"cs/lib/runtime/updater-box":[function(require,exports){var boxPlugin = {
	id:'update-box',
	parentId:'update',
	update:function(el,config){
		return;
		if(!config.boxUpdated){
			config.boxUpdated = true
			setupVMLBorder(el);
		}
	}
}
var ns = document.namespaces;

var FilterHelper = require('./filter').FilterHelper

function nsInit(){
	try{
		ns.add('v', 'urn:schemas-microsoft-com:vml', '#default#VML');
	}catch(e){
		nsInit && setTimeout(nsInit,100);
		nsInit = null;
	}
}
nsInit()

function toPixelWidth(v){
	return v == 'auto'? 0 :parseInt(v)||0
}


function setupVMLBorder(el){

	var rs = el.currentStyle;
	var x = 0;//toPixelWidth(rs.left);
	var y = 0;//toPixelWidth(rs.top);
	var color = rs.borderColor || rs.borderTopColor;
	var bs = [
			toPixelWidth(rs['borderTopWidth']),
			toPixelWidth(rs['borderRightWidth']),
			toPixelWidth(rs['borderBottomWidth']),
			toPixelWidth(rs['borderLeftWidth'])];
	var rs = [rs['border-top-left-radius'],//0		//3  0
			rs['border-top-right-radius'],//1		//1 0
			rs['border-bottom-right-radius'],//2	//1 2
			rs['border-bottom-left-radius']]//3		//3 2
	var width = parseInt(el.offsetWidth);
	var height = parseInt(el.offsetHeight);
	var args = [0,0,width,height];
	//el.runtimeStyle.display = 'none';
	for(var i=0;i<4;i++){
		var r = rs[i].split(' ');
		args.push(parseInt(r[0]),parseInt(r[1]))
		//args.push(parseInt(r[0])+bs[i%3?1:3],parseInt(r[1])+bs[i>1?2:0])
	}
	//console.log(args);
	//console.log(buildInnerArgs(args,bs))
	var buf = [];
	var outer = buildRoundRect.apply(this,args);
	var inner = buildRoundRect.apply(this,buildInnerArgs(args,bs))
	
	doMask(el,x,y,width,height,color,inner,outer)
	
}


function doMask2(source,x,y,width,height,color,inner,outer){
	//setTimeout(function(){
		var style = source.currentStyle;
		var mask = source.parentNode;
		var position = style.position=='absolute'?'absolute':'relative';
		var pos = 'position:'+position+';top:'+(toPixelWidth(style.top)-y)+'px;left:'+(toPixelWidth(style.left)-x)+'px;'
		//source.parentNode.insertBefore(mask,source)
		mask.style.cssText = pos+'width:'+width+'px;height:'+height
				+'px;filter:progid:DXImageTransform.Microsoft.Compositor(function=21) ';
		source.style.left = 0;
		source.style.top = 0;
		mask.zIndex= style.zIndex
		//alert([x,y,pos])
		//source.style.filter = "alpha(opacity=20)"
		source.insertAdjacentHTML('afterEnd',buildShape(inner,width,height,'green'));
		
		//setTimeout(function(){
			source.style.display = 'none';
			mask.filters[0].apply();
			mask.removeChild(source.nextSibling);
			//mask.appendChild(source);
			source.style.display = 'block';
			mask.filters[0].play();
	
	//		source.style.display = 'none'
			if(outer != inner){
				var border = 
				"<div style='"+pos+";z-index:"+style.zIndex+"'>"
					+buildShape(outer+inner,width,height,color)+"</div>"
					
				mask.insertAdjacentHTML('beforeBegin',border)
			}
		//},100);
	//},100);
}
function doMask(source,x,y,width,height,color,inner,outer){
	setTimeout(function(){
		var style = source.currentStyle;
		var mask = document.createElement('div');
		var position = style.position=='absolute'?'absolute':'relative';
		var pos = 'position:'+position+';top:'+(toPixelWidth(style.top)-y)+'px;left:'+(toPixelWidth(style.left)-x)+'px;'
		source.parentNode.insertBefore(mask,source)
		mask.style.cssText = pos+'width:'+width+'px;height:'+height
				+'px;filter:progid:DXImageTransform.Microsoft.Compositor(function=21) ';
		source.style.left = 0;
		source.style.top = 0;
		mask.zIndex= style.zIndex
		//alert([x,y,pos])
		//source.style.filter = "alpha(opacity=20)"
		mask.innerHTML =buildShape(inner,width,height,'green');
		
		//setTimeout(function(){
			mask.filters[0].apply();
			mask.removeChild(mask.firstChild);
			mask.appendChild(source);
			mask.filters[0].play();
	
	//		source.style.display = 'none'
			if(outer != inner){
				var border = 
				"<div style='"+pos+";z-index:"+style.zIndex+"'>"
					+buildShape(outer+inner,width,height,color)+"</div>"
					
				mask.insertAdjacentHTML('beforeBegin',border)
			}
		//},100);
	},100);
}

/* ============= impl util =============== */
function buildShape(path,width,height,color){
	var buf = []
	buf.push('<v:shape  strokeweight="0px" strokecolor="',color,'"  fillcolor="',color,'"',
		' coordsize="',width,' ',height,'"',
		' style="overflow:hidden;position:absolute;left:0px;top:0px;width:',width,'px;height:',height,'px;"',
		' path="',path,'e">',
		//<div style="position:absolute;left:-5px;top:0px;width:10px;width:10px;background:blue"></div>',
		'</v:shape>');
	return buf.join('')
}
function buildRoundRect(x,y,w,h,
			tlh,tlv,trh,trv,brh,brv,blh,blv){
	var buf = ['m',x,',',y+tlv];
	if(tlh){//&&tlv
		buf.push('qy',x+tlh,',',y);
	}
	buf.push('l',x+w-trh,',',y);
	if(trh){//&&trv
		buf.push('qx',x+w,',',y+trv);
	}
	buf.push('l',x+w,',',y+h-brv);
	if(brh){//&&brv
		buf.push('qy',x+w-brh,',',y+h);
	}
	buf.push('l',x+blh,',',y+h);
	if(blh){//&&brv
		buf.push('qx',x,',',y+h-blv);
	}
	buf.push('x');
	return buf.join('')
}
function buildInnerArgs(box,border){
//x,y,w,h,
	var nb = box.concat();
	nb[0] +=border[3];///2
	nb[1] +=border[0];
	nb[2] -=(border[1]+border[3]);
	nb[3] -=(border[0]+border[2]);
/// tlh,tlv,trh,trv, 
	nb[4] -= Math.min(border[3],nb[4]);
	nb[5] -= Math.min(border[0],nb[5]);
	nb[6] -= Math.min(border[1],nb[6]);
	nb[7] -= Math.min(border[0],nb[7]);
//brh,brv,blh,blv
	nb[8] -= Math.min(border[1],nb[8]);
	nb[9] -= Math.min(border[2],nb[9]);
	nb[10]-= Math.min(border[3],nb[10]);
	nb[11]-= Math.min(border[2],nb[11]);
//	*/
	return nb;
}

exports.boxPlugin = boxPlugin;
}],"cs/lib/runtime/updater-ref":[function(require,exports){var totalRelations = [];
var refPlugin = {
	id:'update-ref',
	parentId:'update',
	config:function(style){
		var refs = style['ref-classes']
		if(refs){
			totalRelations.push.apply(totalRelations,refs.split(','))
		}
	},
	update:function(el,config,v,inc){
		if(inc%4){return}
		var refs = getRefs(el);
		var refClasses = config.refClasses0 || '';
		var newRef = refs.join('__ ref-');
		if(refClasses != newRef){
			var className = el.className;
			config.refClasses0 = newRef;
			//remove
			if(refClasses){
				className = className.replace(/(?:^|\s)ref-\S+?__(?=\s|$)/g,' ').replace(/^\s+|\s+$/g,'');
			}
			el.className = className + " ref-"+newRef+'__';
		}
	}
}
function getRefs(el){
	var buf = [];
	var i = totalRelations.length;
	var style = el.currentStyle;
	while(i--){
		var ref_ = totalRelations[i];
		if(ref_ == 'empty'){
			if(!el.firstChild){
				buf.push(ref_);
			}
		}else if(style['cs-ref-'+ref_]){
			var target = 'cs-target-'+ref_;//.toLowerCase();
			var type = ref_.substr(0,ref_.indexOf('-'));
			switch(type){
			case 'child':
				if(el.parentNode.currentStyle[target]){
					buf.push(ref_);
				}
				break;
			case 'gs':
			case 'as':
				var pre =el;
				while(pre= pre.previousSibling){
					if(pre.nodeType === 1){
						if(pre.currentStyle[target]){
							buf.push(ref_);
							break;
						}else{
							if(type === 'as'){
								break;
							}
						}
					}
				}
				break;
			case 'not':
				if(!el.currentStyle[target]){
					//if(el.id=="t")setTimeout(function(){confirm([target,el.currentStyle[target]])},1000)
					buf.push(ref_);
				}
			}
		}
	}
	return buf;
}

exports.refPlugin = refPlugin;

}],"cs/lib/runtime/element":[function(require,exports){exports.ElementExtension = ElementExtension;
var elementCached = {};
var Filter = require('./filter').Filter
var AdditionManager = require('./addition').AdditionManager
function ElementExtension(el){
	if(el){
		var id = el.uniqueID || el;
		var f = elementCached[id];
		if(!f){
			f = elementCached[id] = new ElementExtension();
			f.id = id
			f.config = {};
		}
		return f;
	}
}
function addition(ee){
	return  ee.addition ||(ee.addition= new AdditionManager(ee.id));
}
ElementExtension.prototype = {
	setBefore:function(content){
		addition(this).setContent(content,true)
	},
	setAfter:function(content){
		addition(this).setContent(content)
	},
	setBoxShadow:function(shadow){
		addition(this).setBoxShadow(shadow)
	},
	setBorderRadius:function(){
		addition(this).setBorderRadius(content)
	},
	setBorderImage:function(){
		addition(this).setBorderImage(content)
	},
	setBackground:function(){
		addition(this).setBackground(content)
	},
	setRgba:function(rgba){
		var f = this.filter ||(this.filter= new Filter(this.id));
		f.update('rgba',rgba);
		return this;
	},
	setFilter:function(filter){
		var f = this.filter ||(this.filter= new Filter(this.id));
		f.update(filter.replace(/\(.*/,''),filter);
		return this;
	},
	setOpacity:function(opacity){
		var f = this.filter ||(this.filter= new Filter(this.id));
		f.update('opacity',opacity)
		return this;
	},
	setAlphaPng:function(alphaPng){
		var f = this.filter ||(this.filter= new Filter(this.id));
		f.update('alphaPng',alphaPng)
		return this;
	},
	setGradient:function(gradient){
		var f = this.filter ||(this.filter= new Filter(this.id));
		if(gradient){
			var type = gradient.shift();
			if(type == 'linear'){
				f.update('gradient',gradient)
			}
		}else{
			f.update('gradient',null)
		}
		return this;
	},
	setTransform:function(matrix){
		var f = this.filter ||(this.filter= new Filter(this.id));
		f.update('transform',matrix)
		var el = document.all[this.id]
		var rs = el.runtimeStyle;
		var cs = el.currentStyle;
		var config = this.config;
		var oldOffset = config.csTransformOffset || [0,0];
		setTimeout(function(){
			if(matrix){
				var x = +matrix[4];
				var y = +matrix[5];
				var rsw = rs.width ;
				var rsh = rs.height;
				if(rsw || rsh){
					rs.width = rs.height = '';
				}
				var offsetLeft = parseInt(x+(el.clientWidth - el.offsetWidth) / 2);
				var offsetTop = parseInt(y+(el.clientHeight - el.offsetHeight) / 2);
//					rs.marginLeft = rs.posLeft - oldOffset[0] + offsetLeft + 'px';
//					rs.marginTop = rs.posTop - oldOffset[1] + offsetTop + 'px'; 
				var h = offsetLeft-oldOffset[0] 
				var v = offsetTop-oldOffset[1] 
				rs.marginLeft = (parseInt(cs.marginLeft)||0) +h+ 'px';
				rs.marginRight = (parseInt(cs.marginRight)||0) +h+ 'px';
				rs.marginTop = (parseInt(cs.marginTop)||0) +v+ 'px'; 
				rs.marginBottom = (parseInt(cs.marginBottom)||0) +v+ 'px'; 
				//rs.position='relative';
//					rs.posLeft = rs.posLeft - oldOffset[0] + offsetLeft;
//					rs.posTop = rs.posTop - oldOffset[1] + offsetTop;
				//console.log([rs.marginLeft,rs.marginTop],[x,y,offsetLeft,offsetTop],'\n',el.clientWidth - el.offsetWidth)
				config.csTransformOffset = [offsetLeft,offsetTop];
				if(rsw || rsh){
					rs.width = rsw
					rs.height = rsh;
				}
			}else{
//					rs.marginLeft = rs.posLeft - oldOffset[0]+'px';
//					rs.marginTop = rs.posTop - oldOffset[1]+'px'; 
				
				rs.marginLeft = (parseInt(cs.marginLeft)||0) - oldOffset[0]+'px';
				rs.marginRight = (parseInt(cs.marginRight)||0) - oldOffset[0]+'px';
				rs.marginTop = (parseInt(cs.marginTop)||0) - oldOffset[1]+'px'; 
				rs.marginBottom = (parseInt(cs.marginBottom)||0) - oldOffset[1]+'px'; 
				oldOffset[0]=oldOffset[1] = 0;
				//console.log(oldOffset)
			}
			rs = el = null;
		},0);
	}
}

}],"cs/lib/runtime/plugin-muti-class":[function(require,exports){var configListener = require('./property-listener').configListener
var setupListener = require('./property-listener').setupListener
var mutiClassPlugin = {//multi-classes plugin
	id:'mc',
	config:function(style){
		addMutiClassesConfig(style.getAttribute('muti-classes'));
		configListener('mc', classUpdaterMap);
	},
	update:function(el){//可选
		//css apply 时执行
		setupListener('mc', el);
		updateClasses(el,el.className,true)
	}
	//update:function
	//dispose:function(el)
}
var tracePC = true;
var mutiClassMap = {};
var classUpdaterMap = {'className':function(el){
	if(tracePC){
		updateClasses(el,el.className,true)
	}
}};
/**
 * classMap
 * key3:[[key1,key2,key3],[key0,key3]]
 */
function updateClasses(el,cs,reset){
	if(reset){
		cs = resetClass(cs);
	}
	if(el.className != cs){
		tracePC = false;
		//console.log(el.className,'\n\n',cs)
		el.className = cs;
		tracePC = true;
	}
	return cs;
}

function resetClass(className){
	var cm = mutiClassMap;
	if(className.match(/\S\s+\S/)){
		var cs = className.replace(/\S*\-\-\S*/g,'').replace(/^\s+|\s+$/g,'').split(/\s+/);
		cs.sort();
//		console.log('3',cs)
		var i = cs.length;
//		console.log(i,cs)
		while(i-->0){
			var c = cs[i];
			//console.log(cm['classB']);
			if(i && (c in cm)){
				var list = cm[c];
				
				var l = list.length;
				next:while(l-->0){//一个组合class
					var ms = list[l];
					var mi = ms.length-1;
					var k = i;
					while(mi--){//一个class
						var mc = ms[mi];
						while(true){
							if(k-->0){
								if(cs[k] === mc){break;}
							}else{
								continue next;
							}
						}
					}
					cs.push(ms.join('--'))
				}
			}
		}
		//console.log('\n^',className,'$\n\n',cs.join(','))
		className = cs.join(' ');
//		console.log('end1 class update:',(new Date - t))

//		console.log('4',cs)
	}
	return className;
}




function addMutiClassesConfig(value){//ie6 only
	if(value){
		value = value.split(/\s*,\s*/);
		var len = value.length;
		while(len--){
			var cs = value[len].split('--');
			var last = cs[cs.length-1];
			var list = mutiClassMap[last] ;
			list && list.push(cs)|| (mutiClassMap[last]=[cs])
			//console.log(mutiClassMap[last])
		}
	}
}



//IE6 支持多class hack
exports.mutiClassPlugin = mutiClassPlugin;
exports.updateClasses = updateClasses;

}],"cs/lib/runtime/updater-fixed":[function(require,exports){var fixedPlugin = {
	id:'position-fixed',
	config:function(style){
	},
	update:function(el,config,fixed,inc){
		//try{
		if(fixed){
			
			switch(scrolled){
			case -1:
//				var b = document.body;
				window.attachEvent('onscroll',onscroll)
				window.attachEvent('onresize',onscroll)
//				b.parentNode.attachEvent('onscroll',onscroll);
				scrolled = 1;
			default:
				if(scrolled){
					scrolled--;
				}else if(inc%10){
					return;
				}
				resetFixed(el,config);
				
				config.positionFix = true;
			}
		}else if(config.positionFix){
			var runtimeStyle = el.runtimeStyle;
			runtimeStyle.top = runtimeStyle.right = runtimeStyle.bottom = runtimeStyle.left = ''
		}
		//}catch(e){console.log(e.message)}
	}
}
var scrolled = -1;
function onscroll(){
	scrolled = 3
}
//function initEvent(el){
////	while(el = el.offsetParent){
////		attachEvent('onscroll',onscroll)
////	}
//}
//document.write('<div id="x" style="position:absolute;top:300px"></div>')
//document.title = "aaa";
//document.documentElement.attachEvent('onscroll',onscroll)
//var inc = 0;
//function onscroll(){
//	x.innerHTML = inc++;
//	//gfix && resetFixed.apply(null,gfix)
//}
function resetFixed(el,config){
	var rootRect;
	var rect = el.getBoundingClientRect();
	var currentStyle = el.currentStyle;
	var runtimeStyle = el.runtimeStyle;
	//alert(el.tagName)
	fix('top') || fix('bottom',true);
	fix('left') || fix('right',true);
	function fix(key,rev){
		try{
		var currentValue = parseInt(currentStyle[key]);
		var rectValue = rect[key];
		if(rev){
			rootRect = rootRect || document.documentElement.getBoundingClientRect();
			rectValue = rootRect[key]-19 -rectValue;
			//if(key == 'bottom')console.log(currentValue,rectValue)
		}
		if(!isNaN(currentValue)){
			runtimeStyle[key] = '';
			var fixValue = parseInt(currentStyle[key]);
			if(!isNaN(fixValue)){
				runtimeStyle[key] = currentValue + (fixValue- rectValue)  + 'px'
				return true;
			}
			
		}
		}catch(e){console.log(e.message,currentValue,[fixValue,rectValue])}
		
	}
}

exports.fixedPlugin = fixedPlugin;

}],"cs/lib/runtime/plugin-dynamic-class":[function(require,exports){var updateClasses = require('./plugin-muti-class').updateClasses;
var dynamicClassPlugin = {
	id:'dc',//dynamic pseudo-classes plugin
	update:function(el){//ie7
		el.attachEvent('onmousedown',dpcActive);
		el.attachEvent('onfocus',dpcFocus);
	}
}

var dpcFocus = dpcEvent('focus__','onfocus','onblur');
var dpcActive = dpcEvent('active__','onmousedown','onmouseup','onmouseout');
//ie6
var ie6 = navigator.userAgent.indexOf('; MSIE 6')>0 ;
if(ie6){
	var dpcHover = dpcEvent('hover__','onmouseenter','onmouseleave');
	dynamicClassPlugin.update = function(el){
		el.attachEvent('onmouseenter',dpcHover);
		el.attachEvent('onmousedown',dpcActive);
		el.attachEvent('onfocus',dpcFocus);
	}
}else{
	updateClasses = function(el,className){
		el.className = className;
	}
}
//处理三大动态交互伪类
function dpcEvent(className,enterEvent,exitEvent,exitEvent2){
	function onstart(){
		var el = event.srcElement;
		el.detachEvent(enterEvent,onstart)
		el.attachEvent(enterEvent,onenter);
		el.attachEvent(exitEvent,onexit);
		if(exitEvent2){
			el.attachEvent(exitEvent2,onexit);
		}
		onenter();
	}
	function onenter(){
		var el = event.srcElement
		updateClasses(el,el.className +' '+ className, true);
	}
	var removePattern = new RegExp(
		"(?:^|\\s+)(?:\\S+--)?"+
		className+
		"(?:--\\S+)?(?=\\s|$)",'g')
	function onexit(){
		_removeClassByPattern(event.srcElement,removePattern);
	}
	return onstart;
}


function _removeClassByPattern(el,pattern){
	var c = el.className.replace(pattern,'').replace(/^\s+/,'');
	updateClasses(el,c, false);
}

//IE6 支持多class hack
exports.dynamicClassPlugin = dynamicClassPlugin;

}],"cs/lib/runtime/plugin-attr":[function(require,exports){var updateClasses = require('./plugin-muti-class').updateClasses;
var configListener = require('./property-listener').configListener
var setupListener = require('./property-listener').setupListener
var ieVersion = this.navigator && navigator.userAgent.replace(/^.*(?:; MSIE ([6-9])).*$|.*/,'$1')
var attributePlugin = {
	id:'attr',
	config:function(style){
		addAttriClassesConfig(style.getAttribute('attr-classes'));
		configListener('attr',attributeUpdaterMap);
		console.dir(attributeUpdaterMap)
		//console.log('!!!!!!!!',style.getAttribute('attr-classes'))
	},
	update:function(el){//可选
		setupListener('attr',el);
		switch(ieVersion){
		case '5':
		case '6':
			//console.log(attributeUpdaterMap)
			var out=[el.className]//初始化不需要清理已有。
			for(var attr in attrClassMap){
				var map = attrClassMap[attr];
				applyClass(map,'attr-',el,attr,out);
			}
			updateClasses(el,out.join(' '),true)
			break
		case '7':
		case '8':
			el.className = el.className;
			//console.log(el.className)
		}
		//el.attachEvent('onpropertychange',attrListener);
	}
}
var attrClassMap = {};
var attributeUpdaterMap={};



/* ============= impl util =============== */
function toRegSource(s,c){
	return c? '\\u'+(0x10000+c.charCodeAt()).toString(16).substr(1)
			: s.replace(/([^\w_-])/g,toRegSource);
}
function buildAttrCheck(type,value){
	if(value == null){//exist check
		return function(value){return value != null;}
	}
	var pattern = toRegSource(value);
	switch(type){
		case '^':
			pattern = '^'+pattern;
			break;
		case '$':
			pattern = pattern+'$';
		case '*':
			break;
		case '~'://space-separated
			pattern = '(?:^|\\s)'+pattern+'(?:\\s|$)';
			break;
		case '|':////hyphen-separated 
			pattern = '(?:^|\\-)'+pattern+'(?:\\-|$)';
			break;
		default:
			pattern = '^'+pattern+'$';
	}
	pattern = new RegExp(pattern);
	
	return function(value){
		if(value == null){//ie === null not exists
			return false;
		}
		//alert([value,pattern.test(value)])
		return pattern.test(value)
	}
}


/**
 * 
 * '^': '$':
 * '*'://
 * '~'://space-separated
 * '|'://hyphen-separated 
 */
function addAttriClassesConfig(value){//ie6 only
	if(value){
		value = value.split(/\s*,\s*/);
		var len = value.length;
		while(len--){
			var v = value[len];
			decodeURIComponent(v.replace(/_/g,'%')).replace(/^([\w-_]+)([|~*$^])?(?:=([\s\S]*$))?/,function(a,attr,type,value){
				var map = attrClassMap[attr] ;
				var check = buildAttrCheck(type,value);
				if(!map){
					 map = attrClassMap[attr] = {}
				}
				map[v]=check
				attributeUpdaterMap[attr] = attributeUpdater;
			});
		}
	}
}

function attributeUpdater(el,attr){
	//console.log(attr,tracePC)
	var out = [el.className.replace(new RegExp("(^|\\s+)attr-"+
						/*toRegSource(attr)*/attr+//attr 没有正在特殊字符
						"(?:_(?:5E|24|7E|2A|7C|3D)[\\w\\-_]+)?__(?=\\s|$)",'g'),'')];
	var map = attrClassMap[attr] ;
	applyClass(map,'attr-',el,attr,out)
	//if(tracePC){
	if(CS.ieVersion<=6){
		updateClasses(el,out.join(' '),true);
	}else{
		el.className = out.join(' ');
		//console.log('class updated')
		//setTimeout(function(){el.className +='';document.recalc(true);},300);
	}
}

function applyClass(map,prefix,el,attr,out){
	var testValue = /^class$/.test(attr)?el.className:el.getAttribute(attr);
	switch(attr.toLowerCase()){
	case 'checked':
		testValue = !!el.checked;
		break;
	case 'disabled':
		testValue = !!el.disabled;//?'true':'false';
		break;
	case 'class':
		testValue = el.className;
		break;
	//case 'value':
	//	testValue = el.value;
	default:
		var testValue = el.getAttribute(attr);
	}
	//el.hasAttributeNode(attr)
	testValue = testValue === '' ?null:testValue;
	
	for(var c in map){
		if(map[c](testValue)){
			out.push(prefix+c+'__');
		}
	}
}

//IE6 支持多class hack
exports.attributePlugin = attributePlugin;

}],"cs/lib/runtime/plugin-update":[function(require,exports){/* add default update plugin**/

//var FilterManager = require('./filter').FilterManager
var attrPlugin = require("./plugin-attr").attributePlugin
var updatePlugin = {
	id:'update',
//	config:function(style){//可选
//		var i = configPlugins.length;
//		while(i--){
//			configPlugins[i].config(style);
//		}
//	},
	update:function (el,config){
		try{
		var attrFlag = el.currentStyle['cs-plugin-attr']
		if(attrFlag === '1'){
			el.runtimeStyle['cs-plugin-attr'] = '2';
			attrPlugin.update(el)
		}
		elementList.push(el);
		configList.push(config);
		inc = -1;
		el && updateElement(el,config)
		updateInterval || startInterval();
		}catch(e){alert(e)}
	}
}
var deactive = false;
var activeInc = 0;
try{
function active(){
	deactive = false;
}
document.attachEvent('onfocusin',active)
document.attachEvent('onmousemove',active)
document.attachEvent('onfocusout',function(){
	deactive = true;
})
}catch(e){}

//var configPlugins= [];
var changedUpdaterMap = {};
var existedUpdaterMap = {};

var configList = [];
var elementList = []
var updateInterval = null;
var interval = 128;
var inc = -1;
var forceUpdate = false;
function startInterval(){
	if(updateInterval){
		clearInterval(updateInterval);updateInterval = null;
	}
	forceUpdate = true;
	updateTask();
	updateInterval = setInterval(updateTask,interval)
}
//var attrFixInc = 0
function updateTask(){
	if(deactive && 
		activeInc++%32){
		return;
	}
	inc++
	var i = elementList.length;
	var cont = true;
	//try{
	//var t = new Date();
	while(i--){
		var el = elementList[i];
		el && updateElement(el,configList[i]);
	}
//	switch(CS.ieVersion){
//		case '7':
//		case '8':
//		//attribute NOTIFY
//		if(attrFixInc++ % 8 ==0)
//		document.documentElement.className+=''
//		//document.documentElement.offsetTop
//	}
	//t = new Date() -t;
	
	//}catch(e){cont = cont && confirm(e.message);}
	forceUpdate = false;
}
function updateElement(el,config){
	var currentStyle = el.currentStyle;
	var transaction ;
	try{
	if(forceUpdate ||true){//|| currentStyle['cs-alive']!='0'){
		for(var n in existedUpdaterMap){
			var currentValue = currentStyle[n];
			if(currentValue || currentValue != config[n] ){
//				transaction = transaction || FilterManager.start();
				existedUpdaterMap[n].update(el,config,(config[n] = currentValue),inc);
			}
		}
		for(var n in changedUpdaterMap){
			var currentValue = currentStyle[n];
			//if(n == 'transform'){
			//	console.log(currentValue)
			//}
			if(currentValue != config[n]){
//				transaction = transaction || FilterManager.start();
				
				changedUpdaterMap[n].update(el,config,(config[n] = currentValue),inc);
			}
		}
//		transaction && FilterManager.end();

	}
	}catch(e){
		//console.log(el)
		if('cs-reported' in el && el.runtimeStyle){
			el.runtimeStyle['cs-reported']=1;
			console.error('update failed',location,el.outerHTML,n,e.message||e)
		}
		throw e;
	}
}
exports.pluginMap = {
	update:updatePlugin,
	onexist:{
		appendChild:function(impl,styleKey){
			existedUpdaterMap[styleKey] = impl;
//			impl.config && configPlugins.push(impl)
		}
	},
	onchange:{
		appendChild:function(impl,styleKey){
			changedUpdaterMap[styleKey] = impl;
//			impl.config && configPlugins.push(impl)
		}
	}
}

}],"cs/lib/runtime/filter":[function(require,exports){exports.Filter = Filter;

function Filter(id){
	this.id = id
	this.indexMap = {};
	this.valueMap = {};
	this.lastValueMap = {};
}

Filter.prototype = {
	opacity:function(opacity,filter){
		opacity = parseInt(opacity*100+0.5);
		if(filter){
			filter.opacity = opacity
		}else{
			return 'Alpha(opacity:'+opacity+')'
		}
	},
	alphaPng:function(png,filter){
		//image,sizing
		if(filter){
			if(filter.enabled = !!png){
				filter.src = png;
			}
			
		}
		return "AlphaImageLoader(src='"+png+"', enabled="+!!png+",sizingMethod='crop')";
	},
	transform:function(m,filter){
		if(filter){
			if(m){
				filter.M11 = m[0];
				filter.M12 = m[2];
				filter.M21 = m[1];
				filter.M22 = m[3];
				filter.Enabled = true;
			}else{
				filter.Enabled = false;
			}
		}else if(m){
			//alert("Matrix(M11="+m[0]+",M12="+m[2]+",M21="+m[1]+",M22="+m[3]+",SizingMethod='auto expand')")
			return "Matrix(M11="+m[0]+",M12="+m[2]+",M21="+m[1]+",M22="+m[3]+",SizingMethod='auto expand')"
		}else{
			//alert("Matrix(M11=0,M12=0,M21=0,M22=0,SizingMethod='auto expand' enabled='false')")
			return "Matrix(SizingMethod='auto expand' enabled='false')"
		}
		
	},
	
	rgba:function(rgba,filter){
		//console.log('#rgba',rgba)
		return this.gradient(rgba && [0,rgba,rgba],filter)
	},
	//only for linear-gradient(180deg, yellow, blue);
	gradient:function(match,filter){
		//linear-gradient(180deg, yellow, blue);
		// /\d(?=deg,)|#?\w+(?=,\))/
		//var match = /^linear-gradient\((\d+)deg\s*,\s*(#?[\w]+)\s*,\s*(#?[\w]+)\)$/i.exec(linearGradien);
		if(match){
			var deg = +match[0]+135;
			var step = parseInt(deg/180);
			var type = parseInt(deg/90)%2;
			//var colors = match
			match = match.slice(1)
			if(step%2){
				match.reverse();
			}
			if(filter){
				//console.log('filter:')
				filter.gradientType = type;
				filter.startColorstr = match[0];
				filter.endColorstr = match[1];
				filter.Enabled = true;
				
				//console.log("Gradient(gradientType="+type+",startColorStr="+match[0]+",endColorStr="+match[1]+")" )
			
			}else{
				//console.log("Gradient(gradientType="+type+",startColorStr="+match[0]+",endColorStr="+match[1]+")" )
			
				return "Gradient(gradientType="+type+",startColorStr="+match[0]+",endColorStr="+match[1]+",enabled=true)" ;
			}
		}else{
			//console.log('no gradient')
			if(filter){
				filter.Enabled = false;
			}else{
				return "Gradient(enabled=false)";
			}
		}
	},
	update:function(key,value){
		//if(transaction){transaction[this.id] = this;return }
		var valueMap = this.valueMap;
		var indexMap = this.indexMap;
		var lastValueMap = this.lastValueMap;
		var newFilter ;
		var el = document.all[this.id];
		if(key){
			newFilter = initFilter(this,el,key,value,indexMap,lastValueMap)
			valueMap[key] = value;
		}else{
			for(key in valueMap){
				if(initFilter(this,el,key,valueMap[key],indexMap,lastValueMap)){
					newFilter = true;
					break;
				}
			}
		}

		if(newFilter){
			var updated = [];
			var style = el.runtimeStyle;
			for(var key in valueMap){
				var fn = this[key];
				var value=valueMap[key];
				lastValueMap[key]=[].concat(value).join('');
				indexMap[key] = updated.length;
				updated.push('progid:DXImageTransform.Microsoft.'+(fn?fn.call(this, value):value));
			}
			if(!el.currentStyle.hasLayout){
				style.zoom = 1;
			}
			style.filter = updated.join('\n')
			//console.log('filter:',updated.length,style.filter)
		}
	}
}
function initFilter(thiz,el,key,value,indexMap,lastValueMap){
	if(key in indexMap){
		var code = [].concat(value).join('')
		if(lastValueMap[key] != code){
			//add key,index,value
			lastValueMap[key] = code
			var filter = el.filters[indexMap[key]];
			
			//console.log('filter:',key,value)
			if(thiz[key]){
				value = thiz[key](value, filter);
			}else{
				while(key = /(\w+)\s*=['"\s]*([^,'"]*)['"]*/g.exec(value)){
					filter[key[1]] = key[2];
				}
			}
		}
	}else{
		return true;
	}
}
}],"cs/lib/runtime/addition":[function(require,exports){function AdditionManager(id){this.id = id}
function returnFalse(){return false}
AdditionManager.prototype = {
	setContent:function(content,before){
		var el = document.all[this.id];
		content = window.eval(content.replace(/\r\n?|\n/g,'\\r\\n'));
		el = before?
				addition(el,'cs-addition-before',beforeHTML,true):
				addition(el,'cs-addition-after',afterHTML);
		el.onselectstart = returnFalse;
		//el.oncopy = function(){return false}
		try{
			while(el.firstChild){el.removeChild(el.firstChild);}
			el.appendChild(document.createTextNode(content))
		}catch(e){
			el.innerHTML = content;
		}
	},
	setBoxShadow:function(shadow){
		var args;
		var result = [];
		(','+shadow).replace(/(-?[\d]+)(?:px)?|(#\w+)|inset|,/ig,function(a,px,color){
			if(px){
				args.push(parseInt(px)||0);
			}else if(color){
				args[1] = a;
			}else if(a == 'inset'){//insert
				args[0] = true;
			}else if(a == ','){
				args = [false,'#000']
				result.push(args);
			}
		})
		
		var el = document.all[this.id];
		var el = bg(el);
//		var shadow = el.firstChild;//radius;
//		while(var i = 0;i<result.length;i++){}
		var shadowEl = el.lastChild;//radius;
		while(args.length<6){
			args.push(0)
		}
		args.unshift(shadowEl,el.offsetWidth,el.offsetHeight)
		setupShadow.apply(null,args)
		
	},
	setBorderRadius:function(){
		
	},
	setBackground:function(){
		
	},
	setBorderImage:function(){
		
	}
}
function setupShadow(el,width,height,inset,color,right,bottom,radius,extension){
	var style = el.style;
	var filter = el.filters[0];
	//172142false#0001010100
	//console.log(width,height,inset,color,right,bottom,radius,extension)
	style.left = right-extension-radius+'px';
	style.top = bottom-extension-radius+'px';
	
	style.width = width + extension*2+'px';
	style.height = height + extension*2+'px';
	style.backgroundColor = color;
	if(window.radius != radius){
		window.radius = radius;
		//console.log(radius)
	}
	if(radius){//radius.filter
		filter.Enabled = true;
		filter.PixelRadius = radius;
	}else{
		if(filter.Enabled){
			filter.Enabled = false;
			//console.log(filter.Enabled)
		}
	}
}
		

var beforeHTML = '<cs:content class="before__"></cs:content>';
var afterHTML = '<cs:content class="after__"></cs:content>';
var bgHTML = '<cs:bg style="margin:0;padding:0;border:0;position:absolute;display:inline-block;z-index:-1">' +
					
//var bgInnerHTML = 
					+'<cs:radius style="margin:0;padding:0;border:0;position:absolute;display:block;"/>' +
					'<cs:shadow style="margin:0;padding:0;border:0;position:absolute;display:block;filter:progid:DXImageTransform.Microsoft.Blur(enabled=false)"/>'
				+'</cs:bg>'
var inc = 0;
function addition(el,key,html,before,inner){
	var aid = el.runtimeStyle[key];
	var ael = aid && document.all[aid];
	if(ael == null){
		//el.style.display='block'
		el.runtimeStyle[key] = true;
		el.insertAdjacentHTML(before?'afterBegin':'beforeEnd',html)
//		if(inc++<10)console.log(el.tagName,html)
		ael = before ? el.firstChild:el.lastChild;
//		ael = document.createElement(html);
//		if(inc++<10)console.log(4,el.tagName,el.outerHTML)
//		el.insertBefore(ael,before?el.firstChild:null);
//		if(inc++<10)console.log(5,el.tagName,el.outerHTML)
//		//console.error('?',ael.innerHTML)
//		inner && (ael.innerHTML = inner);
//		if(inc++<13)console.error('6',ael.innerHTML)
		el.runtimeStyle[key] = ael.uniqueID;
	}
	return ael;
}
function bg(el){
	var bg = addition(el,'cs-addition-bg',bgHTML);
	var ps = el.currentStyle;
	var bs = bg.style;
	var rect = el.getBoundingClientRect();
	if(el === bg.offsetParent){
		bs.top = 0;
		bs.left = 0;
	}else{
		var scrollTop = document.documentElement.scrollTop;
		var scrollLeft = document.documentElement.scrollLeft;
		bs.pixelLeft = rect.left-2+scrollLeft;
		bs.pixelTop = rect.top-2+scrollTop;
	}
	bs.border = "1px solid red"
	bs.pixelHeight = rect.bottom- rect.top;
	bs.pixelWidth = rect.right- rect.left;
	return bg;
}
exports.AdditionManager = AdditionManager;

}],"cs/lib/runtime/property-listener":[function(require,exports){var pluginListenerMap = {}
function setupListener(pid,el){
	var style = el.runtimeStyle;
	if(pluginListenerMap[pid] && !style['cs-propertychange']){
		style['cs-propertychange'] = 1;
		el.attachEvent('onpropertychange',propertyListener)
		//console.log(el.tagName)
	}
}
function configListener(pid,propertyListenerMap){
	if(propertyListenerMap){
		pluginListenerMap[pid] = propertyListenerMap;
	}
}
function propertyListener(){
	var el = event.srcElement;
	var attr = event.propertyName;
	if('opacity' == attr || 'style.opacity' == attr){//el.runtimeStyle.opacity changed
		//el.runtimeStyle.filter = 'Alpha(opacity='+parseInt(el.currentStyle.opacity * 100)+')'
		//console.log(el.runtimeStyle.filter)
		return;
	}
	for(var pid in pluginListenerMap){
		var m = pluginListenerMap[pid]
		if(m[attr] && el.runtimeStyle['cs-plugin-'+pid]){
			//console.log(m[attr])
			m[attr](el,attr)
		}
	}
}
exports.setupListener = setupListener;
exports.configListener = configListener;

}]});
//兼容 IE console 缺失的情况
if(!this.console || !console.dir){
	console = this.console || {
		popup:1,
		log:function(){
			this.data.push([].join.call(arguments,' '))>32 && this.data.shift();
			this.popup = this.popup && confirm(this.data)
		},
		show:function(){alert(this.data.join('\n'))},
		data:[]//cache ie data; add log view link: javascript:console.show())
	};
	console.warn || "trace,debug,info,warn,error".replace(/\w+/g,function(n){
		console[n] = function(){
			arguments[0] = n + ':' + arguments[0]
			this.log.apply(this,arguments);
		}
	});
	console.dir = function(o){for(var n in o){console.log(n,o[n]);}}
	console.time = console.time || function(l){this['#'+l] = +new Date}
	console.timeEnd = console.timeEnd || function(l){console.log(l + (new Date-this['#'+l]));}
	console.assert = console.assert || function(l){if(!l){console.error('Assert Failed!!!')}}
}

var CS = require('cs/lib/runtime/index').CS;CS.config();
