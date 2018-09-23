
        "_getSideControlBtnData": function() {
            var classList = " mlts-side-control-buttons mlts-control-buttons tei-button tei-mlts-add-btn tei-push-button tei-btn-responsive tei-graph-control-buttons",
                sideControlBtnData = {
                    "divClass": "mlts-btns-container",
                    "divData": [{
                        "id": this.uniqueId + "-mlts-control-buttons-container",
                        "className": "mlts-control-buttons-container",
                        "data": [{
                            "text": this.manager.getMessage("mlts-side-control-buttons", "reset"),
                            "htmlClass": "tei-mlts-reset-btn tei-reset-btn" + classList,
                            "id": this.uniqueId + "tei-mlts-reset-btn"
                        }, {
                            "text": this.manager.getMessage("mlts-side-control-buttons", "selectArea"),
                            "htmlClass": "tei-mlts-select-area-btn" + classList,
                            "id": this.uniqueId + "tei-mlts-select-area-btn"
                        }]
                    }],
                    "graphId": this.uniqueId + "-graph-container",
                    "graphClass": "graph-activity-area"
                },
                additionalBtnData;

            if (this.model.get('showBothButtons')) {
                additionalBtnData = [{
                    "text": this.manager.getMessage("mlts-side-control-buttons", "solidLine"),
                    "htmlClass": "tei-mlts-solid-line-btn" + classList,
                    "id": this.uniqueId + "tei-mlts-solid-line-btn"
                }, {
                    "text": this.manager.getMessage("mlts-side-control-buttons", "dottedLine"),
                    "htmlClass": "tei-mlts-dotted-line-btn" + classList,
                    "id": this.uniqueId + "tei-mlts-dotted-line-btn"
                }];
            } else {
                additionalBtnData = [{
                    "text": this.manager.getMessage("mlts-side-control-buttons", "addLine"),
                    "htmlClass": "tei-mlts-add-line-btn" + classList,
                    "id": this.uniqueId + "tei-mlts-add-line-btn"
                }];
            };
            sideControlBtnData.divData[0].data.splice(1, 0, ...additionalBtnData);
            return sideControlBtnData;
        },
