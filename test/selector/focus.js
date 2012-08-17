test("focus", function () {
    frameHtml({
        src:'/test/selector/focus/focus.html',
        ontest:function (w, f) {
            w.$('input').focus();
            equal('rgb(255, 255, 0)',  w.$('input').css('background-color'));
            this.finish();
        }
    });
});
