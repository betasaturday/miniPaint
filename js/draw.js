function drawModule(common) {
    
    var dx = [0, 1, 0, -1],
        dy = [-1, 0, 1, 0];
    var used = [];
    var painting = false;
    var fillColor = {},
        w, h;
    function setColor(data, x, y) {
        var st = (x + y*ctx.canvas.width)*4;
        fillColor.r = data[st];
        fillColor.g = data[st + 1];
        fillColor.b = data[st + 2];
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }
    function colorEquals(data, x, y) {
        var st = (x + y*ctx.canvas.width)*4;
        return fillColor.r === data[st] 
            && fillColor.g === data[st + 1]
            && fillColor.b === data[st + 2];
    }
    function pad2(c) {
        return c.length == 1 ? '0' + c : '' + c;
    }
    function rgbToHex(r, g, b) {

        var hex = [
            pad2(Math.round(r).toString(16)),
            pad2(Math.round(g).toString(16)),
            pad2(Math.round(b).toString(16))
        ];

        return "#" + hex.join("");
    }
    function ok(x, y) {
        return x >= 0 && y >= 0 
            && x < w && y < h
            && !used[y][x];
    }
    function colorAt(imageData, x, y) {
        var start = (x + y*ctx.canvas.width)*4;
        return rgbToHex(imageData[start], imageData[start + 1], imageData[start + 2]);
    }
    function relativeCoords(element, event) {
        var rect = element.getBoundingClientRect();
        return {x: Math.floor(event.clientX - rect.left),
                y: Math.floor(event.clientY - rect.top)};
    }
    function trackEventListeners(onDraw, onEndDraw) {

        function onEnd(event) {
            overlay.canvas.removeEventListener("mousemove", onDraw);
            overlay.canvas.removeEventListener("mouseup", onEnd);
            if (onEndDraw)
                onEndDraw(event);
        }

        overlay.canvas.addEventListener("mousemove", onDraw);
        overlay.canvas.addEventListener("mouseup", onEnd);
    }
    function getRandomPoint(center, radius) {
        var angle = Math.random()*Math.PI*2,
            dist = Math.random()*radius,
            dx = Math.cos(angle)*dist,
            dy = Math.sin(angle)*dist;
        return {x: Math.floor(center.x + dx),
               y: Math.floor(center.y + dy)};
    }
    function swapColors() {
        var old = ctx.fillStyle;
        ctx.fillStyle = ctx.strokeStyle;
        ctx.strokeStyle = old;
    }
    function getRect(fr, to) {
        return {left: Math.min(fr.x, to.x),
                top: Math.min(fr.y, to.y),
                width: Math.abs(fr.x - to.x),
                height: Math.abs(fr.y - to.y)};
    }
    function clear(fr, to, cx) {
        var rect = getRect(fr, to);
        cx.clearRect(rect.left - ctx.lineWidth*5, rect.top - ctx.lineWidth*5, rect.width + ctx.lineWidth*10, rect.height + ctx.lineWidth*10);
    }
    function drawPoly(fr, to, cx) {
        var rect = getRect(fr, to);
        if (rect.width > 100)
            console.log("check");
        var radius = rect.width/2;
        var ratio = rect.height/rect.width,
            angle = Math.PI/2,
            n = poly.sides,
            center = {x: (fr.x + to.x)/2,
                        y: (fr.y + to.y)/2},
            coords = [{x: center.x, y: center.y - radius*ratio}];
        
        for (var i = 1; i < n; ++i) {
            angle += 2*Math.PI/n;
            coords.push({x: Math.cos(angle)*radius + center.x,
                        y: -Math.sin(angle)*radius*ratio + center.y});
        }
        
        cx.beginPath();
        cx.moveTo(Math.floor(coords[0].x), Math.floor(coords[0].y));
        for (var i = 1; i < n; ++i)
            cx.lineTo(Math.floor(coords[i].x),
                      Math.floor(coords[i].y));
        cx.closePath();
        cx.fill();
        cx.stroke();
    }
    
    var draw = Object.create(null),
        brush = Object.create(null),
        pencil = Object.create(null),
        spray = Object.create(null),
        eraser = Object.create(null),
        paintBucket = Object.create(null),
        text = Object.create(null),
        poly = Object.create(null);
    var ctx = common.ctx,
        overlay = common.overlay;
    
    ctx.fillStyle = "white";

    brush.width = 5;
    brush.controls = Object.create(null);
    brush.controls.widthInput = common.create("input", {type: "number", min: "1", max: "200", value: "5", class: "brush-width"});
    common.mainPanel.insertBefore(brush.controls.widthInput, common.controlsPlaceHolder);
    brush.handlers = Object.create(null);
    brush.handlers.widthInput = function(event) {
        
        var newVal = +brush.controls.widthInput.value;
        if (newVal >= +brush.controls.widthInput.min &&
            newVal <= +brush.controls.widthInput.max)
        {
            brush.width = newVal;
        }
        else
            brush.controls.widthInput.value = brush.width;
        
    };
    
    spray.radius = 5;
    spray.controls = Object.create(null);
    spray.controls.radiusInput = common.create("input", {type: "number", min: "3", max: "200", value: "5", class: "spray-radius"});
    common.mainPanel.insertBefore(spray.controls.radiusInput, common.controlsPlaceHolder);
    spray.handlers = Object.create(null);
    spray.handlers.radiusInput = function(event) {
        
        var newVal = +spray.controls.radiusInput.value;
        if (newVal >= +spray.controls.radiusInput.min &&
            newVal <= +spray.controls.radiusInput.max)
        {
            spray.radius = newVal;
        }
        else
            spray.controls.radiusInput.value = spray.radius;
        
    };
    
    eraser.width = 5;
    eraser.controls = Object.create(null);
    eraser.controls.widthInput = common.create("input", {type: "number", min: "1", max: "200", value: "5", class: "eraser-width"});
    common.mainPanel.insertBefore(eraser.controls.widthInput, common.controlsPlaceHolder);
    eraser.handlers = Object.create(null);
    eraser.handlers.widthInput = function(event) {
        
        var newVal = +eraser.controls.widthInput.value;
        if (newVal >= +eraser.controls.widthInput.min &&
            newVal <= +eraser.controls.widthInput.max)
        {
            eraser.width = newVal;
        }
        else
            eraser.controls.widthInput.value = eraser.width;
        
    };
    
    text.size = 10;
    text.controls = Object.create(null);
    text.controls.sizeInput = common.create("input", {type: "number", min: "8", max: "200", value: "10", class: "font-size"});
    common.mainPanel.insertBefore(text.controls.sizeInput, common.controlsPlaceHolder);
    text.handlers = Object.create(null);
    text.handlers.sizeInput = function(event) {
        
        var newVal = +text.controls.sizeInput.value;
        if (newVal >= +text.controls.sizeInput.min &&
            newVal <= +text.controls.sizeInput.max)
        {
            text.size = newVal;
        }
        else
            text.controls.sizeInput.value = text.size;
        
    };
    
    poly.sides = 4;
    poly.controls = Object.create(null);
    poly.controls.sidesInput = common.create("input", {type: "number", min: "3", max: "50", value: "4", class: "poly-sides"});
    common.mainPanel.insertBefore(poly.controls.sidesInput, common.controlsPlaceHolder);
    poly.handlers = Object.create(null);
    poly.handlers.sidesInput = function(event) {
        
        var newVal = +poly.controls.sidesInput.value;
        if (newVal >= +poly.controls.sidesInput.min &&
            newVal <= +poly.controls.sidesInput.max)
        {
            poly.sides = newVal;
        }
        else
            poly.controls.sidesInput.value = poly.sides;
        
    };
    poly.width = 5;
    poly.controls.widthInput = common.create("input", {type: "number", min: "1", max: "30", value: "1", class: "poly-width"});
    common.mainPanel.insertBefore(poly.controls.widthInput, common.controlsPlaceHolder);
    poly.handlers.widthInput = function(event) {
        
        var newVal = +poly.controls.widthInput.value;
        if (newVal >= +poly.controls.widthInput.min &&
            newVal <= +poly.controls.widthInput.max)
        {
            poly.width = newVal;
        }
        else
            poly.controls.widthInput.value = poly.width;
        
    };

    
    poly.onselect = 
    text.onselect = 
    paintBucket.onselect =
    eraser.onselect = 
    brush.onselect = 
    pencil.onselect =
    spray.onselect =
        function() {
            //add mousedown EL
            overlay.canvas.addEventListener("mousedown", this.mousedownHandler);

            //show controls
            if (this.controls) {
                for (var name in this.controls) {
                    var control = this.controls[name];
                    control.style.display = "inline-block";
                    control.addEventListener("change", this.handlers[name]);
                    control.addEventListener("blur", this.handlers[name]);
                }
            }

        };
    
    poly.ondeselect = 
    text.ondeselect = 
    paintBucket.ondeselect = 
    eraser.ondeselect = 
    brush.ondeselect =
    pencil.ondeselect = 
    spray.ondeselect =
        function() {
            //remove mousedown EL
            overlay.canvas.removeEventListener("mousedown", this.mousedownHandler);
        
            //hide controls
            if (this.controls) {
                for (var name in this.controls) {
                    var control = this.controls[name];
                    control.style.display = "none";
                    control.removeEventListener("change", this.handlers[name]);
                    control.removeEventListener("blur", this.handlers[name]);
                }
            }
        };
    
   brush.mousedownHandler = function(event) {
       if (event.which == 1) {
           event.preventDefault();
           brush.pos = relativeCoords(ctx.canvas, event);
           brush.handlers.widthInput(); 
           ctx.lineWidth = brush.width;
           ctx.lineCap = "round";


           trackEventListeners(brush.mousemoveHandler.bind(brush));
       }
   };
    
   spray.mousedownHandler = function(event) {
       if (event.which == 1) {
           event.preventDefault();
           spray.pos = relativeCoords(ctx.canvas, event);
           swapColors();
           spray.handlers.radiusInput();

           spray.timer = setInterval(function() {
               var num = spray.radius*spray.radius*Math.PI*0.3;
               for (var i = 0; i < num; ++i) {
                   var newPoint = getRandomPoint(spray.pos, spray.radius);
                   ctx.fillRect(newPoint.x, newPoint.y, 1, 1);
               }
           }, 30);

           trackEventListeners(spray.mousemoveHandler.bind(spray), spray.mouseupHandler.bind(spray));
       }
   };
    
    pencil.mousedownHandler = function(event) {
        if (event.which == 1) {
            event.preventDefault();
            pencil.pos = relativeCoords(ctx.canvas, event);
            ctx.lineWidth = 1;
            ctx.lineCap = "round";

           trackEventListeners(pencil.mousemoveHandler.bind(pencil));
        }
    };
    
    eraser.mousedownHandler = function(event) {
       if (event.which == 1) {
            event.preventDefault();
            eraser.pos = relativeCoords(ctx.canvas, event);
            eraser.previousColor = ctx.strokeStyle;
            ctx.strokeStyle = "white";
            ctx.lineCap = "round";
           eraser.handlers.widthInput();
           ctx.lineWidth = eraser.width;
           
           trackEventListeners(eraser.mousemoveHandler.bind(eraser), eraser.mouseupHandler.bind(eraser));
       }
    };
    
    paintBucket.mousedownHandler = function(event) {
        if (event.which == 1 && !painting) {
            requestAnimationFrame( function() {
                var t0 = performance.now();
                painting = true;
                event.preventDefault();
                var pos = relativeCoords(ctx.canvas, event);
                swapColors();

                var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
                imageData = imageData.data;

                if (colorAt(imageData, pos.x, pos.y) == ctx.fillStyle) {
                    swapColors();
                    painting = false;
                    return;
                }
                var queue = [];
                queue.push(pos);
                for (var i = 0, w = ctx.canvas.width + 5, h = ctx.canvas.height + 5; i < h; ++i) {
                    used[i] = [];
                    used[i][w] = false;
                }
                queue[ctx.canvas.width*ctx.canvas.height] = {};
                var fr = 0,
                    to = 1;
                setColor(imageData, pos.x, pos.y);
                
                while(fr < to)
                {
                    var newTo = to;
                    while(fr < to) {
                        var x = queue[fr].x, y = queue[fr].y;
                        for (var j = 0; j < 4; ++j) {
                            var nx = x + dx[j], ny = y + dy[j];
                            while (ok(nx, ny) && colorEquals(imageData, nx, ny)) {
                                ctx.fillRect(nx, ny, 1, 1);
                                queue[newTo++] = {x: nx, y: ny};
                                used[ny][nx] = true;
                                ny += dy[j];
                                nx += dx[j];
                            }

                            //ctx.fillRect(x + dx[j], y + dy[j], nx - x - dx[j] + 1, ny - dy[j] - y + 1);
                        }
                        ++fr;
                    }
                    fr = to;
                    to = newTo;
                }

                swapColors();
                
                

                painting = false;
                var t1 = performance.now();
                console.log("finished " + (t1 - t0));
            });
        }
    };
    
    text.mousedownHandler = function(event) {
        if (event.which == 1) {
            event.preventDefault();
            var pos = relativeCoords(ctx.canvas, event);
            text.handlers.sizeInput();
            
            swapColors();
            var str = prompt("text:");
            if (str) {
                ctx.font = text.size + "px sans-serif";
                ctx.fillText(str, pos.x, pos.y);
            }
            swapColors();
        }
    };
    
    poly.mousedownHandler = function(event) {
        if (event.which == 1) {
            event.preventDefault();
            var start = relativeCoords(ctx.canvas, event);
            poly.handlers.sidesInput();
            poly.handlers.widthInput();
            ctx.lineWidth = overlay.lineWidth = poly.width;
            overlay.fillStyle = ctx.fillStyle;
            overlay.strokeStyle = ctx.strokeStyle;
            var pos = relativeCoords(ctx.canvas, event);
            
            trackEventListeners(function(event) {
                clear(start, pos, overlay);
                pos = relativeCoords(ctx.canvas, event);
                drawPoly(start, pos, overlay);
            },
            function(event) {
                var cur = relativeCoords(ctx.canvas, event);
                clear(start, pos, overlay); 
                drawPoly(start, cur, ctx);
            });
        }
    };
    
    eraser.mousemoveHandler = 
    brush.mousemoveHandler =
    pencil.mousemoveHandler = 
    function(event) {
        ctx.beginPath();

        ctx.moveTo(this.pos.x, this.pos.y);
        this.pos = relativeCoords(ctx.canvas, event);
        ctx.lineTo(this.pos.x, this.pos.y);

        ctx.stroke();	       
    };
    
    spray.mousemoveHandler = 
    function(event) {
        this.pos = relativeCoords(ctx.canvas, event);
    };
    
    spray.mouseupHandler =
    function(event) {
        clearInterval(this.timer);
        swapColors();
    };
    
    eraser.mouseupHandler = 
    function(event) {
        ctx.strokeStyle = this.previousColor;
    };
    
    
    draw.brush = brush;
    draw.spray = spray;
    draw.pencil = pencil;
    draw.eraser = eraser;
    draw["paint-bucket"] = paintBucket;
    draw.text = text;
    draw.polygon = poly;
    return draw;
}