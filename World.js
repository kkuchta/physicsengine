
var world = function( things, targetFPS ){
    var interval = 1000 / targetFPS;
    var maxIntervals = 1000;
    var xBucketCount = 2;
    var yBucketCount = 2;
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
                        //this[0].color = 'red';
                        //this[1].color = 'red';

                        var A = this[0];
                        var B = this[1];
                        //debugger
                        var Vr = {
                            x: B.velocity.x - A.velocity.x,
                            y: B.velocity.y - A.velocity.y
                        };
                        var VrTotal = Math.sqrt( Vr.x * Vr.x + Vr.y * Vr.y );
                        var e = 0.95; // Totally elastic for now

                        // The unit normal from A to B
                        var Dx = B.x - A.x;
                        var Dy = B.y - A.y;
                        var D = Math.sqrt( Dx*Dx + Dy*Dy );

                        var Nx = Vr.x / VrTotal;
                        var Ny = Vr.y / VrTotal;

                        var Ix = (1 + e) * Nx * (Vr.x * Nx + Vr.y * Ny) / (1/A.mass + 1/B.mass);
                        var Iy = (1 + e) * Ny * (Vr.x * Nx + Vr.y * Ny) / (1/A.mass + 1/B.mass);
                        var V = {
                            a: {
                                x: Ix * (1/A.mass),
                                y: Iy * (1/A.mass)
                            },
                            b: {
                                x: Ix * (1/B.mass),
                                y: Iy * (1/B.mass)
                            }
                        };

                        // Bounce the velocity
                        A.velocity.x += V.a.x;
                        A.velocity.y += V.a.y;
                        B.velocity.x -= V.b.x;
                        B.velocity.y -= V.b.y;

                        // Correct overlap (gonna get some serious jitter here)
                        if( D < A.radius + B.radius ){
                            
                            // correction
                            var C = (A.radius + B.radius) - D;
                            var Cx = Nx * C;
                            var Cy = Ny * C;
                            A.x += Cx;
                            A.y += Cy;
                            B.x -= Cx;
                            B.y -= Cy;
                        }

                    } );
                }
            }
        }

        $.each( things, function(){
            this.tick();
        } );



        $.each( things, function(){
            this.draw();
        } );

    }, interval );
};
