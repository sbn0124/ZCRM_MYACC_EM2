sap.ui.controller("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.AttachmentsCustom", {

	onChange: function(oEvent) {
		this._checkEdit();
		if (this.editPossible === true) {
			var oModel = this.getView().getModel();
			var oUploadCollection = oEvent.getSource();
			var filename = oEvent.getParameter("mParameters").files[0].name;
			var token = this.sToken || oModel.getSecurityToken();

			// Header Token
			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: token
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

			// Header Content-Disposition
			var oCustomerHeaderContentDisp = new sap.m.UploadCollectionParameter({
				name: "content-disposition",
				value: "inline; filename=\"" + encodeURIComponent(filename) + "\""
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderContentDisp);
		}
	},

	onDeleteFile: function(oEvent) {
		this._checkEdit();
		if (this.editPossible === true) {
			var docID = oEvent.getParameter("documentId");
			var accountID = this.getView().getBindingContext().getObject().accountID;
			var contextPath = "AttachmentCollection(documentID='" + docID + "',documentClass='BDS_POC1',businessPartnerID='" + accountID + "')";
			var oModel = this.getView().getModel();
			var aBatchOperation = [oModel.createBatchOperation(contextPath, "DELETE", undefined, {
				sETag: "*"
			})];
			cus.crm.myaccounts.util.Util.sendBatchChangeOperations(oModel, aBatchOperation);
		}
	},

	onRenameFile: function(oEvent) {
		this._checkEdit();
		if (this.editPossible === true) {
			var docID = oEvent.getParameter("documentId");
			var fileName = oEvent.getParameter("fileName");
			var accountID = this.getView().getBindingContext().getObject().accountID;
			var contextPath = "AttachmentCollection(documentID='" + docID + "',documentClass='BDS_POC1',businessPartnerID='" + accountID + "')";
			this._renameFile(contextPath, fileName, false);
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