sap.ui.controller("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.MarketingAttributesCustom", {

	_setUIFieldType: function(oMktAttribute) {
		if (oMktAttribute.mode === cus.crm.myaccounts.util.Constants.modeEdit &&
			(oMktAttribute.hasChecktable || (oMktAttribute.valueRestricted && oMktAttribute.mktAttrValues.length <= 100) ||
				(oMktAttribute.mktAttrValues && oMktAttribute.mktAttrValues.length <= 100))
		) {
			oMktAttribute.fieldType = cus.crm.myaccounts.util.Constants.fieldSelect;
		} else if (oMktAttribute.mode === cus.crm.myaccounts.util.Constants.modeEdit &&
			(oMktAttribute.hasChecktable || oMktAttribute.valueRestricted ||
				(oMktAttribute.mktAttrValues && oMktAttribute.mktAttrValues.length > 100))
		) {
			this.getView().getModel("constants").setData({
				fieldInputVH: "FIELD_INPUTVH"
			}, true);
			oMktAttribute.fieldType = "FIELD_INPUTVH";
		} else if (oMktAttribute.attributeDatatype === cus.crm.myaccounts.util.Constants.dataTypeTIME) {
			if (!oMktAttribute.valueID || oMktAttribute.valueID.length < 9)
				oMktAttribute.fieldType = cus.crm.myaccounts.util.Constants.fieldTime;
			else
				oMktAttribute.fieldType = cus.crm.myaccounts.util.Constants.fieldInput;
		} else if (oMktAttribute.attributeDatatype === cus.crm.myaccounts.util.Constants.dataTypeDATE) {
			if (!oMktAttribute.value || oMktAttribute.valueID.length < 9)
				oMktAttribute.fieldType = cus.crm.myaccounts.util.Constants.fieldDate;
			else
				oMktAttribute.fieldType = cus.crm.myaccounts.util.Constants.fieldInput;
		} else if (oMktAttribute.attributeDatatype === cus.crm.myaccounts.util.Constants.dataTypeCURR) {
			oMktAttribute.fieldType = cus.crm.myaccounts.util.Constants.fieldCurrency;
		} else
			oMktAttribute.fieldType = cus.crm.myaccounts.util.Constants.fieldInput;
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
					that._bindMarketingAttributes();
					sap.m.MessageBox.error(oData.EditAuthorizationCheck.Message, null);
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

	onAddMarketingAttributeClicked: function() {
		this._checkEdit();
		if (this.editPossible === true) {
			jQuery.sap.log.debug("cus.crm.myaccounts.view.overview.MarketingAttributes - onAddMarketingAttributeClicked");
			// this._savePendingData();
			var oMktAttrModel = this.getList().getModel("mktattr");
			var aMktAttributes = oMktAttrModel.getProperty("/MarketingAttributes");
			if (aMktAttributes.length > 0 && !aMktAttributes[0].value && !aMktAttributes[0].attribute && !aMktAttributes[0].attributeSet)
				return; //return if an empty new line exists

			var oNewMktAttribute = this._generateTemplateForMarketingAttribute();
			oNewMktAttribute.mode = cus.crm.myaccounts.util.Constants.modeEdit;
			aMktAttributes.unshift(oNewMktAttribute);
			oMktAttrModel.setProperty("/MarketingAttributes", aMktAttributes);
		}
	},

	onDeleteMarketingAttributeClicked: function(oEvent) {
		this._checkEdit();
		if (this.editPossible === true) {
			jQuery.sap.log.debug("cus.crm.myaccounts.view.overview.MarketingAttributes - onDeleteMarketingAttributeClicked - ContextPath: " +
				oEvent.getSource().getBindingContext("mktattr").sPath);

			var oMktAttributeContext = oEvent.getSource().getBindingContext("mktattr");
			var oMktAttribute = oMktAttributeContext.getObject();
			var lineNumber = oMktAttributeContext.sPath.substring(21);
			if (!oMktAttribute.eTag) {
				// new attribute; not yet send to the backend
				this._removeLine(lineNumber);
			} else {
				var sRequestURL = oMktAttribute.key;
				var oBatchOperation = this.getView().getModel().createBatchOperation(sRequestURL, "DELETE");
				this._collectBatchOperation(oBatchOperation, this._onAfterSave, this._onAfterSaveWithError, lineNumber);
				oMktAttribute.mode = cus.crm.myaccounts.util.Constants.modeEdit; //needed because _removeCoherentErrorFlags will not consider this line. Also a solution with another mode like "deleteMode" would work
			}
			this._savePendingData(); //save other changed lines and sent all operations together
		}
	},

	onSaveMarketingAttributeClicked: function(oEvent) {
		this._checkEdit();
		if (this.editPossible === true) {
			jQuery.sap.log.debug("cus.crm.myaccounts.view.overview.MarketingAttributes - onSaveMarketingAttributeClicked - ContextPath: " +
				oEvent.getSource().getBindingContext("mktattr").sPath);
			this._savePendingData();
		}
	},

	onEditMarketingAttributeClicked: function(oEvent) {
		this._checkEdit();
		if (this.editPossible === true) {
			jQuery.sap.log.debug("cus.crm.myaccounts.view.overview.MarketingAttributes - onEditMarketingAttributeClicked");

			this._savePendingData();

			var oMktAttrContext = oEvent.getSource().getBindingContext("mktattr");
			var oMktAttr = oMktAttrContext.getObject();
			oMktAttr.mode = cus.crm.myaccounts.util.Constants.modeEdit;
			if (oMktAttr.valueRestricted && oMktAttr.mktAttrValues.length <= 100 || oMktAttr.hasChecktable) {
				this._readAttributeValuesForSelect(oMktAttr);
			} else {
				oMktAttr.valueRestricted = false;
				this._setAttributeValues(oMktAttr);
				this._setUIFieldType(oMktAttr);
				this.refreshUI();
			}
		}
	},

	_setAttributeValues: function(oMktAttribute, aMktAttrValues) {
		//initialize mktAttrValues
		if (!oMktAttribute.mktAttrValues)
			oMktAttribute.mktAttrValues = [{
				valueID: oMktAttribute.valueID,
				value: oMktAttribute.value
			}];
		if (aMktAttrValues && aMktAttrValues.length > 0) {
			// Get the array of attribute values
			var aNewValues = [];
			var oNewValue = {};
			var oDefaultValue = {};
			for (var i = 0; i < aMktAttrValues.length; i++) {
				oNewValue = this.getList().getModel().getProperty("/" + aMktAttrValues[i]);
				oNewValue.value = cus.crm.myaccounts.util.formatter.formatMktAttrDisplayField(oNewValue.valueID, oNewValue.value, oMktAttribute.attributeDatatype,
					oMktAttribute.decimalPlaces, oMktAttribute.currency);
				aNewValues.push(oNewValue);
			}
			oMktAttribute.mktAttrValues = aNewValues;

			// var zoModel = new sap.ui.model.json.JSONModel(oMktAttribute.mktAttrValues);
			var oFilterList = this.getList().getModel("mktattr").getProperty("/MarketingAttributes");
			// delete existing marketing values from the value help
			$.each(oFilterList, function(key, value) {
				var v = value;
				if (oMktAttribute.attributeSetID === v.attributeSetID && oMktAttribute.attributeID === v.attributeID) {
					oMktAttribute.mktAttrValues = oMktAttribute.mktAttrValues.filter(function(object) {
						return object.value !== v.value;
						if (!oDefaultValue.valueID) {
							oDefaultValue = oNewValue;
						}
					});
				}
			});
			// In case attribute has default value, set selected key
			// In case of edit valueID is available, don't set default value
			if (!oMktAttribute.valueID) {
				oMktAttribute.valueID = oMktAttribute.mktAttrValues[0].valueID;
				oMktAttribute.value = oMktAttribute.mktAttrValues[0].value;
				if (oMktAttribute.attributeDatatype === cus.crm.myaccounts.util.Constants.dataTypeDATE) {
					// update dateValue (if it is an interval, dateValue is set to null)
					oMktAttribute.dateValue = cus.crm.myaccounts.util.formatter.convertDateStringToUTC(oMktAttribute.value);
				}
			}
		}
	},

	// *** Value Help for Marketing Values ******************************************
	onMarketingValueValueHelpSelected: function(oEvent) {
		var oMktAttribute = oEvent.getSource().getBindingContext("mktattr").getObject();
		this.valueHelpMarketingValue = sap.ui.xmlfragment("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.ValueHelpMarketingValue", this);
		var zoModel = new sap.ui.model.json.JSONModel(oMktAttribute.mktAttrValues);
		var oFilterList = this.getList().getModel("mktattr").getProperty("/MarketingAttributes");
		// delete existing marketing values from the value help
		$.each(oFilterList, function(key, value) {
			var v = value;
			if (oMktAttribute.attributeSetID === v.attributeSetID && oMktAttribute.attributeID === v.attributeID) {
				zoModel.oData = zoModel.oData.filter(function(object) {
					return object.value !== v.value;
				});
			}
		});

		this.valueHelpMarketingValue.oMktAttribute = oMktAttribute;
		this.valueHelpMarketingValue.setModel(zoModel, "MarketingValueModel");
		//Ux requirement : Display "Loading..." as no data text when searching
		this.getView().getModel().attachRequestSent(
			function() {
				if (this._list) {
					this._list.setNoDataText(cus.crm.myaccounts.util.Util.geti18NText("LOADING_TEXT"));
				}
			},
			this.valueHelpMarketingValue
		);
		this.getView().getModel().attachRequestCompleted(
			function() {
				if (this._list) {
					this._list.setNoDataText(cus.crm.myaccounts.util.Util.geti18NText("NO_DATA_TEXT"));
				}
			},
			this.valueHelpMarketingValue
		);
		this.valueHelpMarketingValue.open();
	},

	onMarketingValueValueHelpSearch: function(oEvent) {
		var searchValue = oEvent.getParameter("value");
		var oFilter = new sap.ui.model.Filter("value", sap.ui.model.FilterOperator.Contains, searchValue);
		oEvent.getSource().getBinding("items").filter([oFilter]);
	},

	onMarketingValueValueHelpCancel: function(oEvent) {
		if (oEvent.getSource().getBinding("items").aFilters.length) {
			oEvent.getSource().destroyItems();
			this.valueHelpMarketingValue.setModel(null);
		}
	},

	onMarketingValueValueHelpClose: function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem");
		var oSelectedObject = this.valueHelpMarketingValue.getModel("MarketingValueModel").getProperty(oSelectedItem.getBindingContextPath());
		//get all previously set values of the marketing attribute
		var oMktAttr = this.valueHelpMarketingValue.oMktAttribute;
		// Just set the description and ID of the marketing value to the attribute object. 
		// We cannot use standard method "_copyAttributesOfObject2ToObject1" since it overrides existing object values with empty ones from oSelectedObject
		oMktAttr.value = oSelectedObject.value;
		oMktAttr.valueID = oSelectedObject.valueID;
		oMktAttr.valueRestricted = false;
		oMktAttr.errorExists = false;
		// oMktAttr.key = oMktAttr.key.concat("##", oSelectedObject.valueID);
		oMktAttr.newValueID = oSelectedObject.valueID;
		this._readAttributeValuesForSelect(oMktAttr);
	},
	_savePendingData: function() {
		var oMktAttrModel = this.getList().getModel("mktattr");
		var aMktAttributes = oMktAttrModel.getProperty("/MarketingAttributes");
		for (var i in aMktAttributes) {
			var oMktAttribute = aMktAttributes[i];
			if (oMktAttribute.mode === cus.crm.myaccounts.util.Constants.modeEdit) {
				this._removeCoherentErrorFlags(oMktAttribute); //required to save attributes which collides with each other

				if (this._checkSaveNeeded(oMktAttribute)) {
					if (this._checkSavePossible(oMktAttribute)) {
						var oBindingContext = this.getView().getBindingContext();
						var editMode = oMktAttribute.eTag ? true : false;
						var sRequestURL, oBatchOperation;
						if (oMktAttribute.fieldType === "FIELD_INPUTVH") {
							oMktAttribute.valueID = oMktAttribute.newValueID;
							delete oMktAttribute.newValueID;
						}
						if (editMode) {
							sRequestURL = oMktAttribute.key;
							oBatchOperation = oBindingContext.getModel().createBatchOperation(sRequestURL, "PUT", this._getStripedAttribute(oMktAttribute), {
								contextPath: "/MarketingAttributes/" + i
							});
						} else {
							sRequestURL = oBindingContext.sPath + "/MarketingAttributes";
							oBatchOperation = oBindingContext.getModel().createBatchOperation(sRequestURL, "POST", this._getStripedAttribute(oMktAttribute), {
								contextPath: "/MarketingAttributes/" + i
							});
						}

						this._collectBatchOperation(oBatchOperation, this._onAfterSave, this._onAfterSaveWithError, oMktAttribute);
					}
				} else {
					delete oMktAttribute.mode;
					oMktAttribute.errorExists = false;
					this._setUIFieldType(oMktAttribute);
				}
			}
		}
		this._sendBatchOperations();
	}
});