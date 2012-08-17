test("indeterminate", function () {
    frameHtml({
        src:'/test/selector/lang/lang.html',
        ontest:function (w, f) {
            
            equal('rgb(255, 255, 0)', w.$('p').eq(0).css('background-color'));
            equal('rgba(0, 0, 0, 0)', w.$('p').eq(1).css('background-color'));
            this.finish();
        }
    });
});
