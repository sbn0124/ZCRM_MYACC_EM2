jQuery.sap.require("sap.m.MessageBox");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";

	return Controller.extend("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.CreateAddress", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.view.CreateAddress
		 */
		onInit: function() {
			sap.ca.scfld.md.controller.BaseFullscreenController.prototype.onInit.call(this);
			this.oModel = this.getView().getModel();
			this.oView = this.getView();
			this.oDataModel = sap.ui.getCore().getModel();
			this.oModel = sap.ui.getCore().getModel();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("createAddress").attachMatched(this._onRouteMatched, this);

			/* New Changes */

			this.addressForm = "editFormAddress" + this.getDefaultAddressFormat();
			this.addressFragment = "addressFragment" + this.getDefaultAddressFormat();
			this.valueHelpCountry = null;
			this.valueHelpRegion = null;
			this.countryIDUsedForRegion = undefined;
			this.countryIDUsedForRegionSuggestion = undefined;
			this.customizingModel = new sap.ui.model.json.JSONModel({
				TitleCustomizing: [],
				AcademicTitleCustomizing: [],
				RatingCustomizing: [],
				DefaultEmployeeResponsible: []
			});
			this.getView().setModel(this.customizingModel, "Customizing");

			if (!this.oDataModel)
				this.oDataModel = this.getView().getModel();

			var constants = new sap.ui.model.json.JSONModel(cus.crm.myaccounts.util.Constants);
			this.getView().setModel(constants, "constants");
			this.editMode = false;
			this._cleanUp();
			this._displayCountrySpecificAddressFormat(this.getDefaultAddressFormat());
			this._toggleAddressFields();
		},

		setAccountId: function(sValue) {
			this._AccountID = sValue;
			return this;
		},

		getAccountId: function() {
			if (!this._AccountID)
				this._AccountID = "";
			return this._AccountID;
		},

		_cleanUp: function() {
			this.getView().setModel(null);
			this.getHeaderFooterOptions();
			// this.setBtnEnabled("saveButton", true);
			this.byId(this.getView().getId() + "--addressFragment--MainAddress.emailLabel").setRequired(true);
			this.byId(this.getView().getId() + "--addressFragment--MainAddress.countryLabel").setRequired(true);
		},

		_onRouteMatched: function(oEvent) {
			var ocurAccount = null;
			var oArgs = oEvent.getParameter("arguments");
			if (oArgs) {
				ocurAccount = oArgs.contextPath;

				if (ocurAccount) {
					this.setAccountId(ocurAccount);
					var oParam = "'" + ocurAccount + "'";
					var oPath = "/AccountCollection(" + oParam + ")/";

					this.getView().setBindingContext(oPath);

					var oView = this.getView();
					oView.bindElement({
						path: oPath,
						events: {
							change: this._onBindingChange.bind(this),
							dataRequested: function(oEvent) {
								oView.setBusy(true);
							},
							dataReceived: function(oEvent) {
								oView.setBusy(false);
							}
						}

					});

				}
			}
		},

		_onBindingChange: function(oEvent) {
			// No data for the binding
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			if (!this.getView().getBindingContext()) {
				oRouter.getTargets().display("notFound");
			}
		},

		getDefaultAddressFormat: function() {
			/** * @ControllerHook	extHookGetDefaultAddressFormat
			 * 						In the method extHookGetDefaultAddressFormat it is possible to define
			 * 						a default address format. The return value should be an existing country
			 * 						code e.g. US, JP.
			 * @callback cus.crm.myaccounts.view.maintain.GeneralDataEdit~extHookGetDefaultAddressFormat
			 * @return {string} */
			if (this.extHookGetDefaultAddressFormat)
				return this.extHookGetDefaultAddressFormat();
			else
				return "";
		},

		_displayCountrySpecificAddressFormat: function(countryID) {
			this.getView().byId(this.addressForm).setVisible(false);
			this._setAddressFragmentAndForm(countryID);
			this.getView().byId(this.addressForm).setVisible(true);
		},

		_setAddressFragmentAndForm: function(countryID) {
			this.addressFragment = "addressFragment" + countryID;
			this.addressForm = "editFormAddress" + countryID;

			//addressForm for countryID does not exist in xml - use default address form and fragment
			if (!this.getView().byId(this.addressForm)) {
				this.addressFragment = "addressFragment" + this.getDefaultAddressFormat();
				this.addressForm = "editFormAddress" + this.getDefaultAddressFormat();
			}
		},
		_setCountry: function(countryID, country) {
			if (countryID)
				this._displayCountrySpecificAddressFormat(countryID);

			var countryInput = this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryInput"));
			var countryIDInput = this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryIDInput"));

			var oldCountryID = countryIDInput.getValue();
			if (oldCountryID !== countryID) {
				this._setRegion("", ""); //clear region
			}

			if (countryInput)
				countryInput.setValue(country);
			if (countryIDInput)
				countryIDInput.setValue(countryID);

			//enable address input field
			this._toggleAddressFields();
		},

		_readCountries: function(callbackCountryRead) {
			var that = this;
			this.valueHelpCountry.setModel(new sap.ui.model.json.JSONModel({
				CountryCustomizing: []
			}));
			this.oDataModel.read("/CustomizingCountryCollection", null, undefined, true,
				function(oData) {
					var countryCustomizing = jQuery.parseJSON(JSON.stringify(oData));
					that.valueHelpCountry.setModel(new sap.ui.model.json.JSONModel({
						CountryCustomizing: countryCustomizing.results
					}));
					if (callbackCountryRead)
						callbackCountryRead.call(that);
				},
				function(oError) {
					jQuery.sap.log.error("Read failed in GeneralDateEdit->_readCountries:" + oError.response.body);
				}
			);
		},

		_setRegion: function(regionID, region) {
			var regionInput = this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.regionInput"));
			if (regionInput)
				regionInput.setValue(region);
			var regionIDInput = this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.regionIDInput"));
			if (regionIDInput)
				regionIDInput.setValue(regionID);
		},

		_readRegions: function(callbackRegionRead) {
			var that = this;
			var currentCountryID = this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryIDInput")).getValue();

			if (!that.aRegionCallback)
				that.aRegionCallback = [];

			if (that.regionReadRunning && callbackRegionRead) {
				that.aRegionCallback.push(callbackRegionRead);
				return;
			}

			if (this.countryIDUsedForRegion === currentCountryID) {
				if (callbackRegionRead)
					callbackRegionRead.call(that);
				return;
			}

			if (callbackRegionRead)
				that.aRegionCallback.push(callbackRegionRead);
			that.regionReadRunning = true;

			this.countryIDUsedForRegion = currentCountryID;
			this.valueHelpRegion.setModel(new sap.ui.model.json.JSONModel({
				RegionCustomizing: []
			}));
			this.oDataModel.read("/CustomizingRegionCollection", null, '$filter=countryID%20eq%20%27' + currentCountryID + '%27', true,
				function(oData) {
					var regionCustomizing = jQuery.parseJSON(JSON.stringify(oData));
					that.valueHelpRegion.setModel(new sap.ui.model.json.JSONModel({
						RegionCustomizing: regionCustomizing.results
					}));
					that.regionReadRunning = false;

					for (var i in that.aRegionCallback)
						that.aRegionCallback[i].call(that);
				},
				function(oError) {
					jQuery.sap.log.error("Read failed in GeneralDateEdit->_readRegions: " + oError.response.body);
					that.regionReadRunning = false;
				}
			);
		},

		_toggleAddressFields: function() {

			var countryID = this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryIDInput")).getValue();

			if (countryID && countryID !== "") {
				this._setAddressFieldsEnabled(true, false);
			} else {
				this._setAddressFieldsEnabled(false, false);
			}
		},

		_setAddressFieldsEnabled: function(enabled, emptyFields) {
			var oAddressContainer = this.getView().byId(this.addressForm);
			if (!oAddressContainer)
				return;
			var aFormElements = oAddressContainer.getFormElements();
			var viewId = this.getView().getId();
			for (var i in aFormElements) {
				var aFields = aFormElements[i].getFields();
				for (var z in aFields) {
					var regEx = new RegExp(viewId + "--" + this.addressFragment + "--MainAddress.[A-z0-9]+Input", "g");
					var elementId = aFields[z].getId();
					if (elementId === viewId + "--" + this.addressFragment + "--MainAddress.countryInput")
						continue;
					if (regEx.test(elementId)) {
						aFields[z].setEnabled(enabled);
						if (emptyFields)
							aFields[z].setValue("");
					}
				}
			}
		},

		onCountryValueHelpSelected: function() {
			if (!this.valueHelpCountry) {
				this._createValueHelpCountry();
				// this.getView().addDependent(this.valueHelpCountry);
				this._readCountries();
			}
			this.valueHelpCountry.open();
		},

		_createValueHelpCountry: function() {
			if (!this.valueHelpCountry) {
				this.valueHelpCountry = sap.ui.xmlfragment("cus.crm.myaccounts.view.maintain.ValueHelpCountry", this);
				this.valueHelpCountry.setModel(this.getView().getModel("i18n"), "i18n");
			}
		},

		onCountryValueHelpSearch: function(oEvent) {
			var searchValue = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter("country", sap.ui.model.FilterOperator.Contains, searchValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		onCountryValueHelpClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oSelectedObject = oSelectedItem.getBindingContext().getObject();
				this._setCountry(oSelectedObject.countryID, oSelectedObject.country);
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		onCountryValueHelpCancel: function(oEvent) {
			oEvent.getSource().getBinding("items").filter([]);
		},

		// ############################### region value help: ################################################################

		onRegionValueHelpSelected: function() {
			if (!this.valueHelpRegion) {
				this._createValueHelpRegion();
				//this.getView().addDependent(this.valueHelpRegion);
			}
			this._readRegions();
			this.valueHelpRegion.open();
		},

		_createValueHelpRegion: function() {
			if (!this.valueHelpRegion) {
				this.valueHelpRegion = sap.ui.xmlfragment("cus.crm.myaccounts.view.maintain.ValueHelpRegion", this);
				this.valueHelpRegion.setModel(this.getView().getModel("i18n"), "i18n");
			}
		},

		onRegionValueHelpSearch: function(oEvent) {
			var searchValue = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter("region", sap.ui.model.FilterOperator.Contains, searchValue);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		onRegionValueHelpClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oSelectedObject = oSelectedItem.getBindingContext().getObject();
				this._setRegion(oSelectedObject.regionID, oSelectedObject.region);
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		onRegionValueHelpCancel: function(oEvent) {
			oEvent.getSource().getBinding("items").filter([]);
		},

		// ############################### country suggestion: ################################################################

		onCountrySuggest: function(oEvent) {
			var countryInput = oEvent.getSource();
			var fnDisplaySuggestion = function() {
				var oModel = this.valueHelpCountry.getModel();
				if (countryInput.getSuggestionItems().length > 0)
					return;
				var aCountries = oModel.getProperty("/CountryCustomizing");
				for (var i = 0; i < aCountries.length; i++) {
					var oCountry = aCountries[i];
					var oCustomData = new sap.ui.core.CustomData({
						key: "countryID",
						value: oCountry.countryID
					});
					var oItem = new sap.ui.core.Item({
						text: oCountry.country,
						customData: oCustomData
					});
					countryInput.addSuggestionItem(oItem);
				}
			};
			if (!this.valueHelpCountry) {
				this._createValueHelpCountry();
				this._readCountries(fnDisplaySuggestion);
			} else {
				fnDisplaySuggestion.call(this);
			}
		},

		onCountrySuggestItemSelected: function(oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			var countryID = null;
			for (var i in oItem.getCustomData()) {
				var oCustomData = oItem.getCustomData()[i];
				if (oCustomData.getKey() === "countryID")
					countryID = oCustomData.getValue();
			}
			this._setCountry(countryID, oItem.getText());
		},

		onInputFieldChanged: function() {},

		onCountryInputFieldChanged: function(oEvent) {
			this.onInputFieldChanged();
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

			this._cleanUp();
		},

		// ############################### region suggestion: ################################################################

		onRegionSuggest: function(oEvent) {
			var regionInput = oEvent.getSource();
			var fnDisplaySuggestion = function() {
				if (this.countryIDUsedForRegionSuggestion === this.countryIDUsedForRegion)
					return;
				this.countryIDUsedForRegionSuggestion = this.countryIDUsedForRegion;
				var oModel = this.valueHelpRegion.getModel();
				var aRegions = oModel.getProperty("/RegionCustomizing");
				regionInput.removeAllSuggestionItems();
				for (var i = 0; i < aRegions.length; i++) {
					var oRegion = aRegions[i];
					var oCustomData = new sap.ui.core.CustomData({
						key: "regionID",
						value: oRegion.regionID
					});
					var oItem = new sap.ui.core.Item({
						text: oRegion.region,
						customData: oCustomData
					});
					regionInput.addSuggestionItem(oItem);
				}
			};
			if (!this.valueHelpRegion)
				this._createValueHelpRegion();

			this._readRegions(fnDisplaySuggestion);

		},

		onRegionSuggestItemSelected: function(oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			var regionID = null;
			for (var i in oItem.getCustomData()) {
				var oCustomData = oItem.getCustomData()[i];
				if (oCustomData.getKey() === "regionID")
					regionID = oCustomData.getValue();
			}
			this._setRegion(regionID, oItem.getText());
		},

		onRegionInputFieldChanged: function(oEvent) {
			this.onInputFieldChanged();
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

		getHeaderFooterOptions: function() {
			var that = this;
			return {
				sI18NFullscreenTitle: "DETAIL_TITLE",
				buttonList: [{
					sI18nBtnTxt: "BUTTON_SAVE",
					sId: "saveButton",
					onBtnPressed: jQuery.proxy(this.onSaveButtonPressed, this),
					bDisabled: "false"
				}, {
					sI18nBtnTxt: "BUTTON_CANCEL",
					sId: "cancelButton",
					onBtnPressed: jQuery.proxy(this.onCancelButtonPressed, this)
				}],
				onBack: function() {
					that.onBackButtonPressed();
				}

			};
		},

		_setBusy: function(busy) {
			if (!this.oBusyDialog)
				this.oBusyDialog = new sap.m.BusyDialog();
			if (busy) {
				// this.setBtnEnabled("saveButton", !busy);
				// this.setBtnEnabled("cancelButton", !busy);
				this.oBusyDialog.open();
			} else {
				// this.setBtnEnabled("saveButton", !busy);
				// this.setBtnEnabled("cancelButton", !busy);
				this.oBusyDialog.close();
			}
		},

		_checkSaveNeeded: function() {
			var oAccount = sap.ui.getCore().AppContext;
			var oNewAccount = {};

			var changesInAccount = false,
				changesForDependentRelations = false;

			changesInAccount = this._fillNewObject(oAccount, oNewAccount, "");
			if (changesInAccount)
				return true;

			if (oAccount.category === cus.crm.myaccounts.util.Constants.accountCategoryPerson)
				changesInAccount = this._fillNewObject(oNewAccount, oNewAccount, "", "personFragment");
			if (oAccount.category !== cus.crm.myaccounts.util.Constants.accountCategoryPerson)
				changesInAccount = this._fillNewObject(oNewAccount, oNewAccount, "", "companyFragment");

			if (changesInAccount)
				return true;

			changesForDependentRelations = this._changesForDependentRelationsExists();
			if (!changesForDependentRelations)
				return false;
			else
				return true;
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
						newValue === true ? newValue = 'X' : newValue = '';
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

		_changesForDependentRelationsExists: function(saveMode) {
			var oModel = this.oDataModel,
				oAccountContext = sap.ui.getCore().AppContext,
				changesInDependentObject = false,
				aDependentRelations = this._getDependentRelations();
			for (var i in aDependentRelations) {
				//		var oDependentObject = oModel.getProperty(oAccountContext + "/" + aDependentRelations[i]); //check if entity exists. In create case it will be always empty
				var oDependentObject;
				if (!saveMode)
					oDependentObject = oAccountContext.getProperty(aDependentRelations[i]); //check if entity exists. In create case it will be always filled
				if (!oDependentObject)
					oDependentObject = this._getTemplateForDependentObject(aDependentRelations[i]); //if the entity does not exist -> use template
				var oNewDependentObject = {};
				var fragmentName = null;
				if (aDependentRelations[i] === "MainAddress") {
					fragmentName = this.addressFragment;
				}
				changesInDependentObject = this._fillNewObject(oDependentObject, oNewDependentObject, aDependentRelations[i] + ".", fragmentName);
				if (changesInDependentObject)
					return changesInDependentObject;
			}

			return changesInDependentObject;
		},

		_generateTemplateUsingMetadata: function(path) {
			var oEntityMetadata = this.oDataModel.oMetadata._getEntityTypeByPath(path);
			var oTemplate = {};
			for (var i in oEntityMetadata.property) {
				switch (oEntityMetadata.property[i].type) {
					case "Edm.Boolean":
						{
							oTemplate[oEntityMetadata.property[i].name] = false;
							break;
						}
					case "Edm.DateTime":
						{
							oTemplate[oEntityMetadata.property[i].name] = null;
							break;
						}
					default:
						oTemplate[oEntityMetadata.property[i].name] = "";
				}
			}
			return oTemplate;
		},

		_adaptAccountWithDependentRelationsBeforeCreate: function(oNewAccount) {

			var aDependentRelations = this._getDependentRelations();
			for (var i in aDependentRelations) {
				var oDependentObject = this._getTemplateForDependentObject(aDependentRelations[i]);
				var oNewDependentObject = {};
				var fragmentName = null;
				if (aDependentRelations[i] === "MainAddress") {
					fragmentName = this.addressFragment;
				}
				var changesInDependentObject = this._fillNewObject(oDependentObject, oNewDependentObject, aDependentRelations[i] + ".",
					fragmentName);
				if (changesInDependentObject)
					oNewAccount[aDependentRelations[i]] = oNewDependentObject;
			}
		},

		_getDependentRelations: function() {
			// var oDependentRelations = ["MainAddress", "Classification", "EmployeeResponsibleRel", "EmployeeResponsible"];
			var oDependentRelations = ["MainAddress"];

			var oDependentCustomRelations = [];
			/** * @ControllerHook extHookGetDependentCustomRelations
			 * The method extHookGetDependentCustomRelations should return an array
			 * with additional navigation properties for the AccountCollection, which should be considered in the create/update process 
			 * @callback cus.crm.myaccounts.view.maintain.GeneralDataEdit~extHookGetDependentCustomRelations
			 * @return {array} */
			if (this.extHookGetDependentCustomRelations)
				oDependentCustomRelations = this.extHookGetDependentCustomRelations();
			for (var i in oDependentCustomRelations) {
				oDependentRelations.push(oDependentCustomRelations[i]);
			}

			return oDependentRelations;
		},

		_getTemplateForDependentObject: function(relationName) {
			switch (relationName) {
				case "EmployeeResponsibleRel":
					{
						var oRel = this._generateTemplateUsingMetadata("AccountCollection/" + relationName);
						oRel.main = true;
						oRel.relationshipCategory = 'BUR011'; //Relationship - Has the Employee Responsible
						return oRel;
					}
				default:
					return this._generateTemplateUsingMetadata("AccountCollection/" + relationName);
			}
		},

		onSaveButtonPressed: function(oEvent) {

			var oAccountId = this.getAccountId();
			var that = this;
			var oModel = this.oModel;
			if (oAccountId !== "") {
				oModel.read("EditAuthorizationCheck", null, {
					ObjectID: oModel.formatValue(oAccountId, "Edm.String")
				}, false, function(oData, resp) {
					if (oData.EditAuthorizationCheck.ActionSuccessful === "X") {
						that._saveData(false);
						that._setBusy(false);
					} else {
						var fnClose = function() {
							that.oRouter.navTo("detail", {
								contextPath: "AccountCollection('" + oAccountId + "')"
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

			if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryInput")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryInput")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
			if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.streetInput")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.streetInput")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
			if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.postcodeInput")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.postcodeInput")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
			if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.cityInput")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.cityInput")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}
			if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.emailInput")).getValue().length === 0) {
				this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.emailInput")).setValueState(sap.ui.core.ValueState.Error);
				isMandatoryFieldsFilled = false;
			}

			if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryInput")).getValue() === 'USA' ||
				this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryInput")).getValue() === 'Canada') {
				if (this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.regionInput")).getValue().length === 0) {
					this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.regionInput")).setValueState(sap.ui.core.ValueState.Error);
					isMandatoryFieldsFilled = false;
				}
			}

			if (!isMandatoryFieldsFilled)
				sap.m.MessageBox.alert(cus.crm.myaccounts.util.Util.geti18NText("MSG_MANDATORY_FIELDS"));
			return isMandatoryFieldsFilled;
		},

		getFooterButtons: function() {
			var that = this;
			return [{
				sIcon: "sap-icon://add",
				sTooltip: cus.crm.myaccounts.util.Util.geti18NText("ZADD_ADDRESS_TOOLTIP"),
				onBtnPressed: function() {
					that._checkEdit();
				}
			}];
		},

		_onAfterSave: function(responseObject, oError) {
			this._setBusy(false);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			if (oError) {
				if (this["_onAfterSaveHandleErrorCode_" + oError.statusCode])
					this["_onAfterSaveHandleErrorCode_" + oError.statusCode]();
				else
					sap.m.MessageBox.alert(oError.message.value);
				return;
			}

			if (this.editMode)
				window.history.back();
			else
				oRouter.navTo("detail", {
					contextPath: "AccountCollection('" + responseObject.accountID + "')"
				}, true);
		},

		onNavBack: function() {
			var oHistory = History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				var bReplace = true;
				this.getRouter().navTo("detail", {}, bReplace);
			}
		},

		_objectKeyIsInitial: function(object, path) {
			var oEntityMetadata = this.oDataModel.oMetadata._getEntityTypeByPath(path);
			for (var i in oEntityMetadata.key.propertyRef)
				if (object[oEntityMetadata.key.propertyRef[i].name] !== "")
					return false;

			return true;
		},
		_createBatchOperationForDependentRelations: function(aBatchOperation, eTagString) {
			var oModel = sap.ui.getCore().getModel();
			var oAccountContext = sap.ui.getCore().AppContext;
			var oAccount = sap.ui.getCore().AppContext.getObject();

			var aDependentRelations = this._getDependentRelations();
			for (var i in aDependentRelations) {
				if (aDependentRelations[0]) {
					var oDependentObject = oModel.getProperty(oAccountContext + "/" + aDependentRelations[i]);
					var oDependentObjectContext = null;
					if (oDependentObject)
						oDependentObjectContext = oModel.getContext("/" + oAccount[aDependentRelations[i]]["__ref"]);
					var test = oDependentObjectContext.getObject();
					var oNewDependentObject = {};

					var changesInDependentObject = false;

					var dependentObjectToBeCreated = false;
					//	if (!oDependentObject || this._objectKeyIsInitial(oDependentObject, "AccountCollection/" + aDependentRelations[i])) { //odata contains initial address with no keys -> only if user comes from search result list
					dependentObjectToBeCreated = true;
					oDependentObject = this._getTemplateForDependentObject(aDependentRelations[i]);
					if (oDependentObject.accountID !== null && oDependentObject.accountID !== undefined)
						oDependentObject.accountID = oAccount.accountID;
					//	}
					var fragmentName = null;
					if (aDependentRelations[i] === "MainAddress") {
						fragmentName = this.addressFragment;
					}
					oDependentObject.zzAddrKind = "ISM_WE";
					changesInDependentObject = this._fillNewObject(oDependentObject, oNewDependentObject, aDependentRelations[i] + ".",
						fragmentName);

					var oBatchOperation, requestURL;
					if (changesInDependentObject) {
						var httpMethod;
						if (dependentObjectToBeCreated) {
							httpMethod = "POST";
							var oEntityMetadata = this.oDataModel.oMetadata._getEntityTypeByPath("AccountCollection/" + aDependentRelations[i]);
							requestURL = oEntityMetadata.name + "Collection";
						} else {
							httpMethod = "PUT";
							requestURL = oDependentObjectContext.sPath;
						}
						oBatchOperation = oModel.createBatchOperation(requestURL, httpMethod, oNewDependentObject, {
							sETag: eTagString
						});
						aBatchOperation.push(oBatchOperation);
						aDependentRelations[0] = null;
					}
				}
			}
		},
		_getExpandForDataBinding: function() {
			var expandString = null;
			var aDependentRelations = this._getDependentRelations();
			for (var i in aDependentRelations) {
				if (!expandString)
					expandString = aDependentRelations[i];
				else
					expandString = expandString + "," + aDependentRelations[i];
			}
			return expandString;
		},
		_saveData: function(forceSave) {

			var eTagString = null;
			if (forceSave)
				eTagString = "*";

			// In case no country has been entered, the address fields are emptied
			if (!this.byId(sap.ui.core.Fragment.createId(this.addressFragment, "MainAddress.countryIDInput")).getValue()) {
				this._setAddressFieldsEnabled(false, true);
			}

			if (!this._checkSavePossible())
				return;
			if (!this._checkSaveNeeded()) {
				//	this.onCancelButtonPressed();
				return;
			}

			this._setBusy(true);
			var oModel = sap.ui.getCore().getModel();
			var oAccountContext = sap.ui.getCore().AppContext;
			var oAccount = sap.ui.getCore().AppContext.getObject();
			var oNewAccount = {};

			var changesInAccount = false,
				changesInAccountSpecificFields = false,
				changesForDependentRelations = false;

			changesInAccount = this._fillNewObject(oAccount, oNewAccount, "");
			changesForDependentRelations = this._changesForDependentRelationsExists("saveMode");

			if (!changesInAccount && !changesForDependentRelations)
				return;

			var oBatchOperation, sRequestURL;
			var aBatchOperation = [];
			var that = this;
			this.editMode = "edit";
			if (this.editMode) {
				if (changesForDependentRelations) {
					this._createBatchOperationForDependentRelations(aBatchOperation, eTagString);
				}

				cus.crm.myaccounts.util.Util.sendBatchChangeOperations(this.oDataModel, aBatchOperation,
					function(responseObject) {
						var oRefreshUIObject = cus.crm.myaccounts.util.Util.getRefreshUIObject(oModel, oAccountContext.sPath, that._getExpandForDataBinding());
						oRefreshUIObject.refresh();
						sap.m.MessageToast.show(cus.crm.myaccounts.util.Util.geti18NText("MSG_UPDATE_SUCCESS"));
						that._onAfterSave(responseObject[0]);
					},
					function(oError) {
						that._onAfterSave(null, oError);
					});

			} else {

				sRequestURL = "/AccountCollection";
				oBatchOperation = this.oDataModel.createBatchOperation(sRequestURL, "POST", oNewAccount);

				if (changesForDependentRelations) {
					this._adaptAccountWithDependentRelationsBeforeCreate(oNewAccount);
				}

				aBatchOperation.push(oBatchOperation);
				cus.crm.myaccounts.util.Util.sendBatchChangeOperations(this.oDataModel, aBatchOperation,
					function(responseObject) {
						sap.m.MessageToast.show(cus.crm.myaccounts.util.Util.geti18NText("MSG_CREATION_SUCCESS"));
						that._onAfterSave(responseObject[0]);
					},
					function(oError) {
						that._onAfterSave(null, oError);
					});
			}
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.view.CreateAddress
		 */
		// onBeforeRendering: function() {

		// }

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.view.CreateAddress
		 */
		// onAfterRendering: function() {

		// }

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.view.CreateAddress
		 */
		//	onExit: function() {
		//
		//	}

	});

});