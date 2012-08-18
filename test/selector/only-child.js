test("only-child", function () {
    frameHtml({
        src:'/test/selector/only-child/only-child.html',
        ontest:function (w, f) {

            colorEqual('rgb(255, 255, 0)', w.$('span').eq(0).css('background-color'));
            colorEqual('rgba(0, 0, 0, 0)', w.$('span').eq(1).css('background-color'));
            colorEqual('rgba(0, 0, 0, 0)', w.$('span').eq(2).css('background-color'));
            
            this.finish();
        }
    });
});
