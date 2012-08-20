test("indeterminate", function () {
    frameHtml({
        src:'/test/selector/indirect/indirect.html',
        ontest:function (w, f) {
            colorEqual('rgba(0, 0, 0, 0)', w.$('div').css('background-color'));
            colorEqual('yellow', w.$('p').eq(0).css('background-color'));
            colorEqual('yellow', w.$('p').eq(1).css('background-color'));
            colorEqual('yellow', w.$('p').eq(2).css('background-color'));
            this.finish();
        }
    });
});
