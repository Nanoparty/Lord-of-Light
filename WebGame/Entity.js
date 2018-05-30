var initPack = {player:[],bullet:[],tower:[],base:[],minion:[]};
var removePack = {player:[],bullet:[],minion:[]};
fps = 25;
var gameOver = false;
var victory = -1;

require('./Vector2');
require('./Map');

Entity = function(){
	var self = {
		pos: Vector2(250, 250),
		vel: Vector2(0, 0),
		size: Vector2(0, 0),
		hp:10,
		toRemove:false,
		id:"",
	}
	self.update = function(){
		self.updatePosition();
		if(self.hp <= 0){
			self.toRemove = true;
		}
	}
	self.updatePosition = function(){
		self.pos = Vector2.add(self.pos, self.vel);
	}
	self.isPositionWall = function(pt){
		if (pt && pt.x && pt.y) {
			return simple[Math.abs(Math.floor(pt.y / 64) % simple.length)][Math.abs(Math.floor(pt.x / 64) % simple[0].length)];
		}
	}
	return self;
}

Entity.getFrameUpdateData = function(){
	var pack = {
		initPack:{

			player:initPack.player,
			bullet:initPack.bullet,
			tower:initPack.tower,
			base:initPack.base,
			minion:initPack.minion,
		},
		removePack:{
			player:removePack.player,
			bullet:removePack.bullet,
			minion:removePack.minion,
		},
		updatePack:{
			victory:victory,
			end:gameOver,
			player:Player.update(),
			bullet:Bullet.update(),
			tower:Tower.update(),
			base:Base.update(),
			minion:Minion.update(),
		}
	};
	initPack.player = [];
	initPack.bullet = [];
	initPack.tower = [];
	initPack.base = [];
	initPack.minion = [];
	removePack.player = [];
	removePack.bullet = [];
	removePack.minion = [];
	return pack;
}

