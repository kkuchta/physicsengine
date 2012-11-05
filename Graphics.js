
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
