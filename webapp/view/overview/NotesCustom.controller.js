sap.ui.controller("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.NotesCustom", {

	onAddNote: function(oEvent) {

		this._checkEdit();
		if (this.editPossible === true) {
			var text, oView, oModel, accountID = "",
				oNote, oContext;

			// text is the string you entered in the textarea.
			text = oEvent.getParameter("value");

			//Trim text and do not create note if string is empty
			text = jQuery.trim(text);
			if (text.length === 0) {
				return;
			}

			oView = this.getView();
			oModel = this.getView().getModel();
			oNote = {
				"tdname": accountID, // must not be null, but
				"tdid": "",
				"tdspras": "",
				"content": text,
				"createdAt": null, // must be null (or set)
				"creator": ""
			};
			oContext = oView.getBindingContext();

			var oNoteCreateError = jQuery.proxy(function(oError) {
				var sMessage = "";
				if (oError.response) {
					sMessage = jQuery.parseJSON(oError.response.body).error.message.value;
				}
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: sMessage
				});

			}, this);

			oModel.create("Notes", oNote, oContext, undefined, oNoteCreateError);

			// In case the device is a phone or tablet, a keyboard is displayed to type
			// in the note's text. After pressing the button to add the note, the focus
			// is moved away from input field so that the keyboard disappears.
			// Hybrid devices can have the property to be both, desktop and tablet.
			if (sap.ui.Device.system.phone || (sap.ui.Device.system.tablet && !sap.ui.Device.system.desktop)) {
				var oList = this.getList();
				var oBinding = oList.getBinding("items");
				var fnReceivedHandler = null;
				fnReceivedHandler = jQuery.proxy(function() {
					oList.focus();
					oBinding.detachDataReceived(fnReceivedHandler);
				}, this);
				oBinding.attachDataReceived(fnReceivedHandler);
			}
		}
	},

	_checkEdit: function() {
		var ctx1 = this.getView().getBindingContext().getObject().accountID;
		var that = this;
		var oModel = this.getView().getModel();
		if (oModel.oData["AccountCollection('" + ctx1 + "')"].zIsMyTerritory === true) {
			oModel.read("EditAuthorizationCheck", null, {
				ObjectID: oModel.formatValue(ctx1, "Edm.String")
			}, false, function(oData, resp) {
				if (oData.EditAuthorizationCheck.ActionSuccessful == "X") {
					that.editPossible = true;
				} else {
					that.editPossible = false;
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
	}
});