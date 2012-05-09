exports.ie6Filter = ie6Filter
var parseSelectors = require('./selector').parseSelectors

function ie6Filter(resource,cssom,rule,index){
	var config = resource.cs.config;
	var selectorData = parseSelectors(rule.selectorText);
	var attributeClasses = [];
	var nthClasses = [];
	var notClasses = [];
	walkSelector(selectorData,normalizeSelector);
	//move : to tail and add nth,attr,not classes config
	walkSelector(selectorData,function(node,c,i){//sort
		var c0 = c.charAt(0);
		if(c0 == '.'){
			var c2 = c.replace(/^\.(?:nth|attr|not)-(.*)__$/,'$1')
			if(c2 != c){
				if(c.charAt(1) == 'a'){
					attributeClasses.push(c2);
				}else if(c.charAt(2) == 't'){
					nthClasses.push(c2);
				}else{
					notClasses.push(c2);
				}
			}
		}else if(c0 == ':'){
			var next = node[i+1];
			if(/^\./.test(next)){
				node[i] = next;
				node[i+1] = c;
			}
		}
	})
	console.log(selectorData)
	//add >+~ classes
	walkNode(selectorData,function(group,node,i){//sort
		if(node[0] == '>'){
			//node[0] = ' ';
			//addClass
		}

	});
	//serialize class and add selectors and muti-classes config

	var nthSelectors = [];
	var dynamicSelectors = [];
	var attributeSelectors = [];
	
	var mutiClasses = [];
	var mutiSelectors = [];
	
	var parentIdMap = {}
	
	var result = [];
	var groupResult;
	walkNode(selectorData,function(group,node,index){//sort
		if(index==0){
			groupResult && result.push(groupResult.join(''))
			groupResult = [];
		}
		console.log(index,groupResult,node)
		

		var len = node.length;
		var classIndex = 0;
		var classLastIndex = 0;
		var psIndex = 0;
		for(var i=1;i<len;i++){
			var c = node[i];
			if(c.charAt() == '.'){
				if(classIndex){
					classLastIndex = i;
				}else{
					classIndex = classLastIndex = i;
				}
			}else if(!psIndex && c.charAt() == ':'){
				psIndex = i;
			}
		}
		var prefix  = groupResult.join('');
		if(node[0] == '>'){
			node[0] = ' ';
			var parentId = '.parent-'+encodeSelector(prefix)+'__';
			parentIdMap[parentId]=prefix;
			node.splice(classLastIndex || psIndex|| node.length,0,parentId)
			//parent init
			//child add-parent-id-class
		}
		if(classIndex){
			prefix += node.slice(0,classIndex).join('')
			//muti-classes
			//console.log(classIndex,classLastIndex)
			var classes = node.splice(classIndex,classLastIndex-classIndex+1);
			var classNames = buildClassNames(classes);
			var className = classNames[0];
			var className2 = classNames[1];
			//console.log(prefix,classIndex,groupResult)
			node.splice(classIndex,0,className)
			if(classLastIndex > classIndex){
				mutiClasses.push(className.substr(1));
				//TODO:...
				mutiSelectors.push(prefix + classes[classes.length-1]);
			}
			if(className2 != className){
				className2 = className2
				if(!className2 && prefix.match(/\s$/)){
					className2 = '*'
				}
				if(/(?:\.|--)(?:active|focus|hover)__(--|$)/.test(className)){
					dynamicSelectors.push(prefix+className2);
				}
				if(/(?:\.|--)nth-(?:-[^\-]|[^\-])*__(--|$)/.test(className)){
					nthSelectors.push(prefix+className2);
				}
				if(/(?:\.|--)attr-(?:-[^\-]|[^\-])*__(--|$)/.test(className)){
					attributeSelectors.push(prefix+className2);
				}
			}
		}
		console.log(prefix);
		groupResult.push(node.join(''))
	});
	result.push(groupResult.join(''))
	rule.selectorText = result.reverse().join(',');

	var cache = resource.cs.cache;
	//muti class add expression
	if(cleanSelector(mutiSelectors,cache,'muti')){
		cssom.insertRule(mutiSelectors.join(',')+"{text-kashida:expression(CS.setup('mc',this));}",index+1);
		ClassList.append(config,'muti-classes',mutiClasses);
	}
	if(cleanSelector(attributeSelectors,cache,'attr')){//cs-attr-"+attributeClasses.join(':1;cs-attr-')+":1;
		cssom.insertRule(attributeSelectors.join(',')+"{page-break-before:expression(CS.setup('attr',this));}",index+1);
		ClassList.append(config,'attr-classes',attributeClasses);
	}
	if(cleanSelector(nthSelectors,cache,'nth')){//cs-nth-"+nthClasses.join(':1;cs-nth-')+":1;
		cssom.insertRule(nthSelectors.join(',')+"{page-break-after:expression(CS.setup('nth',this));}",index+1);
		ClassList.append(config,'nth-classes',nthClasses);
	}
	
	if(cleanSelector(dynamicSelectors,cache,'dynamic')){
		cssom.insertRule(dynamicSelectors.join(',')+"{text-kashida-space:expression(CS.setup('dc',this));}",index+1);
	}
	for(var id in parentIdMap){
		cssom.insertRule(parentIdMap[id]+"{"+id+":1;text-underline-position:expression(CS.setup('child',this));}",index+1);
		ClassList.append(config,'parent-classes',[id]);
	}
	//添加动画支持
	var style = rule.style;
	if(style.getPropertyValue('transition-property')){
		style.setProperty('layout-flow', "expression(CS.setup('listener',this))");
	}
}
function cleanSelector(selectors,cache,type){
	/*
	var i = selectors.length;
	var typedCache = cache[type] || (cache[type] = {});
	while(i--){
		var n = selectors[i]
		if(n in typedCache){
			selectors.splice(i,1)
		}else{
			typedCache[n] = true;
		}
	}
	*/
	return selectors.length
}
function buildClassNames(classes){
	classes.sort();
	var buf = [];
	for(var i = 0;i<classes.length;i++){
		var c = classes [i];
		if(!/^\..*__$/.test(c)){
			buf.push(c)
		}
	}
	return [classes.join('--').replace('-\.','-'),buf.join('--').replace('-\.','-')]
}
function walkSelector(data,callback){
	var i = data.length;
	while(i--){
		var group = data[i];
		var j = group.length;
		while(j--){
			var node = group[j];
			var k = node.length;
			while(--k){
				callback(node,node[k],k)
			}
		}
	}
}
function walkNode(data,callback){
	var i = data.length;
	while(i--){
		var group = data[i];
		var len = group.length;
		for(var j=0;j<len;j++){
			callback(group,group[j],j)
		}
	}
}
//nth->ps->class,attr->ps->class,
function normalizeSelector(node,item,i){
	if(item.charAt() == '['){
		//replace attribute;
		item = encodeSelector(item.slice(1,-1).replace(/".+"/,JSON.parse))
		node[i] = '.attr-'+item+'__'
	} else if(item.charAt() == ':'){
		item = item.substr(1);
		switch(item){
		case 'active':
		case 'focus':
		case 'hover':
			node[i] = '.'+item+'__'
			break;
		case 'default':
		case 'valid':
		case 'invalid':
		case 'in-range':
		case 'out-of-range':
			break;
		//form status support
		case 'required':
			var newItem = 'required';
		case 'optional':
			newItem = newItem || 'required=null';
		case 'read-only':
			newItem = newItem || 'readOnly=true';
		case 'read-write':
			newItem = newItem || 'readOnly=false';
		////replace :checked,:enabled,:disabled
		case 'checked':
			newItem = newItem || 'checked=true';
		case 'enabled':
			newItem = newItem || 'disabled=false';
		case 'disabled':
			newItem = newItem || 'disabled=true';
			item = encodeSelector(newItem);
			node[i] = '.attr-'+item+'__'
			break;
		case 'first-letter'://||link|
		case 'first-line':
		case 'link':
		case 'visited':
			break;
		case 'target':
		case 'empty':
			//TODO:...
			break;
		case 'only-child':
		case 'only-of-type':
			var first = item.replace('only','')+'_0_0'
			var last = item.replace('only','last')+'_0_0'
			node.splice(i+1,0,'.nth-'+last+'__')
			newItem = first;
		case 'first-child':
			newItem = 'nth-child_0_0'
		case 'last-child':
			item = newItem || 'nth-last-child_0_0'
		default:
			if(/^nth-/.test(item)){//nth
				//nth-child,nth-last-child,nth-of-type,nth-last-of-type
				item = item.replace(/\(.*\)/,normalizeNth)
				node[i] = '.'+item+'__';
			}else if(/^not\(/.test(item)){
				item = encodeSelector(item.slice(4,-1));
				node[i] = '.not-'+item+'__'
			}
		}
	}
}

function ClassList(){
	this.data = {};
}

ClassList.append = function(config,key,list){
	var thiz = config[key] || (config[key] = new ClassList())
	var i = list.length;
	while(i--){
		thiz.data[list[i]] = 1;
	}
}
ClassList.prototype = {
	toString:function(){
		var buf = []
		for(var n in this.data){
			buf.push(n)
		}
		return buf.join(',')
	}
}
function encodeSelector(attr){
	attr = encodeURIComponent(attr).replace(/[^\w]/g,function(c){
		return c=='%'?'_': 
			'_'+c.charCodeAt().toString(16).toUpperCase();
	})
	return attr;
}
// 			2n+1 => 2_1 ; 2n-1=>2_1 ; 2n+3 => 2_3
// 			2n => 2_0 ; 2n+0 => 2_0 ;2=>0_2 ; 3=>0_3
function normalizeNth(nth){
	nth = nth.toLowerCase().replace(/[()]/g,'')
	if(nth == 'odd'){
		return '_2_1';
	}else if(nth == 'even'){
		return '_2_0';
	}
	nth = nth.split('n');
	var n1 = eval(nth[0]);
	var n2 = n1;
	if(nth.length < 2){
		n1 = 0;
	}else{
		n2 = eval(nth[1])||0;
	}
	//有n
	if(n1>0){
		if(n2<0){
			n2 = n2 % n1 + n1
		}
	}else if(n1 <=0){
		if(n2 <0){
			n1=0;n2=-1
		}
	}
	return '_'+n1+'_'+n2;
}
