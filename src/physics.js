Crafty.c('PhysicsTicker', {
	
	enabled: true,
	
	init:
	function() {
		this.bind('EnterFrame', function() {
			if(this.enabled) {
				Crafty.trigger('PrePhysicsTick');
				Crafty.trigger('EvaluateAccel');
				Crafty.trigger('UpdateCollisions');
				Crafty.trigger('EvaluateHits');
				Crafty.trigger('ResolveConstraint');
				Crafty.trigger('EvaluateInertia');
			}
			Crafty.trigger('UpdateDraw');
			Crafty.trigger('UpdateViewport');
		});
	}
});

Crafty.c("DefaultPhysicsDraw", {
	
	init: function() {
		this.bind("UpdateCollisions", function() {
			this.x = this._phPX;
			this.y = this._phPY;
		});
		this.bind("UpdateDraw", function() {
			if(this._override) {
				this._override = false;
				this.x = this._overrideX;
				this.y = this._overrideY;
			} else {
				this.x = this._phPX;
				this.y = this._phPY;
			}
		});
	},
	
	override: function(x, y) {
		this._override = true;
		this._overrideX = x;
		this._overrideY = y;
	}
});

Crafty.c('Physical', {
	
	init: function() {
		this._phX = this._x;
		this._phY = this._y;
		this._phPX = this._phX;
		this._phPY = this._phY;
		this._phAX = 0.0;
		this._phAY = 0.0;
		
		this.bind('EvaluateAccel', function() {
			// Seconds per frame.
			var sPerF = 1.0 / Crafty.timer.FPS();
			// Apply acceleration to velocity. Since velocity is stored as the
			// difference between the prev frame and the next, apply as
			// p += a * t^2
			this._phX += this._phAX * sPerF * sPerF;
			this._phY += this._phAY * sPerF * sPerF;
			// Once accleration is applied, reset.
			this._phAX = 0.0;
			this._phAY = 0.0;
		});
	},
	
	position: function(x, y) {
		if(x !== undefined && y !== undefined) {
			// Set x and y position to x and y
			this._phPX += x - this._phX;
			this._phPY += y - this._phY;
			this._phX = x;
			this._phY = y;
			return this;
		} else if(typeof x === typeof [] && y === undefined) {
			// Set x and y position by array given in first parameter
			var pos = x;
			this._phPX += pos[0] - this._phX;
			this._phPY += pos[1] - this._phY;
			this._phX = pos[0];
			this._phY = pos[1];
			return this;
		} else if(x === undefined) {
			// Return x and y position as array
			return [this._phX, this._phY];
		}
	},
	
	displacement: function() {
		return [
			this._phX - this._phPX,
			this._phY - this._phPY
		];
	},
	
	velocity: function(vx, vy) {
		var fps = Crafty.timer.FPS();
		if(vx !== undefined && vy !== undefined) {
			// Set x and y velocity to vx and vy
			this._phPX = this._phX - vx / fps;
			this._phPY = this._phY - vy / fps;
			return this;
		} else if(typeof vx === typeof [] && vy === undefined) {
			// Set x and y velocity by array given in first parameter
			var vel = vx;
			this._phPX = this._phX - vel[0] / fps;
			this._phPY = this._phY - vel[1] / fps;
		} else if(vx === undefined) {
			return [
				(this._phX - this._phPX) * fps,
				(this._phY - this._phPY) * fps
			];
		}
	},
	
	acceleration: function(ax, ay) {
		if(ax !== undefined && ay !== undefined) {
			// Increase x and y acceleration by ax and ay
			this._phAX += ax;
			this._phAY += ay;
			return this;
		} else if(typeof ax === typeof [] && ay === undefined) {
			// Increase x and y acceleration by array given in first parameter
			var acc = ax;
			this._phAX += acc[0];
			this._phAY += acc[1];
			return this;
		} else if(ax === undefined) {
			// Return x and y acceleration as array
			return [this._phAX, this._phAY];
		}
	}
});

Crafty.c('SolidConstraint', {
	init: function() {
		this.requires('Physical, Collision');
		
		this.currentNormals = [];
		
		this.bind('ResolveConstraint', function() {
			this.currentNormals = [];
			
			for(var i = 20; i >= 0; --i) {
				this.x = this._phX;
				this.y = this._phY;
				// Find the first hit, process that.
				var hits = this.hit('Solid');
				var hit = hits[0];
				
				if(!hit)
					break;
				
				// Just resolve it lazily, yay verlet integration.
				var norm = hit.normal;
				var overlapAmt = Math.max(hit.overlap, -1.0);
				var overlap = scale([norm.x, norm.y], -overlapAmt);
				this._phX += overlap[0];
				this._phY += overlap[1];
				
				// Maintain a "current normals" list in case other components
				// (such as platforming physics) are interested.
				this.currentNormals.push(overlap);
			}
		});
	}
});

