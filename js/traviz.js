(function() {
    var newDiv = document.createElement("div");
    newDiv.style.cssText = 'font-family: helvetica, arial; position: fixed; height: 100%; width: 350px; overflow: scroll; background-color: whitesmoke; z-index: 999999999999999; padding: 0; top: 0; left: 0; text-align: left; color: #444; box-shadow: 1px 0 10px 2px rgba(0,0,0,0.3); line-height: 1.4; font-size: 16px; box-sizing: border-box;';
    newDiv.setAttribute('id', 'travis');

    var fold = document.createElement("div");
    fold.style.cssText = 'background-color: #222; color: whitesmoke; padding: 1em; width: auto; display: block; position: relative;margin-bottom: 1em;';
    fold.textContent = "Hide/Show";

    var arrow = document.createElement("span");
    arrow.style.cssText = 'position: absolute; top: 1em; right: 10px; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 10px solid #444;';

    newDiv.addEventListener("click", hideShow, false);
    fold.addEventListener("click", hideShow, true);

    fold.appendChild(arrow);
    newDiv.appendChild(fold);
    document.body.appendChild(newDiv);

    traverse(document.getElementsByTagName('html')[0].children);

    function traverse(nodes) {
        nodes = Array.prototype.slice.call(nodes);
        nodes.forEach(function(obj) {
            var children = obj.children;
            var zIndex = document.defaultView.getComputedStyle(obj, null).getPropertyValue("z-index");
            if (zIndex != "auto") {
                console.log("----------------------------");
                console.log(obj);
                console.log(zIndex);

                if (obj.getAttribute('id') == 'travis') {
                    return;
                } else {
                    createLegend(obj, zIndex);
                }
            }
            if (children.length != 0) {
                traverse(children);
            }
        });
    }

    function createLegend(obj, zIndex) {

        var color = '#' + Math.floor(Math.random() * 16777215).toString(16);

        obj.style.backgroundColor = color;

        var item = document.createElement("div");
        item.style.cssText = "background-color: #fff; margin: 1em; margin-top: 0; padding: 1em; border-right: 14px solid transparent; border-radius: 5px;";
        item.style.borderRightColor = color;

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
        sZindex.textContent = "Z-index: " + zIndex;
        sZindex.style.cssText = pStyles;

        item.appendChild(sTag);
        item.appendChild(sId);
        item.appendChild(sClass);
        item.appendChild(sZindex);

        newDiv.appendChild(item);

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
        if (fold.classList.contains('closed')) {
            newDiv.style.marginLeft = "0";
            fold.classList.remove('closed');
            arrow.style.cssText += 'border-right: 10px solid #444; border-left: none;';
        } else {
            newDiv.style.marginLeft = "-320px";
            fold.classList.add('closed');
            arrow.style.cssText += 'border-right: none; border-left: 10px solid #444;';
        }
    }
})();