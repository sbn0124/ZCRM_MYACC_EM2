sap.ui.controller("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.AppointmentsCustom", {

	_navigateToAppointment: function(oEvent) {
		if (sap.ushell && sap.ushell.Container) {
			var fgetService = sap.ushell.Container.getService;
			if (fgetService) {
				var oCrossAppNavigator = fgetService("CrossApplicationNavigation");

				if (oCrossAppNavigator) {
					oCrossAppNavigator.toExternal({
						target: {
							// Semantic object changed
							semanticObject: "ZMyAppointmentsHE",
							action: "myAppointments&/appointment/" + oEvent.getSource().getBindingContext().getProperty("Guid")
						}
					});
				}
			}
		}
	},

	_navigateToCreationOfAppointment: function(processType) {
		if (sap.ushell && sap.ushell.Container) {
			var fgetService = sap.ushell.Container.getService;
			if (fgetService) {
				var oCrossAppNavigator = fgetService("CrossApplicationNavigation");
				if (oCrossAppNavigator) {
					var contextPath = this.getView().getBindingContext().sPath.substring(1);
					var oAccountData = this.getAccountData(contextPath);

					/*
					 * In order to use StartupParameters handling use 'hrefForExternal' instead of 'toExternal'! 
					 */
					var toApp = oCrossAppNavigator.hrefForExternal({
						target: {
							semanticObject: "ZMyAppointmentsHE",
							action: "myAppointments"
						},
						params: {
							"createFromAccount": "X",
							"ContactID": oAccountData.accountID,
							"ContactName": oAccountData.accountName
						},
						appSpecificRoute: [
							"&", "newappointmentfromaccount", processType, contextPath
						].join("/")
					});
					if (toApp) {
						// Navigate to the target
						window.location = toApp;
					}
				}
			}
		}
	},

	getFooterButtons: function() {
		var that = this;
		if (this.getView().getBindingContext().getProperty("zIsMyTerritory") === false) {
			return;
		} else {
			return [{
				sIcon: "sap-icon://add",
				sTooltip: cus.crm.myaccounts.util.Util.geti18NText("ADD_APPOINTMENT_TOOLTIP"),
				onBtnPressed: function() {
					that.onCreateAppointment();
				}
			}];
		}
	},

	getAccountData: function(sContextPath) {
		var oAccountData = this.getView().getModel().getProperty("/" + sContextPath);
		return {
			accountID: oAccountData.accountID,
			accountName: oAccountData.fullName
		};
	}

});