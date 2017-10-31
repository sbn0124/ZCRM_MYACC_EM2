sap.ui.controller("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.GeneralDataEditCustom", {
	onInit: function() {
		//Execute onInit for the base class BaseMasterController  
		sap.ca.scfld.md.controller.BaseFullscreenController.prototype.onInit.call(this);
		this.getView().setModel(new sap.ui.model.json.JSONModel(), "ZCustomizing");
		this._fillCustomizing(); // this.getme();

		this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		// this._oRouter.attachRouteMatched(function(oEvent) {
		// 	if (oEvent.getParameter("name") === "edit") {
		// 		this.restrictAddressEdit();
		// 	}
		// }, this);
	},

	_fillCustomizing: function() {
		var that = this;
		this.oDataModel.read("/ZCustomizingSampleStatusCollection", {
			success: function _OnSuccess(oData, response) {
				that.getView().getModel("ZCustomizing").setData({
					ZSampleStatus: oData.results
				}, true);
			}
		});
		this.oDataModel.read("/ZCustomizingAccIndStatusCollection", {
			success: function _OnSuccess(oData, response) {
				that.getView().getModel("ZCustomizing").setData({
					ZAccIndStatus: oData.results
				}, true);
			}
		});
		this.oDataModel.read("/ZCustomizingOtherFunctionCollection", {
			success: function _OnSuccess(oData, response) {
				that.getView().getModel("ZCustomizing").setData({
					ZOtherFunction: oData.results
				}, true);
			}
		});
		this.accountF4Template = new sap.m.StandardListItem({
			title: "{fullName}",
			description: "{accountID}",
			active: true
		});
	},
	//------------------- RELATION EXTENSIONS--------------------//
	extHookGetDependentCustomRelations: function() {
		return ["ZCustomFields"];
	},
	//------------------ CUSTOM FUNCTIONS ---------------//
	onAccStatusFieldChanged: function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem");
		if (oSelectedItem) {
			this._setAccountStatus(oSelectedItem.getProperty("key"), oSelectedItem.getProperty("text"));
		}
	},
	_setAccountStatus: function(ID, desc) {
		var statusIDInput = this.getView().byId("ZCustomFields.zaccStatusInput");
		if (statusIDInput)
			statusIDInput.setValue(ID);
		var statusInput = this.getView().byId("ZCustomFields.zaccStatusDescrInput");
		if (statusInput)
			statusInput.setValue(desc);
	},
	// ------------------ Account Type help search	-----------------------------//
	_setAccountType: function(typeID, type) {
		var typeInput = this.getView().byId("ZCustomFields.zdescriptionInput");
		if (typeInput)
			typeInput.setValue(type);
		var typeIDInput = this.getView().byId("ZCustomFields.ztypeIDInput");
		if (typeIDInput)
			typeIDInput.setValue(typeID);
	},
	_setAccountSubtype: function(typeID, type) {
		var typeInput = this.getView().byId("ZCustomFields.zsubDescriptionInput");
		if (typeInput)
			typeInput.setValue(type);
		var typeIDInput = this.getView().byId("ZCustomFields.zsubtypeIDInput");
		if (typeIDInput)
			typeIDInput.setValue(typeID);
	},
	_setAccount3type: function(typeID, type) {
		var typeInput = this.getView().byId("ZCustomFields.zacc3rdtypeDescrInput");
		if (typeInput)
			typeInput.setValue(type);
		var typeIDInput = this.getView().byId("ZCustomFields.zacc3rdtypeInput");
		if (typeIDInput)
			typeIDInput.setValue(typeID);
	},
	onAccountTypeValueHelpSelected: function() {
		if (!this.valueHelpAccountType) {
			this.valueHelpAccountType = sap.ui.xmlfragment("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.ValueHelpAccountType", this);
			this.valueHelpAccountType.setModel(this.getView().getModel("i18n"), "i18n");
		}
		var that = this;
		var oFilter = new sap.ui.model.Filter("zbuType", sap.ui.model.FilterOperator.EQ, "");
		//		var oFilter2 = new sap.ui.model.Filter("zbuType", sap.ui.model.FilterOperator.EQ, "" );
		var Filters = [];
		if (this.getView().getBindingContext().getObject().category === this.getView().getModel("constants").getData().accountCategoryPerson) {
			oFilter = new sap.ui.model.Filter("zbuType", sap.ui.model.FilterOperator.EQ, this.getView().getBindingContext().getObject().category);
			Filters.push(oFilter);
		} else {
			oFilter = new sap.ui.model.Filter("zbuType", sap.ui.model.FilterOperator.EQ, this.getView().getBindingContext().getObject().category);
			Filters.push(oFilter); //			oFilter2 = new sap.ui.model.Filter("zbuType", sap.ui.model.FilterOperator.EQ, this.getView().getModel("constants").getData().accountCategoryPerson );
			//			Filters.push(oFilter2);
		}
		this.oDataModel.read("/ZCustomizingAccountTypeCollection", {
			filters: Filters,
			success: function _OnSuccess(oData, response) {
				var oAccTypeModel = new sap.ui.model.json.JSONModel();
				oAccTypeModel.setData(oData);
				that.valueHelpAccountType.setModel(oAccTypeModel, "AccountTypeModel");
			}
		});
		this.valueHelpAccountType.open();
	},
	onAccountTypeValueHelpClose: function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem");
		if (oSelectedItem) {
			//			var oSelectedObject = oSelectedItem.getBindingContext().getObject();
			var oInput = this.byId("ZCustomFields.zdescriptionInput");
			oInput.setValueState(sap.ui.core.ValueState.None);
			this._setAccountType(oSelectedItem.getCustomData()[0].getProperty("value"), oSelectedItem.getProperty("title"));
			if (this.valueHelpAccountSubtype) {
				var that = this;
				this.oDataModel.read("/ZCustomizingSubtypeCollection", {
					filters: [new sap.ui.model.Filter("ztypeID", sap.ui.model.FilterOperator.EQ, this.getView().byId("ZCustomFields.ztypeIDInput").getValue())],
					success: function _OnSuccess(oData, response) {
						var oSubTypeModel = new sap.ui.model.json.JSONModel();
						oSubTypeModel.setData(oData);
						that.valueHelpAccountSubtype.setModel(oSubTypeModel, "SubTypeModel");
					}
				});
			}
		}
		if (oEvent.getSource().getBinding("items").aFilters.length) {
			oEvent.getSource().destroyItems();
			this.valueHelpAccountType.setModel(null);
		}
		this._setAccountSubtype(null, null);
		this._setAccount3type(null, null);
	},
	onAccountTypeValueHelpSearch: function(oEvent) {
		var searchValue = oEvent.getParameter("value");
		var oFilter = new sap.ui.model.Filter("zdescription", sap.ui.model.FilterOperator.Contains, searchValue);
		oEvent.getSource().getBinding("items").filter([oFilter]);
	},
	onAccountTypeValueHelpCancel: function(oEvent) {
		if (oEvent.getSource().getBinding("items").aFilters.length) {
			oEvent.getSource().destroyItems();
			this.valueHelpAccountType.setModel(null);
		}
	},
	//------------------- Account subtype value help	-----------------------//
	onAccountSubtypeValueHelpSelected: function() {
		if (!this.valueHelpAccountSubtype) {
			this.valueHelpAccountSubtype = sap.ui.xmlfragment("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.ValueHelpAccountSubtype", this);
			this.valueHelpAccountSubtype.setModel(this.getView().getModel("i18n"), "i18n");
			var that = this;
			this.oDataModel.read("/ZCustomizingSubtypeCollection", {
				filters: [new sap.ui.model.Filter("ztypeID", sap.ui.model.FilterOperator.EQ, this.getView().byId("ZCustomFields.ztypeIDInput").getValue())],
				success: function _OnSuccess(oData, response) {
					var oSubTypeModel = new sap.ui.model.json.JSONModel();
					oSubTypeModel.setData(oData);
					that.valueHelpAccountSubtype.setModel(oSubTypeModel, "SubTypeModel");
				}
			});
		} else {
			this.valueHelpAccountSubtype.setModel(this.oDataModel);
		}
		this.valueHelpAccountSubtype.open();
	},
	onAccountSubtypeValueHelpClose: function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem");
		if (oSelectedItem) {
			var oInput = this.byId("ZCustomFields.zsubDescriptionInput");
			oInput.setValueState(sap.ui.core.ValueState.None);
			var oSelectedObject = this.valueHelpAccountSubtype.getModel("SubTypeModel").getProperty(oSelectedItem.getBindingContextPath());
			this._setAccountSubtype(oSelectedObject.zsubtypeID, oSelectedObject.zdescription);
			if (this.valueHelpAccount3type) {
				var that = this;
				this.oDataModel.read("/ZCustomizingThirdTypeCollection", {
					filters: [new sap.ui.model.Filter("zsubtypeID", sap.ui.model.FilterOperator.EQ, this.getView().byId(
						"ZCustomFields.zsubtypeIDInput").getValue())],
					success: function _OnSuccess(oData, response) {
						var oThirdTypeModel = new sap.ui.model.json.JSONModel();
						oThirdTypeModel.setData(oData);
						that.valueHelpAccount3type.setModel(oThirdTypeModel, "ThirdTypeModel");
					}
				});
			}
		}
		if (oEvent.getSource().getBinding("items").aFilters.length) {
			oEvent.getSource().destroyItems();
			this.valueHelpAccountSubtype.setModel(null);
		}
		this._setAccount3type(null, null);
	},
	onAccountSubtypeValueHelpSearch: function(oEvent) {
		var searchValue = oEvent.getParameter("value");
		var oFilter = new sap.ui.model.Filter("zdescription", sap.ui.model.FilterOperator.Contains, searchValue);
		oEvent.getSource().getBinding("items").filter([oFilter]);
	},
	onAccountSubtypeValueHelpCancel: function(oEvent) {
		if (oEvent.getSource().getBinding("items").aFilters.length) {
			oEvent.getSource().destroyItems();
			this.valueHelpAccountSubtype.setModel(null);
		}
	},
	// -------------- Account thrid type value help	-------------------//	
	onAccount3typeValueHelpSelected: function() {
		if (!this.valueHelpAccount3type) {
			this.valueHelpAccount3type = sap.ui.xmlfragment("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.ValueHelpAccount3Type", this);
			this.valueHelpAccount3type.setModel(this.getView().getModel("i18n"), "i18n");
			var that = this;
			this.oDataModel.read("/ZCustomizingThirdTypeCollection", {
				filters: [new sap.ui.model.Filter("zsubtypeID", sap.ui.model.FilterOperator.EQ, this.getView().byId(
					"ZCustomFields.zsubtypeIDInput").getValue())],
				success: function _OnSuccess(oData, response) {
					var oThirdTypeModel = new sap.ui.model.json.JSONModel();
					oThirdTypeModel.setData(oData);
					that.valueHelpAccount3type.setModel(oThirdTypeModel, "ThirdTypeModel");
				}
			});
		} else {
			this.valueHelpAccount3type.setModel(this.oDataModel);
		}
		this.valueHelpAccount3type.open();
	},
	onAccount3typeValueHelpClose: function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem");
		if (oSelectedItem) {
			var oSelectedObject = this.valueHelpAccount3type.getModel("ThirdTypeModel").getProperty(oSelectedItem.getBindingContextPath());
			this._setAccount3type(oSelectedObject.zacc3rdtypeID, oSelectedObject.zacc3rdtype);
		}
		if (oEvent.getSource().getBinding("items").aFilters.length) {
			oEvent.getSource().destroyItems();
			this.valueHelpAccount3type.setModel(null);
		}
	},
	onAccount3typeValueHelpSearch: function(oEvent) {
		var searchValue = oEvent.getParameter("value");
		var oFilter = new sap.ui.model.Filter("zacc3rdtype", sap.ui.model.FilterOperator.Contains, searchValue);
		oEvent.getSource().getBinding("items").filter([oFilter]);
	},
	onAccount3typeValueHelpCancel: function(oEvent) {
		if (oEvent.getSource().getBinding("items").aFilters.length) {
			oEvent.getSource().destroyItems();
			this.valueHelpAccountSubtype.setModel(null);
		}
	},
	onTerritoryValueHelpSelected: function(oEvent) {
		if (!this.valueHelpZTerritory) {
			this.valueHelpZTerritory = sap.ui.xmlfragment("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.ValueHelpTerritory", this);
			this.valueHelpZTerritory.setModel(this.getView().getModel("i18n"), "i18n");
		}
		var that = this;
		this.oDataModel.read("/ZCustomizingTerritorySet", {
			filters: [new sap.ui.model.Filter("partner", sap.ui.model.FilterOperator.EQ, this.getView().getBindingContext().getObject().accountID)],
			success: function _OnSuccess(oData, response) {
				var oTerritoryModel = new sap.ui.model.json.JSONModel();
				oTerritoryModel.setData(oData);
				that.valueHelpZTerritory.setModel(oTerritoryModel, "TerritoryModel");
			}
		});
		this.valueHelpZTerritory.open();
	},
	onTerritoryValueHelpClose: function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem");
		if (oSelectedItem) {
			this.byId("ZCustomFields.zTerritoryDescInput").setValue(oSelectedItem.getProperty("title"));
			this.byId("ZCustomFields.zTerritoryInput").setValue(oSelectedItem.getProperty("info"));
		}
	},
	showAccountF4: function(oEvent) {
		if (!this._accountSelectDialog) {
			this._accountSelectDialog = new sap.ui.xmlfragment("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.ValueHelpDepartment", this);
			this._accountSelectDialog.setModel(this.getView().getModel());
			this._accountSelectDialog.setModel(this.getView().getModel("i18n"), "i18n");
			this._accountSelectDialog.getAggregation("_dialog").getSubHeader().getContentMiddle()[0].setPlaceholder(sap.ca.scfld.md.app.Application
				.getImpl().getResourceBundle().getText("SEARCH"));
			this._accountSelectDialog.getAggregation("_dialog").getContent()[1].setGrowingScrollToLoad(true);
			//need to check again
			this._accountSelectDialog.getAggregation("_dialog").getContent()[1].setGrowingThreshold(20);
			/*					sap.ca.scfld.md.app.Application.getImpl().getConnectionManager().getModel().attachRequestSent(
										function () {
											if (this._list) {
												this._list.setNoDataText(this.getModel("i18n").getResourceBundle().getText("LOADING_TEXT"));
											}
										}
										, this._accountSelectDialog);
								
								sap.ca.scfld.md.app.Application.getImpl().getConnectionManager().getModel().attachRequestCompleted(
										function () {
											if (this._list) {
												this._list.setNoDataText(this.getModel("i18n").getResourceBundle().getText("NO_DATA_TEXT"));
											}
										}
										, this._accountSelectDialog);*/
			this._accountSelectDialog.getAggregation("_dialog").setVerticalScrolling(true);
		}
		this._accountSelectDialog.getModel().attachRequestCompleted(null, this._setAccountF4Text, this);
		var aFilters = [];
		aFilters.push(new sap.ui.model.Filter("zIsDepartment", sap.ui.model.FilterOperator.EQ, true));
		this._accountSelectDialog.getAggregation("_dialog").getContent()[1].bindAggregation("items", {
			path: "/AccountCollection",
			parameters: {
				//		  expand : "MainAddress",
				select: "accountID,fullName"
			},
			filters: aFilters,
			template: this.accountF4Template
		});
		this._accountSelectDialog.open();
	},
	closeAccountF4: function(oEvent) {
		this.byId("dialogAccountF4").close();
		this.accountf4open = "";
	},
	setAccount: function(oEvent) {
		var selectedItem = oEvent.getParameter("selectedItem");
		var accountName = selectedItem.getProperty("title");
		var accountId = selectedItem.getProperty("description");
		this.byId("ZCustomFields.zDepartmentDescInput").setValue(accountName);
		this.byId("ZCustomFields.zDepartmentInput").setValue(accountId);
	},
	searchAccount: function(oEvent) {
		var sValue = oEvent.getParameter("value");
		var aFilters = [];
		if (sValue !== "") {
			var filterName = "fullName";
			aFilters.push(new sap.ui.model.Filter(filterName, sap.ui.model.FilterOperator.Contains, sValue));
		}
		aFilters.push(new sap.ui.model.Filter("zIsDepartment", sap.ui.model.FilterOperator.EQ, true));
		var itemsBinding = oEvent.getParameter("itemsBinding");
		if (itemsBinding) {
			itemsBinding.aApplicationFilters = [];
			itemsBinding.filter(aFilters);
		}
	},
	// ------------------ FUNCTION REDEFINITION --------------------//
	_readCustomizing: function(callbackCustomizingRead) {
		var that = this;
		var fnAfterRead = function(oResponses) {
			var aAcademicTitles = oResponses["CustomizingAcademicTitleCollection"];
			if (aAcademicTitles) {
				aAcademicTitles.unshift({
					title: "",
					titleDescription: ""
				});
				that.customizingModel.setProperty("/AcademicTitleCustomizing", aAcademicTitles);
			}
			var aTitles = oResponses["CustomizingTitleCollection"];
			if (aTitles) {
				aTitles.unshift({
					title: "",
					titleDescription: "",
					person: "X",
					organization: "X",
					group: "X"
				});
				that.customizingModel.setProperty("/TitleCustomizing", aTitles);
			}
			var aRatings = oResponses["CustomizingRatingCollection"];
			if (aRatings) {
				aRatings.unshift({
					ratingID: "",
					ratingText: ""
				});
				that.customizingModel.setProperty("/RatingCustomizing", aRatings);
			}
			var oDefaultEmployeeResponsible = oResponses["EmployeeCollection?$filter=isDefaultEmployee%20eq%20true"][0];
			if (oDefaultEmployeeResponsible)
				that.customizingModel.setProperty("/DefaultEmployeeResponsible", oDefaultEmployeeResponsible);
			else
				that.customizingModel.setProperty("/DefaultEmployeeResponsible", {
					fullName: "",
					employeeID: ""
				});
			if (callbackCustomizingRead)
				callbackCustomizingRead.call(that);
		};
		cus.crm.myaccounts.util.Util.sendBatchReadRequests(this.oDataModel, [
			"CustomizingTitleCollection",
			"CustomizingAcademicTitleCollection",
			"CustomizingRatingCollection",
			"EmployeeCollection?$filter=isDefaultEmployee%20eq%20true"
		], fnAfterRead, fnAfterRead);
		//-------------------  CUSTOM CODING: additional settings for Accountstatus Customizing ------------------//
		var statusSelect = this.getView().byId("ZCustomFields.zaccStatusDescrSelect");
		if (statusSelect) {
			that = this;
			this.oDataModel.read("/ZCustomizingAccStatusCollection", {
				success: function _OnSuccess(oData, response) {
					var oAccStatusModel = new sap.ui.model.json.JSONModel();
					oAccStatusModel.setData(oData);
					that.getView().byId("ZCustomFields.zaccStatusDescrSelect").setModel(oAccStatusModel, "CustAccountStatus");
				}
			});
		} //--------------------- END OF CUSTOM CODING ------------------//	    
	},
	// Redefined Functions //	
	onSaveButtonPressed: function() {
		var ctx1 = this.getView().getBindingContext().getObject().accountID;
		var that = this;
		var oModel = this.getView().getModel();
		if (ctx1 !== "") {
			oModel.read("EditAuthorizationCheck", null, {
				ObjectID: oModel.formatValue(ctx1, "Edm.String")
			}, false, function(oData, resp) {
				if (oData.EditAuthorizationCheck.ActionSuccessful === "X") {
					that._saveData(false);
					that._setBusy(false);
				} else {
					var those = that;
					var fnClose = function() {
						those.oRouter.navTo("detail", {
							contextPath: "AccountCollection('" + ctx1 + "')"
						}, true);
					};
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: oData.EditAuthorizationCheck.Message,
						details: null
					}, fnClose);
				}
			}, null);
		} else {
			that._saveData(false);
		}
	},
	_checkSavePossible: function() {
		var inputField, countryID, country, regionID, region, employeeID, employee, url;
		inputField = this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryIDInput"));
		if (inputField)
			countryID = inputField.getValue();
		inputField = this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryInput"));
		if (inputField)
			country = inputField.getValue();
		if (country && !countryID) {
			sap.m.MessageBox.alert(cus.crm.myaccounts.util.Util.geti18NText1("MSG_WRONG_COUNTRY_ERROR", country));
			return false;
		}
		inputField = this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.regionIDInput"));
		if (inputField)
			regionID = inputField.getValue();
		inputField = this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.regionInput"));
		if (inputField)
			region = inputField.getValue();
		if (region && !regionID) {
			sap.m.MessageBox.alert(cus.crm.myaccounts.util.Util.geti18NText1("MSG_WRONG_REGION_ERROR", region));
			return false;
		}
		inputField = this.getView().byId("EmployeeResponsibleRel.account2IDInput");
		if (inputField)
			employeeID = inputField.getValue();
		inputField = this.getView().byId("EmployeeResponsibleRel.account2FullNameInput");
		if (inputField)
			employee = inputField.getValue();
		if (employee && !employeeID) {
			sap.m.MessageBox.alert(cus.crm.myaccounts.util.Util.geti18NText1("MSG_WRONG_EMPLOYEE_ERROR", employee));
			return false;
		}
		inputField = this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.websiteInput"));
		if (inputField) {
			url = inputField.getValue();
			if (!jQuery.sap.validateUrl(url)) {
				sap.m.MessageBox.alert(cus.crm.myaccounts.util.Util.geti18NText1("MSG_WRONG_URL_ERROR", url));
				return false;
			}
		}
		//Check if all mandatory fields are filled
		var isMandatoryFieldsFilled = true;
		var oAccount = this.getView().getBindingContext().getObject();
		if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryInput")).getValue() === 'USA' || this.byId(sap.ui
				.core.Fragment.createId(this.addressFragment, "MainAddress.countryInput")).getValue() === 'Canada') {
			if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.regionInput")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.regionInput")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
		}
