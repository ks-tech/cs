function frameHtml(op) {
    stop();
    var pw = op.win || window, w, f, url = '', id = typeof op.id == 'undefined' ? 'f'
            : op.id, fid = 'iframe#' + id;
    op.finish = function() {
        pw.$(fid).unbind();
        setTimeout(function() {
            pw.$('div#div'+id).remove();
            start();
        }, 20);
    };

    if (pw.$(fid).length == 0) {
        /* 添加frame，部分情况下，iframe没有边框，为了可以看到效果，添加一个带边框的div */
        pw.$(pw.document.body).append('<div id="div' + id + '"></div>');
        pw.$('div#div' + id).append('<iframe id="' + id + '"></iframe>');
    }
    // srcpath = op.src;
    pw.$(fid).one('load', function(e) {
        var w = e.target.contentWindow;
        var h = setInterval(function() {
        clearInterval(h);
        op.ontest(w, w.frameElement);
        }, 20);
        // 找到当前操作的iframe，然后call ontest
    }).attr('src', op.src);
}

var testdir = "";