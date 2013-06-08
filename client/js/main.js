const IMG_CHARA_1 = './js/enchant_js/images/chara1.png';
const IMG_START = './js/enchant_js/images/start.png';
const IMG_GAMEOVER = './js/enchant_js/images/gameover.png';
const IMG_MAP_0 = './js/enchant_js/images/map0.png';
const IMG_ICON_0 = './js/enchant_js/images/icon0.png';
const IMG_EFFECT_0 = './js/enchant_js/images/effect0.png';
const IMG_MAP_2 = './js/enchant_js/images/map2.png';

enchant();

window.onload = function() {
	var SpriteManager = Class.create({
		/**
		 * SpriteManagerを作成します
		 *
		 * @class スプライトのプールを管理します
		 */
		initialize: function() {
			this.sprites = new Array();
			for (var i = 0; i < 1; i++) {
				this.sprites.push([0, new PlayerSprite(32, 32, this)]);
			}
			for (var i = 0; i < 10; i++) {
				this.sprites.push([0, new MobASprite(16, 16, this)]);
			}
			for (var i = 0; i < 100; i++) {
				this.sprites.push([0, new EffectSprite(16, 16, this)]);
			}
			for (var i = 0; i < 1; i++) {
				this.sprites.push([0, new StartSprite(236, 48, this)]);
			}
			for (var i = 0; i < 1; i++) {
				this.sprites.push([0, new GameoverSprite(189, 97, this)]);
			}
			for (var i = 0; i < 1000; i++) {
				this.sprites.push([0, new MapSprite(16, 16, this)]);
			}
			for (var i = 0; i < 330; i++) {
				this.sprites.push([0, new BlockSprite(16, 16, this)]);
			}
			for (var i = 0; i < 100; i++) {
				this.sprites.push([0, new ShadowSprite(32, 32, this)]);
			}
		},
		/**
		 * 指定されたクラスに一致するインスタンスをアクティブ状態にして取り出します<br />
		 * プールに指定されたインスタンスが存在しない場合、あるいはプールが枯渇している場合はnullを返却します
		 *
		 * @param {Class} clazz
		 * @return {ActionSprite} actionSprite
		 */
		getSprite: function(clazz) {
			for (var i = 0; i < this.sprites.length; i++) {
				if (this.sprites[i][0] == 0 && this.sprites[i][1] instanceof clazz) {
					var actionSprite = this.sprites[i][1];
					this.sprites[i][0] = 1;
					actionSprite.initParams();
					return actionSprite;
				}
			}
			console.log("Sprite pool has been exhausted");
			return null;
		},
		/**
		 * インスタンスを非アクティブ状態にします
		 *
		 * @param {ActionSprite} actionSprite
		 */
		releaseSprite: function(actionSprite) {
			for (var i = 0; i < this.sprites.length; i++) {
				if (this.sprites[i][1] == actionSprite) {
					this.sprites[i][0] = 0;
				}
			}
		},
		/**
		 * 現在アクティブになっているインスタンスの数を返却します
		 *
		 * @return {int} count
		 */
		getActiveCount: function() {
			var count = 0;
			for (var i = 0; i < this.sprites.length; i++) {
				if (this.sprites[i][0] == 1) {
					count++;
				}
			}
			return count;
		},
		/**
		 * 現在プールされているインスタンスの数を返却します
		 *
		 * @return {int} count
		 */
		getCount: function() {
			return this.sprites.length;
		}
	});

	var Screen = Class.create({
		/**
		 * Screenを作成します
		 *
		 * @class 画面への描画開始位置を保持します
		 */
		initialize: function() {
			this.x = 0;
			this.y = 0;
		}
	});

	var ActionSprite = Class.create(Sprite, {
		/**
		 * ActionSpriteを作成します
		 *
		 * @class Spriteの継承クラスです<br />
		 * 耐久度、破壊時イベントをサポートします
		 *
		 * @param {int} width
		 * @param {int} height
		 * @param {SpriteManager} spriteManager
		 */
		initialize: function(width, height, spriteManager) {
			Sprite.call(this, width, height);
			this.initParams();
			this.spriteManager = spriteManager;
			this.addEventListener(Event.ENTER_FRAME, function(e) {
				if (this.checkDead()) {
					return;
				}
				this.action();
			});
		},
		/**
		 * パラメータを初期化します<br />
		 * 任意の値を初期化する際には"initActionParams()"をオーバーライドしてください
		 */
		initParams: function() {
			this.isDead = false;
			this.damage = 0;
			this.hp = 1;
			this.initActionParams();
		},
		/**
		 * 任意のパラメータを初期化します<br />
		 * 値の初期化時に任意のパラメータを設定したい場合は、このメソッドをオーバーライドしてください
		 */
		initActionParams: function() {
		},
		/**
		 * このスプライトのアクションを設定します<br />
		 * このメソッドは毎フレーム呼び出されます<br />
		 * このメソッドをオーバーライドするか、別の関数を上書きすることでアクションを変更することができます
		 */
		action: function() {
		},
		/**
		 * このオブジェクトのダメージを増加させます<br />
		 * オブジェクトのダメージが耐久度以上になった時、オブジェクトは破壊されます
		 */
		addDamage: function(damage) {
			this.damage += damage;
			if (this.hp <= this.damage) {
				this.isDead = true;
			}
		},
		/**
		 * オブジェクトの破壊を確認します<br />
		 * 破壊が確認されたとき、オブジェクトの解放を行います<br />
		 * システムから自動的に呼び出されます
		 */
		checkDead: function() {
			if (this.isDead) {
				this.onPreDead();
				this.spriteManager.releaseSprite(this);
				this.parentNode.removeChild(this);
				return true;
			}
			return false;
		},
		/**
		 * オブジェクトが破壊される際に呼び出されます<br />
		 * 破壊時に実行したい動作をオーバーライドしてください
		 */
		onPreDead: function() {
		}
	});

	/*
	 *  Implemented classes
	 */
	// 自機
	var PlayerSprite = Class.create(ActionSprite, {
		initialize: function(width, height, spriteManager) {
			ActionSprite.call(this, width, height, spriteManager);
			this.image = game.assets[IMG_CHARA_1];
		},
		initActionParams: function() {
			this.x = 0;
			this.y = 0;
			this.gX = 0;
			this.gY = 0;
			this.vX = 0;
			this.vY = 0;
			this.frame = 1;
			this.scaleX = 1.0;
			this.scaleY = 1.0;
			this.interval = 0;
			this.time = 0;
			this.power = 1;
			this.isLanding = false;
			this.action = this.control;
		},
		onPreDead: function() {
			// 破壊時エフェクトを発生させて、ゲームオーバーを表示する
			for (var i = 0; i < 10; i++) {
				var effectSprite = this.spriteManager.getSprite(EffectSprite);
				effectSprite.x = this.x;
				effectSprite.y = this.y;
				this.parentNode.parentNode.effectLayer.addChild(effectSprite);
			}
			var gameoverSprite = this.spriteManager.getSprite(GameoverSprite);
			this.parentNode.parentNode.telopLayer.addChild(gameoverSprite);
		},
		control: function() {
			// 上下左右キーによる移動
			// 重力方向への加速を行う
			this.vX = 0;
			var input = game.input;
			if (!this.isLanding) {
				this.vY += 1;
			}
			if ((input.right && input.left) || !(input.right || input.left)) {
				this.frame = 0;
			} else 	if (input.left) {
				this.vX = -3;

				// 歩きアニメーション
				if (5 < this.interval) {
					if (this.frame == 2) {
						this.frame = 1;
					} else {
						this.frame = 2;
					}
					this.interval = 0;
				}

				// 向きの変更
				this.scaleX = -1.0;
				this.scaleY = 1.0;
			} else 	if (input.right) {
				this.vX = 3;

				// 歩きアニメーション
				if (5 < this.interval) {
					if (this.frame == 2) {
						this.frame = 1;
					} else {
						this.frame = 2;
					}
					this.interval = 0;
				}

				// 向きの変更
				this.scaleX = 1.0;
				this.scaleY = 1.0;
			}
			if (input.up) {
				this.vY = -5;
			}
			if (input.down) {
				// do nothing
			}
			this.interval++;

			// 移動前にブロックとの干渉をチェックし、スクリーンを考慮した座標の修正を行う
			this.parentNode.parentNode.avoidBlock(this);
			this.parentNode.parentNode.screen.x = this.gX - 200;
			this.parentNode.parentNode.screen.y = this.gY - 100;
			this.parentNode.parentNode.setScreenPosition(this);

			// サーバーに現在の状態を送信
			// 毎フレーム送信するので負荷が高く効率的でない
			if (networkReady) {
				var d = 0;
				if (this.vX == 0) {
					d = 0;
				} else if (this.vX < 0) {
					d = 1;
				} else if (0 < this.vX) {
					d = 2;
				}
				ws.send(JSON.stringify({
					type: 'shadow',
					id: myId,
					x: this.gX,
					y: this.gY,
					direction: d
				}));
			}
		},
		powerUp: function() {
		}
	});

	// 他プレーヤーの影
	var ShadowSprite = Class.create(ActionSprite, {
		initialize: function(width, height, spriteManager) {
			ActionSprite.call(this, width, height, spriteManager);
			this.image = game.assets[IMG_CHARA_1];
		},
		initActionParams: function() {
			this.x = 0;
			this.y = 0;
			this.gX = 0;
			this.gY = 0;
			this.frame = 0;
			this.scaleX = 1.0;
			this.scaleY = 1.0;
			this.id = 0;
			this.action = this.move;
		},
		move: function() {
			// スクリーンを考慮した座標の修正を行う
			this.parentNode.parentNode.setScreenPosition(this);
		}
	});

	// エフェクト
	var EffectSprite = Class.create(ActionSprite, {
		initialize: function(width, height, spriteManager) {
			ActionSprite.call(this, width, height, spriteManager);
			this.image = game.assets[IMG_EFFECT_0];
		},
		initActionParams: function() {
			this.x = 0;
			this.y = 0;
			this.vX = Math.random() * 12 - 6;
			this.vY = Math.random() * 12 - 6;
			this.frame = 1;
			this.scaleX = Math.random() * 2.0;
			this.scaleY = this.scaleX;
			this.hp = 10;
			this.interval = 0;
			this.action = this.move;
		},
		move: function() {
			this.x += this.vX;
			this.y += this.vY;

			// 一定時間後に自己を破棄
			this.interval++;
			if (5 < this.interval) {
				if (this.frame < 4) {
					this.frame++;
				} else {
					this.isDead = true;
				}
				this.interval = 0;
			}
		}
	});

	// ブロック
	var BlockSprite = Class.create(ActionSprite, {
		initialize: function(width, height, spriteManager) {
			ActionSprite.call(this, width, height, spriteManager);
			this.image = game.assets[IMG_MAP_2];
		},
		initActionParams: function() {
			this.x = 0;
			this.y = 0;
			this.gX = 0;
			this.gY = 0;
			this.frame = 0;
			this.scaleX = 1;
			this.scaleY = 1;
		},
		action: function() {
			// スクリーンを考慮した座標の修正を行う
			this.parentNode.parentNode.setScreenPosition(this);
		}
	});

	// スタートテロップ(未使用)
	var StartSprite = Class.create(ActionSprite, {
		initialize: function(width, height, spriteManager) {
			ActionSprite.call(this, width, height, spriteManager);
			this.image = game.assets[IMG_START];
		},
		initActionParams: function() {
			this.x = 0;
			this.y = 0;
			this.frame = 1;
			this.scaleX = 1.0;
			this.scaleY = 1.0;
		}
	});

	// ゲームオーバーテロップ
	var GameoverSprite = Class.create(ActionSprite, {
		initialize: function(width, height, spriteManager) {
			ActionSprite.call(this, width, height, spriteManager);
			this.image = game.assets[IMG_GAMEOVER];
		},
		initActionParams: function() {
			this.x = 0;
			this.y = 0;
			this.frame = 1;
			this.scaleX = 1.0;
			this.scaleY = 1.0;
		}
	});

	// 敵
	var MobASprite = Class.create(ActionSprite, {
		initialize: function(width, height, spriteManager) {
			ActionSprite.call(this, width, height, spriteManager);
			this.image = game.assets[IMG_CHARA_1];
		},
		initActionParams: function() {
			this.x = 0;
			this.y = 0;
			this.gX = 0;
			this.gY = 0;
			this.vX = 0;
			this.vY = 0;
			this.width = 32;
			this.height = 32;
			this.frame = 5;
			this.scaleX = 1.0;
			this.scaleY = 1.0;
			this.damage = 0;
			this.hp = 5;
			this.count = 0;
			this.interval = 0;
			this.action = this.move;
		},
		// 破壊時エフェクトを発生させ、得点を発生させる
		onPreDead: function() {
			for (var i = 0; i < 10; i++) {
				var effectSprite = this.spriteManager.getSprite(EffectSprite);
				effectSprite.x = this.x;
				effectSprite.y = this.y;
				this.parentNode.parentNode.effectLayer.addChild(effectSprite);
			}
			this.parentNode.parentNode.point += 1000;
		},
		// 重力方向への加速
		// 移動前にブロックとの干渉をチェックし、スクリーンを考慮した座標の修正を行う
		move: function() {
			this.vY += 1;
			this.parentNode.parentNode.avoidBlock(this);
			this.parentNode.parentNode.setScreenPosition(this);
		}
	});

	// 背景
	var MapSprite = Class.create(ActionSprite, {
		initialize: function(width, height, spriteManager) {
			ActionSprite.call(this, width, height);
			this.image = game.assets[IMG_MAP_0];
		},
		initActionParams: function() {
			this.x = 0;
			this.y = 0;
			this.gX = 0;
			this.gY = 0;
			this.frame = 3;
			this.scaleX = 1.0;
			this.scaleY = 1.0;
			this.action = this.move;
		},
		move: function() {
			// スクリーンを考慮した座標の修正を行う
			this.parentNode.parentNode.setScreenPosition(this);
		}
	});

	/*
	 *  Scenes
	 */
	// タイトル
	var TitleScene = Class.create(Scene, {
		initialize: function() {
			Scene.call(this);
			var labels = new Array();
			labels.push(new Label('********************'));
			labels.push(new Label(' Kumatocol      '));
			labels.push(new Label('********************'));
			labels.push(new Label('Click to login'));

			for (var i = 0; i < labels.length; i++) {
				labels[i].color = 'white';
				labels[i].x = 0;
				labels[i].y = i * 16;
				this.addChild(labels[i]);
			}
			this.backgroundColor = 'rgba(0, 0, 0, 1)';
			this.addEventListener(Event.TOUCH_START, function(e) {
				mainScene = new MainScene();
				game.replaceScene(mainScene);
			});
		}
	});

	// メインシーン
	var MainScene = Class.create(Scene, {
		initialize: function() {
			Scene.call(this);
			this.spriteManager = spriteManager;
			this.startNetwork();
			this.point = 0;
			this.clients = 0;
			this.backgroundColor = '#7ecef4';
			this.responeInterval = 0;
			this.itemInterval = 0;
			this.time = 0;
			this.globalX = 0;
			this.screen = new Screen();
			// 毎フレーム行う処理を設定
			this.addEventListener(Event.ENTER_FRAME, function(e) {
				// 敵は座標と現在のフレームを指定してセットされる
				this.setEnemy();
				this.checkCollision();
				this.pointLabel.text = "Point: " + this.point;
				this.spritesLabel.text = "Sprites: " + "(" + "All: " + this.spriteManager.getCount() + " / " + "Active: " + this.spriteManager.getActiveCount() + ")";
				this.clientsLabel.text = "Clients: " + this.clients;
				this.time++;
			});
			// レイヤーとしてグループを設定し、前後関係を設定する
			this.backgroundLayer = new Group();
			this.blockLayer = new Group();
			this.enemyLayer = new Group();
			this.effectLayer = new Group();
			this.playerBulletLayer = new Group();
			this.itemLayer = new Group();
			this.enemyBulletLayer = new Group();
			this.playerLayer = new Group();
			this.shadowLayer = new Group();
			this.telopLayer = new Group();

			// addChildの順番で前後関係が決まる
			this.addChild(this.backgroundLayer);
			this.addChild(this.blockLayer);
			this.addChild(this.enemyLayer);
			this.addChild(this.effectLayer);
			this.addChild(this.playerBulletLayer);
			this.addChild(this.itemLayer);
			this.addChild(this.enemyBulletLayer);
			this.addChild(this.playerLayer);
			this.addChild(this.shadowLayer);
			this.addChild(this.telopLayer);

			// 敵の発生マップ
			// [x, y, 出現フレーム, 敵の種類]
			this.enemyMap = [
				[40, -100, 10, 0],
				[60, -100, 20, 0],
				[80, -100, 30, 0],
				[120, -100, 40, 0],
				[140, -100, 50, 0]
			];

			this.player = this.spriteManager.getSprite(PlayerSprite);
			this.player.gX = 180;
			this.player.gY = 50;
			this.playerLayer.addChild(this.player);
			this.setBackground();
			this.setBlock();
			this.pointLabel = new Label("Point:");
			this.spritesLabel = new Label("Sprites:");
			this.clientsLabel = new Label("Clients:");
			this.pointLabel.x = 0;
			this.pointLabel.y = 0;
			this.spritesLabel.x = 0;
			this.spritesLabel.y = 16;
			this.clientsLabel.x = 0;
			this.clientsLabel.y = 32;
			this.addChild(this.pointLabel);
			this.addChild(this.spritesLabel);
			this.addChild(this.clientsLabel);
		},
		// 衝突判定
		checkCollision: function() {
			for (var i=0; i < this.enemyLayer.childNodes.length; i++) {
				for (var j=0; j < this.playerLayer.childNodes.length; j++) {
					var enemy = this.enemyLayer.childNodes[i];
					var player = this.playerLayer.childNodes[j];
					if(enemy.intersect(player)) {
						enemy.addDamage(10);
						player.isDead = true;
					}
				}
			}
		},
		// 各オブジェクトのグローバル座標と描画開始座標を元に、スクリーン座標を設定する
		setScreenPosition: function(actionSprite) {
			actionSprite.x = actionSprite.gX - this.screen.x;
			actionSprite.y = actionSprite.gY - this.screen.y;
		},
		// ブロックとの干渉を考慮した上で、各オブジェクトのグローバル座標と描画開始座標を元に、スクリーン座標を設定する
		avoidBlock: function(actionSprite) {
			var xMoved = false;
			var yMoved = false;
			for (var i = 0; i < this.blockLayer.childNodes.length; i++) {
				var block = this.blockLayer.childNodes[i];
				actionSprite.isLanding = false;
				// X軸方向の判定と修正
				if (block.gX < actionSprite.gX + actionSprite.vX + actionSprite.width && actionSprite.gX + actionSprite.vX < block.gX + block.width && block.gY < actionSprite.gY + actionSprite.height && actionSprite.gY < block.gY + block.height) {
					if (actionSprite.vX == 0) {
						// do nothing
					} else if (0 < actionSprite.vX) {
						actionSprite.vX = 0;
						actionSprite.gX = block.gX - actionSprite.width;
					} else if (actionSprite.vX < 0) {
						actionSprite.vX = 0;
						actionSprite.gX = block.gX + block.width;
					}
					xMoved = true;
				}
				// Y軸方向の判定と修正
				if (block.gX < actionSprite.gX + actionSprite.width && actionSprite.gX < block.gX + block.width && block.gY < actionSprite.gY + actionSprite.vY + actionSprite.height && actionSprite.gY + actionSprite.vY < block.gY + block.height) {
					if (actionSprite.vY == 0) {
						// do nothing
					} else if (0 < actionSprite.vY) {
						actionSprite.vY = 0;
						actionSprite.gY = block.gY - actionSprite.height;
						actionSprite.isLanding = true;
					} else if (actionSprite.vY < 0) {
						actionSprite.vY = 0;
						actionSprite.gY = block.gY + block.height;
					}
					yMoved = true;
				}
			}
			// 干渉がなかった場合は、そのまま移動
			if (!xMoved) {
				actionSprite.gX += actionSprite.vX;
			}
			if (!yMoved) {
				actionSprite.gY += actionSprite.vY;
			}
		},
		// 敵を配置する
		setEnemy: function() {
			for (var i = 0; i < this.enemyMap.length; i++) {
				var enemyPoint = this.enemyMap[i];
				if (this.time == enemyPoint[2]) {
					if (enemyPoint[3] == 0) {
						var enemySprite = this.spriteManager.getSprite(MobASprite);
						enemySprite.gX = enemyPoint[0];
						enemySprite.gY = enemyPoint[1];
						this.avoidBlock(enemySprite);
						this.setScreenPosition(enemySprite);
						this.enemyLayer.addChild(enemySprite);
					}
				}
			}
		},
		// 背景を配置する
		setBackground: function() {
			var backgroundMap = [
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1],
				[1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
			];

			for (var i = 0; i < backgroundMap.length; i++) {
				for (var j = 0; j < backgroundMap[i].length; j++) {
					if (backgroundMap[i][j] == 1) {
						var mapSprite = this.spriteManager.getSprite(MapSprite);
						mapSprite.gX = j * 16;
						mapSprite.gY = i * 16;
						this.backgroundLayer.addChild(mapSprite);
					}
				}
			}
		},
		// ブロックを配置する
		setBlock: function() {
			var blockMap = [
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
				[1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			];

			for (var i = 0; i < blockMap.length; i++) {
				for (var j = 0; j < blockMap[i].length; j++) {
					if (blockMap[i][j] == 1) {
						var blockSprite = this.spriteManager.getSprite(BlockSprite);
						blockSprite.gX = j * 16;
						blockSprite.gY = i * 16;
						this.blockLayer.addChild(blockSprite);
					}
				}
			}
		},
		// 他プレーヤーの影を更新する
		updateShadow: function(id, x, y, direction) {
			var shadowSprite = null;
			if (id == myId) {
				return;
			}
			if (shadowList.indexOf(id) == -1) {
				shadowSprite = this.spriteManager.getSprite(ShadowSprite);
				shadowSprite.id = id;
				shadowList.push(id);
			} else {
				for (var i = 0; i < this.shadowLayer.childNodes.length; i++) {
					if (this.shadowLayer.childNodes[i].id == id) {
						shadowSprite = this.shadowLayer.childNodes[i];
					}
				}
			}
			// 影の向きを変更する
			switch (direction) {
				case 0:
					// 向きに変更がない場合は更新しない
					break;
				case 1:
					shadowSprite.scaleX = -1;
					break;
				case 2:
					shadowSprite.scaleX = 1;
					break;
				default:
					break;
			}
			shadowSprite.gX = x;
			shadowSprite.gY = y;
			this.shadowLayer.addChild(shadowSprite);
		},
		// 他プレーヤーの影を削除する
		removeShadow: function(id) {
			var shadowSprite = null;
			if (shadowList.indexOf(id) == -1) {
				return;
			}
			for (var i = 0; i < this.shadowLayer.childNodes.length; i++) {
				if (this.shadowLayer.childNodes[i].id == id) {
					shadowSprite = this.shadowLayer.childNodes[i];
				}
			}
			this.spriteManager.releaseSprite(shadowSprite);
			this.shadowLayer.removeChild(shadowSprite);
		},
		// ネットワークへの接続を開始する
		startNetwork: function() {
			ws = new WebSocket(WEBSOCKET_ADDRESS);

			ws.onerror = function(e) {
			};

			ws.onopen = function() {
				networkReady = true;
			        ws.send(JSON.stringify({
			                type: 'join'
		 	       }));
			};

			ws.onmessage = function(event) {
				var data = JSON.parse(event.data);
				if (data.type == 'shadow') {
					if (mainScene == null) {
						return;
					}
					var shadowX = data.x;
					var shadowY = data.y;
					var shadowId = data.id;
					var shadowDirection = data.direction;
					mainScene.updateShadow(shadowId, shadowX, shadowY, shadowDirection);
				}

				if (data.type == 'leave') {
					if (mainScene == null) {
						return;
					}
					mainScene.removeShadow(parseInt(data.id));
				}

				if (data.type == 'clients') {
					if (mainScene == null) {
						return;
					}
					mainScene.clients = parseInt(data.count);
				}
			};

			window.onunload = function() {
			        ws.send(JSON.stringify({
			                type: 'leave',
					id: myId
			        }));
			};
		}
	});

	/*
	 *  Initialize
	 */
	var ws = null;
	var networkReady = false;
	var myId = parseInt(Math.random() * 10000); // ユニークIDを作成(重複を考慮していない一時的な実装)
	var mainScene = null;
	var shadowList = new Array();
	var game = new Game(400, 225);
	var spriteManager = null;
	game.fps = 60;
	game.preload(IMG_CHARA_1);
	game.preload(IMG_START);
	game.preload(IMG_GAMEOVER);
	game.preload(IMG_MAP_0);
	game.preload(IMG_ICON_0);
	game.preload(IMG_EFFECT_0);
	game.preload(IMG_MAP_2);
	game.onload = function() {
		spriteManager = new SpriteManager();
		game.replaceScene(new TitleScene());
	}
	game.start();
};
