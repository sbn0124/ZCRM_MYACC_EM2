sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";

	return Controller.extend("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.Addresses", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.view.Addresses
		 */
		onInit: function() {

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.view.Addresses
		 */
		onBeforeRendering: function() {

		},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.view.Addresses
		 */
		onAfterRendering: function() {

		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.view.Addresses
		 */
		onExit: function() {

		},

		getFooterButtons: function() {
			var that = this;
			if (this.getView().getBindingContext().getProperty("zIsMyTerritory") === false) {
				return;
			} else {
				return [{
					sIcon: "sap-icon://add",
					sTooltip: cus.crm.myaccounts.util.Util.geti18NText("ZADD_ADDRESS_TOOLTIP"),
					onBtnPressed: function() {
						that._checkEdit();
					}
				}];
			}
		},

		// adjusted edit check; we check if the account is in the same territory as the user or homeless.  
		_checkEdit: function() {
			var oAccount = this.getView().getBindingContext().getObject().accountID;
			var ctx = this.getView().getBindingContext();
			sap.ui.getCore().AppContext = ctx;
			this.oDataModel = this.getView().getModel();
			sap.ui.getCore().setModel(this.oDataModel);
			var that = this;
			type: sap.ui.core.mvc.ViewType.XML,
				that._navToCreateAddress(oAccount);
			// if (oModel.oData["AccountCollection" + "(" + "'" + ctx1 + "'" + ")"].zIsMyTerritory === true) {
			// 	oModel.read("EditAuthorizationCheck", null, {
			// 		ObjectID: oModel.formatValue(ctx1, "Edm.String")
			// 	}, false, function(oData, resp) {
			// 		if (oData.EditAuthorizationCheck.ActionSuccessful === "X") {
			// 			that._navToCreateAddress(ctx1);
			// 			// var oParameter;
			// 			// oParameter = {
			// 			// 	contextPath: that.getView().getBindingContext().sPath.substr(1)
			// 			// };
			// 			// that.oRouter.navTo("edit", oParameter, false);
			// 		} else {
			// 			sap.ca.ui.message.showMessageBox({
			// 				type: sap.ca.ui.message.Type.ERROR,
			// 				message: oData.EditAuthorizationCheck.Message,
			// 				details: null
			// 			});
			// 		}
			// 	}, null);

			// } else {
			// 	sap.ca.ui.message.showMessageBox({
			// 		type: sap.ca.ui.message.Type.ERROR,
			// 		message: "Unequal territory",
			// 		details: null
			// 	});
			// }
		},

		_navToCreateAddress: function(oContext) {

			/* If Account doesn't have a valid sample address,
			re-direct user to Account Edit Page */
			this._check_VaildSampleAddress(oContext);

		},

		_check_VaildSampleAddress: function(partner) {
			var oModel = this.getView().getModel(),
				bPartner = this.getView().getModel().formatValue(partner, "Edm.String"),
				that = this;

			if (bPartner) {
				oModel.read("ValidPartnerForSample", null, {
					PARTNER: bPartner
				}, false, function(oData, resp) {
					// navigate to CreateAddress View
					if (oData.ValidPartnerForSample.ActionSuccessful === "X") {
						that.oRouter.navTo("createAddress", {
							contextPath: partner
						});
					} else {
						var oParameter;
						oParameter = {
							contextPath: that.getView().getBindingContext().sPath.substr(1)
						};
						that.oRouter.navTo("edit", oParameter, false);
					}
				}, null);
			}
		}

	});

});