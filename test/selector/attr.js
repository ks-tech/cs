test("attr" ,function() {
    frameHtml({
        src : '/test/selector/attr/attr.html',
        ontest : function(w, f) {
            equal('rgb(255, 255, 0)', w.$('a[href]').css('background-color'));
            notEqual('rgb(255, 255, 0)', w.$('a[name]').css('background-color'));
            this.finish();
        }
    });
});
