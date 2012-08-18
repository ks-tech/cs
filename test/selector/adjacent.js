test("adjacent" ,function() {
    frameHtml({
        src : '/test/selector/adjacent/adjacent.html',
        ontest : function(w, f) {
            colorEqual('rgb(255, 255, 0)', w.$('h2+p').css('background-color'));
            colorNotEqual('rgb(255, 255, 0)', w.$('p').eq(1).css('background-color'));
            this.finish();
        }
    });
});
