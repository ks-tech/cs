<?php
header("Content-type: text/html; charset=utf-8");
header("Cache-Control: no-cache, max-age=10, must-revalidate");
if(!array_key_exists('quirk', $_GET)){
	print '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
};
$case = $_GET['case'];
$case = substr($case , 0 , strlen($case)-3);
$casestr = str_replace(".", "/", $case);
?>

<head>
    <title>Qunit</title>
    <meta content="text/html; charset=UTF-8" http-equiv='Context-Type' />
    <link href="static/framework.css" type="text/css" rel="stylesheet"/>
    <script type="text/javascript" src="/static/cs.js"></script>
    <script type="text/javascript" src="static/jquery-1.3.2.js"></script>
    <script type="text/javascript" src="static/testrunner.js"></script>
    <script type="text/javascript" src="static/framework.js"></script>
    <script type="text/javascript" src="static/ext_qunit.js"></script>
<script type="text/javascript" src="/test/selector/<?php echo $casestr;?>.js"></script>
</head>
<body>
<h1 id="qunit-header"><?php echo $case?></h1>
<h2 id="qunit-banner"></h2>
<h2 id="qunit-userAgent"></h2>
<ol id="qunit-tests"></ol>
</body>
</html>