exports.buildFilterByPrefix = buildFilterByPrefix
function buildFilterByPrefix(sourcePrefix,realPrefixMap,validPropertyMap){
	validPropertyMap = validPropertyMap || css3PropertyMap;
	realPrefixMap = realPrefixMap || createRealPrefixMap(sourcePrefix[0])
	return function(resource,cssom,rule,index){
		var s = rule.style;
		var len = s.length;
		//key->{property:[value,important,prefixIndex]}
		var valueMap = {};
		for(var i=0;i<len;i++){
			var n = s[i];
			var prefix = sourcePrefix.length;
			if(/^-\w+-/.test(n)){//先不考虑 ie -前缀 hack
				prefix = n.replace(/^(-\w+-).*/,'$1');
				n = n.substring(prefix.length);
				prefix = sourcePrefix.indexOf(prefix)
				if(prefix<0){
					continue;
				}
			}
			if(n in validPropertyMap){
				var value = valueMap[n]
				if(!value || prefix < value[2]){
					valueMap[n] = [s.getPropertyValue(n),s.getPropertyPriority(n),prefix];
				}
			}else{
				console.error("未知CSS属性："+n)
			}
		}
		while(len--){
			s.removeProperty(s[len]);
		}
		for(var n in valueMap){
			var value = valueMap[n];
			var pri = value[1];
			value = value[0];
			n = realPrefixMap[n] || n;
			if(/(?:-\w+-|\b)linear-gradient\b/.test(value)){
				var real = realPrefixMap['linear-gradient'];
				if(real ){
					real = value.replace(/(?:-\w+-|\b)linear-gradient\b/,real);
					if(/-ie[678]-/.test(sourcePrefix[0]) && /^background(-image)?$/.test(n)){
						s.setProperty("layoutFlow","expression(CS.setup('listener',this))");
						n = "cs-linear-gradient"
					}
				}
			}
			s.setProperty(n,value,pri)
			console.log(n)
			
		}
	}
}
function createRealPrefixMap(prefix){
	return {
		"transform":prefix+"transform",
		"transform-origin":prefix+"transform-origin",
		"border-radius":prefix+"border-radius",
		"box-shadow":prefix+"box-shadow",
		"linear-gradient":prefix+"linear-gradient"
	}
}
var css3PropertyMap = {
		"border-top-color":5 
		,"border-width":5 
		,"clear":5 
		,"float":5 
		,"margin":5 
		,"margin-bottom":5 
		,"margin-left":5 
		,"margin-right":5 
		,"margin-top":5 
		,"padding":5 
		,"padding-bottom":5 
		,"padding-left":5 
		,"padding-right":5 
		,"padding-top":5 
		,"table-layout":5 
		,"height":5 
		,"visibility":5 
		,"width":5 
		,"page-break-after":5 
		,"page-break-before":5 
		,"list-style":5 
		,"list-style-image":5 
		,"list-style-position":5 
		,"color":5 
		,"direction":5 
		,"font":5 
		,"font-family":5 
		,"font-size":5 
		,"font-style":5 
		,"font-variant":5 
		,"letter-spacing":5 
		,"line-height":5.5 
		,"text-align":5 
		,"text-decoration":5 
		,"text-indent":5 
		,"text-transform":5 
		,"unicode-bidi":5 
		,"vertical-align":5 
		,"word-wrap":5 
		,"writing-mode":5 
		,"ruby-align":5 
		,"ruby-overhang":5 
		,"ruby-position":5 
		,"border":5 
		,"border-bottom-color":5 
		,"border-color":5 
		,"border-left-color":5 
		,"border-right-color":5 
		//IE5.5
		,"cursor":5.5 
		,"clip":5.5 
		,"border-top-style":5.5 
		,"border-top-width":5.5 
		,"text-justify":5.5 
		,"border-bottom":5.5 
		,"border-bottom-style":5.5 
		,"border-bottom-width":5.5 
		,"border-left":5.5 
		,"border-left-style":5.5 
		,"border-left-width":5.5 
		,"border-right":5.5 
		,"border-right-style":5.5 
		,"border-right-width":5.5 
		,"border-top":5.5 
		,"background":5.5 //Yes	Yes	Yes	Yes	Yes	Updated
		,"background-attachment":5.5 //Partial	Partial	Partial	Yes	Yes	Updated
		,"background-color":5.5 //Yes	Yes	Yes	Yes	Yes	Updated
		,"background-image":5.5 //Yes	Yes	Yes	Yes	Yes	Updated
		,"background-repeat":5.5 //Yes	Yes	Yes	Yes	Yes	Updated
		,"background-position":6// //Partial	Partial	Partial	Partial	Yes	Updated
		,"top":6// No	Partial	Partial	Partial	Yes	Yes
		,"bottom":6// No	Partial	Partial	Partial	Yes	Yes
		,"left":6// No	Partial	Partial	Partial	Yes	Yes
		,"right":6// No	Partial	Partial	Partial	Yes	Yes
		,"display":6// Partial	Partial	Partial	Partial	Yes	Yes
		,"position":6// Partial	Partial	Partial	Yes	Yes	Yes
		,"z-index":6// Partial	Partial	Partial	Partial	Yes	Yes
		,"overflow":6// Partial	Partial	Partial	Yes	Yes	Yes
		,"overflow-x":6// Partial	Partial	Partial	Yes	Yes	Yes
		,"overflow-y":6// Partial	Partial	Partial	Yes	Yes	Yes

		,"list-style-type":6// No	No	No	Partial	Yes	Yes
		,"font-weight":6// Partial	Partial	Partial	Partial	Yes	Yes
		,"white-space":6// Partial	Partial	Partial	Partial	Yes	Yes
		,"word-spacing":6// Partial	Partial	Partial	Partial	Yes	Yes
		,"text-align-last":6// Partial	Partial	Partial	Partial	Partial	Partial
		,"text-overflow":6//	No	Partial	Partial	Partial	Partial	Partial
		,"word-break":6// Partial	Partial	Partial	Partial	Partial	Partial
		,"border-collapse":6// Partial	Partial	Partial	Partial	Yes	Yes
		,"border-style":6// No	Partial	Partial	Partial	Yes	Yes
 		//IE7
		,"max-height":7 
		,"max-width":7 
		,"min-height":7 
		,"min-width":7 
 		//IE8
 	
		,"empty-cells":8 //No	No	No	Partial	Yes	Yes
		,"border-spacing":8 
		,"caption-side":8 
		,"content":8 
		,"counter-increment":8 
		,"counter-reset":8 
		,"quotes":8 
		,"orphans":8 
		,"page-break-inside":8 
		,"widows":8 
		,"outline":8 
		,"outline-color":8 
		,"outline-style":8 
		,"outline-width":8 
		,"box-sizing":8 
 	
 		//IE9
		,"font-stretch":9 
		,"background-clip":9 
		,"background-origin":9 
		,"background-size":9 
		,"border-radius":9 
		,"box-shadow":9 
		,"transform":9	//-ms-transform	No	No	No	No	No	Yes
		,"transform-origin":9	//-ms-transform-origin	No	No	No	No	No	Yes
 		
//no support
		,"hanging-punctuation":10 
		,"punctuation-trim":10 
		,"ruby-span":10 
		,"font-effect":10 
		,"font-emphasize":10 
		,"font-size-adjust":10 
		,"font-smooth":10 
		,"background-break":10 
		,"color-profile":10 
		,"rendering-intent":10 
		,"border-break":10 
		,"border-image":10 
		,"text-emphasis":10 
		,"text-outline":10 
		,"text-shadow":10 
		,"text-wrap":10 
		,"appearance":10
		,"icon":10
		,"nav-down":10
		,"nav-index":10
		,"nav-left":10
		,"nav-right":10
		,"nav-up":10
		,"outline-offset":10
		,"outline-radius":10
		,"resize":10
		,"fit":10
		,"fit-position":10
		,"image-orientation":10
		,"page":10
		,"size":10
};
