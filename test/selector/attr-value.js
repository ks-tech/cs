test("attr-list", function () {
    frameHtml({
        src:'/test/selector/attr-value/attr-value.html',
        ontest:function (w, f) {
            colorNotEqual('rgb(255, 255, 0)', w.$('input').eq(0).css('background-color'));
            colorEqual('rgb(255, 255, 0)', w.$('input').eq(1).css('background-color'));
            this.finish();
        }
    });
});
