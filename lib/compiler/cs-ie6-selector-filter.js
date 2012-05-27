var parseSelectors = require('./selector-parser').parseSelectors

var getPluginStyle = require('./cs-util').getPluginStyle;
var encodeSelector =  require('./cs-util').encodeSelector;
var normalizeNth = require('./cs-util').normalizeNth;
var walkSelector = require('./cs-util').walkSelector;
var walkNode = require('./cs-util').walkNode;
var CSSManager = require('./cs-util').CSSManager;

var normalizeIE8Pseudo = require('./cs-ie8-selector-filter').normalizeIE8Pseudo

function ie6SelectorFilter(resource,cssom,rule,index){
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
	var thisAndReference = []
	var result = [];
	walkNode(selectorData,buildSelector(notSelectors,nthSelectors,mutiSelectors,attributeSelectors,dynamicSelectors,
		mutiClasses,thisAndReference,result))
	rule.selectorText = result.reverse().join(',');
	
	var css = new CSSManager(cssom,index,resource.cs)
	
	css.setup('dc',dynamicSelectors);
	css.setup('mc',selectors).config('muti-classes',mutiClasses);
	css.setup('attr',attributeSelectors).config('attr-classes',attributeClasses);
	
	
	css.setup('update',nthSelectors,'cs-update-nth:1;').config('nth-classes',nthClasses);

	var i = thisAndReference.length;
	while(i>0){
		var refSelector = thisAndReference[--i]
		var thisSelector = thisAndReference[--i];
		var refId = thisAndReference[--i].slice(4,-2)
		css.setup('update',[thisSelector],'cs-ref:1;cs-ref-'+refId+':1;')
			.config('ref-classes',[refId]);
		css.append(refSelector,'cs-target-'+refId+':1;')
	}
}


function lastIndexOf(a,p){
	var i = a.length;
	while(i--){
		if(p.test(a[i]))return i;
	}
}
function removeClass(mutiClasses,pattern,removed){
	//console.log(mutiClasses)
	return mutiClasses.replace(/(\.|--)(.+?)(?=--|$)/g,function(a,prefix,content){
		//console.log(a,'%',prefix,'%',content,pattern)
		if(pattern.test(content)){
			removed && removed.push(content);
			return '';
		}else{
			return a;
		}
	}).replace(/^--/,'.')
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
		//console.log(i,classIndex,lastClassesIndex)
		if(i == 1){
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
function prepareNextAndChild(group,node,i){
	switch(node[0]){
	case '~':
		node.push('.ref-gs-~__');
		break;
	case '+':
		node.push('.ref-as-~__')
		break;
	case '>':
		node.push('.ref-child-~__')
		break;
	default:
		return ;
	}
	node[0] = ' ';
}


function buildSelector(notSelectors,nthSelectors,mutiSelectors,attributeSelectors,dynamicSelectors,
	mutiClasses,thisAndReference,result){
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
			var pureClassName = removeClass(className,/.*__$/,psClassNames)
			if(!pureClassName && classIndex == 1){
				pureClassName = '*'
			}
			if(psClassNames.length){
				var parentPrefix  = groupResult.join('');
				//参照系处理
				if(className.indexOf('~')>0){
					var refSelecotr = null;
					var noRefClassName = removeClass(className,/-~__$/,[]);
					var refClassName;
					psClassNames.some(function(c,index){
						if(/^ref-(?:as|gs|child)-~__$/.test(c)){
							refSelecotr = parentPrefix;
							var id = encodeSelector(parentPrefix);
							//rebuild className(sort顺序不会影响,所以能直接替换)
							node[classIndex] = className = className.replace('~',id) ;
							if('c'!==c.charAt(4)){
								parentPrefix = groupResult.pop(),groupResult.join('');
							}
							refClassName = psClassNames[index] =  c.replace('~', id) ;
							//console.log('!!!!',className,refClassName)
							return true;
						}
					})
				}
				
				var prefix = parentPrefix+ node.slice(0,classIndex).join('');
				var postfix = node.slice(classIndex+1).join('');
				if(refSelecotr){//cs class 最后的优先级
					//mutiClass 组合若改变，需要补充
					if(noRefClassName.indexOf('--')>0){
						mutiSelectors.push(prefix + noRefClassName.replace(/^\..*--/,'.') +postfix)
						mutiClasses.push(noRefClassName.substr(1))
					}
					var thisSelector = prefix + noRefClassName +postfix;
					thisAndReference.push(refClassName,thisSelector,refSelecotr);
				}
				if(className.indexOf('--')>0){
					mutiSelectors.push(prefix + className.replace(/^\..*--/,'.') +postfix)
					mutiClasses.push(className.substr(1))
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

//nth->ps->class,attr->ps->class,
function normalizeIE6Selector(node,item,i){
	if(item.charAt() == '['){
		//replace attribute;
		switch(item.slice(1,-1)){
			case 'checked="checked"':
			case 'checked=checked':
			case 'checked':
				item = '[checked="true"]';
		}
		item = encodeSelector(item.slice(1,-1).replace(/".+"/,JSON.parse));
		
		node[i] = '.attr-'+item+'__'
	} else if(item.charAt() == ':'){
		item = item.substr(1);
		switch(item){
		case 'active':
		case 'focus':
		case 'hover':
			node[i] = '.'+item+'__'
			break;
		default:
			normalizeIE8Pseudo(node,item,i,'6');
		}
	}
}

// 			2n+1 => 2_1 ; 2n-1=>2_1 ; 2n+3 => 2_3
// 			2n => 2_0 ; 2n+0 => 2_0 ;2=>0_2 ; 3=>0_3

exports.ie6SelectorFilter = ie6SelectorFilter