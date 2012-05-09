var FS = require('fs');
var CSSOM = require('cssom');
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
		data = data.replace(/#([\da-f])([\da-f])([\da-f])\b/g,'#$1$1$2$2$3$3')
				.replace(colorPattern,function(a,prefix,color){
					return prefix+colorMap[color.toLowerCase()];
				});
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
			var i = compilers.length;
			while(i--){
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

var colorMap = {
aliceblue:"#F0F8FF", antiquewhite:"#FAEBD7", aqua:"#00FFFF", aquamarine:"#7FFFD4", 
azure:"#F0FFFF", beige:"#F5F5DC", bisque:"#FFE4C4", black:"#000000", 
blanchedalmond:"#FFEBCD", blue:"#0000FF", blueviolet:"#8A2BE2", brown:"#A52A2A", 
burlywood:"#DEB887", cadetblue:"#5F9EA0", chartreuse:"#7FFF00", chocolate:"#D2691E", 
coral:"#FF7F50", cornflowerblue:"#6495ED", cornsilk:"#FFF8DC", crimson:"#DC143C", 
cyan:"#00FFFF", darkblue:"#00008B", darkcyan:"#008B8B", darkgoldenrod:"#B8860B", 
darkgray:"#A9A9A9", darkgreen:"#006400", darkkhaki:"#BDB76B", darkmagenta:"#8B008B", 
darkolivegreen:"#556B2F", darkorange:"#FF8C00", darkorchid:"#9932CC", darkred:"#8B0000", 
darksalmon:"#E9967A", darkseagreen:"#8FBC8B", darkslateblue:"#483D8B", darkslategray:"#2F4F4F", 
darkturquoise:"#00CED1", darkviolet:"#9400D3", deeppink:"#FF1493", deepskyblue:"#00BFFF", 
dimgray:"#696969", dodgerblue:"#1E90FF", firebrick:"#B22222", floralwhite:"#FFFAF0", 
forestgreen:"#228B22", fuchsia:"#FF00FF", gainsboro:"#DCDCDC", ghostwhite:"#F8F8FF", 
gold:"#FFD700", goldenrod:"#DAA520", gray:"#808080", green:"#008000", 
greenyellow:"#ADFF2F", honeydew:"#F0FFF0", hotpink:"#FF69B4", indianred:"#CD5C5C", 
indigo:"#4B0082", ivory:"#FFFFF0", khaki:"#F0E68C", lavender:"#E6E6FA", 
lavenderblush:"#FFF0F5", lawngreen:"#7CFC00", lemonchiffon:"#FFFACD", lightblue:"#ADD8E6", 
lightcoral:"#F08080", lightcyan:"#E0FFFF", lightgoldenrodyellow:"#FAFAD2", lightgreen:"#90EE90", 
lightgrey:"#D3D3D3", lightpink:"#FFB6C1", lightsalmon:"#FFA07A", lightseagreen:"#20B2AA", 
lightskyblue:"#87CEFA", lightslategray:"#778899", lightsteelblue:"#B0C4DE", lightyellow:"#FFFFE0", 
lime:"#00FF00", limegreen:"#32CD32", linen:"#FAF0E6", magenta:"#FF00FF", 
maroon:"#800000", mediumaquamarine:"#66CDAA", mediumblue:"#0000CD", mediumorchid:"#BA55D3", 
mediumpurple:"#9370DB", mediumseagreen:"#3CB371", mediumslateblue:"#7B68EE", mediumspringgreen:"#00FA9A", 
mediumturquoise:"#48D1CC", mediumvioletred:"#C71585", midnightblue:"#191970", mintcream:"#F5FFFA", 
mistyrose:"#FFE4E1", moccasin:"#FFE4B5", navajowhite:"#FFDEAD", navy:"#000080", 
oldlace:"#FDF5E6", olive:"#808000", olivedrab:"#6B8E23", orange:"#FFA500", 
orangered:"#FF4500", orchid:"#DA70D6", palegoldenrod:"#EEE8AA", palegreen:"#98FB98", 
paleturquoise:"#AFEEEE", palevioletred:"#DB7093", papayawhip:"#FFEFD5", peachpuff:"#FFDAB9", 
peru:"#CD853F", pink:"#FFC0CB", plum:"#DDA0DD", powderblue:"#B0E0E6", 
purple:"#800080", red:"#FF0000", rosybrown:"#BC8F8F", royalblue:"#4169E1", 
saddlebrown:"#8B4513", salmon:"#FA8072", sandybrown:"#F4A460", seagreen:"#2E8B57", 
seashell:"#FFF5EE", sienna:"#A0522D", silver:"#C0C0C0", skyblue:"#87CEEB", 
slateblue:"#6A5ACD", slategray:"#708090", snow:"#FFFAFA", springgreen:"#00FF7F", 
steelblue:"#4682B4", tan:"#D2B48C", teal:"#008080", thistle:"#D8BFD8", 
tomato:"#FF6347", turquoise:"#40E0D0", violet:"#EE82EE", wheat:"#F5DEB3", 
white:"#FFFFFF", whitesmoke:"#F5F5F5", yellow:"#FFFF00", yellowgreen:"#9ACD32"}

var buf = [];
for(var n in colorMap){
	buf.push(n)
}
var colorPattern = new RegExp("(\\bcolor\\s*\\:\\s*|"+
			"(?:border(?:-\\w+)\\b|background)\\s*\\:(?:"+
				"url\\((?:[^)'\"]+|'[^']*'|\"[^\"]*\")+\\)|[^;}(]"
				+")*?)\\b("+buf.join('|')+")\\b",'ig');

var ie6Filter = require("./cs-ie6-filter").ie6Filter
var ie7Filter = require("./cs-ie7-filter").ie7Filter
var ie8Filter = require("./cs-ie8-filter").ie8Filter
var ieBoxFilter = require("./cs-ie-box-filter").ieBoxFilter
var buildFilterByPrefix = require('./cs-standard-filter').buildFilterByPrefix;
var matrixFilter = require('./cs-matrix').matrixFilter;

addCompiler('-ie6-',ie6Filter)
addCompiler('-ie6-',buildFilterByPrefix(['-ie6-','-ie-'],{}));
addCompiler('-ie6-',ieBoxFilter);
addCompiler('-ie6-',matrixFilter)



addCompiler('-ie7-',ie7Filter)
addCompiler('-ie7-',buildFilterByPrefix(['-ie7-','-ie-'],{"filter":"-ms-filter"}));
addCompiler('-ie7-',ieBoxFilter);
addCompiler('-ie7-',matrixFilter)


addCompiler('-ie8-',ie8Filter)
addCompiler('-ie8-',buildFilterByPrefix(['-ie8-','-ms-','-ie-'],{"filter":"-ms-filter"}));
addCompiler('-ie8-',ieBoxFilter);
addCompiler('-ie8-',matrixFilter)


addCompiler('-ie9-',ie8Filter)
addCompiler('-ie9-',buildFilterByPrefix(['-ie9-','-ms-','-ie-']));


addCompiler('-ie10-',buildFilterByPrefix(['-ms-','-ie10-']));
addCompiler('-ie10-',matrixFilter)
addCompiler('-moz-',buildFilterByPrefix(['-moz-']));
addCompiler('-moz-',matrixFilter)
addCompiler('-webkit-',buildFilterByPrefix(['-webkit-']));
addCompiler('-webkit-',matrixFilter)
addCompiler('-o-',buildFilterByPrefix(['-o-']));
addCompiler('-o-',matrixFilter)

