test("attr-list" ,function() {
    frameHtml({
        src : '/test/selector/attr-list/attr-list.html',
        ontest : function(w, f) {
            equal('rgb(255, 255, 0)', w.$('[class~=first]').css('background-color'));
            equal('rgb(255, 255, 0)', w.$('.first').css('background-color'));
            notEqual('rgb(255, 255, 0)', w.$('.second').css('background-color'));
            notEqual('rgb(255, 255, 0)', w.$('.third').css('background-color'));
            notEqual('rgb(255, 255, 0)', w.$('.second third').css('background-color'));
            this.finish();
        }
    });
});
