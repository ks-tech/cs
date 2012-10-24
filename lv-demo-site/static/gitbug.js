function initialize(){
	var all = document.all || document.getElementsByTagName('*');
	var end = all.length,i=-1;
	var showLabels = [];
	var defaultPath;
	var gitForm = null;
	while(++i<end){
		var el = all.item(i);
		var gitlabel = el.getAttribute('data-git-label');
		var gitpath = el.getAttribute('data-git-path');
		if(gitpath){
			defaultPath  = gitpath
		}
		if(gitlabel){
			showLabels.push([el,defaultPath,gitlabel])
			setupGitbug(el,defaultPath,gitlabel);
		}else{
			if(el.getAttribute('data-git-form')){
				gitForm = el;
			}
			
		}
	}
	
	if(gitForm){
		var i = showLabels.length;
		while(i--){
			var el = showLabels[i][0];
			var key = showLabels[i][2];
			var value = el.innerHTML || el.parentNode.textContent || el.parentNode.innerText;
			showLabels[i] = "<div><label>"+value+"<input name='labels' type='radio' value='"+key+"'/></label></div>"
		}
		showLabels.unshift('<form method="get" action="https://github.com/',defaultPath,'/issues/new"><div><input name="title" placeholder="title" size="8"/><input type="submit" value="Report"/></div>' +
				'<fieldset><legend>选择标签</legend>')
		gitForm.innerHTML = showLabels.join('')+'</fieldset></form>'
	}
	showLabels = null;
}
var gitbugInc = 0;
function setupGitbug(el,gitpath,gitlabel){
	
	var callback = 'c'+gitbugInc++ + +new Date()
	var listURL = "https://github.com/"+gitpath+"/issues?labels="+gitlabel
	var reportURL = "https://github.com/"+gitpath+"/issues/new?labels="+gitlabel
	var url = "https://api.github.com/repos/"+gitpath+"/issues?labels="+gitlabel+"&callback="+callback;
	var script = document.createElement('script');
	window[callback] = function(args){
		updateBugList(el,args.data,listURL,reportURL);
		el = script = null;
	}
	script.src = url;
	document.body.appendChild(script)
	
	
}

function updateBugList(el,buglist,listURL,reportURL){
	var i = buglist.length;
	var html = [];
	var total = 0;
	var unclosed = 0;
	while(i--){
		var gitbug = buglist[i];
		total ++;
		unclosed += !gitbug.closed_at;
		if(unclosed){
			html.push('<li class="unclosed" title="',gitbug.title,
				'"><a target="gitbug" href="',gitbug.html_url,'">',gitbug.title,'</a></li>')
		}else{
			html.push('<li class="closed" title="',gitbug.title,
				'"><a target="gitbug" href="',gitbug.html_url,'">',gitbug.title,'</a></li>')
		}
		//<div class="gitbug"><ul><li><a/></li></ul></div>
	}
	html.unshift('<a href="',listURL,'"><strong title="unclosed bug">',unclosed,'</strong><span title="closedbuf">',total,'</span></a><ul>');
	html.push('<li class="report"><a target="gitbug" href="',reportURL,'">Report BUG>></a></li>')
	html.push('</ul>')
	el.innerHTML = html.join('')
}

if(window.attachEvent){
	window.attachEvent('onload',initialize);
}else{
	window.addEventListener('load',initialize)
}
