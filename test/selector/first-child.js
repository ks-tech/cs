test("first-child", function () {
    frameHtml({
        src:'/test/selector/first-child/first-child.html',
        ontest:function (w, f) {
            colorEqual('rgb(255, 255, 0)',  w.$('li').eq(0).css('background-color'));
            colorEqual('rgba(0, 0, 0, 0)',  w.$('li').eq(1).css('background-color'));
            this.finish();
        }
    });
});
