<?php

	define('DBUSER', 'final');
	define('DBPASS', 'final');
	define('DBBASE', 'heroes');
	define('DBHOST', '127.0.0.1:3306');

	function sf__restablecerSql () {
		$sqls = array_map(function ($v) {return trim($v);}, explode(PHP_EOL, file_get_contents(__DIR__ . '/../db/bd_dump.sql')));
		$nuevoSql = implode(PHP_EOL, array_slice($sqls, array_search('-- #####CORTE#####', $sqls)));
		return $nuevoSql;
	};
?>


