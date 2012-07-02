var FS = require('fs');
var CSSOM = require('cssom');
var DOMParser = require('xmldom').DOMParser
var normalizeColor = require('./color-parser.js').normalizeColor;
var compilersMap= {};
var cssFileInc = 0;
exports.setupCS = setupCS;
exports.addCompiler = addCompiler


function addCompiler(prefix,impl){
	var impls = compilersMap[prefix];
	if(impls){
		impls.push(impl)
	}else{
		compilersMap[prefix] = [impl]
	}
}

function toRegExp(pattern,default_){
	if(pattern){
		if(pattern == true || typeof pattern == 'number'){
			pattern = default_;// /\.html?$/i;
		}else if(typeof pattern == 'string'){
			pattern = new RegExp(pattern);
		}
		if(pattern instanceof RegExp){
			return pattern;
		}
	}
}
/**
var s = document.body.style
s.textIndent = 20;
s.text = body.parentNode.style.getAttribute('text');
alert(s.text)
alert(s.textIndent)
 */
function setupCS(rbs, cssPattern, htmlPattern, scriptPath, htcPath){
	cssPattern = toRegExp(cssPattern)||/\.css$/i;
	htmlPattern = toRegExp(htmlPattern,/\.html?/i);
	scriptPath = scriptPath || '/static/cs.js';
	rbs.config.cs = {
		scriptPath:scriptPath,
		htcPath: htcPath || scriptPath.replace(/[^\/]*$/,'cs.htc')
	}
	if(htmlPattern){
		//
		rbs.addTextFilter(htmlPattern,function(resource,text){
			var sp = rbs.config.cs.scriptPath;
			return htmlFilter(text,sp);
		})
	}
	//文件关系预处理 （@import @media）
	rbs.addDOMBuilder(cssPattern,function cssomBuilder(resource,text){
		resource.cs = {config :{},cache:{},htcPath:rbs.config.cs.htcPath};
		//标准化 color
		
		text = normalizeColor(text)
		var dom = CSSOM.parse(text);
		//TODO:（@import @media）
		//walkRules(resource,cssom,function(){})
		return dom;

	});
	//内容预处理
	rbs.addDOMFilter(cssPattern,function(resource,cssom){
		var path = resource.path;
		var prefix = resource.prefix;
		var compilers = compilersMap[prefix] || [];
		function compilerFilter(resource,parentNode,rule,index){
			var len = compilers.length;
			for(var i=0;i<len;i++){
				compilers[i](resource,parentNode,rule,index)
			}
		}
		walkRules(resource,cssom,compilerFilter);
		if(prefix.match(/^-ie/)){
			var buf = ['head cs-config{cs-id:',+new Date()+cssFileInc++,";"];
			var csConfig = resource.cs.config
			for(var n in csConfig){
				buf.push(n,':',csConfig[n],';')
			}
			buf.push('}')
			cssom.insertRule(buf.join(''),cssom.cssRules.length)
		}
		return cssom;
	})
	//内容序列化
	rbs.addSerializer(cssPattern,function(resource,data){
		return data && data.toString();
	});
}
function htmlFilter(text,scriptImpl){
	var needImpl = true;
	return text.replace(/<script\b[^>]*\/>|<script\b[^>]*>[\s\S]*?<\/script>|((?:<!--[\s\S]*?-->|<link\s+[\s\S]+?>)(?:\s+|<!--[\s\S]*?-->|<link\s+[\s\S]+?>)*)/g,function(a,links){
		if(links){
			links.replace(/<!--[\s\S]*?-->/g,'');
			var domParser = new DOMParser();
			var nodeList = domParser.parseFromString('<html>'+links+'</html>','text/html').documentElement.childNodes;
			var cssLinks = [];
			var otherLinks = [];
			for(var i = 0;i<nodeList.length;i++){
				var el = nodeList.item(i);
				if(el.nodeType==1){
					var attrs = el.attributes;
					var href;
					var extAttrs = [];
					var isCSS = false;
					for(var j=0;j<attrs.length;j++){
						var attr = attrs[j];
						var n = attr.name;
						var v = attr.value;
						if(/^(href|rel|type)$/i.test(n)){
							n = n.toLowerCase();
							if(n == 'href'){
								href = v;
							}else if(!isCSS){
								isCSS = n == 'rel' && /^stylesheet$/i.test(v)
										||  n == 'type'&&/\/css/i.test(v);
							}
						}else{
							extAttrs.push(attr)
						}
					}
					if(isCSS){
						cssLinks.push('.link(',JSON.stringify(href));
						if(extAttrs.length){
							cssLinks.push(',',JSON.stringify(extAttrs.join('')))
						}
						cssLinks.push(')')
					}else{
						otherLinks.push(el)
					}
				}
			}
			if(cssLinks.length){
				if(needImpl){
					needImpl = false;
					otherLinks.push('<script src="'+scriptImpl+'"></script>');
				}
				otherLinks.push('<script>CS'+cssLinks.join('').replace(/\)\.link\(/g,')</script><script>CS.link(')+'</script>')
			}
			return otherLinks.join('\n')
		}else{
			if(a.lastIndexOf(scriptImpl,a.indexOf('>'))>0){
				needImpl = false;
				return '';
			}
			return a;
		}
	})
}
function walkRules(resource,cssom,callback){
	if(cssom){
		//bug fix for @import
		var rules = cssom.cssRules;
		var i = rules.length;
		while(i--){
			var rule = rules[i];
			if(rule.type == 1){//STYLE_RULE
				callback(resource,cssom,rule,i)
			}else if(rule.type == 2){//CHARSET_RULE  
				//TODO:
			}else if(rule.type == 3){//IMPORT_RULE  
				//TODO:
			}else if(rule.type == 4){//MEDIA_RULE
				walkRules(resource,rule,callback);
			}
//CSSOM.CSSRule.STYLE_RULE = 1;
//CSSOM.CSSRule.IMPORT_RULE = 3;
//CSSOM.CSSRule.MEDIA_RULE = 4;
//CSSOM.CSSRule.FONT_FACE_RULE = 5;
//CSSOM.CSSRule.PAGE_RULE = 6;
//CSSOM.CSSRule.WEBKIT_KEYFRAMES_RULE = 8;
//CSSOM.CSSRule.WEBKIT_KEYFRAME_RULE = 9;

// Obsolete in CSSOM http://dev.w3.org/csswg/cssom/
//CSSOM.CSSRule.UNKNOWN_RULE = 0;
//CSSOM.CSSRule.CHARSET_RULE = 2;
			
		}
	}
	return cssom;
}
function toRegSource(s,c){
	return c? '\\u'+(0x10000+c.charCodeAt()).toString(16).substr(1)
			: s.replace(/([^\w_-])/g,toRegSource);
}



