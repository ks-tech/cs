test("only-child", function () {
    frameHtml({
        src:'/test/selector/root/root.html',
        ontest:function (w, f) {
            colorEqual('yellow', w.$(':root').eq(0).css('background-color'));
            this.finish();
        }
    });
});