/**
 * Chartデータ取得API
 */
var http = require("http");
var Q = require('q');
var querystring = require("querystring");
var url = require('url');

// 環境変数から定数を設定
var port = (process.env.PORT || 8888);
var host = (process.env.VCAP_APP_HOST || 'localhost');

// ローカルJS
var cf = require('./cassandraFunctions.js');

// ccchart用JSON (dataは後からセットする)
var chartdata = {
	"config" : {
		"title" : "Temperature Chart",
		"subTitle" : "Temperature sensor data",
		"width" : 800,
		"height" : 700,
		"type" : "line",
		"lineWidth" : 2,
		"maxY" : 35,
		"minY" : 10,
		"paddingTop" : 80,
		"paddingBottom" : 110,
		"xScaleSkip" : 6,
		"xScaleXOffset" : -5,
		"useVal" : "no",
		"useMarker" : "arc",
		"useCssToolTip" : "yes",
		"markerWidth" : 1,
		"hanreiRadius" : 1,
		"xScaleRotate" : -90,
		"xScaleYOffset" : 55,
		"maxWsColLen" : 18,
		"colorSet" : [ "#DDA0DD", "#3CB000" ]
	},
	data:[]
};

// チャートデータを取得するAPIサーバプロセス
// POSTリクエストで日付(YYYY-MM-DD)を受け取り該当日のデータを返す
http.createServer(function(request, response) {
	var postParam = "";

	// POST時のdata取得ハンドラ
	request.on("data", function(chunk) {
		postParam = "";
		var urlinfo = url.parse('/?' + chunk.toString(), true);
		// POSTされた"dateTime"パラメータを抽出
		postParam = urlinfo.query.dateTime;
	});
	// レスポンス作成
	request.on("end", function() {
		chartdata.data = [];
		// POSTされたパラメータが無ければ
		if ("" === postParam) {
			response.writeHead(400, {
				"Content-Type" : "text/plain"
			});
			console.log("Bad Request [" + postParam + "]");
			response.write("Bad Request");
			response.end();
			return;
		} else {
			// 日付チェックがエラーなら
			if (!isValidDate(postParam)) {
				response.writeHead(400, {
					"Content-Type" : "text/plain"
				});
				console.log("Bad Parameter [" + postParam + "]");
				response.write("Bad Parameter");
				response.end();
				return;
			}
			// 正しいリクエストなら
			response.writeHead(200, {
				"Content-Type" : "application/json"
			});
			console.log("POST DATA is [" + postParam + "]");
			// データ取得
			Q.when(cf.getDataByDay(postParam)).done(function(jsondata) {
				// JSONデータを作成して返す
				chartdata.data = jsondata;
				console.log(JSON.stringify(chartdata));
				response.write(JSON.stringify(chartdata));
				response.end();
			});
		}
	});
}).listen(port);

// 日付フォーマットバリデータ
// 参考：http://takamints.hatenablog.jp/entry/2014/10/17/071115
function isValidDate(s) {
	var matches = /^(\d+)-(\d+)-(\d+)$/.exec(s);
	if (!matches) {
		return false;
	}
	var y = parseInt(matches[1]);
	var m = parseInt(matches[2]);
	var d = parseInt(matches[3]);
	if (m < 1 || m > 12 || d < 1 || d > 31) {
		return false;
	}
	var dt = new Date(y, m - 1, d, 0, 0, 0, 0);
	if (dt.getFullYear() != y || dt.getMonth() != m - 1 || dt.getDate() != d) {
		return false;
	}
	return true;
}

console.log('Server running at http://'+host+':'+port+'/');
