<?php
$file = 'index.html';
$newfile = 'index2.html';

if (!copy($file, $newfile)) {
    echo "failed to copy $file...\n";
}
?>