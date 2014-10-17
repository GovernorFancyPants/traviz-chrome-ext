
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
        document.getElementById('user-selector').value = localData.selector;
        document.getElementById('computed-style').checked = localData.computed_style;
        document.getElementById('random-colors').checked = localData.random_colors;
        document.getElementById('user-value-tilde').value = localData.value_extend;
    }
    if (document.getElementById('user-property').value.match(/(~)/)) {
        document.getElementById('user-value-wrapper').classList.add('show-extend');
    }
};

var property_input = document.getElementById('user-property');
property_input.addEventListener('keyup', function() {
    if (property_input.value.match(/(~)/)) {
        document.getElementById('user-value-wrapper').classList.add('show-extend');
    } else {
        document.getElementById('user-value-wrapper').classList.remove('show-extend');
    }
}, false);

var button = document.getElementById('go-button');
button.addEventListener('click', trigger, false);

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

var userValueTilde = document.getElementById('user-value-tilde');
userValueTilde.addEventListener("keyup", function(e) {
    e.which = e.which || e.keyCode;
    if (e.which == 13) {
        trigger();
    }
}, false);

function trigger() {
    input_status = {
        property: document.getElementById('user-property').value,
        selector: document.getElementById('user-selector').value,
        computed_style: document.getElementById('computed-style').checked,
        random_colors: document.getElementById('random-colors').checked,
        value_extend: document.getElementById('user-value-tilde').value
    };

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, input_status, function(response) {
                if (response.status) {
                    document.getElementById('content').classList.remove('hidden');
                    document.getElementById('loading').classList.add('hidden');
                }
            });
        });

    document.getElementById('content').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');

    // Save settings to localstorage
    var dataToStore = JSON.stringify(input_status);
    localStorage.setItem('status_data', dataToStore);
}