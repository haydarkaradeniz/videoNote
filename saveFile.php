<?php
$parts = parse_url($url);
parse_str($parts['query'], $query);
echo $query['fileName'];
file_put_contents($query['fileName'], $query['content']);
?>