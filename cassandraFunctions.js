/**
 * NodeからCassandraへのアクセスAPI 日付計算はmoment-timezoneを利用
 * 参考：http://momentjs.com/timezone/docs/
 */
var cassandra = require('cassandra-driver');
var moment = require("moment-timezone");
var Q = require('q');

// Set the auth provider in the clientOptions when creating the Client instance
var authProvider = new cassandra.auth.PlainTextAuthProvider('iotapp', 'pwdiotapp');

// prepare client
var client = new cassandra.Client({
contactPoints : [ 'ec2-52-193-198-108.ap-northeast-1.compute.amazonaws.com' ],
authProvider : authProvider,
keyspace : 'iot'
});

// Sensor ID
var sens_id = 's001.home';

// Cassandraデータ取得
exports.getDataByDay = function(dateTime) {
	var query = 'SELECT * FROM sens_by_day WHERE s_id=? and s_date=?';
	var data = Q.defer();
	var tmpdata = [];
	var time = [];
	var value = [];

	// データラベルを最初に設定
	time.push("DateTime");
	value.push("℃");

	// すべての結果rowに対する処理
	client.eachRow(query, [ sens_id, dateTime ], {
		prepare : true
	}, function(n, row) {
		// Date型処理
		var localdate = moment.tz(row['s_time'], 'Asia/Tokyo');
		// 日付をArrayにセット
		time.push(localdate.format('YYYY-MM-DD HH:mm'));
		// 値をArrayにセット
		value.push(row['s_val']);
	}, function(err, result) {
		// すべてのrowに対する処理が完了した後に実行される
		if (err) {
			console.error(err);
			return;
		}
		// 作成したArrayデータをオブジェクトにまとめる
		tmpdata.push(time, value);
		// 復帰値にセット
		data.resolve(tmpdata);
	});
	return data.promise;
}

// デバッグ用関数呼び出し (未使用時はコメントアウトする)
// rowの取得より先に関数が復帰してしまう(非同期処理)ため、Qで待ち合わせする
// 
// Q.when(module.exports.getDataByDay("2016-08-10")).done(function(ret) {
// console.log("getDataByDay returns [" + JSON.stringify(ret) + "]");
// });
