var linkData, sideMenuData;

function start() {
    fetchLinks();
    fetchMenu();
}

function fetchLinks() {
    $.ajax({
        url: "page-links.json"
    }).done(onLinksFetchSuccess);
}

function fetchMenu() {
    $.ajax({
        url: "side-menu.json"
    }).done(onMenuFetchSuccess);
}

function onLinksFetchSuccess(response) {
    linkData = response;
    onAllDataFetched();
}

function onMenuFetchSuccess(response) {
    sideMenuData = response;
    onAllDataFetched();
}

function downloadData() {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sideMenuData, null, 4));
    var dlAnchorElem = $('#downloader')[0];
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "side-menu.json");
    dlAnchorElem.click();
}

function onAllDataFetched() {
    if (sideMenuData && linkData) {
        parseSideMenu(sideMenuData.mainlinks);
        downloadData();
        console.log(sideMenuData);
    }
}

function parseSideMenu(links) {
    for (var i = 0; i < links.length; i++) {
        if (links[i].childLinks) {
            parseSideMenu(links[i].childLinks);
        }
        else {
            fillPages(links[i]);
        }
    }
}

function fillPages(link) {
    var data = getDataFromRefID(link.refid);
    if (data) {
        link.childLinks = [];
        for (var i = 0; i < data.pages.length; i++) {
            link.childLinks.push({
                refid: link.refid + "-" + i,
                text: getPageName(data.pages[i]),
                dataURL: link.dataURL.replace(".json", "") + "-" + i + ".json",
                hash: link.hash + "/" + i
            });
        }
    }
}

function getPageName(pageHTML) {
    var $div = $("<div></div>").html(pageHTML),
        $header = $("h2", $div),
        title = $header.length ? $header.text().trim() : ($div.text().trim() ? $div.text().trim().match(/(\w+\s){3}/)[0].trim() : "ANONYMOUS");
    return title;
}

function getDataFromRefID(refID) {
    var links = linkData.dataLinks;
    for (var i = 0; i < links.length; i++) {
        if (refID === links[i].name) {
            return links[i];
        }
    }
    return null;
}

$(document).ready(function () {
    $(".menu-fixer").on("click", start);
});