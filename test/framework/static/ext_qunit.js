/**
 * 重载QUnit部分接口实现批量执行控制功能
 */
(function() {
	if (!QUnit)
		return;
	var ms = QUnit.moduleStart, d = QUnit.done;

	function _d(args /* failures, total */) {
		//默认展开失败用例
		$('li.fail ol').toggle();
		if (parent && parent.brtest) {
			parent.$(parent.brtest).trigger('done', [ new Date().getTime(), {
				failed : args[0],
				passed : args[1]
			}, window._$jscoverage || null ]);
		}
	}
	QUnit.moduleStart = function() {
		stop();
		/* 为批量执行等待import.php正确返回 */
		var h = setInterval(function() {
			if (window && window['baidu']) {
				clearInterval(h);
				ms.apply(this, arguments);
				start();
			}
		}, 20);
	};
	QUnit.done = function() {
		_d(arguments);
		d.apply(this, arguments);
	};
})();
//function RGBToHex(rgb){
//    var regexp = /^rgb/(([0-9]{0,3})/,/s([0-9]{0,3})/,/s([0-9]{0,3})/)/g;
//    var re = rgb.replace(regexp, "$1 $2 $3").split(" ");//利用正则表达式去掉多余的部分  
//    var hexColor = "#"; var hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
//    for (var i = 0; i < 3; i++) {
//        var r = null; var c = re[i];
//        var hexAr = [];
//        while (c > 16) {
//            r = c % 16;
//            c = (c / 16) >> 0;
//            hexAr.push(hex[r]);
//        } hexAr.push(hex[c]);
//        hexColor += hexAr.reverse().join('');
//    }
//    //alert(hexColor)  
//    return hexColor;
//}