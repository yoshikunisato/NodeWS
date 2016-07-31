/**
 * NodeからCassandraへのアクセスサンプル
 */
const cassandra = require('cassandra-driver');

//Set the auth provider in the clientOptions when creating the Client instance
const authProvider = new cassandra.auth.PlainTextAuthProvider('iotapp', 'pwdiotapp');

// prepare client
const client = new cassandra.Client({ contactPoints: ['ec2-52-193-198-108.ap-northeast-1.compute.amazonaws.com'], authProvider: authProvider, keyspace: 'iot'});

const query = 'SELECT * FROM sens_by_day WHERE s_id=? and s_date=?';
client.execute(query, ['s001.home','2016-07-27'], function(err, result) {
	if (err) return console.error(err);
	const row = result.first();
	// Date型処理
	dtime = new Date(row['s_time']);
	console.log(row['s_id']+' ,'+row['s_date']+' '+dtime.toLocaleTimeString({timeZone:'Asia/Tokyo'})+', '+row['s_val']);
});
