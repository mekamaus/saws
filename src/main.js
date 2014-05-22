Crafty.scene('game', function() {
	
	Crafty.sprite(128, 'assets/sprites/saw.png', { saw: [0, 0] });
	Crafty.sprite(64, 'assets/sprites/block.png', { block: [0, 0] });
	Crafty.sprite(512, 'assets/sprites/bg.png', { bg: [0, 0] });
	
	// Create the physics ticker
	var ticker = Crafty.e('PhysicsTicker');
	
	// Spawn the saw
	var player = Crafty.e('Saw');
	
	// Create the background
	Crafty.e('ParallaxBackground').image('bg');
	
	Crafty.e('BlockGenerator');
	
	var fps = Crafty.timer.FPS();
	var minViewportSpeed = 200;
	
	// Viewport movement
	Crafty.bind('EnterFrame', function() {
		
		// Minimum viewport speed
		Crafty.viewport.y -= minViewportSpeed / fps;
		
		var centerY = -Crafty.viewport.y + Crafty.viewport.height / 2;
		var saws = Crafty('Saw').toArray();
		for(var i in saws) {
			var sawId = saws[i];
			var saw = Crafty(sawId);
			if(saw.y > centerY) {
				Crafty.viewport.y -= (saw.y - centerY) * .1;
			}
		}
	});
	
	// Clone (test)
	Crafty.bind('KeyDown', function(ev) {
		if(ev.keyCode === Crafty.keys.SHIFT) {
			
			// Copy lowermost saw's position
			var saws = Crafty('Saw').toArray();
			var lowermostSaw = { y: -Infinity };
			for(var i in saws) {
				var sawId = saws[i];
				var saw = Crafty(sawId);
				if(saw.y > lowermostSaw.y) {
					lowermostSaw = saw;
				}
			}
			var vel = lowermostSaw.velocity();
			Crafty.e('Saw')
				.position(lowermostSaw.x, lowermostSaw.y)
				.velocity(-vel[0], vel[1]);
		}
	});
	
	Crafty.bind('SawDestroyed', function() {
		var sawsRemaining = Crafty('Saw').length;
	});
});
