$JSI.load('cs/lib/compiler/color-parser',function(exports){
	window.normalizeColor = exports.normalizeColor;
},true);

var Test = {
	tasks:[],
	index:0,
	run:function(delay){
		if(delay){
			setTimeout(Test.run,delay);
			return;
		}
		if(Test.index<Test.tasks.length){
			var task = Test.tasks[Test.index++];
			try{
				var interval = task[1].apply(Test);
				Test.closeCase(task[0]);
			}catch(e){
				Test.closeCase(task[0],e);
				Test.run();
				return;
			}
			if(interval>=0||!interval){
				Test.run(interval || 0)
			}
		}else{
			Test.run = Function.prototype;
			Test.closeUnit(document.title);
		}
	},
	on:function(el,type,callback){
		try{
			el.addEventListener(type,callback)
		}catch(e){
			el.attachEvent("on"+type,callback)
		}
	},
	addTask:function(title,callback){
		this.tasks.push([title,callback])
		return this;
	},
	showMessage:function(msg){
		alert(msg)
	},
	closeCase:function(title,e){
		if(window.parent && parent.closeCase){
			parent.closeCase(title)
		}else{
			if(e){
				showResult('失败:'+e.message+','+e+':'+title)
			}else if(!/^@(?:before|after)/.test(title)){
				showResult('成功:'+title)
			}
		}
	},
	closeUnit:function(title){
		if(window.parent && parent.closeUnit){
			parent.closeUnit(title)
		}else{
			showResult('完成用例组:'+title)
		}
	},
	assertColor:function(actual,expect){
		this.assert(normalizeColor(actual),normalizeColor(expect))
	},
	assert:function(actual,expect){
		if(expect != actual){
			throw actual + '!=' +expect;
		}
	}
}
function showResult(result){
	if(!Test.resultDiv){
		Test.resultDiv = document.createElement('div');
		document.body.appendChild(Test.resultDiv)
	}
	var content = document.createElement('div');
	if(/^成功:/.test(result)){
		content.style.background= 'green'
	}else if(/^失败:/.test(result)){
		content.style.background= 'red'
	}
	content.appendChild(document.createTextNode(result))
	content.style.border = '1px solid blue'
	Test.resultDiv.appendChild(content);
}

