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