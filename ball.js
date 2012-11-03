console.log('Starting');

// Globals
var canvas=document.getElementById("canvas");
var context=canvas.getContext("2d");
var bounds = {x: canvas.width, y:canvas.height};
var GRAVITATIONAL_ACCELERATION = 0.5;

// Conventions:
// The origin is at the top-left of the displayable area
// Positive x and y are to the right and down.

var Ball = function( config, forces ) {
    var self = this;
    this.radius = 10;
    this.x = config.x;
    this.y = config.y;
    this.mass = 1;
    this.bounceEnergy = 0.99;
    this.velocity = config.velocity;

    this.draw = function(){
        context.beginPath();
        context.arc(self.x, self.y, self.radius, 0, 2 * Math.PI, false);

        context.closePath();
        context.fill();
    };

    this.tick = function(){
        var accel = getAcceleration();
        this.velocity.x += accel.x;
        this.velocity.y += accel.y;
        move();
        //console.log( 'x=' + this.x );
        //console.log( 'vel x=' + this.velocity.x );
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
            //console.log( "" + this );
            self[this] += self.velocity[this];
            if( self[this] + self.radius >= bounds[this] ){
                //console.log( "bounce large" );
                self[this] = bounds[this] - self.radius;
                self.velocity[this] *= -1 * self.bounceEnergy;
            }
            else if( self[this] - self.radius <= 0 ){
                //console.log( "bounce small" );
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
    //if( Vy > 15 ){
        //debugger
    //}

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

var balls = [];
for( var i = 0; i < 10; i++ ){
    balls.push(
        new Ball(
            {
                x: Math.random() * (bounds.x - 10) + 10,
                y: Math.random() * (bounds.y - 10) + 10,
                velocity: {
                    x: (Math.random() * 40) - 20,
                    y: (Math.random() * 40) - 20
                }
            },
            [friction, drag]
        )
    );
}

var world = function( things ){
    var maxIntervals = 10000;
    var intervalID = setInterval( function(){
        if( maxIntervals-- <= 0 ){
            clearInterval( intervalID );
            //console.log('done');
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        $.each( things, function(){
            this.tick();

            this.draw();
        } );
    }, 10 );
};

var world = new world( balls );
