(function () {
    
    var toolNames = ["select-rect", "brush", "pencil", "eraser", "polygon",
                "spray", "paint-bucket", "text"];
    var mainPanelItems = ["new", "open", "save"];
    var moduleNames = ["draw"];
    var toolbar, mainPanel, canvas, ctx,
        mainWindow = document.body,
        firstScript = document.querySelector("script"),
        tools = Object.create(null),
        activeTool,
        controlsPlaceHolder = null, 
        common = Object.create(null);
    
    function create(tagName, attributes) {
        var node = document.createElement(tagName);
        for (var attr in attributes)
        {
            node.setAttribute(attr, attributes[attr]);
        }
        return node;
    }
    
    function activateTool(toolName) {
        var toolEl = toolbar.querySelector(".icon-" + toolName);
        toolEl.classList.add("active-tool");
        activeTool = tools[toolName];
        if (activeTool.onselect)
            activeTool.onselect();
    }
    
    function deactivate(activeTool) {
        if (activeTool.ondeselect)
            activeTool.ondeselect();
        var activeEl = toolbar.querySelector(".active-tool");
        activeEl.classList.remove("active-tool");
    }
    
    function onColorChanged(color) {
        console.log("here");
    }
    
    function changeFillColor(tinycolor) {
        if (!tinycolor)
            console.log("change is here");
        else
            ctx.fillStyle = tinycolor.toHexString();
    }
    
    function changeStrokeColor(tinycolor) {
        if (!tinycolor)
            console.log("change is here");
        else {
            ctx.strokeStyle = tinycolor.toHexString();
            console.log(ctx.strokeStyle);
        }
    }
    
    var changeColors = [changeStrokeColor, changeFillColor];
    

    
    mainPanel = mainWindow.insertBefore(create("div", {class: "main-panel"}), firstScript);
    toolbar = mainWindow.insertBefore(create("div", {class: "toolbar"}), firstScript);
    canvas = mainWindow.insertBefore(create("canvas", {width: 700, height: 500}), firstScript);
    ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#ff00ff";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    //initialize common
    common.ctx = ctx;
    common.mainPanel = mainPanel;
    common.create = create;
    common.controlsPlaceHolder = controlsPlaceHolder;
    
        
    //add main panel items
    mainPanelItems.forEach(function(itemName) {
        mainPanel.appendChild(create("div", {class: "icon-" + itemName}));
    });
    
    //initialize modules
    var draw = drawModule(common);
    for (var toolName in draw) {
        tools[toolName] = draw[toolName];
    }
    
    //add tools
    toolNames.forEach(function(toolName) {
        toolbar.appendChild(create("div", {class: "icon-" + toolName}));
        if (!tools[toolName])
            tools[toolName] = Object.create(null);
    });
    activateTool("select-rect");

    //add color pickers
    toolbar.appendChild(create("input", {type: "color", class: "color1", id: "color1", value: "#ff00ff"}));
    toolbar.appendChild(create("input", {type: "color", class: "color2", id: "color2", value: "#ffffff"}));
    for (var i= 0; i < 2; ++i) {
        var colorPicker = $("#color" + (i + 1));
        colorPicker.spectrum({
            preferredFormat: "hex",
            showInitial: true,
            showInput: true,
            change: changeColors[i]
        });
    }        
    
    //add save menu
    var saveicon = mainPanel.querySelector(".icon-save");
    var link = saveicon.appendChild(create("a", {href: "/"}));
    function update() {
        try {
          link.href = ctx.canvas.toDataURL();
        } catch (e) {
          if (e instanceof SecurityError)
            link.href = "javascript:alert(" +
              JSON.stringify("Can't save: " + e.toString()) + ")";
          else
            throw e;
        }
      }
      link.addEventListener("mouseover", update);
      link.addEventListener("focus", update);
    
    //add open menu
    function loadImageURL(url) {
      var image = document.createElement("img");
      image.addEventListener("load", function() {
        var fillColor = ctx.fillStyle, size = ctx.lineWidth,
            strokeColor = ctx.strokeStyle;
        ctx.canvas.width = image.width;
        ctx.canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = size;
      });
      image.src = url;
    }
    
    var input = create("input", {type: "file", accept: "image/*"});
    mainPanel.appendChild(input);
    input.addEventListener("change", function() {
        
        if (input.files.length == 0) return;
        var reader = new FileReader();
        reader.addEventListener("load", function() {
          loadImageURL(reader.result);
        });
        reader.readAsDataURL(input.files[0]);
        
    });
    
    var openicon = document.querySelector(".icon-open");
    openicon.addEventListener("click", function(event) {
        if (input.style.display == "inline-block")
            input.style.display = "none";
        else
            input.style.display = "inline-block";
    });
    
    //add new menu
    var newicon = document.querySelector(".icon-new");
    newicon.addEventListener("click", function(event) {
        var w = +prompt("Enter new width:");
        var h = +prompt("And height:");
        if (w && h && w >= 10 && h >= 10 && w <= 1000 && h <= 1000) {
            var fillColor = ctx.fillStyle, size = ctx.lineWidth,
            strokeColor = ctx.strokeStyle;
            ctx.canvas.width = w;
            ctx.canvas.height = h;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = size;           
        }
        else
            alert("Impossible");
    });
    
    //selecting tools
    toolbar.addEventListener("click", function(event) {
        var toolEl = event.target,
            className = toolEl.className;
        if (/^icon/.test(className)) {
            var toolName = className.substr(5);
            if (toolEl.classList.length === 1) {
                requestAnimationFrame( function() {
                    deactivate(activeTool);
                    activateTool(toolName);
                });
            }
        }
    });
    
}());