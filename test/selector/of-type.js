test("of-type", function () {
    frameHtml({
        src:'/test/selector/of-type/of-type.html',
        ontest:function (w, f) {

            equal('rgb(51, 51, 255)', w.$('li').eq(0).css('background-color'));
            equal('rgb(255, 51, 51)', w.$('li').eq(1).css('background-color'));
            equal('rgb(51, 255, 51)', w.$('li').eq(2).css('background-color'));

            equal('rgb(51, 51, 255)', w.$('li').eq(3).css('background-color'));
            equal('rgb(255, 51, 51)', w.$('li').eq(4).css('background-color'));
            equal('rgb(51, 255, 51)', w.$('li').eq(5).css('background-color'));

            equal('rgb(51, 51, 255)', w.$('li').eq(6).css('background-color'));
            equal('rgb(255, 51, 51)', w.$('li').eq(7).css('background-color'));
            equal('rgb(51, 255, 51)', w.$('li').eq(8).css('background-color'));

            equal('rgb(51, 51, 255)', w.$('li').eq(9).css('background-color'));
            equal('rgb(255, 51, 51)', w.$('li').eq(10).css('background-color'));
            equal('rgb(51, 255, 51)', w.$('li').eq(11).css('background-color'));

            this.finish();
        }
    });
});
