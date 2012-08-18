test("attr-list" ,function() {
    frameHtml({
        src : '/test/selector/attr-list/attr-list.html',
        ontest : function(w, f) {
            colorEqual('rgb(255, 255, 0)', w.$('[class~=first]').css('background-color'));
            colorEqual('rgb(255, 255, 0)', w.$('.first').css('background-color'));
            colorNotEqual('rgb(255, 255, 0)', w.$('.second').css('background-color'));
            colorNotEqual('rgb(255, 255, 0)', w.$('.third').css('background-color'));
            colorNotEqual('rgb(255, 255, 0)', w.$('.second').eq(2).css('background-color'));
            this.finish();
        }
    });
});
