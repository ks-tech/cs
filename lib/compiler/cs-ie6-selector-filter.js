exports.ie6Filter = ie6Filter
var parseSelectors = require('./selector').parseSelectors

function updateSelectors(resource,cssom,rule,index){
	var selectorData = parseSelectors(rule.selectorText);
	// prepare for >~+
	walkNode(selectorData,prepareNextAndChild);
	//replace nth/attr/not with encoded_pseudo
	walkSelector(selectorData,normalizeIE6Selector);
	//move pseudo to tail 
	walkSelector(selectorData,pseudoSelectorToTail);
	
	var notClasses = [];
	var nthClasses = [];
	var attributeClasses = [];
	//gather class infos and replace child sibling combinator join-muti-classes
	walkSelector(selectorData,buildClassesInfoCollector(notClasses,nthClasses,attributeClasses))
	
	
	var notSelectors = [];
	var nthSelectors = [];
	var mutiSelectors = [];
	var attributeSelectors = [];
	var dynamicSelectors = [];
	
	var mutiClasses = [];
	var parentIdMap = {};
	var previousIdMap = {};
	var result = [];
	walkNode(selectorData,buildSelector(notSelectors,nthSelectors,mutiSelectors,attributeSelectors,dynamicSelectors,
		mutiClasses,parentIdMap,previousIdMap,result))
		rule.selectorText = result.reverse().join(',');
	
	
	var map = {
		ms:'text-kashida',
		dynamic:'text-kashida-space',
		attr:'page-break-before',
		nth:'page-break-after',
		child:'text-underline-position'
	}

	var config = resource.cs.config;
	var cache = resource.cs.cache;
	function setup(pid,selectors,configKey,configClasses,appendInfo){
		if(cleanSelector(selectors,cache,pid)){
			cssom.insertRule(selectors.join(',')+"{"+(appendInfo|'')+map[pid]+":expression(CS.setup('"+pid+"',this));}",index+1);
			configKey && ClassList.append(config,configKey,configClasses);
		}
	}
	setup('mc',mutiSelectors,'muti-classes',mutiClasses);
	setup('dynamic',dynamicSelectors);
	
	setup('attr',attributeSelectors,'attr-classes',attributeClasses);
	setup('nth',nthSelectors,'nth-classes',nthClasses);
	setup('not',notSelectors,'not-classes',notClasses);

	for(var id in parentIdMap){
		var parentSelectors = [parentIdMap[id]]
		setup('child',parentSelectors,'parent-classes',[id],id+':true;');
	}
	for(var id in previousIdMap){
		var parentSelectors = [parentIdMap[id]]
		setup('child',parentSelectors,'parent-classes',[id],id+':true;');
	}
	
	//添加动画支持
	var style = rule.style;
	if(style.getPropertyValue('transition-property')){
		style.setProperty('layout-flow', "expression(CS.setup('listener',this))");
	}

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
function lastIndexOf(a,p){
	var i = a.length;
	while(i--){
		if(p.test(a[i]))return i;
	}
}
function removeClass(mutiClasses,pattern,removed){
	return mutiClasses.replace(/(.|--)(.+?)(?=--|$)/,function(a,prefix,content){
		if(pattern.test(content)){
			removed && removed.push(content)
		}else{
			return a;
		}
	}).replace(/^--/,'.')
}
function prepareNextAndChild(group,node,i){
	switch(node[0]){
	case '~':
		node.push('[data-gs-]');
		break;
	case '+':
		node.push('[data-as-]')
		break;
	case '>':
		node.push('[data-parent-]')
		break;
	default:
		return ;
	}
	node[0] = ' ';
}


function pseudoSelectorToTail(node,c,i){
	//.c[attr]:hover:first-child:focus:nth  ->.c.attr:hover.first:focus.nth
	//.c.attr:hover.first.nth:focus
	//.c.attr:hover.first.nth:focus
	//.c.attr.first.nth:focus:hover
	if(c.charAt() == ':' && /^\./.test(node[i+1])){
		node[i] = node.splice(i,1);
		node.push(c);
	}
}
function buildSelector(notSelectors,nthSelectors,mutiSelectors,attributeSelectors,dynamicSelectors,
	mutiClasses,parentIdMap,previousIdMap,result){
	var groupResult = [];
	//group->node->select
	return function(group,node,index){
		//console.log(index,groupResult,node)
		var len = node.length;
		var classIndex = lastIndexOf(node,/^\./);
		var className = classIndex>=0?node[classIndex]:null;
		
		if(className){
			var psClassNames = [];
			///^(active|focus|hover|attr-|nth-|not-).*__$/
			var pureClassName = removeClass(className,/.*__/,psClassNames)
			if(!pureClassName){
				pureClassName = '*'
			}
			if(psClassNames.length){
				var parentPrefix  = groupResult.join('');
				{
					var cs;
					psClassNames.some(function(c,index){
						if(/^attr-data_2D(?:as|gs|parent)_2D__$/.test(c)){
							cs = c + encodeSelector(parentPrefix)
							if("attr-data_2Dparent_2D__"==c){
								parentIdMap[cs]=parentPrefix;
							}else{//兄弟节点
								previousIdMap[cs]=parentPrefix;
								parentPrefix = groupResult.pop(),groupResult.join('');
								
							}
							psClassNames[index] = cs ;
							return true;
						}
					})
					if(cs){
						//rebuild className(sort顺序不会影响,所以能直接替换)
						className = className.replace(/(.|--)attr-data_2D(?:as|gs|parent)_2D__(?=--|$)/,"$1"+cs)
					}
				}
				var prefix = parentPrefix+ node.slice(0,classIndex).join('');
				var postfix = node.slice(classIndex+1).join('');
				if(className.indexOf('--')>0){
					mutiSelectors.push(prefix + className.replace(/.*--/,'.')+postfix)
					mutiClasses.push(className)
				}
				if(lastIndexOf(psClassNames,/^(?:active|focus|hover)__$/)>=0){
					dynamicSelectors.push(prefix+pureClassName+postfix);
				}
				if(lastIndexOf(psClassNames,/^attr-.*__$/)>=0){
					//attributeSelectors.push(prefix+removeClass(className,/^(?:attr-|nth-|not-).*__$/));  避免长生太多class组合，放弃该策略
					attributeSelectors.push(prefix+pureClassName+postfix);
				}
				if(lastIndexOf(psClassNames,/^nth-.*__$/)>=0){
					//nthSelectors.push(prefix+removeClass(className,/^(?:nth-|not-).*__$/));
					nthSelectors.push(prefix+pureClassName+postfix);
				}
				if(lastIndexOf(psClassNames,/^not-.*__$/)>=0){
					//notSelectors.push(prefix+removeClass(className,/^(?:not-).*__$/));
					notSelectors.push(prefix+pureClassName+postfix);
				}
				//data_2Dparent_2D
			}
		}
		groupResult.push(node.join(''))
		if(index==group.length-1){
			result.push(groupResult.join(''))
			groupResult = [];
		}
	}
}


/**
 * 收集class信息，如果设置了mutiClasses，还需要合并组合class
 */
function buildClassesInfoCollector(notClasses,nthClasses,attributeClasses){
	var lastClassesIndex = -1;
	var classIndex = -1;
	return function(node,c,i){
		if(c.charAt(0) == '.'){
			var c2 = c.replace(/^\.(?:nth|attr|not)-(.*)__$/,'$1')
			if(c2 != c){
				if(c.charAt(1) == 'a'){
					attributeClasses && attributeClasses.push(c2);
				}else if(c.charAt(2) == 't'){
					nthClasses && nthClasses.push(c2);
				}else{
					notClasses && notClasses.push(c2);
				}
			}
			if(lastClassesIndex == -1){
				lastClassesIndex = i;
			}
			classIndex = i;
		}
		if(i == 0){
			if(classIndex>=0){
				var classes = node.splice(classIndex,lastClassesIndex-classIndex+1);
				var joinedClass = classes.sort().join('--').replace(/--\./g,'--');
				node.splice(classIndex,0,joinedClass);
//				mutiClasses.push(joinedClass.substr(1))
			}
			lastClassesIndex = -1;
		}
		
	}
}
//nth->ps->class,attr->ps->class,
function normalizeIE6Selector(node,item,i){
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
ClassList.prototype.toString = function(){
	var buf = []
	for(var n in this.data){
		buf.push(n)
	}
	return buf.join(',')
}