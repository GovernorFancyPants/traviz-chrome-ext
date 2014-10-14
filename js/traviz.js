//@ sourceUrl=traviz.js

// ### AMD wrapper
;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return factory(root);
        });
    } else {
        // if not using an AMD library set the global `Inlinr` namespace
        root.Inlinr = factory(root);
    }
}(this, function(global) {

    var defaults = {
            use_specified: false
        },
        options = copy({}, defaults),
        Inlinr;

    function copy(target, source) {
        var k;
        for (k in source) {
            target[k] = source[k];
        }
        return target;
    }

    // convert an array-like object to array
    function toArray(list) {
        return [].slice.call(list);
    }

    // get a list of matched nodes
    function $get(selector, parent) {
        if (parent) {
            if (typeof parent.querySelectorAll === 'function') {
                return parent.querySelectorAll(selector);
            } else if (typeof parent === 'string') {
                return $get(selector, $get(parent)[0]);
            }
        }
        return global.document.querySelectorAll(selector);
    }

    // polyfill window.getMatchedCSSRules()
    if (typeof global.getMatchedCSSRules !== 'function') {

        var ELEMENT_RE = /[\w-]+/g,
            ID_RE = /#[\w-]+/g,
            CLASS_RE = /\.[\w-]+/g,
            ATTR_RE = /\[[^\]]+\]/g,
            // :not() pseudo-class does not add to specificity, but its content does as if it was outside it
            PSEUDO_CLASSES_RE = /\:(?!not)[\w-]+(\(.*\))?/g,
            PSEUDO_ELEMENTS_RE = /\:\:?(after|before|first-letter|first-line|selection)/g;
        // handles extraction of `cssRules` as an `Array` from a stylesheet or something that behaves the same
        function getSheetRules(stylesheet) {
            var sheet_media = stylesheet.media && stylesheet.media.mediaText;
            // if this sheet is disabled skip it
            if (stylesheet.disabled) return [];
            // if this sheet's media is specified and doesn't match the viewport then skip it
            if (sheet_media && sheet_media.length && !global.matchMedia(sheet_media).matches) return [];
            // get the style rules of this sheet
            return toArray(stylesheet.cssRules);
        }

        function _find(string, re) {
            var matches = string.match(re);
            return re ? re.length : 0;
        }

        // calculates the specificity of a given `selector`
        function calculateScore(selector) {
            var score = [0, 0, 0],
                parts = selector.split(' '),
                part, match;
            //TODO: clean the ':not' part since the last ELEMENT_RE will pick it up
            while (part = parts.shift(), typeof part == 'string') {
                // find all pseudo-elements
                match = _find(part, PSEUDO_ELEMENTS_RE);
                score[2] = match;
                // and remove them
                match && (part = part.replace(PSEUDO_ELEMENTS_RE, ''));
                // find all pseudo-classes
                match = _find(part, PSEUDO_CLASSES_RE);
                score[1] = match;
                // and remove them
                match && (part = part.replace(PSEUDO_CLASSES_RE, ''));
                // find all attributes
                match = _find(part, ATTR_RE);
                score[1] += match;
                // and remove them
                match && (part = part.replace(ATTR_RE, ''));
                // find all IDs
                match = _find(part, ID_RE);
                score[0] = match;
                // and remove them
                match && (part = part.replace(ID_RE, ''));
                // find all classes
                match = _find(part, CLASS_RE);
                score[1] += match;
                // and remove them
                match && (part = part.replace(CLASS_RE, ''));
                // find all elements
                score[2] += _find(part, ELEMENT_RE);
            }
            return parseInt(score.join(''), 10);
        }

        // returns the heights possible specificity score an element can get from a give rule's selectorText
        function getSpecificityScore(element, selector_text) {
            var selectors = selector_text.split(','),
                selector, score,
                result = 0;
            while (selector = selectors.shift()) {
                if (element.mozMatchesSelector(selector)) {
                    score = calculateScore(selector);
                    result = score > result ? score : result;
                }
            }
            return result;
        }

        function sortBySpecificity(element, rules) {
            // comparing function that sorts CSSStyleRules according to specificity of their `selectorText`
            function compareSpecificity(a, b) {
                return getSpecificityScore(element, b.selectorText) - getSpecificityScore(element, a.selectorText);
            }

            return rules.sort(compareSpecificity);
        }

        //TODO: not supporting 2nd argument for selecting pseudo elements
        //TODO: not supporting 3rd argument for checking author style sheets only
        global.getMatchedCSSRules = function(element /*, pseudo, author_only*/ ) {
            var style_sheets, sheet, sheet_media,
                rules, rule,
                result = [];
            // get stylesheets and convert to a regular Array
            style_sheets = toArray(global.document.styleSheets);

            // assuming the browser hands us stylesheets in order of appearance
            // we iterate them from the beginning to follow proper cascade order
            while (sheet = style_sheets.shift()) {
                // get the style rules of this sheet
                rules = getSheetRules(sheet);
                // loop the rules in order of appearance
                while (rule = rules.shift()) {
                    // if this is an @import rule
                    if (rule.styleSheet) {
                        // insert the imported stylesheet's rules at the beginning of this stylesheet's rules
                        rules = getSheetRules(rule.styleSheet).concat(rules);
                        // and skip this rule
                        continue;
                    }
                    // if there's no stylesheet attribute BUT there IS a media attribute it's a media rule
                    else if (rule.media) {
                        // insert the contained rules of this media rule to the beginning of this stylesheet's rules
                        rules = getSheetRules(rule).concat(rules);
                        // and skip it
                        continue
                    }
                    //TODO: for now only polyfilling Gecko
                    // check if this element matches this rule's selector
                    if (element.mozMatchesSelector(rule.selectorText)) {
                        // push the rule to the results set
                        result.push(rule);
                    }
                }
            }
            // sort according to specificity
            return sortBySpecificity(element, result);
        };
    }

    // prefix the number with a 0 if it's a single digit
    function prefix0(number_str) {
        return number_str.length < 2 ? '0' + number_str : number_str;
    }

    // takes a number or a string representation of a number and return a string of it in Hex radix
    function toHex(num) {
        return (+num).toString(16);
    }

    // replaces all rgb() color format occurrences to their HEX representations
    function rgbToHex(str) {
        return str.replace(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g, function(match, r, g, b) {
            return '#' + prefix0(toHex(r)) + prefix0(toHex(g)) + prefix0(toHex(b));
        });
    }

    // get matched rules
    function getMatchedRules(element) {
        // get the matched rules from all style sheets
        var matched_rules = global.getMatchedCSSRules(element);
        // return `null` or return the list converted into an `Array`
        return matched_rules && toArray(matched_rules);
    }

    // returns a map of style properties, which are used in author style sheets,
    // to their values for a given element
    function getUsedValues(element) {
        var matched_rules = getMatchedRules(element),
            values = [],
            used = {},
            rule, computed, style, property;
        // if nothing is matched we get null so bail out
        if (!matched_rules) return values;
        // get the actual computed style
        //TODO: not supporting pseudo elements
        computed = global.getComputedStyle(element, null);

        // loop over the matched rules from the end since they should come in cascade order
        while (rule = matched_rules.pop()) {
            //for each rule convert rule.style into an array
            style = toArray(rule.style);
            // loop over the array of style properties that were defined in any of the stylesheets
            while (property = style.shift()) {
                // if it's not in `values`
                if (!used[property]) {
                    // take the used value and add it to the list as a CSS name-value pair
                    values.unshift(property + ':' + computed.getPropertyValue(property));
                    // make sure we don't repeat setting it
                    used[property] = true;
                }
            }
        }
        return values;
    }

    function getSpecifiedValues(element) {
        var matched_rules = getMatchedRules(element),
            values = [],
            used = {},
            rule, style_text, properties, property;
        // if nothing is matched we get null so bail out
        if (!matched_rules) return values;

        // loop over the matched rules from the end since they should come in cascade ascending order
        // i.e.: last one is most important
        while (rule = matched_rules.pop()) {
            style_text = rule.style.cssText;
            //for each rule parse and tokenize the cssText into style properties
            properties = style_text.split(';').map(function(item) {
                return item.split(':');
            });
            // loop over the array of style properties that were defined in any of the stylesheets
            while (property = properties.shift()) {
                // if it's not in `used` values
                if (property[0] && !used[property[0]]) {
                    // add this name-value pair to the list of values
                    values.unshift(property.join(':'));
                    // make sure we don't repeat setting it
                    used[property[0]] = true;
                }
            }
        }
        return values;
    }

    function process(elements, context, do_inline) {
        var getValues = options.use_specified ? getSpecifiedValues : getUsedValues,
            el, styles, style_str, s,
            inlined = [];

        if (typeof elements === 'string') {
            //get the elements if it's only a selector
            elements = toArray($get(elements, context));
        }
        // if it's a single element then stick it in an array
        else if (elements.nodeType) {
            elements = [elements];
        }

        // loop over the elements
        while (el = elements.shift()) {
            // pick all the values that were set in any of the stylesheets and generate the CSS text value
            style_str = getValues(el).join(';');
            // if it has any length
            if (style_str) {
                // translate all colors to Hex
                style_str = rgbToHex(style_str);
                // whether to actually set the style attribute
                if (do_inline) {
                    // inline it - set it to the style attribute of the element
                    style_str && el.setAttribute('style', style_str);
                }
            }
            inlined.push(style_str);
        }
        // returned the number of inlined elements, just for reference
        return inlined;
    }

    function configure(ops) {
        copy(options, ops);
        return Inlinr;
    }

    // inlines styles for a given element[s]
    function inline(elements, context) {
        return process(elements, context, true);
    }

    function calculate(elements, context) {
        return process(elements, context, false);
    }

    Inlinr = {
        inline: inline,
        calculate: calculate,
        configure: configure
    };
    return Inlinr;
}));

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    traviz(request.property, request.value, request.selector, request.computedStyle, request.random_colors);
});

