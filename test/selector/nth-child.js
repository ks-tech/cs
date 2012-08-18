test("nth-child", function () {
    frameHtml({
        src:'/test/selector/nth-child/nth-child.html',
        ontest:function (w, f) {
            colorEqual('rgba(0, 0, 0, 0)', w.$('.singular tr').eq(0).css('background-color'));
            colorEqual('rgba(0, 0, 0, 0)', w.$('.singular tr').eq(1).css('background-color'));
            colorEqual('rgb(255, 0, 0)', w.$('.singular tr').eq(2).css('background-color'));
            colorEqual('rgba(0, 0, 0, 0)', w.$('.singular tr').eq(3).css('background-color'));
            
            
            colorEqual('rgb(0, 128, 0)', w.$('.singular2 tr').eq(0).css('background-color'));
            colorEqual('rgba(0, 0, 0, 0)', w.$('.singular2 tr').eq(1).css('background-color'));
            colorEqual('rgba(0, 0, 0, 0)', w.$('.singular2 tr').eq(2).css('background-color'));
            colorEqual('rgba(0, 0, 0, 0)', w.$('.singular2 tr').eq(3).css('background-color'));

            colorEqual('rgb(255, 165, 0)', w.$('.all tr').css('background-color'));

            colorEqual('rgb(0, 0, 255)', w.$('.all2 tr').css('background-color'));

            colorEqual('rgb(255, 0, 0)', w.$('.all3 tr').css('background-color'));

            colorEqual('rgba(0, 0, 0, 0)', w.$('.even tr').eq(0).css('background-color'));
            colorEqual('rgb(0, 128, 0)', w.$('.even tr').eq(1).css('background-color'));
            colorEqual('rgba(0, 0, 0, 0)', w.$('.even tr').eq(2).css('background-color'));
            colorEqual('rgb(0, 128, 0)', w.$('.even tr').eq(3).css('background-color'));

            colorEqual('rgb(255, 165, 0)', w.$('.odd tr').eq(0).css('background-color'));
            colorEqual('rgba(0, 0, 0, 0)', w.$('.odd tr').eq(1).css('background-color'));
            colorEqual('rgb(255, 165, 0)', w.$('.odd tr').eq(2).css('background-color'));
            colorEqual('rgba(0, 0, 0, 0)', w.$('.odd tr').eq(3).css('background-color'));

            colorEqual('rgba(0, 0, 0, 0)', w.$('.firstRows tr').eq(0).css('background-color'));
            colorEqual('rgba(0, 0, 0, 0)', w.$('.firstRows tr').eq(1).css('background-color'));
            colorEqual('rgb(192, 192, 192)' , w.$('.firstRows tr').eq(2).css('background-color'));
            colorEqual('rgb(192, 192, 192)' , w.$('.firstRows tr').eq(3).css('background-color'));

            colorEqual('rgb(0, 128, 0)' , w.$('div p').eq(0).css('background-color'));
            colorEqual('rgb(0, 0, 255)' , w.$('div p').eq(1).css('background-color'));
            colorEqual('rgb(255, 165, 0)' , w.$('div p').eq(2).css('background-color'));
            colorEqual('rgb(255, 0, 0)' , w.$('div p').eq(3).css('background-color'));

            this.finish();
        }
    });
});
