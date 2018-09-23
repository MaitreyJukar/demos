var folderListJSON = function () {
    var folderList = {};
    folderList.aga = [];
    folderList.k5 = [];
    var agaListing = $(".exploration-menu.aga select");
    for (var i = 0; i < agaListing.length; i++) {
        folderList.aga[i] = [];
        const options = agaListing.eq(i).find("option");
        for (var j = 0; j < options.length; j++) {
            value = options.eq(j).attr("value");
            if(value.trim() !== "");
            folderList.aga[i].push(value);
        }
    }
    var k5Listing = $(".exploration-menu.k5 select");
    for (var i = 0; i < k5Listing.length; i++) {
        folderList.k5[i] = [];
        const options = k5Listing.eq(i).find("option");
        for (var j = 0; j < options.length; j++) {
            value = options.eq(j).attr("value");
            if(value.trim() !== "");
            folderList.k5[i].push(value);
        }
    }
    return JSON.stringify(folderList);
}

folderListJSON();