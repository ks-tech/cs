test("attr-list", function () {
    frameHtml({
        src:'/test/selector/attr-value/attr-value.html',
        ontest:function (w, f) {
            colorNotEqual('yellow', w.$('input').eq(0).css('background-color'));
            colorEqual('yellow', w.$('input').eq(1).css('background-color'));
            this.finish();
        }
    });
});
