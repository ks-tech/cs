test("only-child", function () {
    frameHtml({
        src:'/test/selector/only-child/only-child.html',
        ontest:function (w, f) {

            equal('rgb(255, 255, 0)', w.$('span').eq(0).css('background-color'));
            equal('rgba(0, 0, 0, 0)', w.$('span').eq(1).css('background-color'));
            equal('rgba(0, 0, 0, 0)', w.$('span').eq(2).css('background-color'));
            
            this.finish();
        }
    });
});
