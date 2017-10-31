sap.ui.controller("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.TasksCustom", {
	getFooterButtons: function() {
		var that = this;
		if (this.getView().getBindingContext().getProperty("zIsMyTerritory") === false) {
			this.getView().byId("taskInput").setVisible(false);
			return;
		} else {
			return [{
				sIcon: "sap-icon://add",
				sTooltip: cus.crm.myaccounts.util.Util.geti18NText("ADD_TASK_TOOLTIP"),
				onBtnPressed: function() {
					that.onCreateTask();
				}
			}];
		}
	},

	_navigateToCreationOfTask: function(processType) {
		if (sap.ushell && sap.ushell.Container) {
			var fgetService = sap.ushell.Container.getService;
			if (fgetService) {
				var oCrossAppNavigator = fgetService("CrossApplicationNavigation");
				if (oCrossAppNavigator) {
					var accountID = this.getView().getModel().getProperty(this.getView().getBindingContext().sPath).accountID;
					oCrossAppNavigator.toExternal({
						target: {
							semanticObject: "ZMyTasksHE",
							action: "manageTasks"
						},
						params: {
							createFromAccount: "X",
							accountID: accountID
						},
						appSpecificRoute: "&/newTask/" + processType
					});
				}
			}
		}
	},
	_navigateToTask: function(oTask) {
		if (sap.ushell && sap.ushell.Container) {
			var fgetService = sap.ushell.Container.getService;
			if (fgetService) {
				var oCrossAppNavigator = fgetService("CrossApplicationNavigation");
				if (oCrossAppNavigator) {
					oCrossAppNavigator.toExternal({
						target: {
							semanticObject: "ZMyTasksHE",
							action: "manageTasks"
						},
						params: {
							fromAccount: "X"
						},
						appSpecificRoute: "&/taskOverview/Tasks(guid'" + oTask.getProperty("Guid") + "')"
					});
				}
			}
		}
	}
});