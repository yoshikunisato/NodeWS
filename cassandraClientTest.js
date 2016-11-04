/**
 * NodeからCassandraへのアクセスサンプル
 * 日付計算はmoment-timezoneを利用
 * 参考：http://momentjs.com/timezone/docs/
 */
var cassandra = require('cassandra-driver');
var moment = require("moment-timezone");

// Set the auth provider in the clientOptions when creating the Client instance
var authProvider = new cassandra.auth.PlainTextAuthProvider('iotapp', 'pwdiotapp');

// prepare client
var client = new cassandra.Client({
//contactPoints : [ 'cassandra.japanwest.cloudapp.azure.com' ],
contactPoints : [ '133.162.209.156' ], // Fujitsu K5
authProvider : authProvider,
keyspace : 'iot'
});

var query = 'SELECT * FROM sens_by_day WHERE s_id=? and s_date=?';
client.execute(query, [ 's001.home', '2016-08-14' ], function(err, result) {
	if (err)
		return console.error(err);
	var row = result.first();
	// Date型処理
	var localdate = moment.tz(row['s_time'], 'Asia/Tokyo');
	// console.log(row['s_id']+' ,'+row['s_date']+'
	// '+dtime.toLocaleTimeString({timeZone:'Asia/Tokyo'})+', '+row['s_val']);
	console.log(row['s_id'] + ' ,' + localdate.format('YYYY-MM-DD HH:mm') + ', ' + row['s_val']);
});
