jQuery.sap.require("cus.crm.myaccounts.ZCRM_MYACC_EM2.util.Constants");

sap.ui.controller("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.search.SearchResultCustom", {
	/*
	 * Change the order of filters (MyCorporateAccounts by default)
	 */
	_getPossibleAccountFilters: function() {
		if (this.EHP2Backend) {
			return [cus.crm.myaccounts.util.Constants.filterMyAccounts,
				cus.crm.myaccounts.util.Constants.filterAllAccounts
			];
		}
		return [cus.crm.myaccounts.util.Constants.filterMyCorporateAccounts,
		//	cus.crm.myaccounts.ZCRM_MYACC_EM2.util.Constants.filterMyTerritoryCorporateAccounts,
			cus.crm.myaccounts.util.Constants.filterMyAccounts,
			cus.crm.myaccounts.util.Constants.filterMyIndividualAccounts,
			cus.crm.myaccounts.util.Constants.filterAllAccounts,
			cus.crm.myaccounts.util.Constants.filterAllIndividualAccounts,
			cus.crm.myaccounts.util.Constants.filterAllCorporateAccounts,
		];
	},

	/*
	 * Change default filterMyAccounts to filterMyCorporateAccounts
	 */
	_handleNavToWithFilter: function(oEvent) {
		// In case of doing a cross-app navigation from MyAccounts to another app
		// and then doing a back navigation to the result list in MyAccounts,
		// the filter should be kept
		jQuery.sap.log.debug("cus.crm.myaccounts.view.search.SearchResult - handleNavTo");
		if (oEvent.getParameter("name") === "mainPage" || oEvent.getParameter("name") === "S2") {
			var filterState = oEvent.getParameter("arguments").filterState;
			if (filterState) {
				this.selectedKey = filterState;
			} else {
				this.selectedKey = cus.crm.myaccounts.util.Constants.filterMyCorporateAccounts; //filterMyAccounts;
			}
			this._bindTable();
			this.setHeaderFooterOptions(this._getHeaderFooterOptions());
		}
	},

	//add territory as a filter if filter is set to distinguish in odata service
	_getFilters: function() {
		var aFilters = [];

		// Add filter with search value
		var searchValue = this.byId("mySearchField").getValue();
		if (searchValue && searchValue.length > 0) {
			aFilters.push(new sap.ui.model.Filter("fullName", sap.ui.model.FilterOperator.Contains, searchValue));
		}

		// Add filter for property "isMyAccount"
		var isMyAccounts = this.selectedKey.indexOf("MY") >= 0;
		aFilters.push(new sap.ui.model.Filter("isMyAccount", sap.ui.model.FilterOperator.EQ, isMyAccounts));

		//SAPSUP-12447 Add filter for property "isMyTerritory" 
		var zIsMyTerritory = this.selectedKey.indexOf("TERRITORY") >= 0;
		aFilters.push(new sap.ui.model.Filter("zIsMyTerritory", sap.ui.model.FilterOperator.EQ, zIsMyTerritory));

		// Add filter with account category
		if (this.selectedKey.indexOf("INDIVIDUAL") >= 0) {
			aFilters.push(new sap.ui.model.Filter("category", sap.ui.model.FilterOperator.EQ, cus.crm.myaccounts.util.Constants.accountCategoryPerson));
		} else if (this.selectedKey.indexOf("CORPORATE") >= 0) {
			aFilters.push(new sap.ui.model.Filter("category", sap.ui.model.FilterOperator.EQ, cus.crm.myaccounts.util.Constants.accountCategoryCompany));
		} else if (this.selectedKey.indexOf("GROUP") >= 0) {
			aFilters.push(new sap.ui.model.Filter("category", sap.ui.model.FilterOperator.EQ, cus.crm.myaccounts.util.Constants.accountCategoryGroup));
		}

		return aFilters;
	},
	_onBindingChange: function() {
		var title = "";
		switch (this.selectedKey) {
			case cus.crm.myaccounts.util.Constants.filterMyAccounts:
				title = "MY_ACCOUNT_TITLE";
				break;
			case cus.crm.myaccounts.util.Constants.filterMyIndividualAccounts:
				title = "MY_INDIVIDUAL_ACCOUNT_TITLE";
				break;
			case cus.crm.myaccounts.util.Constants.filterMyCorporateAccounts:
				title = "MY_CORPORATE_ACCOUNT_TITLE";
				break;
			case cus.crm.myaccounts.util.Constants.filterMyAccountGroups:
				title = "MY_ACCOUNT_GROUP_TITLE";
				break;
			case cus.crm.myaccounts.util.Constants.filterAllAccounts:
				title = "ALL_ACCOUNTS_TITLE";
				break;
			case cus.crm.myaccounts.util.Constants.filterAllIndividualAccounts:
				title = "ALL_INDIVIDUAL_ACCOUNTS_TITLE";
				break;
			case cus.crm.myaccounts.util.Constants.filterAllCorporateAccounts:
				title = "ALL_CORPORATE_ACCOUNTS_TITLE";
				break;
			case cus.crm.myaccounts.util.Constants.filterAllAccountGroups:
				title = "ALL_ACCOUNT_GROUPS_TITLE";
				break;
			case cus.crm.myaccounts.ZCRM_MYACC_EM2.util.Constants.filterMyTerritoryCorporateAccounts:
				title = "MY_TERRITORY'S_CORPORATE_ACCOUNTS_TITLE";
				break;
		}

		var count = 0;
		var oBinding = this.getList().getBinding("items");

		if (oBinding) {
			count = oBinding.getLength();
		}
		// Work around so that in the case there is a '0' count, the '0' is displayed properly in the title
		if (count > 0) {
			this._oControlStore.oTitle.setText(cus.crm.myaccounts.util.Util.geti18NText1(title, count));
		} else {
			this._oControlStore.oTitle.setText(cus.crm.myaccounts.util.Util.geti18NText1(title, "0"));
		}
	}

});