sap.ui.controller("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.ContactsCustom", {

	_navToContact: function(oEvent) {
		var contactContextPath = oEvent.getSource().getBindingContext().sPath.substr(1);
		var fgetService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
		var oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");
		var oBindingContext = this.getView().getBindingContext();
		if (oBindingContext && oBindingContext.getProperty("category") === cus.crm.myaccounts.util.Constants.accountCategoryPerson) {
			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: "ZMyContactsHE",
					action: "MyContacts&/detail2/" + contactContextPath + "/My Contacts/lastName/false/-1/-1/-1/20"
				}
			});
		} else {
			var contactID = oEvent.getSource().getBindingContext().getObject().contactID;
			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: "ZMyAccountsHE",
					action: "MyAccounts&/detail/AccountCollection('" + contactID + "')"
				}
			});
		}
	},

	onEditContactClicked: function(oEvent) {
		if (this.getView().getBindingContext().getProperty("zIsMyTerritory") === true) {
			var contactContextPath = oEvent.getSource().getBindingContext().sPath.substr(1);
			var fgetService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
			var oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: "ZMyContactsHE",
					action: "MyContacts&/edit/" + contactContextPath
				}
			});
		} else {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: cus.crm.myaccounts.util.Util.geti18NText("ZTERRITORY_FAILED"),
				details: null
			});
		}
	},

	onDeleteContactClicked: function(oEvent) {
		if (this.getView().getBindingContext().getProperty("zIsMyTerritory") === true) {
			var contactContextPath = oEvent.getSource().getBindingContext().sPath.substr(1);
			sap.m.MessageBox.confirm(
				cus.crm.myaccounts.util.Util.geti18NText("MSG_CONFIRM_DELETE_CONTACT"),
				jQuery.proxy(function(confirmed) {
					if (confirmed === "OK") {
						var oModel = this.getView().getModel();
						this.setBusy(true);
						var that = this;
						var aBatchOperation = [];
						var oBatchOperation = oModel.createBatchOperation("/" + contactContextPath, "DELETE", undefined);
						aBatchOperation.push(oBatchOperation);
						cus.crm.myaccounts.util.Util.sendBatchChangeOperations(oModel, aBatchOperation, function() {
							that.setBusy(false);
						}, function() {
							that.setBusy(false);
						});
					}
				}, this)
			);
		} else {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: cus.crm.myaccounts.util.Util.geti18NText("ZTERRITORY_FAILED"),
				details: null
			});
		}
	},

	getFooterButtons: function() {
		var that = this;
		var oBindingContext = this.getView().getBindingContext();
		if (oBindingContext && oBindingContext.getProperty("category") === cus.crm.myaccounts.util.Constants.accountCategoryPerson ||
			oBindingContext.getProperty("zIsMyTerritory") === false)
			return;

		return [{
			sIcon: "sap-icon://add",
			sTooltip: cus.crm.myaccounts.util.Util.geti18NText("ADD_CONTACT_TOOLTIP"),
			onBtnPressed: function() {
				var fgetService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
				var oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");
				oCrossAppNavigator.toExternal({
					target: {
						semanticObject: "ZMyContactsHE",
						action: "MyContacts&/new/" + that.getView().getBindingContext().sPath.substr(1)
					}
				});
			}
		}];
	}
});