var ie6SelectorFilter = require("./ie6-selector-filter").ie6SelectorFilter
var ie7SelectorFilter = require("./ie78-selector-filter").ie7SelectorFilter
var ie8SelectorFilter = require("./ie78-selector-filter").ie8SelectorFilter
addCompiler('-ie6-',ie6SelectorFilter)
addCompiler('-ie7-',ie7SelectorFilter)
addCompiler('-ie8-',ie8SelectorFilter)


var buildFilterByPrefix = require('./standard-filter').buildFilterByPrefix;
var ieUpdateFilter = require('./ie-update-filter').ieUpdateFilter;

addCompiler('-ie6-',buildFilterByPrefix(['-ie6-','-ie-']));
addCompiler('-ie6-',ieUpdateFilter)

addCompiler('-ie7-',buildFilterByPrefix(['-ie7-','-ie-']));
addCompiler('-ie7-',ieUpdateFilter)


addCompiler('-ie8-',buildFilterByPrefix(['-ie8-','-ie-']));
addCompiler('-ie8-',ieUpdateFilter)

addCompiler('-ie9-',buildFilterByPrefix(['-ie9-','-ms-','-ie-'],'-ms-'))


addCompiler('-ms-',buildFilterByPrefix(['-ms-'],'-ms-'));
addCompiler('-moz-',buildFilterByPrefix(['-moz-'],'-moz-'));
addCompiler('-webkit-',buildFilterByPrefix(['-webkit-'],'-webkit-'));
addCompiler('-o-',buildFilterByPrefix(['-o-'],'-o-'));

