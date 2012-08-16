test("child", function () {
    frameHtml({
        src:'/test/selector/child/child.html',
        ontest:function (w, f) {
            
            equal('rgb(255, 255, 0)', w.$('.parent > .child').css('background-color'));
            notEqual('rgb(255, 255, 0)', w.$('.baby-sister > .child').css('background-color'));
            this.finish();
        }
    });
});
