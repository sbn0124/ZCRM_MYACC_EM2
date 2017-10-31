sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.ModulesCustom", {

		onInit: function() {
			this.BatchOperations = [];
		},

		onBeforeRendering: function() {
			if (this.getView().getBindingContext().getProperty("zIsMyTerritory") === false) {
				this.getView().byId("zModuleLink").setEnabled(false);
			} else {
				this.getView().byId("zModuleLink").setEnabled(true);
			}
		},

		onModuleClicked: function(oEvent) {

			var fgetService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
			var oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");
			var moduleID = oEvent.getSource().getProperty("target");
			var sPath = this.getView().getBindingContext().getPath();
			var oAccount = this.getView().getBindingContext().getModel().getProperty(sPath);

			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: "ZMyModulesHE",
					action: "navigate&/account/" + oAccount.accountID + "/module/" + moduleID
				}
			});
		},

		/*		onModuleDelete: function(oEvent){
					var sRequestURL = oEvent.getSource().getBindingContext().sPath;
					var oBatchOperation = this.getView().getModel().createBatchOperation(sRequestURL, "DELTE");
					this.BatchOperations.unshift(oBatchOperation);
					this._sendBatchOperations();
					
				},*/

		getFooterButtons: function() {
			var that = this;
			var oBindingContext = this.getView().getBindingContext();
			var sPath = oBindingContext.getPath();
			var oAccount = oBindingContext.getModel().getProperty(sPath);
			if (oBindingContext && oBindingContext.getProperty("category") === cus.crm.myaccounts.util.Constants.accountCategoryPerson ||
				oBindingContext.getModel().oData["AccountCollection('" + oAccount.accountID + "')"].zIsMyTerritory === false) {
				return;
			} else {
				return [{
					sIcon: "sap-icon://add",
					sTooltip: cus.crm.myaccounts.util.Util.geti18NText("ZADD_MODULE_TOOLTIP"),
					onBtnPressed: function() {
						var fgetService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
						var oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");
						oCrossAppNavigator.toExternal({
							target: {
								semanticObject: "ZMyModulesHE",
								action: "navigate&/account/" + oAccount.accountID + "/module/new"
							}
						});
					}
				}];
			}
		},
		onSubViewLiveSearch: function(searchString) {
			var oBinding = this.byId("list").getBinding("items");
			var aFilters = [];
			if(searchString !== "") {
				aFilters.push(new sap.ui.model.Filter("moduleName", sap.ui.model.FilterOperator.Contains, searchString));
			}
			if(oBinding) {
				oBinding.filter(aFilters);
			}
		}

	});

});