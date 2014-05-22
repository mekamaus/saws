Crafty.c('SawControls', {
	init: function() {
		this.bind('EnterFrame', function() {
			if(Crafty.keydown[Crafty.keys.LEFT_ARROW]) {
				this.acceleration(-3000, 0);
			} else if(Crafty.keydown[Crafty.keys.RIGHT_ARROW]) {
				this.acceleration(+3000, 0);
			}
		});
	}
});