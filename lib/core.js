var pluginRuntimeMap = {}
var styleSheetInfos = [];
var pplm = {};
var cpid ;
var CS = {
	perfix : '-ie6-',
	init: function(){
		var styleSheets = document.styleSheets;
		var i = styleSheets.length;
		while(i-->styleSheetInfos.length){
			var s = styleSheets[i].rules;
			var s = s[s.length-1]
			styleSheetInfos.push(s)
			if(s.selectorText.toLowerCase() == 'head cs-config'){
				for(var n in pluginRuntimeMap){
					cpid = n;
					n = pluginRuntimeMap[n];
					if(n.config){
						n.config(s.style)
					}
				}
			}
		}
	},
	setup: function(pid,el){
		var plugin = pluginRuntimeMap[pid];
		if(plugin){
			var ep = plugin.expression;
			var rts  = el.runtimeStyle;
			var key = 'cs-plugin-'+pid;
			if(ep){
				//if(inc++>1)测试一下
				rts[ep] =  el.currentStyle[ep]||el.parentNode.currentStyle[ep];
				if(rts[key]){
					console.error('插件:'+pid+'被多次初始化了'+rts[key])
					return;
				}
				rts[key] = 1;
			}
			plugin.setup && plugin.setup(el,plugin.visit && traceElement(el,plugin));
			if(pplm[pid] && !rts['cs-onpropertychange']){
				rts['cs-onpropertychange'] = 1;
				el.attachEvent('onpropertychange',propertyListener)
				//console.log(el.tagName)
			}
			//console.log(key,el.tagName,!!pplm[pid])
		}
	},
	addPlugin : function(impl){
		pluginRuntimeMap[impl.id] = impl;
	},
	setPropertyListener : function(listenerMap){
		var buf = [cpid] 
		for(var n in arguments[0]){
			buf.push(n)
		}
		console.log(buf)
		pplm[cpid] = listenerMap;
	},
	update : function(){
		if(traceInterval){
			clearInterval(traceInterval);traceInterval = null;
		}
		traceInterval = setInterval(update,250)
		update();
	}
}
var traceMap = {};
var traceInterval = null;
//var classPattern = /[\w\-_]*[^\s\-_](?=\s|$)/g
//var focusPattern = /^(INPUT|TEXTAREA|SELECT|BUTTON)$/
function traceElement(el,plugin){
	var pid = plugin.id;
	var uniqueID = el.uniqueID;
	var traceInfo = traceMap[uniqueID];
	var pluginConfig = {};
	if(!traceInfo){
		traceInfo = traceMap[uniqueID] = {node:el,config:{},plugins:[]}
	}
	if(!traceInfo.config[pid]){
		traceInfo.config[pid] = pluginConfig;
		traceInfo.plugins.push(pluginRuntimeMap[pid]);
	}else{
		pluginConfig = traceInfo.config[pid];
	}
	
	if(!traceInterval){
		traceInterval = setInterval(update,50)
	}
	return pluginConfig;
}
function update(){
	for(var n in traceMap){
		var ti = traceMap[n];
		var plugins = ti.plugins;
		var i = plugins.length
		while(i--){
			var p = plugins[i];
			p.visit(ti.node,ti.config[p.id])
		}
	}
}
//function css(url){
//	var l = document.createElement('link');
//	l.setAttribute( 'rel',"stylesheet");
//	l.setAttribute('type',"text/css");
//	l.setAttribute('href',$JSI.realpath(url).replace(/__define__.js$/,'.css'));
//	document.scripts[0].parentNode.appendChild(l);
//}

/*--------------- utils ----------*/

function propertyListener(){
	var el = event.srcElement;
	var attr = event.propertyName;
	if('opacity' == attr || 'style.opacity' == attr){//el.runtimeStyle.opacity changed
		//el.runtimeStyle.filter = 'Alpha(opacity='+parseInt(el.currentStyle.opacity * 100)+')'
		//console.log(el.runtimeStyle.filter)
		return;
	}
	for(var pid in pplm){
		var m = pplm[pid]
		if(m[attr] && el.runtimeStyle['cs-plugin-'+pid]){
			m[attr](el,attr)
		}
	}
}



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