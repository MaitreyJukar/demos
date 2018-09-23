(function (JSONCreator) {
    var Question = JSONCreator.Collections.Base.extend({
        model: JSONCreator.Models.Question,

        getQuestionByModelID: function (id) {
            for (var i = 0; i < this.models.length; i++) {
                if (this.models[i].get("modelID") === id) {
                    return this.models[i];
                }
            }
        }
    }, {

    });

    JSONCreator.Collections.Question = Question;
})(window.JSONCreator);