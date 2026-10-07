sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.mall.customergiftissue.controller.Home", {
        onInit: function () {
            this.resetModel();
        },

        resetModel: function() {
            var oData = {
                gvr_type_code: "CI",
                customer_ID: "20000000-0000-0000-0000-000000000001",
                campaign_name: "Diwali_Fest_2026",
                employee_code: "EMP9001",
                assignGiftVouchers: [],
                returnGiftVouchers: []
            };
            this.getView().setModel(new JSONModel(oData), "uiState");
        },

        onTypeSelect: function (oEvent) {
            var sKey = oEvent.getParameter("selectedIndex");
            var types = ["CI", "RT", "RP"];
            this.getView().getModel("uiState").setProperty("/gvr_type_code", types[sKey]);
        },

        onAddAssignVoucher: function () {
            var aVouchers = this.getView().getModel("uiState").getProperty("/assignGiftVouchers");
            aVouchers.push({
                giftVoucher_ID: "10000000-0000-0000-0000-000000000001",
                issue_quantity: 1,
                total_amount: "500.00"
            });
            this.getView().getModel("uiState").refresh();
        },

        onAddReturnVoucher: function () {
            var aVouchers = this.getView().getModel("uiState").getProperty("/returnGiftVouchers");
            aVouchers.push({
                RT_Ass_GiftVoucher_ID: "",
                issue_quantity: 1
            });
            this.getView().getModel("uiState").refresh();
        },

        onSubmit: function () {
            var oState = this.getView().getModel("uiState").getData();
            var oPayload = {
                gvr_type_code: oState.gvr_type_code,
                customer_ID: oState.customer_ID,
                employee_code: oState.employee_code
            };

            if (oState.gvr_type_code === 'CI') {
                oPayload.campaign_name = oState.campaign_name;
                oPayload.assignGiftVouchers = oState.assignGiftVouchers.map(v => ({
                    giftVoucher_ID: v.giftVoucher_ID,
                    issue_quantity: parseInt(v.issue_quantity),
                    total_amount: v.total_amount
                }));
            } else if (oState.gvr_type_code === 'RT') {
                oPayload.returnGiftsTotal_amt = "500.00"; // Placeholder
                oPayload.returnGiftVouchers = oState.returnGiftVouchers.map(v => ({
                    RT_Ass_GiftVoucher_ID: v.RT_Ass_GiftVoucher_ID,
                    issue_quantity: parseInt(v.issue_quantity),
                    total_amount: "500.00"
                }));
            } else if (oState.gvr_type_code === 'RP') {
                // Combine both
                oPayload.assignGiftsTotal_amt = "500.00";
                oPayload.returnGiftsTotal_amt = "500.00";
                oPayload.assignGiftVouchers = oState.assignGiftVouchers.map(v => ({
                    giftVoucher_ID: v.giftVoucher_ID,
                    issue_quantity: parseInt(v.issue_quantity),
                    total_amount: v.total_amount
                }));
                oPayload.returnGiftVouchers = oState.returnGiftVouchers.map(v => ({
                    RT_Ass_GiftVoucher_ID: v.RT_Ass_GiftVoucher_ID,
                    issue_quantity: parseInt(v.issue_quantity),
                    total_amount: "500.00"
                }));
            }

            var oModel = this.getView().getModel(); // OData V4 Model
            var oListBinding = oModel.bindList("/GVHeaderSet");

            var that = this;
            var oContext = oListBinding.create(oPayload);
            
            oContext.created().then(function () {
                MessageToast.show("Transaction Successful!");
                that.resetModel();
            }).catch(function (oError) {
                MessageBox.error(oError.message);
            });
        }
    });
});