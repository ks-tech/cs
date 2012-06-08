var pluginMap = require('./plugin-update').pluginMap
var styleInfos = [];
var setupKeyMap = {
	mc:'textKashida',
	dc:'textKashidaSpace',
	attr:'pageBreakBefore',
	//nth:'pageBreakAfter',//merge to update 
	//child:'textUnderlinePosition',//merge to update //'tableLayout',//table 不太可能作为父节点把？
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
}
CS.config= function(){
	var styleSheets = document.styleSheets;
	var i = styleSheets.length;
	while(i-->styleInfos.length){
		var s = styleSheets[i].rules;
		if(s){
			s = s[s.length-1]
			styleInfos.push(s)
			if(s.selectorText.toLowerCase() == 'head cs-config'){
				for(var n in pluginMap){
					var plugin = pluginMap[n];
					if(plugin.config){
						plugin.config(s.style,n);
					}
				}
			}
		}
	}
}

CS.link = function(href,extAttr){
	href = href.replace(/[^\-][^\/]+$/,uar);
	var l = ['<link rel="stylesheet" type="text/css" onload="CS.config()" href="',href,'" ',extAttr];
	document.write(l.join(''))
	return this;
}
CS.addPlugin = function(impl,parentId,args){
	if(parentId){
		var parentPlugin = pluginMap[parentId];
		parentPlugin.appendChild(impl,args)
	}
	pluginMap[impl.id] = impl;
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