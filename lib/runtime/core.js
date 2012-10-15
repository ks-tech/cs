var pluginMap = require('./plugin-update').pluginMap
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
			var parentPlugin = pluginMap[parentId];
			parentPlugin.appendChild(impl,args)
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