test("enabled", function () {
    frameHtml({
        src:'/test/selector/enabled/enabled.html',
        ontest:function (w, f) {
            colorEqual('yellow',  w.$('input').eq(0).css('background-color'));
            colorNotEqual('rgba(0, 0, 0, 0)', w.$('input').eq(1).css('background-color'));
            colorEqual('yellow',  w.$('input').eq(2).css('background-color'));
            this.finish();
        }
    });
});
