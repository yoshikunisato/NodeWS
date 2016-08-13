/**
 * Websocketのサンプル http://qiita.com/toshirot/items/a461cdc8c2079d9b8530
 */
var WsServer = require('ws').Server;
var tid;

// WebSocketサーバー作成
var ws = new WsServer({
	// host: 'ccchart.com',
	host : 'localhost',
	port : 80
});

broadCast();// データ配信開始

// クライアント接続時イベント
ws.on('connection', function(socket) {
	console.log('conned: ' + ws.clients.length);
});

// 100ms毎にデータをブロードキャストする
function broadCast() {
	tid = setInterval(function() {
		var dataAry = mkData();
		ws.clients.forEach(function(client) {
			client.send(JSON.stringify(dataAry));
		});
	}, 100);
}

// データ配列を作る
function mkData() {
	var data = [];
	var now = new Date();
	var H = now.getHours();
	var M = now.getMinutes();
	var S = now.getSeconds();
	H = (H < 10) ? '0' + H : H;
	M = (M < 10) ? '0' + M : M;
	S = (S < 10) ? '0' + S : S;

	data[0] = H + ':' + M + ':' + S;
	data[1] = Math.floor(Math.random(10) * 96);
	data[2] = 32 + Math.floor(Math.random(10) * 18);

	return data;
}