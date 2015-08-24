(function () {
    "use strict";
    
    var tools = ["select-rect", "brush", "pencil", "polygon",
                "spray", "paint-bucket", "text"];
    var mainPanelItems = ["new", "open", "save"];
    var toolbar, mainPanel, mainWindow = document.body,
        firstScript = document.querySelector("script");
    
    function create(tagName, attributes) {
        var node = document.createElement(tagName);
        for (var attr in attributes)
        {
            node.setAttribute(attr, attributes[attr]);
        }
        return node;
    }
    

    
    mainWindow.insertBefore(create("div", {class: "main-panel"}), firstScript);
    mainWindow.insertBefore(create("div", {class: "toolbar"}), firstScript);
    mainWindow.insertBefore(create("canvas", {width: 700, height: 500}), firstScript);
    
    toolbar = document.querySelector(".toolbar");
    mainPanel = document.querySelector(".main-panel");
    
    (function addTools() {

        tools.forEach(function(toolName) {
            toolbar.appendChild(create("div", {class: "icon-" + toolName}));
        });
    } ());
    
    (function addMainPanelItems() {
        mainPanelItems.forEach(function(itemName) {
            mainPanel.appendChild(create("div", {class: "icon-" + itemName}));
        });
    } ());
}());