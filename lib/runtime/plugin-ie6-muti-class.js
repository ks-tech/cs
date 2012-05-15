var mutiClassPlugin = {id:'mc',//multi-classes plugin
	config:function(style){
		addMutiClassesConfig(style.getAttribute('muti-classes'));
		return classUpdaterMap;
	},
	setup:function(el){//可选
		//css apply 时执行
		updateClasses(el,el.className,true)
	},
	//vist:function
	//dispose:function(el){//可选，系统发现该对象不存在时执行。	//},
	expression:'textKashida' //可选，如果设置，编译是需要设置自动添加初始化expression
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
		el.className = cs;
		tracePC = true;
	}
	return cs;
}

function resetClass(cs){
	var cm = mutiClassMap;
	if(cs.match(/\S\s+\S/)){
		cs = cs.replace(/\S*\-\-\S*/g,'').replace(/^\s+|\s+$/g,'').split(/\s+/);
		cs.sort();
//		console.log('3',cs)
		var i = cs.length;
		//console.log(cs)
		while(i-->0){
			var c = cs[i];
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
		cs = cs.join(' ');
//		console.log('end1 class update:',(new Date - t))

//		console.log('4',cs)
	}
	return cs;
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
		}
	}
}



//IE6 支持多class hack
exports.mutiClass = mutiClassPlugin;
exports.updateClasses = updateClasses;
