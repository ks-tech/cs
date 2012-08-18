test("child", function () {
    frameHtml({
        src:'/test/selector/cursor-pointer/cursor-pointer.html',
        ontest:function (w, f) {
            colorEqual('pointer', w.$('p.pointer').css('cursor'));
            this.finish();
        }
    });
});
