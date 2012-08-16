function run(kiss, runnext) {
    window.document.title = kiss;
    
    var wb = window.brtest = window.brtest || {};
    
    wb.timeout = wb.timeout || 8000;
    wb.breakOnError = /breakonerror=true/gi.test(location.search)
        || $('input#id_control_breakonerror').attr('checked');
    wb.runnext = /batchrun=true/gi.test(location.search) || runnext
        || $('input#id_control_runnext').attr('checked');
    wb.kiss = kiss;
    var cid = 'id_case_' + kiss.split('.').join('_');
//    /* 只有参数有showsrconly的时候才显示div */
//    if (/showsrconly=true/gi.test(location.search)) {
//        var div = document.getElementById('id_testlist_srconly');
//        div.style.display = 'block';
//    }
    /* id中由于嵌入用例名称，可能存在导致通过id直接$无法正确获取元素的情况 */
    wb.kissnode = $(document.getElementById(cid));
    wb.kisses = wb.kisses || {};
////    把没有用例的情况加入到报告中
//    if (!wb.kisslost) {
//        $('div#id_showSrcOnly a').each(function () {
//            wb.kisses[this.title] = '0,0,_,0,0';
//        });
//        wb.kisslost = true;
//    }
    
    var wbkiss = wb.kisses[wb.kiss] = wb.kisses[wb.kiss] || '';

    /**
     * 超时处理
     */
    var toh = setTimeout(function () {
        if (!window.brtest.breakOnError)
            $(wb).trigger('done', [ new Date().getTime(), {
                failed:1,
                passed:1
            }, null, 'timeout' ]);
    }, wb.timeout);
    /**
     * 为当前用例绑定一个一次性事件
     */
    $(wb)
        .one(
        'done',
        function (event, a, b) {
            clearTimeout(toh);
            var wb = window.brtest, errornum = b.failed, allnum = b.failed
                + b.passed;// , testTimeOutFlag = b[2];
            wb.kissend = new Date().getTime();
            wb.kissnode.removeClass('running_case');
            /*
             * ext_qunit.js的_d方法会触发done事件
             * top.$(wbkiss).trigger('done', [ new Date().getTime(),
             * args ]); new Date().getTime()指向a参数，args指向b参数
             */
            wb.kisses[wb.kiss] = errornum + ',' + allnum + ',_,'
                + wb.kissstart + ',' + wb.kissend;

            if (errornum > 0) {
                wb.kissnode.addClass('fail_case');
                // wb.kisses[kiss + '_error'] =
                // window.frames[0].innerHTML;
            } else
                wb.kissnode.addClass('pass_case');

            if (wb.runnext
                && (!wb.breakOnError || parseInt(wb.kisses[wb.kiss]
                .split(',')[0]) == 0)) {
                var nextA = wb.kissnode.next()[0];
                if (nextA.tagName == 'A') {
                    if (wb.kisses[nextA.title] === undefined)
                        run(nextA.title, wb.runnext);
                } else {
                    /* 隐藏执行区 */
                    // $('div#id_runningarea').toggle();
                    /* ending 提交数据到后台 */
                    wb.kisses['config'] = location.search
                        .substring(1);
                    var url = /mail=true/.test(location.search) ? 'record.php'
                        : 'report.php';
                    /**
                     * 启动时间，结束时间，校验点失败数，校验点总数
                     */
                    $.ajax({
                        url:url,
                        type:'post',
                        data:wb.kisses,
                        success:function (msg) {
                            // $('#id_testlist').hide();
                            /* 展示报告区 */
                            $('#id_reportarea').show().html(msg);
                        },
                        error:function (xhr, msg) {
                            alert('fail' + msg);
                        }
                    });
                }
            }
        });

    /**
     * 初始化执行区并通过嵌入iframe启动用例执行
     */
    var url = 'run.php?case=' + kiss + '&time=' + new Date().getTime() + "&"
        + location.search.substring(1);
    // + (location.search.length > 0 ? '&' + location.search.substring(1)
    // : '');

    var fdiv = 'id_div_frame_' + kiss.split('.').join('_');
    var fid = 'id_frame_' + kiss.split('.').join('_');
    wb.kissnode.addClass('running_case');
    if ($('input#id_control_hidelist').attr('checked'))
        $('div#id_testlist').css('display', 'none');
    /* 隐藏报告区 */
    $('div#id_reportarea').empty().hide();
    /* 展示执行区 */
    $('div#id_runningarea').empty().css('display', 'block').append(
        '<iframe id="' + fid + '" src="' + url
            + '" class="runningframe"></iframe>');
    wb.kissstart = new Date().getTime();
}
;

/**
 * 为批量运行提供入口，参数携带batchrun=true
 */
$(document).ready(
    function () {
        $('.jsframe_qunit').bind('click', function () {
            var kiss = $(this).attr('title');
            run(kiss);
        })
        if (location.href.search("[?&,]batchrun=true") > 0
            || $('input#id_control_runnext').attr('checked')) {
            run($('div#id_testlist a').attr('title'), true);
        }
    });
