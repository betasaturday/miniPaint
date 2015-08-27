function drawModule(common) {
    
    function relativeCoords(element, event) {
        var rect = element.getBoundingClientRect();
        return {x: Math.floor(event.clientX - rect.left),
                y: Math.floor(event.clientY - rect.top)};
    }
    function trackEventListeners(onDraw, onEndDraw) {

        function onEnd(event) {
            ctx.canvas.removeEventListener("mousemove", onDraw);
            ctx.canvas.removeEventListener("mouseup", onEnd);
            if (onEndDraw)
                onEndDraw();
        }

        ctx.canvas.addEventListener("mousemove", onDraw);
        ctx.canvas.addEventListener("mouseup", onEnd);
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
    var draw = Object.create(null),
        brush = Object.create(null),
        pencil = Object.create(null),
        spray = Object.create(null),
        eraser = Object.create(null);
    var ctx = common.ctx;
    
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

    
    eraser.onselect = 
    brush.onselect = 
    pencil.onselect =
    spray.onselect =
        function() {
            //add mousedown EL
            ctx.canvas.addEventListener("mousedown", this.mousedownHandler);

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
    
    eraser.ondeselect = 
    brush.ondeselect =
    pencil.ondeselect = 
    spray.ondeselect =
        function() {
            //remove mousedown EL
            ctx.canvas.removeEventListener("mousedown", this.mousedownHandler);
        
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
    return draw;
}