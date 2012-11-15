
var graphics = new Graphics( context, canvas );

var balls = [];
for( var i = 0; i < 2; i++ ){
    balls.push(
        new Ball(
            {
                x: Math.random() * (bounds.x - 10) + 10,
                y: Math.random() * (bounds.y - 10) + 10,
                velocity: {
                    x: (Math.random() * 20) - 10,
                    y: (Math.random() * 20) - 10
                },
                radius: 50
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
//balls.push(
    //new Ball(
        //{
            //x: 100,
            //y: 100,
            //velocity: {
                //x: 5,
                //y: 10
            //}
        //},
        //[],
        //graphics
    //),
    //new Ball(
        //{
            //x: 200,
            //y: 100,
            //velocity: {
                //x: 0,
                //y: 10
            //}
        //},
        //[],
        //graphics
    //)
//);  

var targetFPS = 50;
var world = new world( balls, targetFPS );
