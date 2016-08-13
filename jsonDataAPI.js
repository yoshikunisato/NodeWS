/**
 * Chartデータ取得API
 */
var http = require("http");
var Q = require('q');
var querystring = require("querystring");
var url = require('url');

// ローカルJS
var cf = require('./cassandraFunctions.js');

// var chartdata = {
// "config" : {
// "title" : "Temperature Chart",
// "subTitle" : "Temperature sensor data",
// "width" : 800,
// "height" : 700,
// "type" : "line",
// "lineWidth" : 2,
// "maxY" : 40,
// "minY" : -10,
// "paddingTop" : 80,
// "paddingBottom" : 110,
// "useVal" : "yes",
// "useMarker" : "css-ring",
// "useCssToolTip" : "yes",
// "markerWidth" : 10,
// "xScaleRotate" : -90,
// "xScaleYOffset" : 55,
// "maxWsColLen" : 18,
// "colorSet" : [ "#DDA0DD", "#3CB000" ]
// },
//
// "data" : [
// [ "DateTime", "2016-08-10 14:10", "2016-08-10 14:15",
// "2016-08-10 14:20", "2016-08-10 14:25", "2016-08-10 14:30",
// "2016-08-10 14:35", "2016-08-10 14:40" ],
// [ "℃", 25.5, 25.6, 27.3, 28.4, 27.9, 26.7, 25.5 ] ]
// };

var chartdata = {
	"config" : {
		"title" : "Temperature Chart",
		"subTitle" : "Temperature sensor data",
		"width" : 800,
		"height" : 700,
		"type" : "line",
		"lineWidth" : 2,
		"maxY" : 40,
		"minY" : -10,
		"paddingTop" : 80,
		"paddingBottom" : 110,
		"useVal" : "yes",
		"useMarker" : "css-ring",
		"useCssToolTip" : "yes",
		"markerWidth" : 10,
		"xScaleRotate" : -90,
		"xScaleYOffset" : 55,
		"maxWsColLen" : 18,
		"colorSet" : [ "#DDA0DD", "#3CB000" ]
	},
	data:[]
};
//var chartconfig = {
//	"config" : {
//	"title" : "Temperature Chart",
//	"subTitle" : "Temperature sensor data",
//	"width" : 800,
//	"height" : 700,
//	"type" : "line",
//	"lineWidth" : 2,
//	"maxY" : 40,
//	"minY" : -10,
//	"paddingTop" : 80,
//	"paddingBottom" : 110,
//	"useVal" : "yes",
//	"useMarker" : "css-ring",
//	"useCssToolTip" : "yes",
//	"markerWidth" : 10,
//	"xScaleRotate" : -90,
//	"xScaleYOffset" : 55,
//	"maxWsColLen" : 18,
//	"colorSet" : [ "#DDA0DD", "#3CB000" ]
//	}
//};

http.createServer(function(request, response) {
	var postData = "";
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
			Q.when(cf.getDataByDay("2016-08-10")).done(function(jsondata) {
				// JSONデータを作成して返す
				chartdata.data = jsondata;
				console.log(JSON.stringify(chartdata));
				response.write(JSON.stringify(chartdata));
				response.end();
			});
		}
	});
}).listen(8888);

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

console.log('Server running at http://127.0.0.1:8888/');