Player = function(id, username,team,hero){
	var self = Entity();
	self.id = id;
	self.number = "" + Math.floor(10 * Math.random());
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	self.mouseAngle = 0;
	self.maxSpd = 400 / fps;
	self.hp = 10;
	self.hpMax = 300;
	self.score = 0;
	self.username = username;
	self.mp = 100;
	self.mpMax = 100;
	self.xp = 0;
	self.xpMax = 10;
	self.lvl = 1;
	self.lvlPts = 0;
	self.team = team;
	self.hero = hero;
	self.faith = 0;
	self.kills = 0;
	self.deaths = -1;
	self.damage = 100;
	self.speed = self.maxSpd*fps;
	self.armor = 2;
	self.time = process.uptime;
	self.respawnTimer = 10;
	self.tempTime = 0;
	self.timerStart = false;
	self.difference = 0;

	if (self.team === 0) {
		self.respawnPoint = Vector2(1616, 8080);
	} else {
		self.respawnPoint = Vector2(8080, 1616);
	}

	var super_update = self.update;
	self.update = function(){
		if(!self.toRemove){
			self.updateSpd();
			super_update();
		}


		//check dead
		if(self.toRemove){


			if(self.timerStart === false){
				self.timerStart = true;
				self.tempTime = self.time;
			}
			self.difference = self.time - self.tempTime;
			if(self.difference > self.respawnTimer){
				self.difference = 0;
				self.timerStart = false;
				self.respawn();
			}

		}

		//time
		self.time = process.uptime();

		//mana regen

		if(self.mp < self.mpMax){
			self.mp +=1;
		}

		//update xp -- level up!
		if(self.xp >= self.xpMax){
			self.xp = self.xp - self.xpMax;
			self.xpMax = self.xpMax + self.xpMax;
			self.lvl += 1;
			self.lvlPts += 1;
			self.hpMax += 10;
			self.hp = self.hpMax;
			self.mpMax += 20;
			self.mp = self.mpMax;
			self.damage+=1;

		}

		if(self.pressingAttack && !self.toRemove){
			self.shootBullet(self.mouseAngle);
		}
	}

	self.shootBullet = function(angle){
		if(self.mp >= 10){
			var b = Bullet(self,angle, self.hero);
			b.pos = self.pos;
			self.mp -= 10;
		}
	}

	self.updateSpd = function(){

		if(self.pressingRight && !self.isPositionWall(Vector2.add(Vector2.add(self.pos, Vector2(0, 24)), Vector2(self.maxSpd, 0))))
			self.vel.x = self.maxSpd;
		else if(self.pressingLeft && !self.isPositionWall(Vector2.add(Vector2.add(self.pos, Vector2(0, 24)), Vector2(-self.maxSpd, 0))))
			self.vel.x = -self.maxSpd;
		else
			self.vel.x = 0;

		if(self.pressingUp && !self.isPositionWall(Vector2.add(Vector2.add(self.pos, Vector2(0, 24)), Vector2(0, -self.maxSpd))))
			self.vel.y = -self.maxSpd;
		else if(self.pressingDown && !self.isPositionWall(Vector2.add(Vector2.add(self.pos, Vector2(0, 24)), Vector2(0, self.maxSpd))))
			self.vel.y = self.maxSpd;
		else
			self.vel.y = 0;
	}

	self.respawn = function (){
		self.deaths += 1;
		self.pos = self.respawnPoint;
		self.hp = self.hpMax;
		self.toRemove = false;
	}

	self.respawn();

	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.pos.x,
			y:self.pos.y,
			number:self.number,
			name:self.username,
			hp:self.hp,
			hpMax:self.hpMax,
			score:self.score,
			right:self.pressingRight,
			left:self.pressingLeft,
			up:self.pressingUp,
			down:self.pressingDown,
			mp:self.mp,
			mpMax:self.mpMax,
			xp:self.xp,
			xpMax:self.xpMax,
			lvl:self.lvl,
			lvlPts:self.lvlPts,
			team:self.team,
			hero:self.hero,
			faith:self.faith,
			kills:self.kills,
			deaths:self.deaths,
			damage:self.damage,
			speed:self.speed,
			armor:self.armor,
			time:self.time,
			difference:self.difference,
			timerStart:self.timerStart,
		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.pos.x,
			y:self.pos.y,
			hp:self.hp,
			score:self.score,
			name:self.username,
			right:self.pressingRight,
			left:self.pressingLeft,
			up:self.pressingUp,
			down:self.pressingDown,
			mp:self.mp,
			mpMax:self.mpMax,
			xp:self.xp,
			xpMax:self.xpMax,
			lvl:self.lvl,
			lvlPts:self.lvlPts,
			faith:self.faith,
			kills:self.kills,
			deaths:self.deaths,
			damage:self.damge,
			speed:self.speed,
			armor:self.armor,
			time:self.time,
			difference:self.difference,
			timerStart:self.timerStart,
		}
	}

	Player.list[id] = self;

	initPack.player.push(self.getInitPack());
	return self;
}
Player.list = {};
Player.onConnect = function(socket, username, team,hero){
	var player = Player(socket.id, username, team,hero);
	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'attack')
			player.pressingAttack = data.state;
		else if(data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
		else if(data.inputId === 'stop') {
			player.pressingRight = false;
			player.pressingDown = false;
			player.pressingLeft = false;
			player.pressingUp = false;
			player.pressingAttack = false;
		}
	});

	socket.emit('init',{
		selfId:socket.id,
		player:Player.getAllInitPack(),
		bullet:Bullet.getAllInitPack(),
		tower:Tower.getAllInitPack(),
		base:Base.getAllInitPack(),
		minion:Minion.getAllInitPack(),
	});
}
Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack());
	return players;
}

Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
	removePack.player.push(socket.id);
}
Player.getTeam = function(socket){
	return Player.list[socket.id].x;
}
Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		Player.list[i].update();
		pack.push(Player.list[i].getUpdatePack());
	}
	return pack;
}

