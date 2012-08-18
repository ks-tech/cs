test("external-style", function () {
    frameHtml({
        src:'/test/selector/external-style/external-style.html',
        ontest:function (w, f) {
            colorEqual('rgb(30, 119, 211)',  w.$('body').css('background-color'));
            this.finish();
        }
    });
});
