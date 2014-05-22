Crafty.c('Block', {
	init: function() {
		this.requires('2D, Canvas, Collision, Solid, block')
			.bind('EnterFrame', function() {
				var y = this.y;
				if(y < -Crafty.viewport.y - 64) {
					this.destroy();
				}
			});
	}
});
