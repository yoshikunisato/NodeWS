/**
 * NodeからCassandraへのアクセスAPI
 */
var cassandra = require('cassandra-driver');

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

function getDataByDay(dateTime) {
	var query = 'SELECT * FROM sens_by_day WHERE s_id=? and s_date=?';
	var data = [];
	var time = [];
	var value = [];
	
	// すべての結果rowに対する処理
	client.eachRow(query, [ sens_id, dateTime ], { prepare: true }, function(n, row) {
		// Date型処理
		dtime = new Date(row['s_time']);
		//console.log(row['s_id'] + ' ,' + row['s_date'] + ' ' + dtime.toLocaleTimeString({timeZone : 'Asia/Tokyo'}) + ', ' + row['s_val']);
		time.push(dtime.toLocaleTimeString({timeZone : 'Asia/Tokyo'}));
		value.push(row['s_val']);
	},function(err, result) {
		// すべてのrowに対する処理が完了した後に実行される
		if(err){
			console.error(err);
			return;
		}
		// 取得したデータをJSONにまとめる
		data.push(time, value);
		console.log(JSON.stringify(data));
		return;
	});
}

// TODO: rowの取得より先に関数が復帰してしまう(非同期処理)
var ret = getDataByDay("2016-08-10");
console.log("getDataByDay returns ["+ret+"]");
