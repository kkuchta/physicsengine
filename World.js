
var world = function( things, targetFPS ){
    var interval = 1000 / targetFPS;
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
