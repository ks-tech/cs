test("disabled", function () {
    frameHtml({
        src:'/test/selector/disabled/disabled.html',
        ontest:function (w, f) {
            colorNotEqual('yellow',  w.$('input').eq(0).css('background-color'));
            colorEqual('yellow', w.$('input').eq(1).css('background-color'));
            colorNotEqual('yellow',  w.$('input').eq(2).css('background-color'));
            this.finish();
        }
    });
});
