test("attr-end" ,function() {
    frameHtml({
        src : '/test/selector/attr-begin/attr-begin.html',
        ontest : function(w, f) {
            colorEqual('transparent', w.$('p').eq(0).css('background-color'));
            colorEqual('transparent', w.$('p').eq(1).css('background-color'));
            colorEqual('yellow', w.$('p').eq(2).css('background-color'));
            this.finish();
        }
    });
});
