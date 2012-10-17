var parseSelectors = require('./selector-parser').parseSelectors

var encodeSelector =  require('./util').encodeSelector;
var decodeSelector = require('./util').decodeSelector;
var normalizeNth = require('./util').normalizeNth;
var walkSelector = require('./util').walkSelector;
var walkNode = require('./util').walkNode;
var CSSManager = require('./util').CSSManager;

var normalizeIE8Pseudo = require('./ie78-selector-filter').normalizeIE8Pseudo
var pseudoElementToEnd = require('./ie78-selector-filter').pseudoElementToEnd

function ie6SelectorFilter(resource,cssom,rule,index){
	if(!rule.selectorText){return;}
	var selectorData = parseSelectors(rule.selectorText);
	var hasPSE = pseudoElementToEnd(selectorData)
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
	var emptySelectors = [];
	var mutiSelectors = [];
	var attributeSelectors = [];
	var dynamicSelectors = [];
	
	var mutiClasses = [];
	var thisAndReference = []
	var result = [];
	
	//console.log(selectorData)
	walkNode(selectorData,buildSelector(notSelectors,emptySelectors,nthSelectors,mutiSelectors,attributeSelectors,dynamicSelectors,
		mutiClasses,thisAndReference,result))
	rule.selectorText = serializeSelector(result);
	
	var css = new CSSManager(resource,cssom,index)
	
	css.setup('dc',dynamicSelectors);
	css.setup('mc',mutiSelectors).config('muti-classes',mutiClasses);
	css.setup('attr',attributeSelectors).config('attr-classes',attributeClasses);
	
	

	css.setup('update',nthSelectors,'cs-update-nth:1;').config('nth-classes',nthClasses);
	emptySelectors.length && css.setup('update',emptySelectors,'cs-ref-empty:1;cs-ref:1;').config('ref-classes',['empty'])
	if(hasPSE){//>init defualt
		var i = result.length
		while(i--){
			var item = result[i];
			//.after__--ref-
			//.before__--ref-
			var ownerItem = item.replace(/\s+\.(?:before|after)__--\S+$/,'');
			
			if(ownerItem != item){
				var type = item.slice(ownerItem.length).replace(/.*(before|after)__--.*/,'$1');
				var content = rule.style.getPropertyValue('content');
				if(content){
					content = 'cs-gen-'+type+':'+content.replace(/([^\\])\\(?:\r\n?|\n)/g,'$1').replace(/([^\\])\\A/g,'$1\r\n')+';'
				}
				css.setup('update',[ownerItem],content);
				//css.setup('update',[ownerItem],'cs-update-gen:1');
			}
		}
		rule.style.removeProperty('content');
	}
	var i = thisAndReference.length;
	while(i>0){
		var refSelector = thisAndReference[--i]
		var thisSelector = thisAndReference[--i];
		var refId = thisAndReference[--i].slice(4,-2)
		css.setup('update',[thisSelector],'cs-ref:1;cs-ref-'+refId+':1;')
			.config('ref-classes',[refId]);
		css.append(refSelector,'cs-target-'+refId+':1;')
	}
	
	var i=notSelectors.length;
	while(i--){
		var nc = notClasses[i]
		var setupSelector = notSelectors[i];
		var target = decodeSelector(nc.slice(4))
		css.setup('update',[setupSelector],'cs-ref-'+nc+':1;cs-ref:1;')
			.config('ref-classes',[nc])
			.append(compileSelect(setupSelector,target),'cs-target-'+nc+':1;');
		var genRule = cssom.cssRules[index+1];
		ie6SelectorFilter(resource,cssom,genRule,index+1)
	}
	
}
var perialize = "body body.cs__"
function serializeSelector(result){
	var i = result.length;
	while(i--){
		var g = result[i];
		var c = g.length - g.replace('--','-').length
		if(c==1){
			result[i] = 'html '+g;
		}else if(c > 1){
			var prefix = 'html.cs-op ';
			if(c>2 && /^body[\.#\s]/i.test()){
				prefix += c==3? 'body ':'body.cs__ ';
			}
			result[i] = prefix +g
		}
		//var hasBody =
	}
	return result.reverse().join(',');
}

function compileSelect(selector,nc){
	return selector.replace(/[^\s>]*$/,function(a){
		if(nc.charAt() == '.' && a.indexOf('.')>=0){
			return a.replace(/\.[\w-_]+/,nc);
		}
		if(/^\w/.test(a) && /^\w/.test(nc)){//tag select
			if(a.toLowerCase().indexOf(nc.toLowerCase()) == 0){
				return a;
			}else{//failed anyway
				return '_'+a;
			}
		}else{
			//ie678 顺序无所谓
			if(/^\w/.test(nc)){
				return nc + a;
			}else{
				return a + nc;
			}
		}
	})
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
		//node[i] = 
		node.splice(i,1);
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
//		if(typeof c != 'string'){
//			console.dir(c)
//		}
		if(c.charAt(0) == '.'){
			var c2 = c.replace(/^\.(?:nth|attr|ref-not)-(.*)__$/,'$1')
			if(c2 != c){
				if(c.charAt(1) == 'a'){
					attributeClasses && attributeClasses.push(c2);
				}else if(c.charAt(2) == 't'){
					nthClasses && nthClasses.push(c2);
				}else{
					notClasses && notClasses.push('not-'+c2);
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


function buildSelector(notSelectors,emptySelectors,nthSelectors,mutiSelectors,attributeSelectors,dynamicSelectors,
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
								groupResult.pop();
								parentPrefix = groupResult.join('');
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
				if(lastIndexOf(psClassNames,/^ref-not-.*__$/)>=0){
					//notSelectors.push(prefix+removeClass(className,/^(?:not-).*__$/));
					notSelectors.push(prefix+pureClassName+postfix);
				}
				if(lastIndexOf(psClassNames,/^ref-empty__$/)>=0){
					emptySelectors.push(prefix+pureClassName+postfix);
				}
				//data_2Dparent_2D
			}else{
				parentPrefix = null;
			}
			
			if(className.indexOf('--')>0){
				if(null == parentPrefix){
					var parentPrefix  = groupResult.join('');
					var prefix = parentPrefix+ node.slice(0,classIndex).join('');
					var postfix = node.slice(classIndex+1).join('');
				}
				mutiSelectors.push(prefix + className.replace(/^\..*--/,'.') +postfix)
				mutiClasses.push(className.substr(1))
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
		case 'first-child': //only for ie6
			node[i] = '.nth-child_0_1__';
			break;
		
//		case 'checked':
//			var newItem = 'checked=true';
//		case 'enabled':
//			var newItem = newItem || 'disabled=false';
//		case 'disabled':
//			var newItem = newItem || 'disabled=true';
//			item = encodeSelector(newItem);
//			node[i] = '.attr-'+item+'__'
			break;
		default:
			normalizeIE8Pseudo(node,item,i,'6');
		}
	}
}

// 			2n+1 => 2_1 ; 2n-1=>2_1 ; 2n+3 => 2_3
// 			2n => 2_0 ; 2n+0 => 2_0 ;2=>0_2 ; 3=>0_3

exports.ie6SelectorFilter = ie6SelectorFilter