
var commonForces = {

    gravity : function( ball ){
        return {
            x:0,
            y: ball.mass * GRAVITATIONAL_ACCELERATION,
            name: 'gravity'
        };
    },

    drag : function( ball ){
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
    },

    friction: function( ball ){
        
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
    }
};
