sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller, History) {
    "use strict";

    return Controller.extend("com.mall.customergiftissue.controller.Display", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDisplay").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sGVNo = oEvent.getParameter("arguments").gv_no;
            var oView = this.getView();
            var oModel = oView.getModel();

            var oListBinding = oModel.bindList("/GVHeaderSet", null, null, [
                new sap.ui.model.Filter("gv_no", sap.ui.model.FilterOperator.EQ, parseInt(sGVNo))
            ], {
                $expand: "assignGiftVouchers,returnGiftVouchers,bills"
            });

            oListBinding.requestContexts(0, 1).then(function (aContexts) {
                if (aContexts && aContexts.length > 0) {
                    oView.setBindingContext(aContexts[0]);
                } else {
                    sap.m.MessageBox.error("Transaction not found.");
                }
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteHome", {}, true);
            }
        }
    });
});
