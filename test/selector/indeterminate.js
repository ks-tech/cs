test("indeterminate", function () {
    frameHtml({
        src:'/test/selector/indeterminate/indeterminate.html',
        ontest:function (w, f) {
            colorEqual('rgba(0, 0, 0, 0)', w.$('label').css('background-color'));
            w.$('button')[0].click();
            colorEqual('rgb(255, 255, 0)', w.$('label').css('background-color'));
            w.$('button')[1].click();
            colorEqual('rgba(0, 0, 0, 0)', w.$('label').css('background-color'));
//            equal('rgb(255, 255, 0)',  w.$('input').css('background-color'));
            this.finish();
        }
    });
});
