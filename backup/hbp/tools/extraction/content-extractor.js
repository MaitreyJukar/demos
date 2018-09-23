var dataLinks;

function downloadData(storageObj, name) {
    name = name || "page-data";
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storageObj, null, 4));
    var dlAnchorElem = $('#downloader')[0];
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", name + ".json");
    dlAnchorElem.click();
}

function fetchJSON() {
    $.ajax({
        url: "page-links.json"
    }).done(JSONFetchSuccess);
}

function JSONFetchSuccess(response) {
    dataLinks = response.dataLinks;
    parseContent();
}

function parseContent() {
    for (var i = 0; i < dataLinks.length; i++) {
        parsePages(dataLinks[i]);
    }
}

function parsePages(link) {
    for (var i = 0; i < link.pages.length; i++) {
        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            href: link.path.replace("0/index.html", i + "/style.css")
        }).on("load", onStyleLoaded.bind(this, link, i)).appendTo("head");
    }
}

function onStyleLoaded(link, i) {
    var name = link.pages.length > 1 ? link.name + "-" + i : link.name;
    downloadData(getContent(link.pages[i]), name);

    // For JSONs of nodes that can expand into pages
    if (link.pages.length > 1 && !i) {
        downloadData(getContent(link.pages[i]), link.name);
    }
}

function getContent(page) {
    var $html = $("<div></div>").html(page),
        content = {
            nodes: []
        };
    $(".current-html").html($html);
    $(".asset", $html).each(function (i, elem) {
        if (!$(elem).is(":empty")) {
            fillNodeData($(elem), content);
        } else if (isValidImage($(elem))) {
            content.nodes.push({
                nodeType: "image",
                url: $(elem).css("background-image")
            });
        }
    });
    return content;
}

function isValidImage($elem) {
    return !$elem.is(".a0, .a1") &&
        $elem.css("background-image") &&
        $elem.css("background-image") != "none"
}

function fillNodeData($asset, content) {
    $("p, img, h2, ul, .kWidgetIframeContainer", $asset).each(function (i, elem) {
        switch (elem.tagName) {
            case "P":
                content.nodes.push(fetchTextData(elem));
                break;
            case "IMG":
                content.nodes.push(fetchImageData(elem));
                break;
            case "H2":
                content.title = fetchTitleData(elem);
                break;
            case "UL":
                content.nodes.push(fetchBulletData(elem));
                break;
            case "DIV":
                content.nodes.push(fetchVideoData(elem));
                break;
            default:
                break;
        }
    });
}

function fetchTextData(elem) {
    return {
        nodeType: "text",
        text: elem.textContent.trim()
    };
}

function fetchImageData(elem) {
    return {
        nodeType: "image",
        url: elem.src
    };
}

function fetchTitleData(elem) {
    return elem.textContent.trim();
}

function fetchBulletData(elem) {
    return {
        nodeType: "bullet",
        bulletList: $("li", elem).map(function () {
            return $(this).text().trim();
        }).get()
    };
}

function fetchVideoData(elem) {
    return {
        nodeType: "video",
        url: elem.src
    };
}


$(document).ready(function () {
    $(".json-downloader").on("click", fetchJSON);
});