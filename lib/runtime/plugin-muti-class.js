var configListener = require('./property-listener').configListener
var setupListener = require('./property-listener').setupListener
var mutiClassPlugin = {//multi-classes plugin
	id:'mc',
	config:function(style){
		addMutiClassesConfig(style.getAttribute('muti-classes'));
		configListener('mc', classUpdaterMap);
	},
	update:function(el){//可选
		//css apply 时执行
		setupListener('mc', el);
		updateClasses(el,el.className,true)
	}
	//update:function
	//dispose:function(el)
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
		//console.log(el.className,'\n\n',cs)
		el.className = cs;
		tracePC = true;
	}
	return cs;
}

function resetClass(className){
	var cm = mutiClassMap;
	if(className.match(/\S\s+\S/)){
		var cs = className.replace(/\S*\-\-\S*/g,'').replace(/^\s+|\s+$/g,'').split(/\s+/);
		cs.sort();
//		console.log('3',cs)
		var i = cs.length;
//		console.log(i,cs)
		while(i-->0){
			var c = cs[i];
			//console.log(cm['classB']);
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
		//console.log('\n^',className,'$\n\n',cs.join(','))
		className = cs.join(' ');
//		console.log('end1 class update:',(new Date - t))

//		console.log('4',cs)
	}
	return className;
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
			//console.log(mutiClassMap[last])
		}
	}
}



//IE6 支持多class hack
exports.mutiClassPlugin = mutiClassPlugin;
exports.updateClasses = updateClasses;
