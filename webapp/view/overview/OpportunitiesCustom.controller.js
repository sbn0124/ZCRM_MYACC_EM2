sap.ui.controller("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.OpportunitiesCustom", {

	//------------------ CUSTOM FUNCTIONS ---------------//	

	onDepartmentClicked: function(e) {
		this._navToDepartment(e);

	},

	_navToDepartment: function(e) {
		var g = e.getSource().getBindingContext().getObject().zdepartment;
		var f = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
		var c = f && f("CrossApplicationNavigation");
		if (c) {
			c.toExternal({
				target: {
					semanticObject: "ZMyAccountsHE",
					action: "MyAccounts&/detail/AccountCollection('" + g + "')"
				}
			});
		}
	},

	onAccountClicked: function(oEvent) {
		this._showBusinessCardAccountfunction(oEvent);
	},

	_showBusinessCardAccountfunction: function(oEvent) {
		var contextPath = oEvent.getSource().getBindingContext().sPath;
		var oModel = this.getView().getModel();
		var oContact = oModel.getProperty(contextPath + "/MainContact");
		var oAccount = this.getView().getBindingContext().getObject();
		var that = this;
		this._navToAccount(oModel.getProperty(contextPath + "/MainContact"));
	},

	_navToAccount: function(oContact) {

		var contactID = oContact.contactID;
		var fgetService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
		var oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");

		if (oCrossAppNavigator) {
			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: "ZMyAccountsHE",
					action: "MyAccounts&/detail/AccountCollection('" + contactID + "')"
				}
			});
		}
	},

	_navToOpportunity: function(oEvent) {
		var guid = oEvent.getSource().getBindingContext().getObject().Guid;

		// *XNav* (1) obtain cross app navigation interface
		var fgetService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
		var oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");

		// *XNav (2) generate cross application link
		if (oCrossAppNavigator) {
			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: "ZHEOpportunities",
					action: "manageOpportunity&/display/Opportunities(guid'" + guid + "')"
				}
			});
		}
	},

	_navigateToCreationOfOpportunity: function(processType) {
		// var fgetService = sap.ushell.Container.getService;
		// var oCrossAppNavigator = fgetService("CrossApplicationNavigation");
		// var contextPath = this.getView().getBindingContext().sPath.substring(1);
		// oCrossAppNavigator.toExternal({
		// 	target: {
		// 		semanticObject: "ZHEOpportunities",
		// 		action: "manageOpportunity&/NewOpportunityFromAccount/" + processType + "/" + contextPath
		// 	}
		// });
		var fgetService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
		var oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");
		var contextPath = this.getView().getBindingContext().sPath.substring(1);
		if (oCrossAppNavigator) {
			var semantic = "MyOpportunitiesZOH2";
			switch (this.processType) {
				case 'ZOH2':
					semantic = "MyOpportunitiesZOH2";
					break;
				case 'ZOHE':
					semantic = "ZHEOpportunities";
					break;
				case 'ZOEM':
					semantic = "MyOpportunitiesEM";
					break;
				case 'ZOPM':
					semantic = "MyOpportunitiesSTM";
					break;
				default:
					semantic = "MyOpportunitiesZOH2";
			}
			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: semantic,
					action: "manageOpportunity&/NewOpportunityFromAccount/" + processType + "/" + contextPath
				}
			});
		}
	},

	getFooterButtons: function() {
		var that = this;
		if (this.getView().getBindingContext().getProperty("zIsMyTerritory") === false) {
			return;
		} else {
			return [{
				sIcon: "sap-icon://add",
				sTooltip: cus.crm.myaccounts.util.Util.geti18NText("ADD_OPPORTUNITY_TOOLTIP"),
				onBtnPressed: function() {
					that.onCreateOpportunity();
				}
			}];
		}
	}
});