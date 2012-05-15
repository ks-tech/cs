var childPlugin = {id:'child',//attribute query plugin
	config:function(style){
//		console.log('nth-classes:',style.cssText)
		style = style['parent-classes'];
		if(style){
			style = style.split(',')
			var i = style.length;
			parentIdMap[style[i]] = true;
		}
	},
	setup:function(el,config){//可选
		var cs = el.children;
		var buf = [];
		for(var n in parentIdMap){
			if(el.currentStyle[n]){
				buf.push(n);
			}
		}
		if(buf.length){
			var i = cs.length;
			config.postClass = ' '+cs.join(' ')
			while(i--){
				cs[i].className += config.postClass;
			}
		}
	},
	expression:'textUnderlinePosition'
}
var  parentIdMap = {}
exports.childPlugin  =childPlugin;
