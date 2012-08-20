test("adjacent" ,function() {
    frameHtml({
        src : '/test/selector/adjacent/adjacent.html',
        ontest : function(w, f) {
            colorEqual('yellow', w.$('h2+p').css('background-color'));
            colorNotEqual('yellow', w.$('p').eq(1).css('background-color'));
            this.finish();
        }
    });
});
