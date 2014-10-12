document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.executeScript(null, {
        file: "jquery-2.1.1.js"
    }, function() {
            chrome.tabs.executeScript(null, {
                file: 'traviz.min.js'
            });
        });
});

var button = document.getElementById('go-button');
button.addEventListener("click", trigger, false);

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

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                property: sProperty,
                value: sValue,
                selector: sSelector
            });
        });
    //window.close();
}