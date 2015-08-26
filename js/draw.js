(function() {
    
    function relativeCoords(element, event) {
        var rect = element.getBoundingClientRect();
        return {x: Math.floor(event.clientX - rect.left),
                y: Math.floor(event.clientY - rect.top)};
    }

    var brush = Object.create(null),
        pencil = Object.create(null),
        spray = Object.create(null),
        cx, context; 
    
    brush.onselect =
    pencil.onselect = 
    spray.onselect =
        function() {
            var self = this;
            function onmousedown(event) {
                 if (event.which == 1) {
                    event.preventDefault();
                    self.onStart(event);
                }
            }
            cx = self.cx;
            cx.canvas.addEventListener("mousedown", onmousedown);
            self.ondeselect = function() {
                cx.canvas.removeEventListener("mousedown", onmousedown);
            };
        
        };
    
    
    
    var trackEventListeners = 
        function(onDraw) {
        
            function onEnd(event) {
                cx.canvas.removeEventListener("mousemove", onDraw);
                cx.canvas.removeEventListener("mouseup", onEnd);
                console.log("remove");
            }
        
            cx.canvas.addEventListener("mousemove", onDraw);
            cx.canvas.addEventListener("mouseup", onEnd);
            console.log("add");                                    
        };
    
    brush.onStart = function(event) {
        
        function onDraw(event) {
            cx.beginPath();
                   
            cx.moveTo(pos.x, pos.y);
            pos = relativeCoords(cx.canvas, event);
            cx.lineTo(pos.x, pos.y);

            cx.stroke();
         }
        
        cx.lineCap = "round";
        cx.lineWidth = 10;
        cx.lineJoin = "round";

    
        var pos = relativeCoords(cx.canvas, event);
        trackEventListeners(onDraw);
    };
    
    pencil.onStart = function(event) {
        
        function onDraw(event) {
            cx.beginPath();
                   
            cx.moveTo(pos.x, pos.y);
            pos = relativeCoords(cx.canvas, event);
            cx.lineTo(pos.x, pos.y);

            cx.stroke();
         }
        
        cx.lineCap = "round";
        cx.lineWidth = 10;
        cx.lineJoin = "round";

    
        var pos = relativeCoords(cx.canvas, event);
        trackEventListeners(onDraw);
    };
    
    
    window.brush = brush;
    window.pencil = pencil;
    window.spray = spray;
} ());