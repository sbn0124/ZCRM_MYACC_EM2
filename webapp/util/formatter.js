jQuery.sap.declare("cus.crm.myaccounts.ZCRM_MYACC_EM2.util.formatter");

this.cus.crm.myaccounts.ZCRM_MYACC_EM2.util.formatter = {

	formatSamplingStatus: function(status) {
		if (status !== "" && status !== null) {
			var that = this;
			this.getModel().read("/ZCustomizingSampleStatusCollection('" + status + "')", {
				success: function _OnSuccess(oData, response) {
					that.setText(oData.description);
					//	return oData.description;
				}
			});
		}
	},

	formatAccIndStatus: function(status) {
		if (status !== "" && status !== null) {
			var that = this;
			this.getModel().read("/ZCustomizingAccIndStatusCollection('" + status + "')", {
				success: function _OnSuccess(oData, response) {
					that.setText(oData.zstatus);
				}
			});
		}
	},

	formatAddrKind: function(addrKind) {
		switch (addrKind) {
			case "":
				return cus.crm.myaccounts.util.Util.geti18NText("ZSTANDARD_ADDR");
			case "ISM_WE":
				return cus.crm.myaccounts.util.Util.geti18NText("ZSHIP_TO");
			case "HOME":
				return cus.crm.myaccounts.util.Util.geti18NText("ZHOME_ADDR");
			case "MAIN_WORK":
				return cus.crm.myaccounts.util.Util.geti18NText("ZWORK_ADDR");
			case "ZUSEHOME":
				return cus.crm.myaccounts.util.Util.geti18NText("ZUSEHOME");
			case "ZUSEWORK":
				return cus.crm.myaccounts.util.Util.geti18NText("ZUSEWORK");
			default:
				return addrKind;
		}
	},

	formatContactID: function(contactID) {
		if (contactID) {
			return contactID;
		} else {
			this.setEnabled(false);
			return "None";
		}
	}
};

this.cus.crm.myaccounts.ZCRM_MYACC_EM2.util.formatter.showModuleStatus = function(status) {

	if (status === 'A') //Active
	{
	//	return this.cus.crm.myaccounts.util.Util.geti18NText("ZACTIVE");
	    return 'Active';
	} else if (status === 'I') //Inactive
	{
	//	return this.cus.crm.myaccounts.util.Util.geti18NText("ZINACTIVE");
	    return 'Inactive';
	} else {
		return "-";
	}

};