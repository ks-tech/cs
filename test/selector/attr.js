test("attr" ,function() {
    frameHtml({
        src : '/test/selector/attr/attr.html',
        ontest : function(w, f) {
            colorEqual("yellow", w.$('a[href]').css('background-color'));
            colorNotEqual('yellow', w.$('a[name]').css('background-color'));
            this.finish();
        }
    });
});
