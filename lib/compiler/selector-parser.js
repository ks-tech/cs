//([tag,hash,class]),(attribute),(pseduNegation),(combinator),
exports.parseSelectors = parseSelectors;
var tokens = /([#\.]?[^\.\s\#\[\:+~>,]+|\*)|(\[(?:[^=]+)(?:(?:'(?:[^']|\\.)*'|"(?:[^"]|\\.)*"|[^\]])+)\])|(\:+[\w\-\_]+(?:\((?:[^()'"]|\([^()]+\)|'(?:[^']|\\.)*'|"(?:[^"]|\\.)*")*\))?)|\s*([~+>,\s])\s*/g
function normalizeAttribute(attr){
	return attr.replace(/'((?:[^']|\\.)*)'|"((?:[^"]|\\.)*)"|\s+/,function(a){
		if(/['"]/.test(a.charAt())){
			return JSON.stringify(this.eval(a))
		}else{
			return '';
		}
	})
}
/**
 * 解析 css rule 的 selectorText
 * 结果以数组表示 [group1,group2...]
 * 				group->[node1,node2,...]
 * 				node->[combinator1,selector1,combinator2,selector2...]
 */
function parseSelectors(source){
	var node = [''];
	var group = [node];
	var groups = [group];
	var valid = source.replace(tokens,function(all,tagHashClass,attribute,pseduNegation,combinator,index){
		if(tagHashClass){
			node.push(all)
		}else if(attribute){
			node.push(normalizeAttribute(all))
		}else if(pseduNegation){
			//type_selector | universal | HASH | class | attrib | pseudo
			if(/^\:\:(?:before|after|first-line|first-letter)$/i.test(all)){
				all = all.slice(1);
			}else if(/:not\(\s*\[/.test(all)){
				node.push(normalizeAttribute(all))
			}else if(/:root$/g.test(all)){
				//node 必须是第一个node，有+>~在前必须匹配失败
				var invalid = true;
				if(node === group[0] && node[0] == ''){
					if(/^(?:\*|html)$/.test(node[1]) || node.length == 1){
						node[1] = 'html'
						invalid = false;
					}else if(!/^[\w\-]+$/.test(node[1])){//如果没有任何标签，也可能通过（加上html）
						node.splice(1,0,'html')
						invalid = false;
					}
				}
				if(invalid){
					node.push(all)
				}
			}else{
				node.push(all.replace(/\s*/g,''))
			}
		}else if(combinator){
			switch(combinator){
			case ',':
				node = ['']
				group = [node];
				groups.push(group)
				break;
			case '+':
			case '~':
			case '>':
				node = [combinator]
				group.push(node);
				break;
			default://\s
				node = [' ']
				group.push(node);
			}
		}
		return '';
	});
	if(valid){
		console.error(source+'is valid! some unrecognized selector type left:'+valid)
	}
	return groups;
}



//selectors_group
//  : selector [ COMMA S* selector ]*
//  ;
//selector
//  : simple_selector_sequence [ combinator simple_selector_sequence ]*
//  ;
//combinator
//  /* combinators can be surrounded by whitespace */
//  : PLUS S* | GREATER S* | TILDE S* | S+
//  ;
//simple_selector_sequence
//  : [ type_selector | universal ]
//    [ HASH | class | attrib | pseudo | negation ]*
//  | [ HASH | class | attrib | pseudo | negation ]+
//  ;
//
//type_selector
//  : [ namespace_prefix ]? element_name
//  ;
//
//namespace_prefix
//  : [ IDENT | '*' ]? '|'
//  ;
//
//element_name
//  : IDENT
//  ;
//
//universal
//  : [ namespace_prefix ]? '*'
//  ;
//
//class
//  : '.' IDENT
//  ;
//
//attrib
//  : '[' S* [ namespace_prefix ]? IDENT S*
//        [ [ PREFIXMATCH |
//            SUFFIXMATCH |
//            SUBSTRINGMATCH |
//            '=' |
//            INCLUDES |
//            DASHMATCH ] S* [ IDENT | STRING ] S*
//        ]? ']'
//  ;
//
//pseudo
//  /* '::' starts a pseudo-element, ':' a pseudo-class */
//  /* Exceptions: :first-line, :first-letter, :before and :after. */
//  /* Note that pseudo-elements are restricted to one per selector and */
//  /* occur only in the last simple_selector_sequence. */
//  : ':' ':'? [ IDENT | functional_pseudo ]
//  ;
//
//functional_pseudo
//  : FUNCTION S* expression ')'
//  ;
//
//expression
//  /* In CSS3, the expressions are identifiers, strings, */
//  /* or of the form "an+b" */
//  : [ [ PLUS | '-' | DIMENSION | NUMBER | STRING | IDENT ] S* ]+
//  ;
//
//negation
//  : NOT S* negation_arg S* ')'
//  ;
//
//negation_arg
//  : type_selector | universal | HASH | class | attrib | pseudo
//  ;
