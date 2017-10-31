jQuery.sap.require("cus.crm.myaccounts.ZCRM_MYACC_EM2.util.formatter");
jQuery.sap.require("cus.crm.myaccounts.util.formatter");
sap.ui.controller("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.OverviewPageCustom", {

	extHookAdaptAvailableSubViews: function(tabs) {
		// Place your hook implementation code here 
		var sTab = tabs;
		var Departments = {
			hidden: undefined,
			//			hidden: cus.crm.myaccounts.util.formatter.isEqual('category', 'constants>/accountCategoryPerson'),
			//			hidden: "{parts:['category', 'constants>/accountCategoryPerson'], formatter: 'cus.crm.myaccounts.util.formatter.isEqual'}",
			key: "department",
			name: "Departments",
			viewName: "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.DepartmentsCustom"
		};
		var Modules = {
			hidden: undefined,
			key: "module",
			name: "Modules",
			viewName: "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.ModulesCustom"
		};
		var Addresses = {
			hidden: undefined,
			key: "address",
			name: "Addresses",
			viewName: "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.Addresses"
		};
		
		// https://jira.springer-sbm.com/browse/SAPSUP-13559
		// delete Leads, Quoatations, Sales Orders from DropDownList
		sTab.splice(7, 1);
		sTab.splice(8, 2);
		// https://jira.springer-sbm.com/browse/SAPSUP-13559
		
		sTab.push(Departments);
		sTab.push(Modules);
		sTab.push(Addresses);
		return sTab;
	}

	/*	onAfterRendering: function() {

			var oTabs = this.oTabConfigurationModel.getData().Tabs;
			var result = oTabs.filter(function(obj) {
				return obj.key === "department";
			});
			var allTabs = oTabs.filter(function(obj) {
				return obj.key !== "department";
			});
			result[0].hidden = true;
			allTabs.push(result[0]);
			this.oTabConfigurationModel.getData().Tabs = allTabs;
		}*/

});