test("attr-list" ,function() {
    frameHtml({
        src : '/test/selector/attr-list/attr-list.html',
        ontest : function(w, f) {
            colorEqual('yellow', w.$('[class~=first]').css('background-color'));
            colorEqual('yellow', w.$('.first').css('background-color'));
            colorNotEqual('yellow', w.$('.second').css('background-color'));
            colorNotEqual('yellow', w.$('.third').css('background-color'));
            colorNotEqual('yellow', w.$('.second').eq(2).css('background-color'));
            this.finish();
        }
    });
});
