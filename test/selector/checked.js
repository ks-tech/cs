test("attr-list", function () {
    frameHtml({
        src:'/test/selector/checked/checked.html',
        ontest:function (w, f) {
            colorEqual('rgb(255, 255, 0)', w.$('span').eq(0).css('background-color'));
            colorEqual('rgba(0, 0, 0, 0)', w.$('span').eq(1).css('background-color'));
            w.$('input').eq(1).click();
            colorEqual('rgba(0, 0, 0, 0)', w.$('span').eq(0).css('background-color'));
            colorEqual('rgb(255, 255, 0)', w.$('span').eq(1).css('background-color'));
            this.finish();
        }
    });
});