function traviz(opt_property, opt_value, opt_selector, computedStyle, opt_randomColors) {

    var oProperty = opt_property;
    var oValue = opt_value;
    var oSelector = opt_selector;
    var oComputedStyle = computedStyle;
    var oRandomColors = opt_randomColors;

    if (document.getElementById('traviz-overlay')) {

        // If Traviz already exist, delete it

        remove();
    }

    var uiTraviz = document.createElement("div");
    uiTraviz.style.cssText = 'font-family: helvetica, arial; position: fixed; height: 100%; width: 350px; overflow: scroll; background-color: #f3f3f3; z-index: 999999999999999; padding: 0; top: 0; left: 0; text-align: left; color: #444; box-shadow: 1px 0 10px 2px rgba(0,0,0,0.3); line-height: 1.4; font-size: 16px; box-sizing: border-box;';
    uiTraviz.setAttribute('id', 'traviz-overlay');

    var uiHeader = document.createElement("div");
    uiHeader.style.cssText = 'background-color: #fff; padding: 1em; padding-left: 65px; width: auto; display: block; position: relative;';

    var uiRemove = document.createElement("a");
    uiRemove.style.cssText = 'background-color: #fff; position: relative; color: #4183c4; text-decoration: none';
    uiRemove.textContent = "Close";
    uiRemove.setAttribute('href', '#');

    var uiArrow = document.createElement("span");
    uiArrow.style.cssText = 'position: absolute; top: 1em; right: 10px; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 10px solid #f3f3f3;';

    var uiResultMeta = document.createElement("span");
    uiResultMeta.style.cssText = 'background-color: #eaeaea; padding: 1em; width: auto; display: block; position: relative;margin-bottom: 1em;';

    var uiLogo = document.createElement("span");
    uiLogo.style.cssText = 'position: absolute; left: 1em; top: 10px; display: inline-block; width: 32px; height: 32px; background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE3LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMSBUaW55Ly9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLXRpbnkuZHRkIj4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJ0aW55IiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIKCSB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBmaWxsPSIjNDU0NTQ1IiBkPSJNMTA4LjMsMTkuN2MtMTUuNi0xNS42LTQwLjktMTUuNi01Ni42LDBjLTE1LjYsMTUuNi0xNS42LDQwLjksMCw1Ni42czQwLjksMTUuNiw1Ni42LDAKCUMxMjMuOSw2MC43LDEyMy45LDM1LjMsMTA4LjMsMTkuN3ogTTU3LjQsNzAuNmMtMTIuNS0xMi41LTEyLjUtMzIuOCwwLTQ1LjNjMTIuNS0xMi41LDMyLjgtMTIuNSw0NS4zLDBzMTIuNSwzMi44LDAsNDUuMwoJQzkwLjEsODMuMSw2OS45LDgzLjEsNTcuNCw3MC42eiIvPgo8cGF0aCBmaWxsPSIjNDU0NTQ1IiBkPSJNMTcuOCwxMjEuNUw2LjUsMTEwLjJsMzAuMy0zMC4zYzAuNS0wLjUsMS4yLTEsMi0xLjJsNi4yLTIuMWMwLjctMC4yLDEuNC0wLjcsMi0xLjJsNC44LTQuOGw1LjcsNS43CglsLTQuOCw0LjhjLTAuNSwwLjUtMSwxLjItMS4yLDJsLTIuMSw2LjJjLTAuMiwwLjctMC43LDEuNC0xLjIsMkwxNy44LDEyMS41eiIvPgo8cGF0aCBmaWxsPSIjNDU0NTQ1IiBkPSJNODAsMjBjLTE1LjUsMC0yOCwxMi41LTI4LDI4YzAsMTUuNSwxMi41LDI4LDI4LDI4czI4LTEyLjUsMjgtMjhDMTA4LDMyLjUsOTUuNSwyMCw4MCwyMHogTTgwLDcyCgljLTEzLjMsMC0yNC0xMC43LTI0LTI0czEwLjctMjQsMjQtMjRzMjQsMTAuNywyNCwyNFM5My4zLDcyLDgwLDcyeiIvPgo8cGF0aCBmaWxsPSIjNDU0NTQ1IiBkPSJNODAsMjhjLTExLDAtMjAsOS0yMCwyMGMwLDExLDksMjAsMjAsMjBzMjAtOSwyMC0yMEMxMDAsMzcsOTEsMjgsODAsMjh6IE04MCw2MGMtNi42LDAtMTItNS40LTEyLTEyCgljMC02LjYsNS40LTEyLDEyLTEyczEyLDUuNCwxMiwxMkM5Miw1NC42LDg2LjYsNjAsODAsNjB6Ii8+CjxjaXJjbGUgZmlsbD0iIzQ1NDU0NSIgY3g9IjgwIiBjeT0iNDgiIHI9IjgiLz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+);';

    uiTraviz.addEventListener("click", hideShow, false);
    uiHeader.addEventListener("click", hideShow, false);
    uiRemove.addEventListener("click", remove, false);

    uiHeader.appendChild(uiLogo);
    uiHeader.appendChild(uiRemove);
    uiHeader.appendChild(uiArrow);
    uiTraviz.appendChild(uiHeader);
    uiTraviz.appendChild(uiResultMeta);
    document.body.appendChild(uiTraviz);

    // Traverse all elements on page

    if (opt_selector) {

        // TODO: Since traverse() is recursive it will print out all children of the matching elements. Need to change this behaviour to only print elements with matching selector

        traverse($(opt_selector)); // If selector is set, only traverse matching elements
    } else {
        traverse(document.getElementsByTagName('html')[0].children);
    }

    function traverse(nodes) {

        nodes = Array.prototype.slice.call(nodes);
        nodes.forEach(function(obj) {

            var children = obj.children;

            // Get element value

            var objValue;

            if (!oComputedStyle) { // Get specified values

                // Doesn't work on sites with assets on other domain or local sites

                objValue = getMatchedStyle(obj, oProperty);

            } else { // Else get computed values
                objValue = document.defaultView.getComputedStyle(obj, null).getPropertyValue(oProperty);
            }

            // Switch on operator

            if (obj != uiTraviz && !isDescendant(uiTraviz, obj) && oProperty && oValue) {
                switch (oValue[0]) {
                    case '!':
                        if (objValue != oValue.slice(1)) {
                            createLegend(obj, objValue, oProperty);
                        }
                        break;

                    // TODO: Make > and < operator work with % and em/rem

                    case '>':
                        if (parseInt(objValue.replace(/[^\d.]/g, "")) > parseInt(oValue.replace(/[^\d.]/g, ""))) {
                            createLegend(obj, objValue, oProperty);
                        }
                        break;
                    case '<':
                        if (parseInt(objValue.replace(/[^\d.]/g, "")) < parseInt(oValue.replace(/[^\d.]/g, ""))) {
                            createLegend(obj, objValue, oProperty);
                        }
                        break;
                    default:
                        if (oSelector) {
                            if (objValue == oValue) {
                                createLegend(obj, objValue, oProperty);
                            } else if (!oValue) {
                                createLegend(obj, objValue, oProperty);
                            }
                        } else if (objValue == oValue) {
                            createLegend(obj, objValue, oProperty);
                    }
                }
            } else if (obj != uiTraviz && !isDescendant(uiTraviz, obj) && oProperty && !oValue) {
                createLegend(obj, objValue, oProperty);
            } else if (obj != uiTraviz && !isDescendant(uiTraviz, obj) && !oProperty && !oValue) {
                createLegend(obj, objValue, oProperty);
            }
            if (children.length !== 0 && !oSelector) { // Loop if item has children and selector is not set
                traverse(children);
            } else {

                // Print number of elements matched

                count = uiTraviz.getElementsByClassName('item').length;
                if (!oValue && !oProperty && !oSelector) {
                    uiResultMeta.textContent = "You must specify a property, value and/or selector";
                } else if (!oProperty && !oSelector) {
                    uiResultMeta.textContent = "Found " + String(count) + " elements with a selector of " + oSelector;
                } else {
                    uiResultMeta.textContent = "Found " + String(count) + " elements with " + oProperty + " " + oValue;
                    if (oSelector) {
                        uiResultMeta.textContent += " and a selector of " + oSelector;
                    }
                }
            }
        });
    }

    function isDescendant(parent, child) {
        // Check if element is decendant of a specific element
        var node = child.parentNode;
        while (node !== null) {
            if (node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }

    // var color = getStyleRuleValue('color', '.foo'); // searches all sheets for the first .foo rule and returns the set color style.
    // var color = getStyleRuleValue('color', '.foo', document.styleSheets[2]);

    // function getStyleRuleValue(style, selector, sheet) {
    //     var sheets = typeof sheet !== 'undefined' ? [sheet] : document.styleSheets;
    //     for (var i = 0, l = sheets.length; i < l; i++) {
    //         var sheet = sheets[i];
    //         if( !sheet.cssRules ) { continue; }
    //         for (var j = 0, k = sheet.cssRules.length; j < k; j++) {
    //             var rule = sheet.cssRules[j];
    //             if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1) {
    //                 return rule.style[style];
    //             }
    //         }
    //     }
    //     return null;
    // }

    // getCssPropertyForRule('div:hover', 'color');

    // function getCssPropertyForRule(rule, prop) {
    //     var sheets = document.styleSheets;
    //     var slen = sheets.length;
    //     for (var i = 0; i < slen; i++) {
    //         var rules = document.styleSheets[i].cssRules;
    //         var rlen = rules.length;
    //         for (var j = 0; j < rlen; j++) {
    //             if (rules[j].selectorText == rule) {
    //                 return rules[j].style[prop];
    //             }
    //         }
    //     }
    // }

    // Should give cascaded styles (Eg 1em, 2rem, 50%)
    // Doesn't seem to be working

    function getMatchedStyle(elem, property) {
        // element property has highest priority
        var val = elem.style.getPropertyValue(property);

        // if it's important, we are done
        if (elem.style.getPropertyPriority(property))
            return val;

        // get matched rules
        var rules = window.getMatchedCSSRules(elem, '');

        // iterate the rules backwards
        // rules are ordered by priority, highest last
        if (rules) {
            for (var i = rules.length; i-- > 0; ) {
                var r = rules[i];

                var important = r.style.getPropertyPriority(property);

                // if set, only reset if important
                if (val === null || important) {
                    val = r.style.getPropertyValue(property);

                    // done if important
                    if (important)
                        break;
                }
            }
        }

        return val;
    }

    function createLegend(obj, value, property) {

        var color;

        if (oRandomColors) {
            color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        } else {
            color = 'hotpink';
        }

        setOrgColor(document.getElementsByTagName('html')[0].children); // Save initial bg-color

        obj.style.backgroundColor = color; // Set new random bg-color

        var item = document.createElement("div");
        item.style.cssText = "background-color: #fff; margin: 1em; margin-top: 0; padding: 1em; border-right: 14px solid transparent; border-radius: 2px;";
        item.style.borderRightColor = color;
        item.classList.add('item');

        var pStyles = "margin: 0; margin-bottom: .5em; padding: 0;";

        var sTag = document.createElement("p");
        sTag.textContent = "Tag: " + obj.tagName;
        sTag.style.cssText = pStyles;
        var sId = document.createElement("p");
        sId.textContent = "Id: " + obj.getAttribute("id");
        sId.style.cssText = pStyles;
        var sClass = document.createElement("p");
        sClass.textContent = "Class: " + obj.getAttribute("class");
        sClass.style.cssText = pStyles;
        var sPropVal = document.createElement("p");
        sPropVal.textContent = property + ": " + value;
        sPropVal.style.cssText = pStyles;

        item.appendChild(sTag);
        item.appendChild(sId);
        item.appendChild(sClass);
        if (property) {
            item.appendChild(sPropVal);
        }

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

        // Fold Traviz

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
        reset(document.getElementsByTagName('html')[0].children); // Reset bg-color

        // Don't know what this does
        //
        // var myNode = document.getElementById('traviz-overlay');
        // while (myNode.firstChild) {
        //     myNode.removeChild(myNode.firstChild);
        // }
        document.getElementById('traviz-overlay').parentNode.removeChild(document.getElementById('traviz-overlay'));
    }

    function reset(nodes) {

        // Reset bg-color

        nodes = Array.prototype.slice.call(nodes);
        nodes.forEach(function(obj) {

            var children = obj.children;
            obj.style.backgroundColor = obj.getAttribute('data-traviz-old-color') || "";

            if (children.length !== 0) {
                reset(children);
            }
        });
    }

    function setOrgColor(nodes) {

        // Save initial bg-color

        nodes = Array.prototype.slice.call(nodes);
        nodes.forEach(function(obj) {

            var children = obj.children;
            oldBgColor = document.defaultView.getComputedStyle(obj, null).getPropertyValue('background-color');
            if (!obj.getAttribute('data-traviz-old-color')) {
                obj.setAttribute('data-traviz-old-color', oldBgColor);
            }

            if (children.length !== 0) {
                setOrgColor(children);
            }
        });
    }
}



