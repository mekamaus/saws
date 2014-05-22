Crafty.c('Saw', {
	init: function() {
		this.requires('2D, Canvas, Physical, DefaultPhysicsDraw, Inertia,' +
					  'PhysicsGravity, SawControls, VelocityConstraint, saw,' +
					  'SolidConstraint, PhysicsBounds, RotationConstraint')
			.origin(64, 64)
			.bounds({ circle: { center: [64, 64], radius: 64 } })
			.position(Crafty.viewport.width / 2 - 64, 0)
			.constrainVelocity({
				x: {
					min: -Infinity,
					max: +Infinity
				}
			})
			.constrainRotation(function() {
				return this.position()[0] / 64 / Math.PI * 180;
			})
			.bind('EnterFrame', function() {
				var y = this.y;
				if(y < -Crafty.viewport.y - 128) {
					this.destroy();
					Crafty.trigger('SawDestroyed');
				}
			});
	}
});