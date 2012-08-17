test("only-child", function () {
    frameHtml({
        src:'/test/selector/root/root.html',
        ontest:function (w, f) {
            equal('rgb(255, 255, 0)', w.$(':root').eq(0).css('background-color'));
            this.finish();
        }
    });
});