/*		if (this.byId("ZCustomFields.zsubDescriptionInput").getValue().length === 0) {
			this.byId("ZCustomFields.zsubDescriptionInput").setValueState(sap.ui.core.ValueState.Error);
			isMandatoryFieldsFilled = false;
		}*/
/*		if (this.byId("ZCustomFields.zdescriptionInput").getValue().length === 0) {
			this.byId("ZCustomFields.zdescriptionInput").setValueState(sap.ui.core.ValueState.Error);
			isMandatoryFieldsFilled = false;
		}*/
		if (oAccount.category === cus.crm.myaccounts.util.Constants.accountCategoryPerson) {
			if (this.byId(sap.ui.core.Fragment.createId("personFragment", "name1Input")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId("personFragment", "name1Input")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
			if (this.byId(sap.ui.core.Fragment.createId("personFragment", "name2Input")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId("personFragment", "name2Input")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
			if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryInput")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryInput")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
			if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.emailInput")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.emailInput")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
			if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.streetInput")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.streetInput")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
			if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.cityInput")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.cityInput")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
			if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.postcodeInput")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.postcodeInput")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
		} else {
			if (this.byId(sap.ui.core.Fragment.createId("companyFragment", "name1Input")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId("companyFragment", "name1Input")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
			if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryInput")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryInput")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
			if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.streetInput")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.streetInput")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
			if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.cityInput")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.cityInput")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
			if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.postcodeInput")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.postcodeInput")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
		}
		if (!isMandatoryFieldsFilled)
			sap.m.MessageBox.alert(cus.crm.myaccounts.util.Util.geti18NText("MSG_MANDATORY_FIELDS"));
		return isMandatoryFieldsFilled;
	},
	_cleanUp: function() {
		this.getView().setModel(null);
		this.setBtnEnabled("saveButton", true);
	},
	_setEmptyScreen: function(accountCategory) {

		var oAccountTemplate = this._getTemplateForAccount(accountCategory);
		var aDependentRelations = this._getDependentRelations();
		for (var i in aDependentRelations) {
			oAccountTemplate[aDependentRelations[i]] = this._getTemplateForDependentObject(aDependentRelations[i]);
		}
		var oNewAccountModel = new sap.ui.model.json.JSONModel({
			NewAccount: oAccountTemplate
		});
		oNewAccountModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
		//to be similar to oData model
		this.getView().setModel(oNewAccountModel);
		this.getView().setBindingContext(oNewAccountModel.getContext("/NewAccount"));
		this._setDefaultEmployeeResponsible();
		this._setDefaultValues(accountCategory);

	},
	_setDefaultValues: function(accountCategory) {

		//Status for individual account
		// this.byId("zAccountStatusInput").setSelectedKey("01");
		//Status for coorporate account
		if (accountCategory === "2") {
			// this.byId("ZCustomFields.zaccStatusDescrSelect").setSelectedKey("01");
		}
		// this.byId("zSamplingStatusInput").setSelectedKey("03");
		var oCountryLabel = this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryLabel"));
		oCountryLabel.setRequired(true);
		var that = this;
		if (accountCategory === cus.crm.myaccounts.util.Constants.accountCategoryPerson) {
			this.oDataModel.read("/ZCustomizingAccountTypeCollection", {
				success: function _OnSuccess(oData, response) {
					var result = $.grep(oData.results, function(e) {
						return e.ztypeID === "10001";
					});
					if (result.length === 1) {
						that.byId("ZCustomFields.ztypeIDInput").setValue(result[0].ztypeID);
						that.byId("ZCustomFields.zdescriptionInput").setValue(result[0].zdescription);
					}
				}
			});
		}
	},
	onCountryValueHelpClose: function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem");
		if (oSelectedItem) {
			/*
			 * Set value state to none 
			 */
			var oInput = this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryInput"));
			oInput.setValueState(sap.ui.core.ValueState.None);
			var oSelectedObject = oSelectedItem.getBindingContext().getObject();
			this._setCountry(oSelectedObject.countryID, oSelectedObject.country);
		}
		oEvent.getSource().getBinding("items").filter([]);
	},

	onRegionInputFieldChanged: function(oEvent) {
		this.onInputFieldChanged(oEvent);
		var regionInput = oEvent.getSource();
		this._setRegion("", regionInput.getValue());

		var fnCheckRegion = function() {
			var oModel = this.valueHelpRegion.getModel();
			var aRegions = oModel.getProperty("/RegionCustomizing");
			for (var i = 0; i < aRegions.length; i++) {
				var oRegion = aRegions[i];
				if (oRegion.region.toUpperCase() === regionInput.getValue().toUpperCase()) {
					this._setRegion(oRegion.regionID, regionInput.getValue());
				}

			}
		};
		if (!this.valueHelpRegion) {
			this._createValueHelpRegion();
			this._readRegions(fnCheckRegion);
		} else {
			fnCheckRegion.call(this);
		}
	},

	onRegionValueHelpClose: function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem");
		if (oSelectedItem) {
			/*
			 * Set value state to none 
			 */
			var oInput = this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.regionInput"));
			oInput.setValueState(sap.ui.core.ValueState.None);
		}
		if (oSelectedItem) {
			var oSelectedObject = oSelectedItem.getBindingContext().getObject();
			this._setRegion(oSelectedObject.regionID, oSelectedObject.region);
		}
		oEvent.getSource().getBinding("items").filter([]);
	},

	onCountryInputFieldChanged: function(oEvent) {
		this.onInputFieldChanged(oEvent);
		var countryInput = oEvent.getSource();
		this._setCountry("", countryInput.getValue());
		var fnCheckCountry = function() {
			var oModel = this.valueHelpCountry.getModel();
			var aCountries = oModel.getProperty("/CountryCustomizing");
			for (var i = 0; i < aCountries.length; i++) {
				var oCountry = aCountries[i];
				if (oCountry.country.toUpperCase() === countryInput.getValue().toUpperCase())
					this._setCountry(oCountry.countryID, countryInput.getValue());
			}
		};
		if (!this.valueHelpCountry) {
			this._createValueHelpCountry();
			this._readCountries(fnCheckCountry);
		} else {
			fnCheckCountry.call(this);
		}
	},
	onInputFieldChanged: function(oEvent) {
		var oInput = oEvent.getSource();
		//Email OR Country OR street OR postcode OR City
		if (oInput.getId().indexOf("email") !== -1 || oInput.getId().indexOf("country") !== -1 || oInput.getId().indexOf("street") !== -1 ||
			oInput.getId().indexOf("postcode") !== -1 || oInput.getId().indexOf("city") !== -1) {
			if (oInput.getValue().length > 0) {
				oInput.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInput.setValueState(sap.ui.core.ValueState.Error);
			}
		}
		if (this.getView().byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryInput")).getValue() === 'USA' || this.byId(
				sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryInput")).getValue() === 'Canada') {
			if (oInput.getId().indexOf("region") !== -1) {
				if (oInput.getValue().length > 0) {
					oInput.setValueState(sap.ui.core.ValueState.None);
				} else {
					oInput.setValueState(sap.ui.core.ValueState.Error);
				}
			}
		}
	},

	// onAfterRendering: function() {
	// 	this.restrictAddressEdit();
	// },

	restrictAddressEdit: function() {
		var that = this;
		if (that.oRouter) {
			if (that.oRouter._oRouter._prevMatchedRequest.includes("edit")) {
				that._setAddressFieldsEnabled(false, false);
			}
		}
	},

	// enhanced standard method 
	_setAddressFieldsEnabled: function(enabled, emptyFields) {
		var oAddressContainer = this.getView().byId(this.addressForm);
		var oAccount = this.getView().getBindingContext().getObject();
		if (oAccount.category === '1') {
			this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.emailLabel")).setRequired(true);
		}
		if (!oAddressContainer) {
			return;
		}
		var aFormElements = oAddressContainer.getFormElements();
		var viewId = this.getView().getId();
		for (var i in aFormElements) {
			var aFields = aFormElements[i].getFields();
			for (var z in aFields) {
				var regEx = new RegExp(viewId + "--" + this.addressFragment + "--MainAddress.[A-z0-9]+Input", "g");
				var elementId = aFields[z].getId();
				if (elementId === viewId + "--" + this.addressFragment + "--MainAddress.ZznoaddrvalidationInput" ||
					elementId === viewId + "--" + this.addressFragment + "--MainAddress.countryInput") {
					continue;
				}

				var elementValue = aFields[z].getValue();
				if (this.oRouter._oRouter._prevMatchedRequest.includes("new")) {
					if (elementId === viewId + "--" + this.addressFragment + "--MainAddress.countryInput") {
						aFields[z].setEnabled(true);
						if (elementValue === 'USA') {
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.streetLabel")).setRequired(true);
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.postcodeLabel")).setRequired(true);
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.cityLabel")).setRequired(true);
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryLabel")).setRequired(true);
						} else if (elementValue === 'Canada') {
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.streetLabel")).setRequired(true);
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.postcodeLabel")).setRequired(true);
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryLabel")).setRequired(true);
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.regionLabel")).setRequired(true);
						} else if (elementValue === 'United Kingdom') {
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.streetLabel")).setRequired(true);
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.postcodeLabel")).setRequired(true);
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.cityLabel")).setRequired(true);
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryLabel")).setRequired(true);
						} else if (elementValue === 'Japan') {
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.streetLabel")).setRequired(true);
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.postcodeLabel")).setRequired(true);
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.cityLabel")).setRequired(true);
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryLabel")).setRequired(true);
						} else {
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.streetLabel")).setRequired(true);
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.postcodeLabel")).setRequired(true);
							this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryLabel")).setRequired(true);
						}
					}
				}
				if (this.oRouter._oRouter._prevMatchedRequest.includes("edit") && (elementId === viewId + "--" + this.addressFragment +
						"--MainAddress.emailInput" || elementId === viewId +
						"--" + this.addressFragment + "--MainAddress.mobilePhoneInput" || elementId === viewId + "--" + this.addressFragment +
						"--MainAddress.phoneInput" | elementId === viewId + "--" + this.addressFragment + "--MainAddress.websiteInput")) {
					aFields[z].setEnabled(true);
					continue;
				}
				if (elementValue === '' && regEx.test(elementId)) {
					aFields[z].setEnabled(enabled);
					if (emptyFields) {
						aFields[z].setValue("");
					}
				} else if (elementValue !== '') {
					aFields[z].setEnabled(false);
				}

			}
		}
	},

	_fillNewObject: function(sourceObject, targetObject, fieldPrefix, fragmentName) {

		var changesExist = false;
		var inputFieldId = "";
		for (var key in sourceObject) {

			if (fragmentName)
				inputFieldId = this.getView().getId() + "--" + fragmentName + "--" + fieldPrefix + key + "Input";
			else
				inputFieldId = this.getView().getId() + "--" + fieldPrefix + key + "Input";

			if (typeof sourceObject[key] !== "object" || key === "birthDate")
				targetObject[key] = sourceObject[key];

			//get new value from input field
			var oInputField = this.byId(inputFieldId);
			if (oInputField) {
				var newValue = "";
				if (oInputField.getDateValue) { //special logic for dates
					newValue = oInputField.getValue();
					newValue = cus.crm.myaccounts.util.formatter.convertDateStringToUTC(newValue);
				} else if (oInputField.getSelectedKey) //special logic for select field
					newValue = oInputField.getSelectedKey();
				else if (oInputField.getValue) //special logic for input field
					newValue = oInputField.getValue();
				else if (oInputField.getSelected) //special logic for radio buttons and check boxes
					newValue = oInputField.getSelected();

				/* Capture Address Validation Switch Input */
				if (oInputField.getState) {
					newValue = oInputField.getState();
					if (newValue == true)
						newValue = 'X';
					else
						newValue = '';
				}

				//check if the new value is different from the original value
				if (newValue && newValue.getTime) {
					if (!targetObject[key] || newValue.getTime() !== targetObject[key].getTime()) {
						changesExist = true;
						targetObject[key] = newValue;
					}
				} else if (targetObject[key] !== newValue) {
					changesExist = true;
					targetObject[key] = newValue;
				}
			}
		}
		return changesExist;
	},

	onName2InputFieldChanged: function() {
		var oAccount = this.getView().getBindingContext().getObject();
		if (oAccount.category === cus.crm.myaccounts.util.Constants.accountCategoryPerson) {
			this.byId(sap.ui.core.Fragment.createId("personFragment", "name2Input")).setValueState(sap.ui.core.ValueState.None);
		}
	},
	onName3InputFieldChanged: function() {
		var a = this.getView().getBindingContext().getObject();
/*		if (a.category === cus.crm.myaccounts.util.Constants.accountCategoryPerson) this.byId(sap.ui.core.Fragment.createId("personFragment",
			"name1Input")).setValueState(sap.ui.core.ValueState.None);
		else */
		this.byId(sap.ui.core.Fragment.createId("companyFragment", "name3Input")).setValueState(sap.ui.core.ValueState.None);
	},	

	_onAfterSave: function(responseObject, oError) {
		this._setBusy(false);
		if (oError) {
			if (this["_onAfterSaveHandleErrorCode_" + oError.statusCode])
				this["_onAfterSaveHandleErrorCode_" + oError.statusCode]();
			else
				sap.m.MessageBox.alert(oError.message.value);
			return;
		}

		if (this.editMode) {
			this.getView().getModel().refresh(true);
			window.history.back();
		} else
			this.oRouter.navTo("detail", {
				contextPath: "AccountCollection('" + responseObject.accountID + "')"
			}, true);
	}

});