var initPack = {map:[]};


simple = require('./simplemap.json');



World = function(){
	var self = {

		rows: simple.length,
		cols: simple[0].length,
		id:"",
		tiles:[],
	}

	self.update = function(){

	}
	return self;

}

World.getMapUpdateData = function(){
	var pack = {
		initPack:{
			map:initPack.map,
		},
	};
	return pack;
}

Map = function(id){
	var self = World();
	self.id = id;
	for(var r = 0;r < self.rows;r++){
		self.tiles[r] = [];
		for(var c =0;c < self.cols;c++){
			self.tiles[r][c] = new Tile(r,c,simple[r][c]);
		}
	}

	self.getInitPack = function(){
		return {
			id:self.id,
			rows:self.rows,
			cols:self.cols,
			tiles:self.tiles,
		};
	}
	Map.list[0] = self;

	initPack.map.push(self.getInitPack());
	return self;
}
Map.list = {};


Map.onStart = function(socket){
	var map = Map("One");

	socket.emit('mapInit',{
		map:Map.getAllInitPack(),
		})
}
Map.getAllInitPack = function(){
	return Map.list[0].getInitPack();
}

var Tile = function(row, col, type){
	var self = {
		row: 0,
		col: 0,
		solid: false,
		type: 0,
		width:64,

	}
	self.row = row;
	self.col = col;
	self.type = type;
	return self;
}

Tile.changeColor = function(r,g,b){
		self.color = "rgb(r,g,b)";
	}


Tile.update = function(){

}
