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
            // Bind the view to the specific GVHeader record
            this.getView().bindElement({
                path: "/GVHeaderSet(gv_no=" + sGVNo + ")", // Assuming we use gv_no as a key or filter
                parameters: {
                    $expand: "assignGiftVouchers,returnGiftVouchers,bills"
                }
            });
            // Note: OData V4 uses ID as key, so normally it's GVHeaderSet(<UUID>). We'd need to search by gv_no.
            // For simplicity in this demo, let's assume the router passes the ID.
            this.getView().bindElement({
                path: "/GVHeaderSet(" + sGVNo + ")",
                parameters: {
                    $expand: "assignGiftVouchers,returnGiftVouchers,bills"
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
