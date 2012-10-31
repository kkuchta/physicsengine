console.log('here');
var canvas=document.getElementById("canvas");
var context=canvas.getContext("2d");

function drawBall( x, y ){

}

var ball = {
    radius:10,
    x:10,
    y:100,
    velocity:{
        x:10,
        y:0
    },
    draw: function(){

        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);

        context.closePath();
        context.fill();
    },
    move: function( direction ){

        var accelerationFromGravity = 0.5;
        console.log('-');
        if( direction != 'y' && direction != 'x' ){ return; }
        var speed = this.velocity[direction];
        var position = this[direction];
        //console.log( 'Original speed = ' + speed );
        console.log( 'old ' + direction + ' = ' + position );
        console.log( 'old ' + direction + ' speed = ' + speed );
        if( direction == 'x' ){
            accelerationFromGravity = 0;
        }

        var dragConstant = 0.03;
        var accelerationFromDrag = speed * dragConstant;
        accelerationFromDrag *= speed > 0 ? -1 : 1;
        var acceleration = accelerationFromDrag + accelerationFromGravity;
        if( direction == 'x' ){
            acceleration = 0;
        }

        speed += acceleration;
        
        var bound = direction == 'y' ? canvas.height : canvas.width;
        if(
            (position + (this.radius*2)) >= bound && speed > 0 ||
            position === 0
        ){
            console.log( "bounce" );

            // Energy lost in bounce
            speed *= -0.90;
            //speed *= -1;

            // Hack to avoid bouncing through the floor at high speeds
            position = bound - this.radius;
        }
        else{
            position += speed;
        }
        this.velocity[direction] = speed;
        this[direction] = position;
        console.log( 'new ' + direction + ' = ' + position );
        console.log( 'new ' + direction + ' speed = ' + speed );
    }
};
function drawScreen(){
    //console.log('drawing');
        context.clearRect(0, 0, canvas.width, canvas.height);
        ball.draw();
}

var screenLocked = false;
setInterval( function(){
        drawScreen();
}, 30 );


var maxFrames = 100;
var i = 0;
var tickID = setInterval( function(){
    console.log( '-----' );
    //if( i++ > maxFrames ){ clearInterval(tickID); console.log('done'); }

    ball.move('y');
    ball.move('x');
    //console.log( 'velocity = ' + ball.velocity.y );
    //console.log( 'y = ' + ball.y );
    //console.log( '---' );

}, 10 );
