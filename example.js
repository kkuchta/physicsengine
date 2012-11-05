
var graphics = new Graphics( context, canvas );

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
            [commonForces.gravity, commonForces.friction, commonForces.drag],
            //[],
            graphics
        )
    );
}

var targetFPS = 50;
var world = new world( balls, targetFPS );
