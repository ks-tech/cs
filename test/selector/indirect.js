test("indeterminate", function () {
    frameHtml({
        src:'/test/selector/indirect/indirect.html',
        ontest:function (w, f) {
            equal('rgba(0, 0, 0, 0)', w.$('div').css('background-color'));
            equal('rgb(255, 255, 0)', w.$('p').eq(0).css('background-color'));
            equal('rgb(255, 255, 0)', w.$('p').eq(1).css('background-color'));
            equal('rgb(255, 255, 0)', w.$('p').eq(2).css('background-color'));
            this.finish();
        }
    });
});
