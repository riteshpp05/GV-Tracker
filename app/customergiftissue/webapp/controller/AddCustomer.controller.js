sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, History, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.mall.customergiftissue.controller.AddCustomer", {
        onInit: function () {
            this.resetModel();
        },

        resetModel: function() {
            var oData = {
                name: "",
                email: "",
                phone: "",
                phoneCode: "+91",
                salutation: "MR",
                shoppingMall_ID: "8208"
            };
            this.getView().setModel(new JSONModel(oData), "uiState");
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
        },

        onSubmit: function () {
            var oState = this.getView().getModel("uiState").getData();
            var oModel = this.getView().getModel(); // OData V4 Model
            var oListBinding = oModel.bindList("/CustomerSet");

            var that = this;
            var oContext = oListBinding.create(oState);
            
            oContext.created().then(function () {
                MessageToast.show("Customer Registered Successfully!");
                that.resetModel();
                that.onNavBack();
            }).catch(function (oError) {
                MessageBox.error(oError.message);
            });
        }
    });
});
