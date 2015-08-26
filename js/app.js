(function () {
    "use strict";
    
    var toolNames = ["select-rect", "brush", "pencil", "polygon",
                "spray", "paint-bucket", "text"];
    var mainPanelItems = ["new", "open", "save"];
    var toolbar, mainPanel, canvas, cx,
        mainWindow = document.body,
        firstScript = document.querySelector("script"),
        tools = Object.create(null),
        activeTool;
    
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
        cx.fillStyle = tinycolor.toHexString();
    }
    
    function changeStrokeColor(tinycolor) {
        cx.strokeStyle = tinycolor.toHexString();
    }
    
    var changeColors = [changeStrokeColor, changeFillColor];
    

    
    mainPanel = mainWindow.insertBefore(create("div", {class: "main-panel"}), firstScript);
    toolbar = mainWindow.insertBefore(create("div", {class: "toolbar"}), firstScript);
    canvas = mainWindow.insertBefore(create("canvas", {width: 700, height: 500}), firstScript);
    cx = canvas.getContext("2d");

    
    (function addTools() {
        toolNames.forEach(function(toolName) {
            toolbar.appendChild(create("div", {class: "icon-" + toolName}));
            if (window[toolName])
            {
                tools[toolName] = window[toolName];
            }
            else
                tools[toolName] = Object.create(null);
            tools[toolName].cx = cx;
            tools[toolName].properties = Object.create(null);
            tools[toolName].controls = Object.create(null);
        });
        activateTool("select-rect");
        
        toolbar.appendChild(create("input", {type: "color", class: "color1", id: "color1"}));
        toolbar.appendChild(create("input", {type: "color", class: "color2", id: "color2", value: "#ffffff"}));
        
        
    } ());
    
    (function addMainPanelItems() {
        mainPanelItems.forEach(function(itemName) {
            mainPanel.appendChild(create("div", {class: "icon-" + itemName}));
        });
    } ());
    
    (function createModules() {
        
    }());
    
    (function addColorPickers() {
        for (var i= 0; i < 2; ++i) {
            var colorPicker = $("#color" + (i + 1));
            colorPicker.spectrum({
                preferredFormat: "hex",
                showInitial: true,
                showInput: true,
                change: changeColors[i]
            });
        }
    }());

    
    
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