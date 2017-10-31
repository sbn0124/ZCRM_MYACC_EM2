sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"cus/crm/myaccounts/util/Constants",
	"cus/crm/myaccounts/util/Util"
], function(Controller, Constants) {
	"use strict";

	return Controller.extend("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.DepartmentsCustom", {

		onInit: function() {
			this.BatchOperations = [];
			var constants = new sap.ui.model.json.JSONModel(Constants);
			this.getView().setModel(constants, "constants");
			this.editPossible = true;

		},

		onItemSelected: function() {
			//		jQuery.sap.log.debug("cus.crm.myaccounts.view.overview.MarketingAttributes - onItemSelected");
			this._bindDepartments();
		},

		onDepartmentClicked: function(e) {
			this._navToDepartment(e);
		},

		_navToDepartment: function(oEvent) {
			var partner = oEvent.getSource().getProperty("target");
			var service = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
			var nav = service && service("CrossApplicationNavigation");
			if (nav) {
				nav.toExternal({
					target: {
						semanticObject: "ZMyAccountsHE",
						action: "MyAccounts&/detail/AccountCollection('" + partner + "')"
					}
				});
			}
		},

		getList: function() {
			return this.byId("list");
		},

		onAddDepartmentLine: function() {
			this._checkEdit();
			if (this.editPossible === true) {
				this._bindDepartments();
				var oDepartmentsModel = this.getList().getModel("department");
				var aDepartments = oDepartmentsModel.getProperty("/ZDepartments");
				if (aDepartments.length > 0 && !aDepartments[0].partner) {
					return; //return if an empty new line exists
				}

				var oNewDepartment = this._generateTemplateForDepartment();
				oNewDepartment.mode = Constants.modeEdit;
				oNewDepartment.new = true;
				oNewDepartment.notSaved = true;
				aDepartments.push(oNewDepartment);
				oDepartmentsModel.setProperty("/ZDepartments", aDepartments);
				this.getList().setModel(oDepartmentsModel, "department");
			}
		},

		_generateTemplateForDepartment: function() {
			var oData = {};
			oData.partner = "";
			oData.name = "";
			return oData;
		},

		_bindDepartments: function() {
			//		jQuery.sap.log.debug("cus.crm.myaccounts.view.overview.MarketingAttributes - _bindMarketingAttributes");
			var that = this;
			if (!this.getList().getModel("department")) {
				this.getList().setModel(new sap.ui.model.json.JSONModel(), "department");
			}
			this.getList().getModel("department").setProperty("/ZDepartments", []);
			this.getList().setBusy(true);
			cus.crm.myaccounts.util.Util.readODataObjects(that.getView().getBindingContext(), "ZDepartments", [], function(results) {
				// build json model
				if (results) {
					var aDepartments = that.getList().getModel("department").getProperty("/ZDepartments");
					for (var i = 0; i < results.length; i++) {
						var oDep = jQuery.extend({}, that.getView().getModel().getProperty("/" + results[i]));
						oDep.key = results[i];
						aDepartments.push(oDep);
					}
					that.getList().getModel("department").setProperty("/ZDepartments", aDepartments);
					that.getList().setBusy(false);
				}
			});
		},

		onDeleteDepartmentClicked: function(oEvent) {
			this._checkEdit();
			if (this.editPossible === true) {
				var oDepContext = oEvent.getSource().getBindingContext("department");
				var oDepartment = oDepContext.getObject();
				var lineNumber = oDepContext.sPath.substring(14);
				if (oDepartment.notSaved) {
					// new attribute; not yet send to the backend
					this._removeLine(lineNumber);
				} else {
					var sRequestURL = oDepartment.key;
					var oBatchOperation = this.getView().getModel().createBatchOperation(sRequestURL, "DELETE");
					this._collectBatchOperation(oBatchOperation, this._onAfterSave, this._onAfterSaveWithError, lineNumber);
					//				oDepartment.mode = Constants.modeEdit; //needed because _removeCoherentErrorFlags will not consider this line. Also a solution with another mode like "deleteMode" would work
				}
				//			this._savePendingData(); //save other changed lines and sent all operations together
				this._sendBatchOperations();
			}
		},

		_savePendingData: function() {
			var oDepartment = this.getList().getModel("department");
			var aDepartments = oDepartment.getProperty("/ZDepartments");
			for (var i in aDepartments) {
				var oDep = aDepartments[i];
				if (oDep.mode === Constants.modeEdit) {
					//					this._removeCoherentErrorFlags(oMktAttribute); //required to save attributes which collides with each other
					var oBindingContext = this.getView().getBindingContext();
					var editMode = oDep.new ? true : false;
					var sRequestURL, oBatchOperation;

					if (!editMode) {
						sRequestURL = oDep.key; //TODO
						oBatchOperation = oBindingContext.getModel().createBatchOperation(sRequestURL, "PUT", this._getStripedAttribute(oDep), {
							contextPath: "/ZDepartments/" + i
						});
					} else {
						sRequestURL = oBindingContext.sPath + "/ZDepartments";
						oBatchOperation = oBindingContext.getModel().createBatchOperation(sRequestURL, "POST", this._getStripedAttribute(oDep), {
							contextPath: "/ZDepartments/" + i
						});
					}
					this._collectBatchOperation(oBatchOperation, this._onAfterSave, this._onAfterSaveWithError, oDep);
				}
			}
			this._sendBatchOperations();
		},

		_getStripedAttribute: function(oDep) {
			var oDepartment = jQuery.extend({}, oDep);
			delete oDepartment.new;
			delete oDepartment.mode;
			delete oDepartment.key;
			delete oDepartment.notSaved;
			return oDepartment;
		},

		_removeLine: function(lineNumber) {
			var oDepartment = this.getList().getModel("department");
			var aDepartments = oDepartment.getProperty("/ZDepartments");
			aDepartments.splice(lineNumber, 1);
			oDepartment.setProperty("/ZDepartments", aDepartments);
		},

		onSaveDepartmentClicked: function(oEvent) {
			this._checkEdit();
			if (this.editPossible === true) {
				this._savePendingData();
			}
		},

		onEditDepartmentClicked: function(oEvent) {
			this._checkEdit();
			if (this.editPossible === true) {
				var oDepartmentContext = oEvent.getSource().getBindingContext("department");
				var oDepartment = oDepartmentContext.getObject();
				oDepartment.mode = Constants.modeEdit;
				this.refreshUI();
			}
		},

		refreshUI: function() {
			var oDepartment = this.getList().getModel("department");
			var aDepartments = oDepartment.getProperty("/ZDepartments");
			oDepartment.setProperty("/ZDepartments", aDepartments);
		},

		_collectBatchOperation: function(oBatchOperation, callBackSuccess, callBackError, callbackArguments) {
			if (this.requestURIIncludedInQueue(oBatchOperation.requestUri))
				return;
			var oBatch = {
				operation: oBatchOperation,
				callBackSuccess: callBackSuccess,
				callBackError: callBackError,
				callbackArguments: callbackArguments
			};
			if (oBatchOperation.method === 'DELETE') {
				//  process DELETE operations first --> add oBatch on index 0
				this.BatchOperations.unshift(oBatch);
			} else {
				this.BatchOperations.push(oBatch);
			}
		},

		requestURIIncludedInQueue: function(requestUri) {
			for (var i in this.BatchOperations)
				if (this.BatchOperations[i].operation.requestUri === requestUri)
					return true;
			return false;
		},

		_sendBatchOperations: function() {
			//some operations can be combined but saving changes should be separate because in batch either everything or nothing is saved
			if (!this.BatchOperations.length) {
				this.refreshUI(); //if the queue is empty, refresh UI
				this._setBusy(false);
				return;
			}
			var aBatchOperationsForProcessing = [];
			var that = this;
			var continueProcessing = true;
			var batchMethod = this.BatchOperations[0].operation.method;
			var aBatchOperation = [];
			while (continueProcessing && this.BatchOperations.length) {
				if (batchMethod === this.BatchOperations[0].operation.method) {
					aBatchOperationsForProcessing.push(this.BatchOperations[0]);
					aBatchOperation.push(this.BatchOperations[0].operation);
					this.BatchOperations.splice(0, 1);
				} else {
					continueProcessing = false;
				}
			}
			var backendBatchRequestFunction = cus.crm.myaccounts.util.Util.sendBatchChangeOperations;
			if (batchMethod === 'GET')
				backendBatchRequestFunction = cus.crm.myaccounts.util.Util.sendBatchReadOperations;

			backendBatchRequestFunction(
				this.getView().getModel(), aBatchOperation,
				function(_aResponseObjects) {
					var aResponseObjects = _aResponseObjects;
					if (batchMethod === 'GET') { //read delivers the response in different format
						aResponseObjects = [];
						for (var key in _aResponseObjects)
							aResponseObjects.push(_aResponseObjects[key]);
					}
					for (var i in aBatchOperationsForProcessing) {
						if (aBatchOperationsForProcessing[i].callBackSuccess) {
							var aArguments = [];
							var oResponseObject = null;
							if (aResponseObjects.length > i)
								oResponseObject = aResponseObjects[i];
							aArguments.push(aBatchOperationsForProcessing[i].operation);
							aArguments.push(oResponseObject);
							if (aBatchOperationsForProcessing[i].callbackArguments instanceof Array) {
								aArguments = $.merge(aArguments, aBatchOperationsForProcessing[i].callbackArguments);
							} else {
								aArguments.push(aBatchOperationsForProcessing[i].callbackArguments);
							}
							aBatchOperationsForProcessing[i].callBackSuccess.apply(that, aArguments);
						}
					}
					that._sendBatchOperations();
				},
				function(oError) {
					for (var i in aBatchOperationsForProcessing) {
						if (aBatchOperationsForProcessing[i].callBackError) {
							var aArguments = [];
							aArguments.push(aBatchOperationsForProcessing[i].operation);
							aArguments.push(oError);
							if (aBatchOperationsForProcessing[i].callbackArguments instanceof Array) {
								aArguments = $.merge(aArguments, aBatchOperationsForProcessing[i].callbackArguments);
							} else {
								aArguments.push(aBatchOperationsForProcessing[i].callbackArguments);
							}
							aBatchOperationsForProcessing[i].callBackError.apply(that, aArguments);
						}
					}
					that.refreshUI();
				}
			);
		},

		_setBusy: function(busy) {
			if (!this.oBusyDialog)
				this.oBusyDialog = new sap.m.BusyDialog();
			if (busy)
				this.oBusyDialog.open();
			else
				this.oBusyDialog.close();
		},

		_copyAttributesOfObject2ToObject1: function(object1, object2) {
			if (!object2)
				return;
			for (var key in object1) {
				if (object2.hasOwnProperty(key))
					object1[key] = object2[key];
			}
		},

		_onAfterSave: function(oBatchOperation, oResponseObject, callbackArgument) {
			var oDepartment = callbackArgument;
			switch (oBatchOperation.method) {
				case "DELETE":
					//after delete remove line in table
					var lineNumber = callbackArgument;
					this._removeLine(lineNumber);
					return;
				case "POST":
					delete oDepartment.mode;
					delete oDepartment.notSaved;
					this._copyAttributesOfObject2ToObject1(oDepartment, oResponseObject);
					this._bindDepartments();
					break;
				case "PUT":
					delete oDepartment.mode;
					delete oDepartment.notSaved;
					this._copyAttributesOfObject2ToObject1(oDepartment, oResponseObject);
					break;
			}
			this.refreshUI();
		},

		showAccountF4: function(oEvent) {
			if (!this._accountSelectDialog) {
				this._accountSelectDialog = new sap.ui.xmlfragment("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.ZAccountSelectDialog", this);
				this._accountSelectDialog.setModel(this.getView().getModel());
				this._accountSelectDialog.setModel(this.getView().getModel("i18n"), "i18n");

			}
			var oDepartment = oEvent.getSource().getBindingContext("department").getObject();
			var oDataTemplate = new sap.ui.core.CustomData({
				key: "accountID"
			});
			oDataTemplate.bindProperty("value", "accountID");
			this.accountF4Template = new sap.m.StandardListItem({
				title: "{fullName}",
				active: true
			});
			this.accountF4Template.addCustomData(oDataTemplate);
			var oFilter = new sap.ui.model.Filter("category", sap.ui.model.FilterOperator.EQ, "2");
			var oFilter2 = new sap.ui.model.Filter("fullName", sap.ui.model.FilterOperator.NE, "");
			this._accountSelectDialog.getAggregation('_dialog').getContent()[1].bindAggregation("items", {
				path: "/AccountCollection",
				parameters: {
					select: "accountID,fullName"
				},
				filters: [oFilter, oFilter2],
				template: this.accountF4Template
			});
			this._accountSelectDialog.oDepartment = oDepartment;
			this._accountSelectDialog.open();
		},

		closeAccountF4: function(oEvent) {
			this.byId('dialogAccountF4').close();
			this.accountf4open = "";
		},

		setAccount: function(oEvent) {
			var selectedItem = oEvent.getParameter("selectedItem");
			var accountName = selectedItem.getProperty("title");
			var accountId = selectedItem.getCustomData()[0].getProperty("value");

			var oDepartment = this._accountSelectDialog.oDepartment;
			oDepartment.partner = accountId;
			oDepartment.name = accountName;
			this.refreshUI();
		},

		searchAccount: function(oEvent) {

			var sValue = oEvent.getParameter("value");
			var aFilters = [];

			if (sValue !== "") {

				//var sAccountAnnotation = cus.crm.opportunity.util.schema._getEntityAnnotation(this.oModel,'service-schema-version','Account');
				var filterName = "fullName";
				//push the necessary filter
				//aFilters.push(new sap.ui.model.Filter(((sAccountAnnotation === null) ? "name1" : "fullName"), sap.ui.model.FilterOperator.Contains, sValue));
				aFilters.push(new sap.ui.model.Filter(filterName, sap.ui.model.FilterOperator.Contains, sValue));
			}

			var itemsBinding = oEvent.getParameter("itemsBinding");

			if (itemsBinding) {
				itemsBinding.aApplicationFilters = [];
				itemsBinding.filter(aFilters);

			}

		},

		getFooterButtons: function() {
			var that = this;
			if (this.getView().getBindingContext().getProperty("zIsMyTerritory") === false) {
				return;
			} else {
				return [{
					sIcon: "sap-icon://add",
					sTooltip: cus.crm.myaccounts.util.Util.geti18NText("ZADD_DEPARTMENT_TOOLTIP"),
					sId: "addButton",
					onBtnPressed: function() {
						that.onAddDepartmentLine();
					}
				}];
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
						that._bindDepartments();
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
		
		onSubViewLiveSearch: function(searchString) {
			var oBinding = this.getList().getBinding("items");
			var aFilters = [];
			if(searchString !== "") {
				aFilters.push(new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, searchString));
			}
			if(oBinding) {
				oBinding.filter(aFilters);
			}
		}

	});

});