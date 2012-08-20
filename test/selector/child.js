test("child", function () {
    frameHtml({
        src:'/test/selector/child/child.html',
        ontest:function (w, f) {

            colorEqual('yellow', w.$('div .child').eq(0).css('background-color'));
            colorNotEqual('red', w.$('div .child').eq(0).css('background-color'));
            this.finish();
        }
    });
});
