test("attr" ,function() {
    frameHtml({
        src : '/test/selector/attr/attr.html',
        ontest : function(w, f) {
            colorEqual('rgb(255, 255, 0)', w.$('a[href]').css('background-color'));
            colorNotEqual('rgb(255, 255, 0)', w.$('a[name]').css('background-color'));
            this.finish();
        }
    });
});
