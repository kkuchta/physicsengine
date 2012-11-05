console.log('Starting');

// Globals
var canvas=document.getElementById("canvas");
var context=canvas.getContext("2d");
var bounds = {x: canvas.width, y:canvas.height};
var GRAVITATIONAL_ACCELERATION = 0.5;


var Graphics = function( context, canvas ){
    
    this.drawBall = function( x, y, radius, color ){
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);

        context.closePath();
        context.fillStyle = color;
        context.fill();
    };

    this.drawLine = function( a, b, color, strokeWidth ){
        context.beginPath();
        context.moveTo(a.x,a.y);
        context.lineTo(b.x,b.y);
        if( typeof color === 'undefined' ){
            color = 'black';
        }
        if( typeof strokeWidth === 'undefined' ){
            strokeWidth = 1;
        }
        context.lineWidth = strokeWidth;
        context.strokeStyle = color;
        context.stroke(); 
    };

    this.highlightBox = function( x, y, width, height, color ){
        context.strokeStyle = color;
        context.lineWidth = 4;
        context.strokeRect( x, y, width, height );
    };

    this.clear = function(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    };
    
};
var graphics = new Graphics( context, canvas );

// Conventions:
// The origin is at the top-left of the displayable area
// Positive x and y are to the right and down.

var Ball = function( config, forces, graphics ) {
    var self = this;
    this.radius = 10;
    this.x = config.x;
    this.y = config.y;
    this.color = config.color;
    this.mass = 1;
    this.bounceEnergy = 0.99;
    this.velocity = config.velocity;

    this.draw = function(){
        graphics.drawBall( self.x, self.y, self.radius, self.color );
    };

    this.tick = function(){
        var accel = getAcceleration();
        this.velocity.x += accel.x;
        this.velocity.y += accel.y;
        move();
    };

    /**
     * Expects calculateCallback to take a ball parameter and return:
     * { x: newtons in x direction, y: netwons in y direction }
     */
    this.addForce = function( calculateCallback ){
        forces.push( calculateCallback );
    };

    // Private
    //var forces = [];

    var getAcceleration = function(){
        var totalAccelX = 0;
        var totalAccelY = 0;
        $.each( forces, function(){
            var force = this(self);
            var accelX = force.x / self.mass;
            var accelY = force.y / self.mass;
            totalAccelY += accelY;
            totalAccelX += accelX;
        } );
        return { x: totalAccelX, y: totalAccelY };
    };

    var move = function(){
        $.each( ['x','y'], function(){
            self[this] += self.velocity[this];

            // Check whether we're colliding.

            // Check whether we should bounce off a wall.
            if( self[this] + self.radius >= bounds[this] ){
                self[this] = bounds[this] - self.radius;
                self.velocity[this] *= -1 * self.bounceEnergy;
            }
            else if( self[this] - self.radius <= 0 ){
                self[this] = bounds[this];
                self[this] = self.radius;
                self.velocity[this] *= -1 * self.bounceEnergy;
            }

        });
    };
};

var gravity = function( ball ){
    return {
        x:0,
        y: ball.mass * GRAVITATIONAL_ACCELERATION,
        name: 'gravity'
    };
};


var drag = function( ball ){
    var DRAG_CONSTANT = 0.001; // ball's drag coefficient * fluid mass density * 0.5
    var ballVelocity = Math.sqrt( ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y );
    
    var dragForce = DRAG_CONSTANT * ballVelocity * ballVelocity;

    // Break into components
    // 
    // V = sqrt( Vx^2 + Vy^2 )
    // V / F  = Vx / Fx
    // Therefore, Fx = (Vx * F ) / V
    // And Vy = (Fx * Vx) / Fy
    var Vx = ball.velocity.x * -1;
    var Vy = ball.velocity.y * -1;
    var F = dragForce;
    var V = ballVelocity;

    // Special case because 0/0 == NaN
    var Fx = (Vx === 0 || F === 0) ? 0 : ( Vx * F ) / V;
    var Fy = (Vy === 0 || F === 0) ? 0 : ( Vy * F ) / V;

    return { x: Fx, y: Fy, name: 'drag' };
    
};

var friction = function( ball ){
    
    // Fake a normal force based on gravity here
    var Fn = ball.mass * GRAVITATIONAL_ACCELERATION;
    var u = 0.005;

    var Ff = 0;

    // We're going to half-ass this and assume only horizontal friction along
    // the floor.  So, if we're at the bottom and not moving much, apply friction
    if( Math.abs(ball.velocity.y) < 1 && ball.y + ball.radius > bounds.y - 1 ){
        Ff = Fn * u;
        Ff *= ball.velocity.x > 0 ? -1 : 1;
    }
    return {x:Ff,y:0,name:'friction'};
};

var wind = function( ball ){
    return {x:-0.1,y:0};
};

var balls = [];
for( var i = 0; i < 100; i++ ){
    balls.push(
        new Ball(
            {
                x: Math.random() * (bounds.x - 10) + 10,
                y: Math.random() * (bounds.y - 10) + 10,
                velocity: {
                    x: (Math.random() * 40) - 20,
                    y: (Math.random() * 40) - 20
                }
                //x: 115,
                //y: 125,
                //velocity: { x: 0, y: 0 }
            },
            [gravity, friction, drag],
            //[],
            graphics
        )
    );
}

//balls.push( new Ball(
        //{
            //x: 80,
            //y: 80,
            //velocity: { x:10, y:10 },
            //color: 'green'
        //},
        //[],
        //graphics
//) );

