jQuery.sap.require("sap.ca.scfld.md.controller.BaseFullscreenController");
jQuery.sap.require("cus.crm.myaccounts.util.formatter");
jQuery.sap.require("cus.crm.myaccounts.util.Util");
cus.crm.myaccounts.NavigationHelper = {};
sap.ui.controller("cus.crm.myaccounts.ZCRM_MYACC_EM2.view.S360Custom", {
	    onInit: function () {
	        this.oRouter.attachRouteMatched(this.handleNavTo, this);
	        this.backendSupportsEdit = cus.crm.myaccounts.util.Util.getServiceSchemaVersion(this.getView().getModel(), "AccountCollection") > 0;
	    },
	    onAfterRendering: function () {
	        $(".sapCRMmyAccountsHeader .sapMFlexItem").attr("style", "float:left");
	    },
	    handleNavTo: function (e) {
	        if (e.getParameter("name") === "s360") {
	            var c = this, v = this.getView(), m = v.getModel(), p = "/" + e.getParameter("arguments").contextPath, a = new sap.ui.model.Context(m, "/" + e.getParameter("arguments").contextPath), b = function () {
	                    v.setBindingContext(a);
	                    var o = c._getHeaderFooterOptions();
	                    c.setHeaderFooterOptions(o);
	                };
	            v.setBindingContext(undefined);
	            m.createBindingContext(p, "", { expand: this._getExpandForDataBinding() }, b, true);
	        }
	    },
	    _getExpandForDataBinding: function () {
	        return "AccountFactsheet,AccountFactsheet/Attachments,Logo,AccountFactsheet/Opportunities,AccountFactsheet/Notes,AccountFactsheet/Contacts,AccountFactsheet/Contacts/WorkAddress,AccountFactsheet/Leads,AccountFactsheet/Tasks,Classification,MainAddress,EmployeeResponsible,EmployeeResponsible/WorkAddress";
	    },
	    _getSelectedText: function () {
	        var a = this.getView().getModel().getProperty(this.getView().getBindingContext().sPath);
	        var t = cus.crm.myaccounts.util.formatter.AccountNameFormatter(a.fullName, a.name1) + "\n";
	        var m = this.getView().getModel().getProperty(this.getView().getBindingContext().sPath + "/MainAddress");
	        if (m)
	            t += m.address;
	        return t;
	    },
	    _getShareDisplay: function () {
	        var a = this.getView().getModel().getProperty(this.getView().getBindingContext().sPath);
	        var t = cus.crm.myaccounts.util.formatter.AccountNameFormatter(a.fullName, a.name1);
	        var m = this.getView().getModel().getProperty(this.getView().getBindingContext().sPath + "/MainAddress");
	        var b = "";
	        if (m)
	            b = m.address;
	        return new sap.m.StandardListItem({
	            title: t,
	            description: b
	        });
	    },
	    _getDiscussID: function () {
	        var u = document.createElement("a");
	        u.href = this.getView().getModel().sServiceUrl;
	        return u.pathname + this.getView().getBindingContext().sPath;
	    },
	    _getDiscussType: function () {
	        var u = document.createElement("a");
	        u.href = this.getView().getModel().sServiceUrl;
	        return u.pathname + "/$metadata#AccountCollection";
	    },
	    _getDiscussName: function () {
	        var a = this.getView().getModel().getProperty(this.getView().getBindingContext().sPath);
	        return cus.crm.myaccounts.util.formatter.AccountNameFormatter(a.fullName, a.name1);
	    },
	    _getHeaderFooterOptions: function () {
	        var t = this;
	        var b = [];
	        if (this.backendSupportsEdit) {
	            b.push({
	                sI18nBtnTxt: "BUTTON_EDIT",
	                onBtnPressed: function () {
	                    var p;
	                    p = { contextPath: t.getView().getBindingContext().sPath.substr(1) };
	                    t.oRouter.navTo("edit", p, false);
	                }
	            });
	        }
	        return {
	            buttonList: b,
	            sI18NFullscreenTitle: "DETAIL_TITLE",
	            onBack: function () {
	                window.history.back();
	            },
	            oJamOptions: {
	                oShareSettings: {
	                    oDataServiceUrl: "/sap/opu/odata/sap/SM_INTEGRATION_SRV/",
	                    object: {
	                        id: document.URL.replace(/&/g, "%26"),
	                        display: t._getShareDisplay(),
	                        share: t._getSelectedText()
	                    }
	                },
	                oDiscussSettings: {
	                    oDataServiceUrl: "/sap/opu/odata/sap/SM_INTEGRATION_SRV/",
	                    feedType: "object",
	                    object: {
	                        id: t._getDiscussID(),
	                        type: t._getDiscussType(),
	                        name: t._getDiscussName(),
	                        ui_url: document.URL
	                    }
	                }
	            },
	            oAddBookmarkSettings: { icon: "sap-icon://Fiori2/F0002" }
	        };
	    },
	    navToOpportunity: function () {
	        var Q = this.getView().getModel().getProperty(this.getView().getBindingContext().sPath + "/AccountFactsheet/opportunitiesCount");
	        this.navToOtherApplication("Opportunity", "manageOpportunity", this.getView().getModel().getProperty(this.getView().getBindingContext().sPath).accountID, Q, this.getView().getModel().getProperty(this.getView().getBindingContext().sPath).name1);
	    },
	    navToLead: function () {
	        var Q = this.getView().getModel().getProperty(this.getView().getBindingContext().sPath + "/AccountFactsheet/leadsCount");
	        this.navToOtherApplication("Lead", "manageLead", this.getView().getModel().getProperty(this.getView().getBindingContext().sPath).accountID, Q, this.getView().getModel().getProperty(this.getView().getBindingContext().sPath).name1);
	    },
	    navToAppointments: function () {
	        var a = this.getView().getModel().getProperty(this.getView().getBindingContext().sPath).accountID;
	        var n = this.getView().getBindingContext().sPath + "/AccountFactsheet/nextContact/fromDate";
	        var b = this.getView().getModel().getProperty(n);
	        var Q = this.getView().getModel().getProperty(this.getView().getBindingContext().sPath + "/AccountFactsheet/futureActivitiesCount");
	        var f = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
	        this.oCrossAppNavigator = f && f("CrossApplicationNavigation");
	        if (null === b) {
	            b = new Date();
	        }
	        var c = this.getDateParameterfromDate(b);
	        cus.crm.myaccounts.NavigationHelper.qty = Q;
	        cus.crm.myaccounts.NavigationHelper.accountName = this.getView().getModel().getProperty(this.getView().getBindingContext().sPath).name1;
	        this.oRouter.detachRouteMatched(this.handleNavTo, this, this);
	        if (this.oCrossAppNavigator)
	            this.oCrossAppNavigator.toExternal({
	                target: {
	                    semanticObject: "Appointment",
	                    action: "myAppointments"
	                },
	                params: {
	                    "accountID": [a],
	                    "Date": [c]
	                }
	            });
	    },
	    getDateParameterfromDate: function (d) {
	        var D = d.getDate().toString();
	        D = D.length === 1 ? "0" + D : D;
	        var m = d.getMonth() + 1;
	        m = m.toString();
	        m = m.length === 1 ? "0" + m : m;
	        var y = d.getFullYear();
	        var s = "" + y + m + D;
	        return s;
	    },
	    navToTask: function () {
	        var Q = this.getView().getModel().getProperty(this.getView().getBindingContext().sPath + "/AccountFactsheet/tasksCount");
	        this.navToOtherApplication("Task", "manageTasks", this.getView().getModel().getProperty(this.getView().getBindingContext().sPath).accountID, Q, this.getView().getModel().getProperty(this.getView().getBindingContext().sPath).name1);
	    },
	    navToNote: function (e) {
	        this.oRouter.navTo("AccountNotes", { contextPath: e.getSource().getBindingContext().sPath.replace("/", "") });
	    },
	    navToContact: function () {
	        var Q = this.getView().getModel().getProperty(this.getView().getBindingContext().sPath + "/AccountFactsheet/contactsCount");
	        this.navToOtherApplication("ContactPerson", "MyContacts", this.getView().getModel().getProperty(this.getView().getBindingContext().sPath).accountID, Q, this.getView().getModel().getProperty(this.getView().getBindingContext().sPath).name1);
	    },
	    navToOtherApplication: function (t, a, b, q, c) {
	        var f = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
	        this.oCrossAppNavigator = f && f("CrossApplicationNavigation");
	        cus.crm.myaccounts.NavigationHelper.qty = q;
	        cus.crm.myaccounts.NavigationHelper.accountName = c;
	        this.oRouter.detachRouteMatched(this.handleNavTo, this, this);
	        if (this.oCrossAppNavigator)
	            this.oCrossAppNavigator.toExternal({
	                target: {
	                    semanticObject: t,
	                    action: a
	                },
	                params: { "accountID": [b] }
	            });
	    },
	    navToAttachment: function (e) {
	        this.oRouter.navTo("AccountAttachments", { contextPath: e.getSource().getBindingContext().sPath.replace("/", "") });
	    }
});