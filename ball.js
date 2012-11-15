


// Conventions:
// The origin is at the top-left of the displayable area
// Positive x and y are to the right and down.

var Ball = function( config, forces, graphics ) {
    var self = this;
    this.radius = config.radius;
    this.x = config.x;
    this.y = config.y;
    this.color = config.color;
    this.mass = 1;
    this.bounceEnergy = 0.99;
    this.velocity = config.velocity;
    this.guid = Utils.generateGUID();


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
    var collisionsFound = {};
    $.each( itemSet, function(){
        var a = this;
        $.each( itemSet, function(){
            var b = this;

            // If they're the same item or we've already checked the reverse order
            if( b === a || collisionsFound[b.guid+a.guid] ){
                return true;
            }

            var xDistance = Math.abs( a.x - b.x );
            var yDistance = Math.abs( a.y - b.y );
            var distance = Math.sqrt( xDistance * xDistance + yDistance * yDistance );
            if( distance <= a.radius + b.radius ){
                collisionsFound[a.guid+b.guid] = [a,b];
            }

        } );
    });
    //collisionsFound = $.map(collisionsFound, function(element){ return element; } ); // Get array values
    var values = [];
    $.each( collisionsFound, function(i,val)
    {
        values.push( val );
    });

    return values;
}


var framesSinceLastCheck = 0;
var lastFrameCheck = new Date().getTime();

setInterval( function(){
    var currentTime = new Date().getTime();
    var totalTime = currentTime - lastFrameCheck;
    var fpms = framesSinceLastCheck / totalTime;
    var fps = fpms * 1000;
    console.log( 'fps=' + fps + " (target=" + targetFPS + ")" );

}, 1000 );

