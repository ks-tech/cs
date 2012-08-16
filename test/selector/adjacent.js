test("adjacent" ,function() {
    frameHtml({
        src : '/test/selector/adjacent/adjacent.html',
        ontest : function(w, f) {
            equal('rgb(255, 255, 0)', w.$('h2+p').css('background-color'));
            notEqual('rgb(255, 255, 0)', w.$('p').eq(1).css('background-color'));
            this.finish();
        }
    });
});
