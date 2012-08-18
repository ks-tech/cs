test("child", function () {
    frameHtml({
        src:'/test/selector/child/child.html',
        ontest:function (w, f) {

            colorEqual('rgb(255, 255, 0)', w.$('.parent > .child').css('background-color'));
            colorNotEqual('rgb(255, 255, 0)', w.$('.baby-sister > .child').css('background-color'));
            this.finish();
        }
    });
});
