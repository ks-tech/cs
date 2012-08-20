<?php
header("Content-type: text/html; charset=utf-8");
$filter = array_key_exists('filter', $_GET) ? $_GET['filter'] : '*';
$quirk = array_key_exists('quirk', $_GET);
if (!$quirk) {
    ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <?php } ?>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>CS Test Index Page</title>
    <script type="text/javascript" src="/static/cs.js"></script>
    <script type="text/javascript" src="static/jquery-1.3.2.js"></script>
    <script type="text/javascript" src="static/run.js"></script>
    <link media="screen" href="static/list.css" type="text/css" rel="stylesheet"/>
</head>
<body>
<div id="title">
    <h1>CS Test Index Page</h1>
</div>
<div id="id_control" class="control">
    <input id="id_control_runnext" type="checkbox"/>自动下一个
    <input id="id_control_breakonerror" type="checkbox"/>出错时终止
    <input id="id_control_clearstatus" type="button" value="清除用例状态"
           onclick="$('.testlist a').removeClass('running_case pass_case fail_case');"/>
</div>
<div>
    <a id="id_testlist_status" class="button"> <span
        onclick="$('div#id_testlist').slideToggle('slow');"> 折叠用例 </span> </a>
    <a id="id_srconly" class="button"><span
        onclick="$('#id_showSrcOnly').slideToggle('slow');">折叠缺失</span> </a>
    <a id="id_srconly" class="button"><span
        onclick="$('#id_runningarea').slideToggle('slow');">折叠执行</span> </a>
</div>
<div id="id_rerun" onclick="run($('#id_rerun').html());return false;"></div>
<div style="clear: both"></div>
<div id="id_testlist" class="testlist">
    <?php
    /*分析所有源码与测试代码js文件一一对应的文件并追加到当前列表中*/
    // require_once "case.class.php";
    // Kiss::listcase($filter);
    function filter($file, $include = null, $exclude = null, &$m = null) {
        return !(($include && preg_match($include, $file, $m) == 0) || ($exclude && preg_match($exclude, $file) != 0));
    }
    /**
     * 查找指定目录下的文件或目录
     * @static
     * @param string $path 目录路径
     * @param null $include 要包含的文件正则，如果设置了，则只有符合这个正则的文件才能被请求到
     * @param null $exclude  要排除的文件正则，如果设置了，即使是包含的文件，也会被排除
     * @param bool $recursion 是否递归查找，默认是true
     * @param bool $include_dir 找到的结果是否包含目录，默认为false，不包含
     * @param array $files 递归用的存储容器，不应该被用到
     * @return array 数组
     */
    function find($path, $include = null, $exclude = null, $recursion = true, $include_dir = false, &$files = array()) {
        // $path = self::realpath($path);
        if (is_dir($path)) {
            $path .= '/';
            $dir = dir($path);
            while (false !== ($entry = $dir->read())) {
                if ($entry == '.' || $entry == '..' || ($entry{0} == '.' && is_dir($path . $entry))) {
                    continue;
                }
                $entry = $path . $entry;
                if (is_dir($entry)) {
                    if ($include_dir && filter($entry, $include, $exclude)) {
                        $files[] = $entry;
                    }
                    if ($recursion) {
                        find($entry, $include, $exclude, true, $include_dir, $files);
                    }
                } else {
                    if (!filter($entry, $include, $exclude)) {
                        continue;
                    }
                    $files[] = $entry;
                }
            }
            $dir->close();
            return $files;
        } else if (is_file($path) && filter($path, $include, $exclude)) {
            $files[] = $path;
        }
        return $files;
    }

    $testdir = dirname(dirname(__FILE__)) . "/selector";
//var_dump($testdir);    
    $array = find($testdir, "/^((?!framework).)*\.js$/");
    foreach ($array as $key) {
        $key = str_replace('/', '.', substr($key, strlen($testdir) + 1));
        $id = 'id_case_' . join('_', explode('.', $key));
        print('<A class="jsframe_qunit" target="_blank" id="' . $id . '" title=' . $key . ' onlick="run(\'' . $key . '\')">' . $key . '</A>');
        // id=\"$c->case_id\" class=\"jsframe_qunit\" target=\"_blank\" title=\"$name\" onclick=\"run('$name');\$('#id_rerun').html('$name');return false;\">
    }
//    ?>
    <div style="clear: both; overflow: hidden"></div>
</div>
<div id="id_runningarea" class="runningarea" style="border: solid; display: none"></div>
<div id="id_reportarea" class="reportarea" style="display: none;"></div>
<div class='clear'></div>
</body>
</html>