Minion = function(base, waypoints){
	var self = Entity();
	self.pos = base.pos;
	self.id = Math.random();
	self.team = base.team;
	self.waypoints = waypoints;
	self.toRemove = false;
	self.maxSpd = 10;
	self.waypoint = 0;
	self.damage = 2;
	self.hp = 1000;
	var super_update = self.update;
	self.update = function() {
		self.updateSpd();
		super_update();
		if (self.hp <= 0) {
			self.toRemove = true;
		}
	}

	self.updateSpd = function() {
		if (self.waypoint < self.waypoints.length) {
			var diff = Vector2.sub(self.waypoints[self.waypoint], self.pos);
			diff = Vector2.unit(diff);

			self.vel = Vector2.mult(diff, self.maxSpd);
			if (self.pos.dist(self.waypoints[self.waypoint]) < 32) self.waypoint++;
		} else {
			self.vel = Vector2(0,0);
			self.toRemove = true;
		}

		if (self.team === 0) {
			var mlist = Minion.list1;
		} else {
			var mlist = Minion.list0;
		}

		for (var i in mlist) {
			var m = mlist[i];
			if (self.pos.dist(m.pos) < 256) {
				self.vel = Vector2(0,0);
				self.shootBullet(m.pos);
				return;
			}
		}

		for (var i in Tower.list) {
			var t = Tower.list[i];
			if (self.pos.dist(Vector2.add(t.pos, Vector2(20, 128))) < 320 && self.team !== t.team && !t.toRemove) {
				self.vel = Vector2(0,0);
				self.shootBullet(t.pos);
				return;
			}
		}

		for (var i in Base.list) {
			var b = Base.list[i];
			if (self.pos.dist(b.pos) < 320 && self.team !== b.team && !b.toRemove) {
				self.vel = Vector2(0,0);
				self.shootBullet(b.pos);
				return;
			}
		}

		for (var i in Player.list) {
			var p = Player.list[i];
			if (self.pos.dist(p.pos) < 64 && self.team !== p.team) {
				self.vel = Vector2(0,0);
				self.shootBullet(p.pos);
				return;
			}
		}
	}

	self.shootBullet = function(pt) {
		var b = Bullet(self, 180 * (1 / Math.PI) * Vector2.angle(Vector2.sub(pt, self.pos)), "agni");
		b.pos = self.pos;
	}

	self.getInitPack = function() {
		return {
			id: self.id,
			x: self.pos.x,
			y: self.pos.y,
			hp: self.hp,
			team: self.team,
		}
	}

	self.getUpdatePack = function() {
		return {
			id: self.id,
			x: self.pos.x,
			y: self.pos.y,
			hp: self.hp,
		}
	}

	Minion.list[self.id] = self;
	if (self.team === 0) {
		Minion.list0[self.id] = self;
	} else {
		Minion.list1[self.id] = self;
	}
	initPack.minion.push(self.getInitPack());
	return self;
}

Minion.list = {};
Minion.list0 = {};
Minion.list1 = {};

Minion.getAllInitPack = function(){
	var minions = [];
	for(var i in Minion.list)
		minions.push(Minion.list[i].getInitPack());
	return minions;
}

Minion.update = function(){
	var pack = [];
	for(var i in Minion.list){
		var m = Minion.list[i];
		m.update();
		if(m.toRemove){
			delete Minion.list[i];
			if (m.team === 0) {
				delete Minion.list0[i];
			} else {
				delete Minion.list1[i];
			}
			removePack.minion.push(m.id);
		} else
			pack.push(m.getUpdatePack());
	}
	return pack;
}

