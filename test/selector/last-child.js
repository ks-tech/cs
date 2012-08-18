test("indeterminate", function () {
    frameHtml({
        src:'/test/selector/last-child/last-child.html',
        ontest:function (w, f) {
            colorEqual('rgba(0, 0, 0, 0)', w.$('li').eq(0).css('background-color'));
            colorEqual('rgba(0, 0, 0, 0)', w.$('li').eq(1).css('background-color'));
            colorEqual('rgb(255, 255, 0)', w.$('li').eq(2).css('background-color'));
            this.finish();
        }
    });
});
