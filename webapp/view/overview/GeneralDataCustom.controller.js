sap.ui.controller("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.GeneralDataCustom", {

	//------------------- RELATION EXTENSIONS--------------------//
	extHookGetDependentCustomRelations: function() {
		return ['ZCustomFields'];
	},

	getFooterButtons: function() {
		var that = this;
		return [{
			sI18nBtnTxt: "BUTTON_EDIT",
			sIcon: "",
			onBtnPressed: function() {
				that._checkEdit();
			}
		}];
	},

	_checkEdit: function() {
		var ctx1 = this.getView().getBindingContext().getObject().accountID;
		var that = this;
		var oModel = this.getView().getModel();
		if (oModel.oData["AccountCollection('" + ctx1 + "')"].zIsMyTerritory === true) {
			oModel.read("EditAuthorizationCheck", null, {
				ObjectID: oModel.formatValue(ctx1, "Edm.String")
			}, false, function(oData, resp) {
				if (oData.EditAuthorizationCheck.ActionSuccessful === "X") {
					var oParameter;
					oParameter = {
						contextPath: that.getView().getBindingContext().sPath.substr(1)
					};
					that.oRouter.navTo("edit", oParameter, false);
				} else {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: oData.EditAuthorizationCheck.Message,
						details: null
					});
				}
			}, null);
		} else {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: cus.crm.myaccounts.util.Util.geti18NText("ZTERRITORY_FAILED"),
				details: null
			});
		}
	},

	onAfterRendering: function() {
		this.getView().byId("address").setVisible(false);
	}

});