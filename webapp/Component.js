jQuery.sap.declare("cus.crm.myaccounts.ZCRM_MYACC_EM2.Component");
// use the load function for getting the optimized preload file if present
sap.ui.component.load({
	name: "cus.crm.myaccounts",
	// Use the below URL to run the extended application when SAP-delivered application is deployed on SAPUI5 ABAP Repository
	url: "/sap/bc/ui5_ui5/sap/CRM_MYACCOUNTS" // we use a URL relative to our own component
		// extension application is deployed with customer namespace
});
(function() {
	jQuery.sap.registerModulePath("sap.cus.crm.lib.reuse", "/sap/bc/ui5_ui5/sap/crm_lib_reuse/sap/cus/crm/lib/reuse");
}());
this.cus.crm.myaccounts.Component.extend("cus.crm.myaccounts.ZCRM_MYACC_EM2.Component", {
	metadata: {
		version: "1.0",
		config: {
			"sap.ca.serviceConfigs": [{
				"name": "CRM_BUPA_ODATA",
				"serviceUrl": "/sap/opu/odata/sap/ZCRM_BUPA_ODATA_EM_SRV/",
				"isDefault": true,
				"useBatch": true,
				"countSupported": true,
				"mockedDataSource": "./model/metadata.xml"
			}],
			"sap.ca.i18Nconfigs": {
				"bundleName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.i18n.i18n"
			},
			"serviceConfig": {
				"name": "ZCRM_BUPA_ODATA_EM_SRV",
				"serviceUrl": "/sap/opu/odata/sap/ZCRM_BUPA_ODATA_EM_SRV/"
			}
		},
		routing: {
			"config": {
				"routerClass": "sap.m.routing.Router",
				"viewType": "XML",
				"viewPath": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view",
				"controlId": "fioriContent",
				"controlAggregation": "pages"
			},
			"routes": {
				"createAddress": {
					"pattern": "CreateAddress/{contextPath}",
					"view": "maintain.CreateAddress",
					"target": "createAddress"
				}
			},
			"targets": {
				"createAddress": {
					"viewName": "maintain.CreateAddress"
				}
			}
		},
		customizing: {
			"sap.ui.viewReplacements": {
				"cus.crm.myaccounts.view.overview.Opportunities": {
					"viewName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.OpportunitiesCustom",
					"type": "XML"
				},
				"cus.crm.myaccounts.view.maintain.GeneralDataEdit": {
					"viewName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.GeneralDataEditCustom",
					"type": "XML"
				},
				"cus.crm.myaccounts.view.overview.Contacts": {
					"viewName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.ContactsCustom",
					"type": "XML"
				},
				"cus.crm.myaccounts.view.overview.MarketingAttributes": {
					"viewName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.MarketingAttributesCustom",
					"type": "XML"
				},
				"cus.crm.myaccounts.view.overview.GeneralData": {
					"viewName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.GeneralDataCustom",
					"type": "XML"
				}
			},
			"sap.ui.controllerExtensions": {
				"cus.crm.myaccounts.view.overview.Opportunities": {
					"controllerName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.OpportunitiesCustom"
				},
				"cus.crm.myaccounts.view.overview.GeneralData": {
					"controllerName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.GeneralDataCustom"
				},
				"cus.crm.myaccounts.view.maintain.GeneralDataEdit": {
					"controllerName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.GeneralDataEditCustom"
				},
				"cus.crm.myaccounts.view.overview.OverviewPage": {
					"controllerName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.OverviewPageCustom"
				},
				"cus.crm.myaccounts.view.overview.Contacts": {
					"controllerName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.ContactsCustom"
				},
				"cus.crm.myaccounts.view.overview.MarketingAttributes": {
					"controllerName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.MarketingAttributesCustom"
				},
				"cus.crm.myaccounts.view.overview.Attachments": {
					"controllerName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.AttachmentsCustom"
				},
				"cus.crm.myaccounts.view.overview.Notes": {
					"controllerName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.NotesCustom"
				},
				"cus.crm.myaccounts.view.overview.Tasks": {
					"controllerName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.TasksCustom"
				},
				"cus.crm.myaccounts.view.overview.Appointments": {
					"controllerName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.AppointmentsCustom"
				},
				"cus.crm.myaccounts.view.search.SearchResult": {
					"controllerName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.search.SearchResultCustom"
				},
				"cus.crm.myaccounts.view.S360": {
					"controllerName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.S360Custom"
				}
			},
			"sap.ui.viewExtensions": {
				"cus.crm.myaccounts.view.overview.GeneralData": {
					"extDisplayFormMiddle": {
						"className": "sap.ui.core.Fragment",
						"fragmentName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.GeneralData_extDisplayFormMiddleCustom",
						"type": "XML"
					},
					"extDisplayFormAddress": {
						"className": "sap.ui.core.Fragment",
						"fragmentName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.GeneralData_extDisplayFormAddressCustom",
						"type": "XML"
					}
				},
				"cus.crm.myaccounts.view.overview.GeneralDataCompany": {
					"extDisplayFormCompany": {
						"className": "sap.ui.core.Fragment",
						"fragmentName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.overview.GeneralData_extDisplayFormCompanyCustom",
						"type": "XML"
					}
				},
				"cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.GeneralDataEditCustom": {
					"extEditFormMiddle": {
						"className": "sap.ui.core.Fragment",
						"fragmentName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.GeneralDataEdit_extEditFormMiddleCustom",
						"type": "XML"
					},
					"extEditFormAddress": {
						"className": "sap.ui.core.Fragment",
						"fragmentName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.GeneralDataEdit_extEditFormAddressCustom",
						"type": "XML"
					}
				},
				"cus.crm.myaccounts.view.maintain.GeneralDataEditCompany": {
					"extEditFormCompany": {
						"className": "sap.ui.core.Fragment",
						"fragmentName": "cus.crm.myaccounts.ZCRM_MYACC_EM2.view.maintain.GeneralDataEdit_extEditFormCompanyCustom",
						"type": "XML"
					}
				}
			},
			"sap.ui.viewModifications": {
				"cus.crm.myaccounts.view.search.SearchResult": {
					"contactColumn": {
						"visible": false
					}
				},
				"cus.crm.myaccounts.view.maintain.GeneralDataEdit": {
					"birthDateLabel": {
						"visible": false
					}
				}
			}
		}
	},
	init: function() {
		this.getRouter().initialize();
	}
});