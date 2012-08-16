test("attr-list", function () {
    frameHtml({
        src:'/test/selector/attr-value/attr-value.html',
        ontest:function (w, f) {
            notEqual('rgb(255, 255, 0)', w.$('input').eq(0).css('background-color'));
            equal('rgb(255, 255, 0)', w.$('input').eq(1).css('background-color'));
            this.finish();
        }
    });
});