/**
 * Constraint that is applied to an object's velocity.
 */
Crafty.c('VelocityConstraint', {
	init: function() {
		this.attr({
			_minSpeed: -Infinity,
			_maxSpeed: +Infinity,
			_minXVel: -Infinity,
			_maxXVel: +Infinity,
			_minYVel: -Infinity,
			_maxYVel: +Infinity
		});
		this.bind('ResolveConstraint', function() {
			// Apply each constraint to the velocity
			var vel = this.velocity();
			vel = this._xyConstraint(vel);
			vel = this._speedConstraint(vel);
			this.velocity(vel);
		});
	},
	
	constrainVelocity: function(ob) {
		var xcon = ob.x, ycon = ob.y, scon = ob.speed;
		if(xcon) {
			if(xcon.min !== undefined) {
				this._minXVel = xcon.min;
			}
			if(xcon.max !== undefined) {
				this._maxXVel = xcon.max;
			}
		}
		if(ycon) {
			if(ycon.min !== undefined) {
				this._minYVel = ycon.min;
			}
			if(ycon.max !== undefined) {
				this._maxYVel = ycon.max;
			}
		}
		if(scon) {
			if(scon.min !== undefined) {
				this._minSpeed = scon.min;
			}
			if(scon.max !== undefined) {
				this._maxSpeed = scon.max;
			}
		}
		return this;
	},
	
	_xyConstraint: function(vel) {
		vel[0] = constrain(vel[0], this._minXVel, this._maxXVel);
		vel[1] = constrain(vel[1], this._minYVel, this._maxYVel);
		return vel;
	},
	
	_speedConstraint: function(vel) {
		var oldSpeed = dist(vel);
		
		// Make speed nonzero if needed.
		if(oldSpeed === 0) {
			vel = [1, 0];
			oldSpeed = 1;
		}
		
		// Scale speed to match velocity requirements.
		var newSpeed = constrain(oldSpeed, this._minSpeed, this._maxSpeed);
		vel = scale(vel, newSpeed / oldSpeed);
		
		return vel;
	}
});

/**
 * Constraint affecting rotation.
 */
Crafty.c('RotationConstraint', {
	init: function() {
		this.attr({
				_constraint: function() { return this.rotation; }
			})
			.bind('ResolveConstraint', function() {
				this.rotation = this._constraint();
			});
	},
	
	constrainRotation: function(constraint) {
		this._constraint = constraint;
		return this;
	}
});

/**
 * Gravitational acceleration.
 */
Crafty.c('PhysicsGravity', {
	init: function() {
		this.requires('Physical');
		this.bind('PrePhysicsTick', function() {
			this.acceleration(0, 1600);
		});
	}
});

/**
 * Inertial movement, i.e. Newton's 1st law.
 */
Crafty.c('Inertia', {
	
	init: function() {
		this.bind('EvaluateInertia', function() {
			var px = this._phPX;
			var py = this._phPY;
			this._phPX = this._phX;
			this._phPY = this._phY;
			this._phX += this._phX - px;
			this._phY += this._phY - py;
		});
	},
	
	applyImpulse: function(px, py) {
		this._phX = this._phPX + px;
		this._phY = this._phPY + py;
	}
});

Crafty.c('PhysicsBounds', {
	
	init: function() {
		this.requires('Collision');
	},
	
	bounds: function(ob) {
		if(ob.circle) {
			var circle = ob.circle;
			var verts = [];
			var res = 32;
			var center = circle.center || [0, 0];
			var radius = circle.radius || 32;
			for(var i = 0; i < res; i++) {
				var t = i / res * 2 * Math.PI;
				var vert = [
					center[0] + radius * Math.cos(t),
					center[1] + radius * Math.sin(t)
				];
				verts.push(vert);
			}
			var poly = new Crafty.polygon(verts);
			this.collision(poly);
		}
		return this;
	}
});

function dist(vec) {
	return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
}

function constrain(val, min, max) {
	return val < min ? min : val > max ? max : val;
}

function scale(vec, val) {
	vec[0] *= val;
	vec[1] *= val;
	return vec;
}
