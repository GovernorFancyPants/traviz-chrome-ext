
// TODO: Save previous values in localstorage and append on popup open

// var port = chrome.extension.connect({
//     name: "Sample Communication"
// });

// port.onDisconnect.addListener(function() {
//     window.alert('closed');
//     var sProperty = document.getElementById('user-property').value;
//     var sValue = document.getElementById('user-value').value;
//     var sSelector = document.getElementById('user-selector').value;
//     var sComputedStyle = document.getElementById('computed-style').checked;
//     status = {
//         property: sProperty,
//         value: sValue,
//         selector: sSelector,
//         computedStyle: sComputedStyle
//     }

//     var dataToStore = JSON.stringify(status);
//     localStorage.setItem('status_data', dataToStore);
// });

// Load script file and jQuery

document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.executeScript(null, {
        file: "jquery-2.1.1.js"
    }, function() {
            chrome.tabs.executeScript(null, {
                file: 'traviz.js'
            });
        });
});

// Get settings from localstorage on load

window.onload = function() {
    var localData = JSON.parse(localStorage.getItem('status_data'));

    if (localData) {
        document.getElementById('user-property').value = localData.property;
        document.getElementById('user-value').value = localData.value;
        document.getElementById('user-selector').value = localData.selector;
        document.getElementById('computed-style').checked = localData.computed_style;
        document.getElementById('random-colors').checked = localData.random_colors;
    }
};

// Save settings to localstorage on unload

// TODO: unload is not fired when clicking outside of popup or on icon. Need to implement port channel commented out above

addEventListener('unload', function(event) {
    input_status = {
        property: document.getElementById('user-property').value,
        value: document.getElementById('user-value').value,
        selector: document.getElementById('user-selector').value,
        computed_style: document.getElementById('computed-style').checked,
        random_colors: document.getElementById('random-colors').checked
    };

    var dataToStore = JSON.stringify(input_status);
    localStorage.setItem('status_data', dataToStore);
}, true);

var button = document.getElementById('go-button');
button.addEventListener('click', trigger, false);

var valueInput = document.getElementById('user-value');
valueInput.addEventListener("keyup", function(e) {
    e.which = e.which || e.keyCode;
    if (e.which == 13) {
        trigger();
    }
}, false);

var propertyInput = document.getElementById('user-property');
propertyInput.addEventListener("keyup", function(e) {
    e.which = e.which || e.keyCode;
    if (e.which == 13) {
        trigger();
    }
}, false);

var selectorInput = document.getElementById('user-selector');
selectorInput.addEventListener("keyup", function(e) {
    e.which = e.which || e.keyCode;
    if (e.which == 13) {
        trigger();
    }
}, false);

function trigger() {
    var sProperty = document.getElementById('user-property').value;
    var sValue = document.getElementById('user-value').value;
    var sSelector = document.getElementById('user-selector').value;
    var sComputedStyle = document.getElementById('computed-style').checked;
    var sRandomColors = document.getElementById('random-colors').checked;

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                property: sProperty,
                value: sValue,
                selector: sSelector,
                computedStyle: sComputedStyle,
                random_colors: sRandomColors
            });
        });
    window.close();
}