Bullet = function(parent,angle, hero){
	var self = Entity();
	self.pos = parent.pos;
	self.id = Math.random();
	self.vel = Vector2.Polar(1000 / fps, angle);
	self.actuallyParent = parent;
	self.parent = parent.id;
	self.damage = parent.damage;
	self.timer = 0;
	self.toRemove = false;
	self.hero = hero;
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > 10)
			self.toRemove = true;
		super_update();

		if(self.isPositionWall(self.pos)) {
			self.toRemove = true;
			for (var i in Tower.list) {
				var t = Tower.list[i];
				if (self.pos.dist(Vector2.add(t.pos, Vector2(32,128))) < 192 && t.team !== self.actuallyParent.team) {
					t.hp -= self.damage;
				}
			}
			for (var i in Base.list) {
				var b = Base.list[i];
				if (self.pos.dist(Vector2.add(b.pos, Vector2(32,128))) < 192 && b.team !== self.actuallyParent.team) {
					b.hp -= self.damage;
				}
			}
		}

		for(var i in Player.list){
			var p = Player.list[i];
			if(self.pos.dist(p.pos) < 32 && self.parent !== p.id && self.actuallyParent.team !== p.team){
				p.hp -= self.damage;

				if(p.hp <= 0){
					var shooter = Player.list[self.parent];
					if(shooter) {
						shooter.score += 1;
						shooter.xp += 3;
						shooter.kills +=1;
						shooter.faith+=10;
					}

				}
				self.toRemove = true;
			}
		}

		if(!self.toRemove) {
			for(var i in Minion.list){
				var m = Minion.list[i];
				if(self.pos.dist(m.pos) < 32 && self.actuallyParent.team !== m.team) {
					m.hp -= self.damage;
					self.toRemove = true;
				}
			}
		}

		if(!self.toRemove) {
			for(var i in Tower.list){
				var m = Tower.list[i];
				if(self.pos.dist(m.pos) < 32 && self.actuallyParent.team !== m.team) {
					m.hp -= self.damage;
					self.toRemove = true;
				}
			}
		}

		if(!self.toRemove) {
			for(var i in Base.list){
				var m = Base.list[i];
				if(self.pos.dist(m.pos) < 128 && self.actuallyParent.team !== m.team) {
					m.hp -= self.damage;
					self.toRemove = true;
				}
			}
		}
	}
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.pos.x,
			y:self.pos.y,
			hero:self.hero
		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.pos.x,
			y:self.pos.y,
		};
	}

	Bullet.list[self.id] = self;
	initPack.bullet.push(self.getInitPack());
	return self;
}
Bullet.list = {};

Bullet.update = function(){
	var pack = [];
	for(var i in Bullet.list){
		var bullet = Bullet.list[i];
		bullet.update();
		if(bullet.toRemove){
			delete Bullet.list[i];
			removePack.bullet.push(bullet.id);
		} else
			pack.push(bullet.getUpdatePack());
	}
	return pack;
}

Bullet.getAllInitPack = function(){
	var bullets = [];
	for(var i in Bullet.list)
		bullets.push(Bullet.list[i].getInitPack());
	return bullets;
}

Base = function(team,id){
	var self = Entity();
	self.hp = 10000;
	self.batch = 0;
	self.team = team;
	self.id = id;
	if(team === 0){
		self.pos = Vector2(1920, 7488);

	} else if(team === 1){
		self.pos = Vector2(7488, 1920);
	}

	self.update = function(){
		if(self.hp <= 0){
			self.hp = 0;
			self.toRemove = true;
			gameOver = true;
			victory = self.team;
		}
		if (team === 0) {
			if (self.batch === 0 && !self.toRemove){
				Minion(self,[Vector2(2832, 6576), Vector2(3664, 6112), Vector2(6784, 2992), Vector2(7559,2020)]);
				Minion(self,[Vector2(1760,6718), Vector2(1760,1632),Vector2(6880,1540),Vector2(7559,2020)]);
				Minion(self,[Vector2(2885,7864),Vector2(5152, 7856), Vector2(7104, 8064), Vector2(7808,8064), Vector2(7808, 7248), Vector2(7947,2891),Vector2(7559,2020)]);
			}
			self.batch = (self.batch + 1) % 150;
		} else {

			if (self.batch === 0 && !self.toRemove){
				Minion(self, [Vector2(6784, 2992), Vector2(3664, 6112), Vector2(2832, 6576), Vector2(2020,7559)]);
				Minion(self,[Vector2(6880, 1540), Vector2(1760, 1632), Vector2(1760, 6718), Vector2(2020,7559)]);
				Minion(self,[Vector2(7947, 2891), Vector2(7808, 7248), Vector2(7808, 8064), Vector2(7104, 8064), Vector2(5152, 7856), Vector2(2885, 7864), Vector2(2020,7559)]);
			}
			self.batch = (self.batch + 1) % 150;
		}
	}


	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.pos.x,
			y:self.pos.y,
			hp:self.hp,
			destroyed:self.toRemove,
			team:self.team,
		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.pos.x,
			y:self.pos.y,
			hp:self.hp,
			destroyed:self.toRemove,
		};
	}

	Base.list[id] = self;
	initPack.base.push(self.getInitPack());
	return self;
}

