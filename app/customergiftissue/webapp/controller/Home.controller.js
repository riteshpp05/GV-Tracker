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
                bills: [],
                assignGiftVouchers: [],
                returnGiftVouchers: []
            };
            this.getView().setModel(new JSONModel(oData), "uiState");
        },

        onNavToAddCustomer: function () {
            this.getOwnerComponent().getRouter().navTo("RouteAddCustomer");
        },

        onNavToDisplay: function () {
            // Hardcoded prompt or value for demo purposes. 
            // In a real app, you'd have a dialog to input GV Number.
            var sGVNo = prompt("Enter GV Number to display (e.g. 10000001):", "10000001");
            if (sGVNo) {
                this.getOwnerComponent().getRouter().navTo("RouteDisplay", { gv_no: sGVNo });
            }
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

        onAddBill: function () {
            var aBills = this.getView().getModel("uiState").getProperty("/bills");
            aBills.push({
                sr_no: aBills.length + 1,
                b_no: "",
                b_amount: "0.00",
                attachments: []
            });
            this.getView().getModel("uiState").refresh();
        },

        onFileChange: function (oEvent) {
            // Read the selected file and store its name in the bill's local model
            var oFileUploader = oEvent.getSource();
            var sFileName = oEvent.getParameter("newValue");
            if (sFileName) {
                MessageToast.show("File selected: " + sFileName);
            }
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
                
                var nTotalAssign = 0;
                oPayload.assignGiftVouchers = (oState.assignGiftVouchers || []).map(function (v) {
                    var nQty = parseInt(v.issue_quantity, 10) || 1;
                    var nAmt = parseFloat(v.total_amount) || 0;
                    nTotalAssign += nAmt;
                    return {
                        giftVoucher_ID: v.giftVoucher_ID,
                        issue_quantity: nQty,
                        total_amount: nAmt.toFixed(2)
                    };
                });
                oPayload.assignGiftsTotal_amt = nTotalAssign.toFixed(2);

                oPayload.bills = (oState.bills || []).map(function (b, idx) {
                    var nAmt = parseFloat(b.b_amount) || 0;
                    return {
                        sr_no: idx + 1,
                        b_no: b.b_no || ("BILL-" + (idx + 1)),
                        b_amount: nAmt.toFixed(2)
                    };
                });
            } else if (oState.gvr_type_code === 'RT') {
                var nTotalReturn = 0;
                oPayload.returnGiftVouchers = (oState.returnGiftVouchers || []).map(function (v) {
                    var nQty = parseInt(v.issue_quantity, 10) || 1;
                    var nAmt = parseFloat(v.total_amount) || 500;
                    nTotalReturn += nAmt;
                    return {
                        RT_Ass_GiftVoucher_ID: v.RT_Ass_GiftVoucher_ID,
                        issue_quantity: nQty,
                        total_amount: nAmt.toFixed(2)
                    };
                });
                oPayload.returnGiftsTotal_amt = nTotalReturn.toFixed(2);
            } else if (oState.gvr_type_code === 'RP') {
                var nTotalAssign = 0;
                var nTotalReturn = 0;

                oPayload.assignGiftVouchers = (oState.assignGiftVouchers || []).map(function (v) {
                    var nQty = parseInt(v.issue_quantity, 10) || 1;
                    var nAmt = parseFloat(v.total_amount) || 0;
                    nTotalAssign += nAmt;
                    return {
                        giftVoucher_ID: v.giftVoucher_ID,
                        issue_quantity: nQty,
                        total_amount: nAmt.toFixed(2)
                    };
                });

                oPayload.returnGiftVouchers = (oState.returnGiftVouchers || []).map(function (v) {
                    var nQty = parseInt(v.issue_quantity, 10) || 1;
                    var nAmt = parseFloat(v.total_amount) || 500;
                    nTotalReturn += nAmt;
                    return {
                        RT_Ass_GiftVoucher_ID: v.RT_Ass_GiftVoucher_ID,
                        issue_quantity: nQty,
                        total_amount: nAmt.toFixed(2)
                    };
                });

                oPayload.assignGiftsTotal_amt = nTotalAssign.toFixed(2);
                oPayload.returnGiftsTotal_amt = nTotalReturn.toFixed(2);
            }

            var oModel = this.getView().getModel();
            var oListBinding = oModel.bindList("/GVHeaderSet");

            var that = this;
            var oContext = oListBinding.create(oPayload);
            
            oContext.created().then(function () {
                MessageToast.show("Transaction Successful! GV record created.");
                that.resetModel();
            }).catch(function (oError) {
                var sMsg = oError && oError.message ? oError.message : "Error creating transaction.";
                MessageBox.error(sMsg);
            });
        }
    });
});