test("indeterminate", function () {
    frameHtml({
        src:'/test/selector/not/not.html',
        ontest:function (w, f) {
            equal('rgba(0, 0, 0, 0)', w.$('li').eq(0).css('background-color'));
            equal('rgb(255, 255, 0)', w.$('li').eq(1).css('background-color'));
            equal('rgb(255, 255, 0)', w.$('li').eq(2).css('background-color'));
            this.finish();
        }
    });
});