Base.list = {};

Base.getAllInitPack = function(){
	var bases = [];
	for(var i in Base.list)
		bases.push(Base.list[i].getInitPack());
	return bases;
}

Base.update = function(){
	var pack = [];
	for(var i in Base.list){
		Base.list[i].update();
		pack.push(Base.list[i].getUpdatePack());
	}
	return pack;
}

Base.onStart = function(){
	var base = Base(0,0);
	var base2 = Base(1,1);
}

Tower = function(team, id,x ,y){
	var self = Entity();
	self.hp = 5000;
	self.team = team;
	self.id = id;
	self.range = 540;
	self.attacking = false;
	self.target;
	self.damage = 1;

	self.pos = Vector2(x,y);

	self.update = function(){
		if(self.hp <= 0){
			self.hp = 0;
			self.toRemove = true;
			self.attacking = false;
		}

		if(!self.attacking && !self.toRemove){
			for(var i in Minion.list){
				if(Minion.list[i].pos.dist(self.pos) < self.range && Minion.list[i].team !== self.team){
					self.target = Minion.list[i];
					self.attacking = true;
					break;
				}
			}
			for(var i in Player.list){
				if(!self.attacking && Player.list[i].pos.dist(self.pos) < self.range && Player.list[i].team !== self.team){
					self.target = Player.list[i];
					self.attacking = true;
				}
			}
		}

		self.attack();

	}

	self.attack = function(){

		if(self.target){
			if(self.target.pos.dist(self.pos) < self.range){
				self.target.hp -= self.damage;
				if(self.target.hp <= 0){
					self.target = undefined;
					self.attacking = false;
				}
			}else{
				self.target = undefined;
				self.attacking = false;
			}
		}


	}


	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.pos.x,
			y:self.pos.y,
			hp:self.hp,
			destroyed:self.toRemove,
			attacking:self.attacking,
			target:self.target,
			team:self.team,
		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.pos.x,
			y:self.pos.y,
			hp:self.hp,
			destroyed:self.toRemove,
			attacking:self.attacking,
			target:self.target,
		};
	}
	Tower.list[self.id] = self;
	initPack.tower.push(self.getInitPack());
	return self;
}

Tower.getAllInitPack = function(){
	var towers = [];
	for(var i in Tower.list)
		towers.push(Tower.list[i].getInitPack());
	return towers;
}

Tower.update = function(){
	var pack = [];
	for(var i in Tower.list){
		Tower.list[i].update();
		pack.push(Tower.list[i].getUpdatePack());
	}
	return pack;
}

Tower.list = {};

Tower.onStart = function(){
	//top
	Tower(0,0,1600,6528);
	Tower(0,1,1472,4288);
	Tower(0,2,1600,2112);

	Tower(1,3,6720,1408);
	Tower(1,4,4544,1472);
	Tower(1,5,2304,1344);

	//middle
	Tower(0,6,2688,6656);
	Tower(0,7,3456,5824);
	Tower(0,8,4416,4864);

	Tower(1,9,6848,2496);
	Tower(1,10,6208,3072);
	Tower(1,11,5312,3904);

	//bottom
	Tower(0,12,2816,7744);
	Tower(0,13,5056,7808);
	Tower(0,14,7104,7744);

	Tower(1,15,7938,2624);
	Tower(1,16,7936,4864);
	Tower(1,17,7936,6976);

	//Tower(1,1);

}
