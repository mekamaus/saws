Crafty.c('BlockGenerator', {
	
	init: function() {
		
		this.attr({
			width: 12,
			minGapWidth: 3,
			maxGapWidth: 3,
			rowStart: 512,
			rowSpacing: 192,
			_curRowY: 0
		});
		
		var fps = Crafty.timer.FPS();
		
		this.bind('EnterFrame', function() {
			if(this._curRowY < -Crafty.viewport.y + Crafty.viewport.height * 2) {
				this._makeRow();
			}
		});
	},
	
	_makeRow: function() {
		
		if(this._curRowY < this.rowStart) {
			this._curRowY = this.rowStart;
		} else {
			this._curRowY += this.rowSpacing;
		}
		
		// Randomly choose whether to make 1 or 2 gaps
		if(Math.random() < 0.5) {
			// Make 1 gap
			var gapWidth = randomRange(this.minGapWidth, this.maxGapWidth);
			var gapLeft = randomRange(0, this.width - gapWidth);
			for(var i = 0; i < this.width; i++) {
				if(i < gapLeft || i >= gapLeft + gapWidth) {
					Crafty.e('Block')
						.attr({
							x: 16 + 64 * i,
							y: this._curRowY
						});
				}
			}
		} else {
			// Make 2 gaps
			var gap1Width = randomRange(this.minGapWidth, this.maxGapWidth);
			var gap2Width = randomRange(this.minGapWidth, this.maxGapWidth);
			var gapSpacing = randomRange(1, this.width - gap1Width - gap2Width)
			var gap1Left = randomRange(0, this.width - gap1Width - gapSpacing - gap2Width);
			var gap2Left = gap1Left + gap1Width + gapSpacing;
			for(var i = 0; i < this.width; i++) {
				if(i < gap1Left || (i >= gap1Left + gap1Width && i < gap2Left) || i >= gap2Left + gap2Width) {
					Crafty.e('Block')
						.attr({
							x: 16 + 64 * i,
							y: this._curRowY
						});
				}
			}
		}

		// Make blocks for the walls.
		for(var i = 0; i < this.rowSpacing / 64; i++) {
			Crafty.e('Block')
				.attr({
					x: -64 + 16,
					y: this._curRowY - i * 64
				});
			Crafty.e('Block')
				.attr({
					x: 800 - 16,
					y: this._curRowY - i * 64
				});
		}
	}
});

function randomRange(a, b) {
	return Math.floor(a + Math.random() * (b + 1 - a));
}
