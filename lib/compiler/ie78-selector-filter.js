var parseSelectors = require('./selector-parser').parseSelectors

var encodeSelector =  require('./util').encodeSelector;
var decodeSelector = require('./util').decodeSelector;
var normalizeNth = require('./util').normalizeNth;
var walkSelector = require('./util').walkSelector;
var walkNode = require('./util').walkNode;
var CSSManager = require('./util').CSSManager;
function ie7SelectorFilter(resource,cssom,rule,index){
	doSelectorFilter(resource,cssom,rule,index,normalizeIE7Selector)
}
function ie8SelectorFilter(resource,cssom,rule,index){
	doSelectorFilter(resource,cssom,rule,index,normalizeIE8Selector)
}

function doSelectorFilter(resource,cssom,rule,index,normalizer){
	if(!rule.selectorText){return;}
	var css = new CSSManager(resource,cssom,index)
	var selectorData = parseSelectors(rule.selectorText);
	if(normalizeIE7Selector == normalizer){
		var hasPSE = pseudoElementToEnd(selectorData)
	}
	walkSelector(selectorData,normalizer);
	var result = [];
	var groupResult = [];
	var dynamicSelectors = [];
	var attributeSelectors = [];
	var attributeClasses = [];
	var nthSelectors = [];
	var nthClasses = [];
	var notSelectors = [];
	var notClasses = [];
	var notPrefix = [];
	var emptySelectors = [];
	walkNode(selectorData,function(group,node,index){
		var pureSelector;
		for(var i=0;i<node.length;i++){
			var c = node[i];
			switch(c){
			case '.active__':
			case '.focus__': 
				pureSelector =  pureSelector || toPureSelector(groupResult,node);
				dynamicSelectors .push(pureSelector)
				break;
			default:
				switch(c.charAt(0) ){
				case '[':
					pureSelector =  pureSelector || toPureSelector(groupResult,node);
					attributeSelectors.push(pureSelector);
					attributeClasses.push(c.replace(/\[([\w\-\.]+).*/,'$1_3D'));
					break;
				case '.':
					var c2 = c.replace(/^\.(?:(?:nth|attr|ref-not)-(.*)|ref-empty)__$/,'$1')
					if(c2 != c){
						pureSelector =  pureSelector || toPureSelector(groupResult,node);
						if(/\.attr-.+__/.test(c)){
							//console.log(pureSelector)
							attributeSelectors.push(pureSelector);
							attributeClasses.push(c2);
						}else if(/\.nth-.+__/.test(c)){
							nthSelectors.push(pureSelector)
							nthClasses.push(c2);
						}else if(/\.ref-not-.+__/.test(c)){
							notSelectors.push(pureSelector);
							notPrefix.push(groupResult.join(''))
							notClasses && notClasses.push('not-'+c2);
						}else if(/\.ref-empty__/.test(c)){
							emptySelectors.push(pureSelector)
						}
					}
				}
					
			}
		}
		
		groupResult.push(node.join(''))
		if(index==group.length-1){
			result.push(groupResult.join(''))
			groupResult = [];
		}
	})
	rule.selectorText = result.reverse().join(',');
	css.setup('dc',dynamicSelectors);
	if(hasPSE){//only ie7
		var i = result.length
		while(i--){
			var item = result[i];
			var ownerItem = item.replace(/\s*>\s*\.(?:before|after)__$/,'');
			
			if(ownerItem != item){
				//console.log(ownerItem)
				var type = item.slice(ownerItem.length).replace(/.*(before|after)__/,'$1');
				//console.log(ownerItem,type);
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
	if(normalizeIE7Selector == normalizer){
		css.setup('attr',attributeSelectors).config('attr-classes',attributeClasses);
	}else{//ie8
		//非正常的plugin初始化！
		css.setup('update',attributeSelectors.map(function(a){
			return a.replace(/\:(?:active|focus|hover)\b|\.[\w\-_]+__\b/g,'');
		}),'cs-plugin-attr:1;').config('attr-classes',attributeClasses);
	}
	css.setup('update',nthSelectors.map(function(a){
		return a.replace(/\:(?:active|focus|hover)\b|\.[\w\-_]+__\b/g,'');
	}),'cs-update-nth:1;').config('nth-classes',nthClasses);
	emptySelectors.length && css.setup('update',emptySelectors,'cs-ref-empty:1;cs-ref:1;').config('ref-classes',['empty'])
	var i=notSelectors.length;
	while(i--){
		var nc = notClasses[i]
		var setupSelector = notSelectors[i];
		var target = decodeSelector(nc.slice(4))
		css.setup('update',[setupSelector],'cs-ref-'+nc+':1;cs-ref:1;')
			.config('ref-classes',[nc])
			.append(compileSelect(setupSelector,target),'cs-target-'+nc+':1;');
		var genRule = cssom.cssRules[index+1];
		doSelectorFilter(resource,cssom,genRule,index+1,normalizer)
	}
}
function compileSelect(selector,nc){
	return selector.replace(/[^\s>]*$/,function(a){
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
function toPureSelector(groupResult,node){
	var buf = groupResult.concat();
	for(var i=0;i<node.length;i++){
		var n = node[i];
		if(!/^\.\w+.*__$/.test(n)){
			buf.push(n);
		}
	}
	return buf.join('').replace(/[\s+~>]+$/,'$&*');
}
function normalizeIE7Selector(node,item,i){
	if(item.charAt() == ':'){
		item = item.substr(1);
		switch(item){
		//case 'hover':
		case 'active':
		case 'focus':
			node[i] = '.'+item+'__'
			break;
		default:
			normalizeIE8Pseudo(node,item,i);
		}
	}
}
function normalizeIE8Selector(node,item,i){
	if(item.charAt() == ':'){
		item = item.substr(1);
		normalizeIE8Pseudo(node,item,i);
	}
}
function pseudoElementToEnd(groups){
	var i=groups.length;
	while(i--){
		var group = groups[i];
		var node = group[group.length-1];
			var p=Math.max(node.indexOf(':before'),node.indexOf(':after'));
			if(p>=0){
				var e = node[p].slice(1);
				node.splice(p,1);
				group.push(['>','.'+e+'__'])
				var hasPSE = true;
				break;
			}
	}
	return hasPSE;
		
}
function normalizeIE8Pseudo(node,item,i){
	switch(item){
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
		node[i] = '.target__';
		break;
	case 'empty':
		//TODO:...
		node[i] = '.ref-empty__';
		break;
	case 'only-child':
	case 'only-of-type':
		var first = item.replace('only-','nth-')+'_0_1'
		node.splice(i+1,0,item.replace('only','.nth-last')+'_0_1__')
		newItem = first;
	//case 'first-child': //only for ie6
	//	newItem = newItem || 'nth-child_0_1'
	case 'last-child':
		newItem = newItem || 'nth-last-child_0_1'
	case 'first-of-type': 
		newItem = newItem || 'nth-of-type_0_1'
	case 'last-of-type':
		newItem = newItem || 'nth-last-of-type_0_1'
		item = newItem;
	default:
		if(/^nth-/.test(item)){//nth
			//nth-child,nth-last-child,nth-of-type,nth-last-of-type
			item = item.replace(/\(.*\)/,normalizeNth)
			node[i] = '.'+item+'__';
		}else if(/^not\(/.test(item)){
			item = item.slice(4,-1);
			var encoded = encodeSelector(item);
			node[i] = '.ref-not-'+encoded+'__'
		}
	}
}
exports.normalizeIE8Pseudo = normalizeIE8Pseudo;
exports.ie7SelectorFilter = ie7SelectorFilter;
exports.ie8SelectorFilter = ie8SelectorFilter;
exports.pseudoElementToEnd = pseudoElementToEnd;