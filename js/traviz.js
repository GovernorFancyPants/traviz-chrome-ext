//@ sourceUrl=traviz.js

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    traviz(request.property, request.value, request.selector);
});

function traviz(opt_property, opt_value, opt_selector) {

    var oProperty = opt_property;
    var oValue = opt_value;
    var oSelector = opt_selector;

    if (document.getElementById('traviz-overlay')) {
        remove();
    }

    var uiTraviz = document.createElement("div");
    uiTraviz.style.cssText = 'font-family: helvetica, arial; position: fixed; height: 100%; width: 350px; overflow: scroll; background-color: #f3f3f3; z-index: 999999999999999; padding: 0; top: 0; left: 0; text-align: left; color: #444; box-shadow: 1px 0 10px 2px rgba(0,0,0,0.3); line-height: 1.4; font-size: 16px; box-sizing: border-box;';
    uiTraviz.setAttribute('id', 'traviz-overlay');

    var uiHeader = document.createElement("div");
    uiHeader.style.cssText = 'background-color: #fff; padding: 1em; padding-left: 65px; width: auto; display: block; position: relative;';
    //uiHeader.textContent = "Hide/Show";

    var uiRemove = document.createElement("a");
    uiRemove.style.cssText = 'background-color: #fff; position: relative; color: #4183c4; text-decoration: none';
    uiRemove.textContent = "Close";
    uiRemove.setAttribute('href', 'javascript:;');

    var uiArrow = document.createElement("span");
    uiArrow.style.cssText = 'position: absolute; top: 1em; right: 10px; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 10px solid #f3f3f3;';

    var uiLogo = document.createElement("span");
    uiLogo.style.cssText = 'position: absolute; left: 1em; top: 10px; display: inline-block; width: 32px; height: 32px; background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE3LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMSBUaW55Ly9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLXRpbnkuZHRkIj4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJ0aW55IiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIKCSB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBmaWxsPSIjNDU0NTQ1IiBkPSJNMTA4LjMsMTkuN2MtMTUuNi0xNS42LTQwLjktMTUuNi01Ni42LDBjLTE1LjYsMTUuNi0xNS42LDQwLjksMCw1Ni42czQwLjksMTUuNiw1Ni42LDAKCUMxMjMuOSw2MC43LDEyMy45LDM1LjMsMTA4LjMsMTkuN3ogTTU3LjQsNzAuNmMtMTIuNS0xMi41LTEyLjUtMzIuOCwwLTQ1LjNjMTIuNS0xMi41LDMyLjgtMTIuNSw0NS4zLDBzMTIuNSwzMi44LDAsNDUuMwoJQzkwLjEsODMuMSw2OS45LDgzLjEsNTcuNCw3MC42eiIvPgo8cGF0aCBmaWxsPSIjNDU0NTQ1IiBkPSJNMTcuOCwxMjEuNUw2LjUsMTEwLjJsMzAuMy0zMC4zYzAuNS0wLjUsMS4yLTEsMi0xLjJsNi4yLTIuMWMwLjctMC4yLDEuNC0wLjcsMi0xLjJsNC44LTQuOGw1LjcsNS43CglsLTQuOCw0LjhjLTAuNSwwLjUtMSwxLjItMS4yLDJsLTIuMSw2LjJjLTAuMiwwLjctMC43LDEuNC0xLjIsMkwxNy44LDEyMS41eiIvPgo8cGF0aCBmaWxsPSIjNDU0NTQ1IiBkPSJNODAsMjBjLTE1LjUsMC0yOCwxMi41LTI4LDI4YzAsMTUuNSwxMi41LDI4LDI4LDI4czI4LTEyLjUsMjgtMjhDMTA4LDMyLjUsOTUuNSwyMCw4MCwyMHogTTgwLDcyCgljLTEzLjMsMC0yNC0xMC43LTI0LTI0czEwLjctMjQsMjQtMjRzMjQsMTAuNywyNCwyNFM5My4zLDcyLDgwLDcyeiIvPgo8cGF0aCBmaWxsPSIjNDU0NTQ1IiBkPSJNODAsMjhjLTExLDAtMjAsOS0yMCwyMGMwLDExLDksMjAsMjAsMjBzMjAtOSwyMC0yMEMxMDAsMzcsOTEsMjgsODAsMjh6IE04MCw2MGMtNi42LDAtMTItNS40LTEyLTEyCgljMC02LjYsNS40LTEyLDEyLTEyczEyLDUuNCwxMiwxMkM5Miw1NC42LDg2LjYsNjAsODAsNjB6Ii8+CjxjaXJjbGUgZmlsbD0iIzQ1NDU0NSIgY3g9IjgwIiBjeT0iNDgiIHI9IjgiLz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+);';

    var uiMeta = document.createElement("span");
    uiMeta.style.cssText = 'background-color: #eaeaea; padding: 1em; width: auto; display: block; position: relative;margin-bottom: 1em;';

    uiTraviz.addEventListener("click", hideShow, false);
    uiHeader.addEventListener("click", hideShow, false);
    uiRemove.addEventListener("click", remove, false);

    uiHeader.appendChild(uiLogo);
    uiHeader.appendChild(uiRemove);
    uiHeader.appendChild(uiArrow);
    uiTraviz.appendChild(uiHeader);
    uiTraviz.appendChild(uiMeta);
    document.body.appendChild(uiTraviz);


    if (opt_selector) {
        traverse($(opt_selector));
    } else {
        traverse(document.getElementsByTagName('html')[0].children);
    }

    function traverse(nodes) {

        nodes = Array.prototype.slice.call(nodes);
        nodes.forEach(function(obj) {

            var children = obj.children;
            if (oValue.match(/\%$/)) {
                orgDisplay = document.defaultView.getComputedStyle(obj, null).getPropertyValue('display');
                obj.setAttribute('data-traviz-old-display', orgDisplay);
                obj.style.display = 'none';
                var objValue = document.defaultView.getComputedStyle(obj, null).getPropertyValue(oProperty);
                obj.style.display = obj.getAttribute('data-traviz-old-display') || "";
            } else {
                var objValue = document.defaultView.getComputedStyle(obj, null).getPropertyValue(oProperty);
            }

            switch (oValue[0]) {
                case '!':
                    if (objValue != oValue.slice(1) && obj != uiTraviz && !isDescendant(uiTraviz, obj)) {
                        createLegend(obj, objValue, oProperty);
                    }
                    break;
                case '>':
                    if (parseInt(objValue.replace(/[^\d.]/g, "")) > parseInt(oValue.replace(/[^\d.]/g, "")) && obj != uiTraviz && !isDescendant(uiTraviz, obj)) {
                        createLegend(obj, objValue, oProperty);
                    }
                    break;
                case '<':
                    if (parseInt(objValue.replace(/[^\d.]/g, "")) < parseInt(oValue.replace(/[^\d.]/g, "")) && obj != uiTraviz && !isDescendant(uiTraviz, obj)) {
                        createLegend(obj, objValue, oProperty);
                    }
                    break;
                default:
                    if (oSelector) {
                        if (objValue == oValue && obj != uiTraviz && !isDescendant(uiTraviz, obj)) {
                            createLegend(obj, objValue, oProperty);
                        } else if (obj != uiTraviz && !isDescendant(uiTraviz, obj)) {
                            createLegend(obj, objValue, oProperty);
                        }
                    } else {
                        if (objValue == oValue && obj != uiTraviz && !isDescendant(uiTraviz, obj)) {
                            createLegend(obj, objValue, oProperty);
                        }
                }
            }

            if (children.length != 0) {
                traverse(children);
            } else {
                count = uiTraviz.getElementsByClassName('item').length;
                uiMeta.textContent = "Found " + String(count) + " elements with " + oProperty + " " + oValue;
            }
        });
    }

    function isDescendant(parent, child) {
        var node = child.parentNode;
        while (node != null) {
            if (node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }

    function createLegend(obj, value, property) {

        var color = '#' + Math.floor(Math.random() * 16777215).toString(16);

        setOrgColor(document.getElementsByTagName('html')[0].children);

        obj.style.backgroundColor = color;

        var item = document.createElement("div");
        item.style.cssText = "background-color: #fff; margin: 1em; margin-top: 0; padding: 1em; border-right: 14px solid transparent; border-radius: 2px;";
        item.style.borderRightColor = color;
        item.classList.add('item');

        var pStyles = "margin: 0; margin-bottom: .5em; padding: 0;"

        var sTag = document.createElement("p");
        sTag.textContent = "Tag: " + obj.tagName;
        sTag.style.cssText = pStyles;
        var sId = document.createElement("p");
        sId.textContent = "Id: " + obj.getAttribute("id");
        sId.style.cssText = pStyles;
        var sClass = document.createElement("p");
        sClass.textContent = "Class: " + obj.getAttribute("class");
        sClass.style.cssText = pStyles;
        var sZindex = document.createElement("p");
        sZindex.textContent = property + ": " + value;
        sZindex.style.cssText = pStyles;

        item.appendChild(sTag);
        item.appendChild(sId);
        item.appendChild(sClass);
        item.appendChild(sZindex);

        uiTraviz.appendChild(item);

        item.addEventListener("mouseover", function() {
            var shadow = "box-shadow: #e74c3c 0 0 15px 5px, #e74c3c 0 0 15px 5px inset!important";
            obj.style.cssText += shadow;
        }, true);
        item.addEventListener("mouseout", function() {
            obj.style.boxShadow = "";
        }, true);
        item.addEventListener("click", function(e) {
            e.stopPropagation();
            obj.scrollIntoView();
        }, true);
    }

    function hideShow(e) {
        e.stopPropagation();
        if (uiHeader.classList.contains('closed')) {
            uiTraviz.style.marginLeft = "0";
            uiHeader.classList.remove('closed');
            uiArrow.style.cssText += 'border-right: 10px solid #f3f3f3; border-left: none;';
        } else {
            uiTraviz.style.marginLeft = "-320px";
            uiHeader.classList.add('closed');
            uiArrow.style.cssText += 'border-right: none; border-left: 10px solid #f3f3f3;';
        }
    }

    function remove() {
        reset(document.getElementsByTagName('html')[0].children);

        var myNode = document.getElementById('traviz-overlay');
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
        document.getElementById('traviz-overlay').parentNode.removeChild(document.getElementById('traviz-overlay'));
    }

    function reset(nodes) {
        nodes = Array.prototype.slice.call(nodes);
        nodes.forEach(function(obj) {

            var children = obj.children;
            obj.style.backgroundColor = obj.getAttribute('data-traviz-old-color') || "";

            if (children.length != 0) {
                reset(children);
            }
        });
    }

    function setOrgColor(nodes) {
        nodes = Array.prototype.slice.call(nodes);
        nodes.forEach(function(obj) {

            var children = obj.children;
            oldBgColor = document.defaultView.getComputedStyle(obj, null).getPropertyValue('background-color');
            if (!obj.getAttribute('data-traviz-old-color')) {
                obj.setAttribute('data-traviz-old-color', oldBgColor);
            }

            if (children.length != 0) {
                setOrgColor(children);
            }
        });
    }
}