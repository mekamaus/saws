var scrollFactor = 0.5;

Crafty.c('ParallaxBackground', {
	init: function() {
		this.requires('2D, Canvas').attr({ z: -1, _startY: 0 });
		this.bind('ViewportScroll', function() {
			this.y = this._startY + -Crafty.viewport.y * (1.0 - scrollFactor);
			
			if(!this.spawned
			&& this.y + this.h < -Crafty.viewport.y + Crafty.viewport.height) {
				this.spawned = true;
				var newbg = Crafty.e('ParallaxBackground').image(this._img).attr({
					_startY: this._startY + this.h
				});
			} else if(this.y + this.h < -Crafty.viewport.y) {
				this.destroy();
			}
		});
	},
	
	image: function(img) {
		this._img = img;
		this.requires(img).attr({
			w: Crafty.viewport.width,
			h: Crafty.viewport.width
		});
		return this;
	}
});