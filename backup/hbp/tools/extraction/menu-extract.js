function appendLink() {
    $("body").append("<a id='downloader' style='display:none'></a>")
}

function downloadData(storageObj) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storageObj, null, 4));
    var dlAnchorElem = $('#downloader')[0];
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "side-menu.json");
    dlAnchorElem.click();
}

function getMenuData() {
    var obj = {},
        nodes = [];
    $(".tree-link").each(function (i, elem) {
        var key = elem.textContent.toLowerCase().split(/\s+/).join("-"),
            listItem = $(elem).parent(),
            $parent = listItem.closest(".tree-subtree"),
            linkData = {
                refid: null,
                text: elem.textContent,
                dataURL: "source/courses/sm/json/#name#.json",
                hash: null
            },
            parentKey;
        if ($parent.length && $parent.prev(".tree-link").length) {
            parentKey = $parent.prev(".tree-link")[0].textContent.toLowerCase().split(/\s+/).join("-");
            if (!obj[parentKey].childLinks) {
                obj[parentKey].childLinks = [];
            }
            linkData.refid = obj[parentKey].refid + "-" + listItem.index();
            linkData.hash = obj[parentKey].hash + "/" + listItem.index();
            linkData.dataURL = linkData.dataURL.replace("#name#", linkData.refid);
            obj[parentKey].childLinks.push(linkData);
        } else {
            linkData.refid = "link-" + listItem.index();
            linkData.hash = "" + listItem.index();
            linkData.dataURL = linkData.dataURL.replace("#name#", linkData.refid);
            nodes.push(linkData);
        }
        obj[key] = linkData;
    });
    return {
        mainlinks: nodes
    };
}

function extractMenu() {
    appendLink();
    downloadData(getMenuData());
}

function JSONFixes() {
    JSON.parse(JSON.stringify(a), function (k, v) {
        if (k === "refid") {
            this.dataURL = "source/courses/sm/json/" + v + ".json";
        }
        return v;
    });
}

extractMenu();