//balls.push( new Ball(
        //{
            //x: 200,
            //y: 200,
            //velocity: { x:5, y:5 },
            //color: 'blue'
        //},
        //[],
        //graphics
//) );

//balls.push( new Ball(
        //{
            //x: 320,
            //y: 80,
            //velocity: { x:-10, y:10 },
            //color: 'blue'
        //},
        //[],
        //graphics
//) );

// Brute force collision check within a set of items.
function checkCollisions( itemSet ){
    var collisionsFound = [];
    $.each( itemSet, function(){
        var a = this;
        $.each( itemSet, function(){
            var b = this;
            //if( itemSet.length > 1 ) debugger
            if( b === a){
                return true;
            }

            var xDistance = Math.abs( a.x - b.x );
            var yDistance = Math.abs( a.y - b.y );
            var distance = Math.sqrt( xDistance * xDistance + yDistance * yDistance );
            if( distance <= a.radius + b.radius ){
                collisionsFound.push( [a,b] );
            }

        } );
    });
    return collisionsFound;
}

var targetFPS = 200;
var interval = 1000 / targetFPS;
var world = function( things ){
    var maxIntervals = 1000;
    var xBucketCount = 10;
    var yBucketCount = 10;
    var xBucketSize = bounds.x / xBucketCount;
    var yBucketSize = bounds.y / yBucketCount;

    var getBuckets = function( x, y, radius ){
        var buckets = [];

        // central bucket
        var xBucket = Math.floor( x / xBucketSize );
        var yBucket = Math.floor( y / yBucketSize );
        buckets.push({x:xBucket,y:yBucket});

        var left = x % xBucketSize <= radius                && x - radius >= 0;
        var right = (bounds.x - x - 1) % xBucketSize <= radius  && x + radius <= bounds.x;
        var above = y % yBucketSize <= radius               && y - radius >= 0;
        var below = (bounds.y - y - 1) % yBucketSize <= radius  && y + radius <= bounds.y;
        
        // Note that this'll sometimes check a corner box that isn't *strictly*
        // necessary (due to the circular shape hitting, say, below and left but
        // not the bottom left corner), but we're ignoring that minor
        // inefficiency for simplicity.

        if( left && above )  buckets.push( {x:xBucket-1, y:yBucket-1} );
        if( left )           buckets.push( {x:xBucket-1, y:yBucket  } );
        if( left && below )  buckets.push( {x:xBucket-1, y:yBucket+1} );
        if( below )          buckets.push( {x:xBucket,   y:yBucket+1} );
        if( right && below ) buckets.push( {x:xBucket+1, y:yBucket+1} );
        if( right )          buckets.push( {x:xBucket+1, y:yBucket  } );
        if( right && above ) buckets.push( {x:xBucket+1, y:yBucket-1} );
        if( above )          buckets.push( {x:xBucket,   y:yBucket-1} );

        return buckets;
    };

    var intervalID = setInterval( function(){
        framesSinceLastCheck++;
        if( maxIntervals-- <= 0 ){
            clearInterval( intervalID );
        }

        graphics.clear();
        $.each( things, function(){
            this.tick();
        } );


        // Draw collision grid for debugging
        for( var x = 0; x <= xBucketCount; x++ ){
            graphics.drawLine( {x: x*xBucketSize, y:0}, {x:x*xBucketSize,y:bounds.y} );
            for( var y = 0; y <= yBucketCount; y++ ){
                graphics.drawLine( {x: 0, y:y*yBucketSize}, {x:bounds.y,y:y*yBucketSize} );
            }
        }

        // Build collision grid
        var collisionBuckets = [];
        $.each( things, function(){
            var thing = this;
            thing.color = 'black';

            var bucketsIn = getBuckets( thing.x, thing.y, thing.radius );
            //var bucketsIn = [];

            $.each( bucketsIn, function(){
                var bucket = this;

                var bucketLeft = bucket.x * xBucketSize;
                var bucketTop = bucket.y * yBucketSize;
                graphics.highlightBox( bucketLeft, bucketTop, xBucketSize, yBucketSize, 'red' );
                if( !$.isArray( collisionBuckets[bucket.x] ) ){
                    collisionBuckets[bucket.x] = [];
                }
                if( !$.isArray( collisionBuckets[bucket.x][bucket.y] ) ){
                    collisionBuckets[bucket.x][bucket.y] = [];
                }
                collisionBuckets[bucket.x][bucket.y].push(thing);
            } );

            //console.log( 'Thing pos=('+this.x+','+this.y+')' );
        } );

        for( var x = 0; x <= xBucketCount; x++ ){
            for( var y = 0; y <= yBucketCount; y++ ){
                if(
                    $.isArray( collisionBuckets[x] ) &&
                    $.isArray( collisionBuckets[x][y] ) ){

                    // [ [thing1, thing2], [thing7,thing2], [thing3, thing5] ... ]
                    var collisions = checkCollisions( collisionBuckets[x][y] );
                    $.each( collisions, function(){
                        this[0].color = 'red';
                        this[1].color = 'red';
                    } );
                }
            }
        }

        $.each( things, function(){
            this.draw();
        } );

    }, interval );
};

var framesSinceLastCheck = 0;
var lastFrameCheck = new Date().getTime();

setInterval( function(){
    var currentTime = new Date().getTime();
    var totalTime = currentTime - lastFrameCheck;
    var fpms = framesSinceLastCheck / totalTime;
    var fps = fpms * 1000;
    console.log( 'fps=' + fps + " (target=" + targetFPS + ", interval=" + interval + ")" );

}, 1000 );

var world = new world( balls );
