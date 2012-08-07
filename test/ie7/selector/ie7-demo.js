document.write("<style>"+
(('IE7'in window&&IE7.compat>=IE7.appVersion)?"":"#ie7_demo button{display:none;}")+
"#ie7_demo{position:relative;background:"+
(('IE7'in window&&IE7.compat>=IE7.appVersion&&location.search!="?ie7_off")?"yellow":"#ccc")+
";color:black;padding:4px 0;margin:0;text-indent:8px;"+
"left:0;top:0;letter-spacing:normal;text-align:left;height:auto;width:200px;border:none;"+
"font:bold 32px/36px Verdana,Arial,Helvetica,sans-serif;text-transform:none;z-index:99;}"+
"#ie7_demo button{margin:6px 0 0 20px;line-height:normal;vertical-align:top;text-indent:0px;width:5em;}</style>"+
"<h1 id='ie7_demo'>IE7&nbsp;<button type=button onclick=\"location.replace(location.pathname+'"+
(location.search=="?ie7_off"?"":"?ie7_off")+"')\">"+
(location.search=="?ie7_off"?"Apply":"Remove")+"</button></h1>");