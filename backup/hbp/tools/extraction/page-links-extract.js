function appendLink() {
    $("body").append("<a id='downloader' style='display:none'></a>")
}

function downloadData(storageObj) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storageObj, null, 4));
    var dlAnchorElem = $('#downloader')[0];
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "page-links.json");
    dlAnchorElem.click();
}

function populateLinkData() {
    var links = [],
        dataLinks = [];

    $(".tree-link a[href]").each(function (i, elem) {
        var matches = elem.href.match(/.+#(.+)\/(.+)/),
            path = createDataPath(...matches),
            key = elem.textContent.toLowerCase().split(/\s+/).join("-"),
            name = getFileName(elem);
        links.push(elem.href);
        if (path) {
            dataLinks.push({
                key,
                path,
                name,
                text: elem.textContent
            });
        }
    });
    return {
        dataLinks
    };
}

function getFileName(elem) {
    var $parents = $(elem).parents(".tree-subtree"),
        name = "link";
    for (var i = $parents.length - 1; i >= 0; i--) {
        $parent = $($parents[i]);
        if ($parent.prev(".tree-link").length) {
            name += "-" + $parent.parent().index();
        }
    }
    name += "-" + $(elem).parents(".tree-link").eq(0).parent().index();
    return name;
}

function createDataPath(path, type, id, pg) {
    pg = pg || 0;
    switch (type) {
        case "node":
            return "https://eproduct.hbsp.harvard.edu/eproduct/product/spreadsheet_2013/content/item/" + id + "/" + pg + "/index.html";
        case "exam":
            return null;
        //return "https://eproduct.hbsp.harvard.edu/eproduct/exam/navigation/spreadsheet_2013/" + id;
        default:
            return null;
        // console.log(path);
        // return "NOTHING HERE";
    }
}

function extractPageLinks() {
    appendLink();
    downloadData(populateLinkData());
}

extractPageLinks();