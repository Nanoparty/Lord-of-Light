var tmx = require("tmx-parser");
var jsfile = require("jsonfile")
tmx.parseFile('mapProgress.tmx', function (err, data) {
    var tiles = [];
    var cur = [];
    for (var i = 0; i < data.layers[0].tiles.length; i++) {
        if (i % data.width === 0) {
            if (i !== 0) tiles.push(cur);
            cur = [];
        }
        cur.push(data.layers[0].tiles[i].id);
    }
    tiles.push(cur);
    jsfile.writeFile('./simplemap.json', tiles, function(){});
});
