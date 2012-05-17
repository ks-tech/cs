var FS = require('fs');
var CSSOM = require('cssom');
var normalizeColor = require('./color-parser.js').normalizeColor;
var compilersMap= {};
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


/**
var s = document.body.style
s.textIndent = 20;
s.text = body.parentNode.style.getAttribute('text');
alert(s.text)
alert(s.textIndent)
 */
function setupCS(rbs, prefix){
	prefix = prefix.replace(/[\\\/]?$/,'/');
	var pattern = new RegExp('^'+toRegSource(prefix)+'(.+)\.css$');
	
	
//	rbs.addTextFilter(/.+\.html$/i,function(resource,text){
//		return text.replace();
//	})
	//文本预处理
	rbs.addTextFilter(pattern,function(resource,text){
		resource.cs = {config :{},cache:{}};
		var path = (resource.sourcePath || resource.path).substr(prefix.length).replace(/\.js$/,'');
		if(!text){
			try{
				var file = require.resolve(path);
			}catch(e){}
			if(file ){
				text = resource.getExternalAsBinary(file).toString('utf-8');
			}
		}
		//console.log(JSON.stringify(text))
		return text;
	})
	//文件关系预处理 （@import @media）
	rbs.addDOMBuilder(pattern,function cssomBuilder(resource,data){
		//标准化 color
		data = normalizeColor(data)
		data = CSSOM.parse(data);
		
		//TODO:（@import @media）
		//walkRules(resource,cssom,function(){})
		return data;
	});
	//内容预处理
	rbs.addDOMFilter(pattern,function(resource,cssom){
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
		var buf = ['head cs-config{'];
		var csConfig = resource.cs.config
		for(var n in csConfig){
			buf.push(n,':',csConfig[n],';')
		}
		buf.push('}')
		cssom.insertRule(buf.join(''),cssom.cssRules.length)
		return cssom;
	})
	//内容序列化
	rbs.addSerializer(pattern,function(resource,data){
		return data && data.toString();
	});
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



var ie6SelectorFilter = require("./cs-ie6-selector-filter").ie6SelectorFilter
var ie7SelectorFilter = require("./cs-ie7-selector-filter").ie7SelectorFilter
addCompiler('-ie6-',ie6SelectorFilter)
addCompiler('-ie7-',ie7SelectorFilter)


var buildFilterByPrefix = require('./cs-standard-filter').buildFilterByPrefix;
var ieUpdateFilter = require('./cs-ie-update-filter').ieUpdateFilter;

addCompiler('-ie6-',buildFilterByPrefix(['-ie6-','-ie-']));
addCompiler('-ie6-',ieUpdateFilter)

addCompiler('-ie7-',buildFilterByPrefix(['-ie7-','-ie-']));
addCompiler('-ie7-',ieUpdateFilter)


addCompiler('-ie8-',buildFilterByPrefix(['-ie8-','-ms-','-ie-']));
addCompiler('-ie8-',ieUpdateFilter)

addCompiler('-ie9-',buildFilterByPrefix(['-ie9-','-ms-','-ie-']));


addCompiler('-ms-',buildFilterByPrefix(['-ms-']));
addCompiler('-moz-',buildFilterByPrefix(['-moz-']));
addCompiler('-webkit-',buildFilterByPrefix(['-webkit-']));
addCompiler('-o-',buildFilterByPrefix(['-o-']));

