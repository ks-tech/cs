test("first-child", function () {
    frameHtml({
        src:'/test/selector/first-child/first-child.html',
        ontest:function (w, f) {
            equal('rgb(255, 255, 0)',  w.$('li').eq(0).css('background-color'));
            equal('rgba(0, 0, 0, 0)',  w.$('li').eq(1).css('background-color'));
            this.finish();
        }
    });
});
