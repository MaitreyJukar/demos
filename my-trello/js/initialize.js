window.MyTrello = {
    "Models": {},
    "Views": {},
    "Collections": {}
};

$(document).ready(function() {
    var Dashboard = new MyTrello.Views.Dashboard({
    	"el": $('.dashboard'),
    	"model": new MyTrello.Models.Dashboard()
    });
});