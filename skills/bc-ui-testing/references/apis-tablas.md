# APIs estándar de BC → tabla origen (BC 29.1 ES, 18/11/2026)

Una fila por entidad y ruta, tal como las expone el entorno (`apicategoryroutes` + `$metadata`). Tabla = `SourceTable` de la página API o primer `dataitem` de la query API, sacado del código AL (Base App, System App, API V2, E-Document, Quality Management, Sustainability) o de los símbolos descargados del entorno (`dev/packages`, sirve con la app S2S).
- Se omiten las 6 entidades comunes a todas las rutas: apicategoryroutes, companies, entityDefinitions, externalbusinesseventdefinitions, externaleventsubscriptions, subscriptions.
- **→ datos en**: la página usa una tabla Aggregate/Buffer (temporal o espejo) y los datos reales salen de esas tablas.
- En queries (analytics, reportsFinance) la tabla es la del **primer dataitem**: si es una cabecera (p. ej. Sales Header en líneas pendientes), la query cruza con las líneas.
- *(tabla de sistema)*: tabla de la plataforma (ID 2000000xxx), sin código AL.
- Regenerar tras cada versión mayor con los scripts de `scripts/api-map/` (inventario del entorno + mapeo).
### microsoft/admin/beta
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| supportContactInformation | Support Contact Information (9165) | page 9166 Support Contact Info. Entity |

### microsoft/analytics/v0.5
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| accountCategories | Account Category | query 36954 Account Categories |
| assemblyHeaders | Assembly Header (900) | query 36964 Assembly Headers - Order |
| assemblyLines | Assembly Line (901) | query 36965 Assembly Lines - Item |
| balanceSheetGeneralLedgerEntries | G/L Account (15) | query 36955 G\L Entries - Balance Sheet |
| bins | Bin (7354) | query 36966 Bins |
| calendarEntries | Calendar Entry (99000757) | query 36983 Calendar Entries |
| capacityLedgerEntries | Capacity Ledger Entry (5832) | query 36984 Capacity Ledger Entries |
| closeIncomeStmtSourceCodes | PBI C. Income St. Source Code | query 37013 Close Income Source - PBI API |
| closeOpportunityCodes | Close Opportunity Code (5094) | page 37083 Close Opp. Code - PBI API |
| closingGeneralLedgerEntries | G/L Account (15) | query 36956 G/L Entries - Closing |
| contacts | Contact (5050) | page 36966 Contacts - PBI API |
| customerLedgerEntries | Cust. Ledger Entry (21) | query 36957 Customer Ledger Entries |
| customers | Customer (18) | page 36954 Customers |
| dateSetups | sin tabla (página calculada) | page 36955 Date Setup |
| dimensions | General Ledger Setup (98) | query 36952 Dimensions |
| dimensionSetEntries | PowerBI Flat Dim. Set Entry | query 36950 PowerBI Dimension Set Entries |
| dynamicDimensions | Dimension Set Entry (480) | query 37016 Dynamic Dimensions - PBI API |
| fromBinWarehouseJournalLines | Warehouse Journal Line (7311) | query 36980 Whse. Journal Lines - From Bin |
| generalLedgerAccountCategories | G/L Account Category (570) | query 36958 G/L Account Categories |
| generalLedgerAccounts | G/L Account (15) | query 36959 G/L Accounts |
| generalLedgerBudgetEntries | G/L Budget Entry (96) | query 36960 G/L Budget Entries - PBI API |
| generalLedgerBudgets | G/L Budget Name (95) | query 36961 G/L Budgets |
| generalLedgerSetups | General Ledger Setup (98) | page 36956 General Ledger Setup - PBI API |
| incomeStatementGeneralLedgerEntries | G/L Account (15) | query 36962 G/L Entries - Income Statement |
| incomeStmtGeneralLedgerEntries | G/L Account (15) | query 37014 G/L Income Statement - PBI API |
| inventoryAdjustmentEntryOrders | Inventory Adjmt. Entry (Order) (5896) | query 37020 Inv. Adj. Ent Order - PBI API |
| inventoryProdOrderComponentLines | Prod. Order Component (5407) | query 36971 Prod. Order Comp. - Invt. |
| inventoryProdOrderLines | Prod. Order Line (5406) | query 36972 Prod. Order Lines - Invt. |
| itemBudgets | Item Budget Name (7132) | query 37002 Item Budget Names |
| itemCategories | Item Category (5722) | page 36967 Item Category - PBI API |
| itemJobPlanningLines | Job Planning Line (1003) | query 36969 Job Planning Lines - Item |
| itemLedgerEntries | Item Ledger Entry (32) | query 36968 Item Ledger Entries - PBI API |
| itemOutstandingPurchaseLines | Purchase Header (38) | query 36998 Purch. Lines - Item Outstd. |
| itemOutstandingSalesLines | Sales Header (36) | query 37003 Sales Line - Item Outstanding |
| itemReceivedNotInvoicedPurchaseLines | Purchase Header (38) | query 37001 Purch. Lines - Item Received |
| items | Item (27) | query 36953 Items - PBI API |
| itemShippedNotInvoicedSalesLines | Sales Header (36) | query 37006 Sales Line - Item Shipped |
| itemValueEntries | Value Entry (5802) | query 36967 Value Entries - Item |
| jobLedgerEntries | Job Ledger Entry (169) | query 36992 Job Ledger Entries - PBI API |
| jobOutstandingPurchaseLines | Purchase Line (39) | query 36996 Purch. Lines - Job Outstanding |
| jobPlanningLines | Job Planning Line (1003) | query 36993 Job Planning Lines |
| jobReceivedNotInvoicedPurchaseLines | Purchase Line (39) | query 36997 Purch. Lines - Job Received |
| jobs | Job (167) | query 36995 Jobs |
| jobTasks | Job Task (1001) | query 36994 Job Tasks |
| locations | Location (14) | page 36957 Locations |
| machineCenters | Machine Center (99000758) | query 36985 Machine Centers |
| manufacturingProdOrderComponents | Prod. Order Component (5407) | query 36988 Prod. Order Comp. - Manuf. |
| manufacturingProdOrderLines | Prod. Order Line (5406) | query 36989 Prod. Order Lines - Manuf. |
| manufacturingProductionOrders | Production Order (5405) | query 37008 Prod. Orders - PBI API |
| manufacturingSetup | Manufacturing Setup (99000765) | query 37007 Manufacturing Setup - PBI API |
| manufacturingValueEntries | Value Entry (5802) | query 37011 Manuf. Value Entries - PBI API |
| opportunities | Opportunity (5092) | query 37017 Opportunity - PBI API |
| opportunityEntries | Opportunity Entry (5093) | query 37018 Opportunity Entries - PBI API |
| orderServiceLines | Service Line (5902) | query 36976 Service Lines - Order |
| outstandingPurchaseLines | Purchase Line (39) | query 36973 Purchase Lines - Outstanding |
| outstandingSalesLines | Sales Line (37) | query 36975 Sales Lines - Outstanding |
| pbiCountryRegions | Country/Region (9) | query 6210 Country Region - PBI API |
| pbiEmissionFees | Emission Fee (6226) | query 6211 Emission Fees - PBI API |
| pbiEmployeeAbsences | Employee Absence (5207) | query 6212 Employee Absence - PBI API |
| pbiEmployeeLedgerEntries | Employee Ledger Entry (5222) | query 6213 EmployeeLedgerEntry - PBI API |
| pbiEmployeeQualifications | Employee Qualification (5203) | query 6214 Employee Quali - PBI API |
| pbiEmployees | Employee (5200) | query 6215 Employees - PBI API |
| pbiResponsibilityCentres | Responsibility Center (5714) | query 6216 Resp Centre - PBI API |
| pbiSustainabilityAccountCategories | Sustain. Account Category (6211) | query 6218 Sust Account Cat - PBI API |
| pbiSustainabilityAccounts | Sustainability Account (6210) | query 6219 Sust Accounts - PBI API |
| pbiSustainabilityGoals | Sustainability Goal (6219) | query 6220 Sustainability Goals - PBI API |
| pbiSustainabilityLedgerEntries | Sustainability Ledger Entry (6216) | query 6221 Sust Ledger Entries - PBI API |
| pbiSustainabilitySubAccountCategories | Sustain. Account Subcategory (6212) | query 6217 SusSub Act Category - PBI API |
| planningComponentLines | Planning Component (99000829) | query 36970 Planning Components |
| prodItemLedgerEntries | Item Ledger Entry (32) | query 36986 Item Ledger Entries - Prod. |
| prodOrderCapacityNeeds | Prod. Order Capacity Need (5410) | query 36987 Prod. Order Capacity Needs |
| prodOrderRoutingLines | Prod. Order Routing Line (5409) | query 36990 Prod. Order Routing Lines |
| purchaseCreditMemoLines | Purch. Cr. Memo Line (125) | query 37108 Purchase Credit Lines |
| purchaseInvoiceLines | Purch. Inv. Line (123) | query 37107 Purchase Invoice Lines |
| purchaseItemBudgetEntries | Item Budget Entry (7134) | query 36999 Item Budget Entries - Purch. |
| purchaseLines | Purchase Header (38) | query 37073 Purchase Lines - PBI API |
| purchaseValueEntries | Value Entry (5802) | query 37023 Purch. Value Entries - PBI API |
| requisitionLines | Requisition Line (246) | query 36974 Requisition Lines |
| resources | Resource (156) | query 37070 Resources - PBI API |
| returnReasonCodes | Return Reason (6635) | page 36965 Return Reason Code - PBI API |
| routingLinks | Routing Link (99000777) | query 37009 Routing Links - PBI API |
| routings | Routing Header (99000763) | query 37010 Routings - PBI API |
| salesCreditLines | Sales Cr.Memo Line (115) | query 37109 Sales Credit Lines - PBI API |
| salesCrProjectLedgerEntries | Job Ledger Entry (169) | query 37071 Sales Cr Project Ledger Entry |
| salesCycleStages | Sales Cycle Stage (5091) | page 37082 Sales Cycle Stage - PBI API |
| salesInvoiceLines | Sales Invoice Line (113) | query 37074 Sales Invoice Lines - PBI API |
| salesInvoiceProjectLedgerEntries | Job Ledger Entry (169) | query 37110 Sales Inv Project Ledger Entry |
| salesItemBudgetEntries | Item Budget Entry (7134) | query 37004 Item Budget Entries - Sales |
| salesLines | Sales Header (36) | query 37024 Sales Line V2 - PBI API |
| salespersonPurchasers | Salesperson/Purchaser (13) | page 36958 Salesperson/Purchasers |
| salesValueEntries | Item Ledger Entry (32) | query 37025 Sales Value Entries - PBI API |
| toBinWarehouseJournalLines | Warehouse Journal Line (7311) | query 36981 Whse. Journal Lines - To Bin |
| transferLines | Transfer Line (5741) | query 36977 Transfer Lines |
| vendorLedgerEntries | Vendor Ledger Entry (25) | query 36963 Vendor Ledg. Entries - PBI API |
| vendors | Vendor (23) | page 36959 Vendors - PBI API |
| warehouseActivityLines | Warehouse Activity Line (5767) | query 36978 Warehouse Activity Lines |
| warehouseEntries | Warehouse Entry (7312) | query 36979 Warehouse Entries |
| workCenterGroups | Work Center Group (99000756) | query 37012 Work Center Groups - PBI API |
| workCenters | Work Center (99000754) | query 36991 Work Centers |
| workingDays | sin tabla (página calculada) | page 36960 Working Days |
| zones | Zone (7300) | query 36982 Zones |

### microsoft/analytics/v1.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| abcAnalysisSetups | ABC Analysis Setup (7160) | query 37022 ABC Analysis Setup - PBI API |
| accountCategories | Account Category | query 36954 Account Categories |
| assemblyHeaders | Assembly Header (900) | query 36964 Assembly Headers - Order |
| assemblyLines | Assembly Line (901) | query 36965 Assembly Lines - Item |
| balanceSheetGeneralLedgerEntries | G/L Account (15) | query 36955 G\L Entries - Balance Sheet |
| bins | Bin (7354) | query 36966 Bins |
| calendarEntries | Calendar Entry (99000757) | query 36983 Calendar Entries |
| capacityLedgerEntries | Capacity Ledger Entry (5832) | query 36984 Capacity Ledger Entries |
| closeIncomeStmtSourceCodes | PBI C. Income St. Source Code | query 37013 Close Income Source - PBI API |
| closeOpportunityCodes | Close Opportunity Code (5094) | page 37083 Close Opp. Code - PBI API |
| closingGeneralLedgerEntries | G/L Account (15) | query 36956 G/L Entries - Closing |
| contacts | Contact (5050) | page 36966 Contacts - PBI API |
| customerLedgerEntries | Cust. Ledger Entry (21) | query 36957 Customer Ledger Entries |
| customers | Customer (18) | page 36954 Customers |
| dateSetups | sin tabla (página calculada) | page 36955 Date Setup |
| dimensions | General Ledger Setup (98) | query 36952 Dimensions |
| dimensionSetEntries | PowerBI Flat Dim. Set Entry | query 36950 PowerBI Dimension Set Entries |
| dynamicDimensions | Dimension Set Entry (480) | query 37016 Dynamic Dimensions - PBI API |
| fromBinWarehouseJournalLines | Warehouse Journal Line (7311) | query 36980 Whse. Journal Lines - From Bin |
| generalLedgerAccountCategories | G/L Account Category (570) | query 36958 G/L Account Categories |
| generalLedgerAccounts | G/L Account (15) | query 36959 G/L Accounts |
| generalLedgerBudgetEntries | G/L Budget Entry (96) | query 36960 G/L Budget Entries - PBI API |
| generalLedgerBudgets | G/L Budget Name (95) | query 36961 G/L Budgets |
| generalLedgerSetups | General Ledger Setup (98) | page 36956 General Ledger Setup - PBI API |
| incomeStatementGeneralLedgerEntries | G/L Account (15) | query 36962 G/L Entries - Income Statement |
| incomeStmtGeneralLedgerEntries | G/L Account (15) | query 37014 G/L Income Statement - PBI API |
| inventoryAdjustmentEntryOrders | Inventory Adjmt. Entry (Order) (5896) | query 37020 Inv. Adj. Ent Order - PBI API |
| inventoryProdOrderComponentLines | Prod. Order Component (5407) | query 36971 Prod. Order Comp. - Invt. |
| inventoryProdOrderLines | Prod. Order Line (5406) | query 36972 Prod. Order Lines - Invt. |
| itemBudgets | Item Budget Name (7132) | query 37002 Item Budget Names |
| itemCategories | Item Category (5722) | page 36967 Item Category - PBI API |
| itemJobPlanningLines | Job Planning Line (1003) | query 36969 Job Planning Lines - Item |
| itemLedgerEntries | Item Ledger Entry (32) | query 36968 Item Ledger Entries - PBI API |
| itemOutstandingPurchaseLines | Purchase Header (38) | query 36998 Purch. Lines - Item Outstd. |
| itemOutstandingSalesLines | Sales Header (36) | query 37003 Sales Line - Item Outstanding |
| itemReceivedNotInvoicedPurchaseLines | Purchase Header (38) | query 37001 Purch. Lines - Item Received |
| items | Item (27) | query 36953 Items - PBI API |
| itemShippedNotInvoicedSalesLines | Sales Header (36) | query 37006 Sales Line - Item Shipped |
| itemValueEntries | Value Entry (5802) | query 36967 Value Entries - Item |
| jobLedgerEntries | Job Ledger Entry (169) | query 36992 Job Ledger Entries - PBI API |
| jobOutstandingPurchaseLines | Purchase Line (39) | query 36996 Purch. Lines - Job Outstanding |
| jobPlanningLines | Job Planning Line (1003) | query 36993 Job Planning Lines |
| jobReceivedNotInvoicedPurchaseLines | Purchase Line (39) | query 36997 Purch. Lines - Job Received |
| jobs | Job (167) | query 36995 Jobs |
| jobTasks | Job Task (1001) | query 36994 Job Tasks |
| locations | Location (14) | page 36957 Locations |
| machineCenters | Machine Center (99000758) | query 36985 Machine Centers |
| manufacturingProdOrderComponents | Prod. Order Component (5407) | query 36988 Prod. Order Comp. - Manuf. |
| manufacturingProdOrderLines | Prod. Order Line (5406) | query 36989 Prod. Order Lines - Manuf. |
| manufacturingProductionOrders | Production Order (5405) | query 37008 Prod. Orders - PBI API |
| manufacturingSetup | Manufacturing Setup (99000765) | query 37007 Manufacturing Setup - PBI API |
| manufacturingValueEntries | Value Entry (5802) | query 37011 Manuf. Value Entries - PBI API |
| opportunities | Opportunity (5092) | query 37017 Opportunity - PBI API |
| opportunityEntries | Opportunity Entry (5093) | query 37018 Opportunity Entries - PBI API |
| orderServiceLines | Service Line (5902) | query 36976 Service Lines - Order |
| outstandingPurchaseLines | Purchase Line (39) | query 36973 Purchase Lines - Outstanding |
| outstandingSalesLines | Sales Line (37) | query 36975 Sales Lines - Outstanding |
| pbiCountryRegions | Country/Region (9) | query 6210 Country Region - PBI API |
| pbiEmissionFees | Emission Fee (6226) | query 6211 Emission Fees - PBI API |
| pbiEmployeeAbsences | Employee Absence (5207) | query 6212 Employee Absence - PBI API |
| pbiEmployeeLedgerEntries | Employee Ledger Entry (5222) | query 6213 EmployeeLedgerEntry - PBI API |
| pbiEmployeeQualifications | Employee Qualification (5203) | query 6214 Employee Quali - PBI API |
| pbiEmployees | Employee (5200) | query 6215 Employees - PBI API |
| pbiResponsibilityCentres | Responsibility Center (5714) | query 6216 Resp Centre - PBI API |
| pbiSustainabilityAccountCategories | Sustain. Account Category (6211) | query 6218 Sust Account Cat - PBI API |
| pbiSustainabilityAccounts | Sustainability Account (6210) | query 6219 Sust Accounts - PBI API |
| pbiSustainabilityGoals | Sustainability Goal (6219) | query 6220 Sustainability Goals - PBI API |
| pbiSustainabilityLedgerEntries | Sustainability Ledger Entry (6216) | query 6221 Sust Ledger Entries - PBI API |
| pbiSustainabilitySubAccountCategories | Sustain. Account Subcategory (6212) | query 6217 SusSub Act Category - PBI API |
| planningComponentLines | Planning Component (99000829) | query 36970 Planning Components |
| prodItemLedgerEntries | Item Ledger Entry (32) | query 36986 Item Ledger Entries - Prod. |
| prodOrderCapacityNeeds | Prod. Order Capacity Need (5410) | query 36987 Prod. Order Capacity Needs |
| prodOrderRoutingLines | Prod. Order Routing Line (5409) | query 36990 Prod. Order Routing Lines |
| purchaseCreditMemoLines | Purch. Cr. Memo Line (125) | query 37108 Purchase Credit Lines |
| purchaseInvoiceLines | Purch. Inv. Line (123) | query 37107 Purchase Invoice Lines |
| purchaseItemBudgetEntries | Item Budget Entry (7134) | query 36999 Item Budget Entries - Purch. |
| purchaseLines | Purchase Header (38) | query 37073 Purchase Lines - PBI API |
| purchaseValueEntries | Value Entry (5802) | query 37023 Purch. Value Entries - PBI API |
| requisitionLines | Requisition Line (246) | query 36974 Requisition Lines |
| resources | Resource (156) | query 37070 Resources - PBI API |
| returnReasonCodes | Return Reason (6635) | page 36965 Return Reason Code - PBI API |
| routingLinks | Routing Link (99000777) | query 37009 Routing Links - PBI API |
| routings | Routing Header (99000763) | query 37010 Routings - PBI API |
| salesCreditLines | Sales Cr.Memo Line (115) | query 37109 Sales Credit Lines - PBI API |
| salesCrProjectLedgerEntries | Job Ledger Entry (169) | query 37071 Sales Cr Project Ledger Entry |
| salesCycleStages | Sales Cycle Stage (5091) | page 37082 Sales Cycle Stage - PBI API |
| salesInvoiceLines | Sales Invoice Line (113) | query 37074 Sales Invoice Lines - PBI API |
| salesInvoiceProjectLedgerEntries | Job Ledger Entry (169) | query 37110 Sales Inv Project Ledger Entry |
| salesItemBudgetEntries | Item Budget Entry (7134) | query 37004 Item Budget Entries - Sales |
| salesLines | Sales Header (36) | query 37024 Sales Line V2 - PBI API |
| salespersonPurchasers | Salesperson/Purchaser (13) | page 36958 Salesperson/Purchasers |
| salesValueEntries | Item Ledger Entry (32) | query 37025 Sales Value Entries - PBI API |
| toBinWarehouseJournalLines | Warehouse Journal Line (7311) | query 36981 Whse. Journal Lines - To Bin |
| transferLines | Transfer Line (5741) | query 36977 Transfer Lines |
| vendorLedgerEntries | Vendor Ledger Entry (25) | query 36963 Vendor Ledg. Entries - PBI API |
| vendors | Vendor (23) | page 36959 Vendors - PBI API |
| warehouseActivityLines | Warehouse Activity Line (5767) | query 36978 Warehouse Activity Lines |
| warehouseEntries | Warehouse Entry (7312) | query 36979 Warehouse Entries |
| workCenterGroups | Work Center Group (99000756) | query 37012 Work Center Groups - PBI API |
| workCenters | Work Center (99000754) | query 36991 Work Centers |
| workingDays | sin tabla (página calculada) | page 36960 Working Days |
| zones | Zone (7300) | query 36982 Zones |

### microsoft/automate/v1.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| postedPurchaseInvoices | Purch. Inv. Header (122) | page 9971 Posted Purchase Invoice API |
| postedSalesInvoices | Sales Invoice Header (112) | page 9970 Posted Sales Invoice API |

### microsoft/automation/beta
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| extensionDeploymentStatus | NAV App Tenant Operation *(tabla de sistema)* | page 5448 Automation Extension Depl. |

### microsoft/automation/v1.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| automationCompanies | Company *(tabla de sistema)* | page 30001 APIV2 - Aut. Companies |
| configurationPackages | Config. Package (8623) | page 30000 APIV2 - Aut. Config. Packages |
| extensionDeploymentStatus | NAV App Tenant Operation *(tabla de sistema)* | page 30007 APIV2 - Aut. Extension Depl. |
| extensions | Published Application *(tabla de sistema)* | page 30002 APIV2 - Aut. Extensions |
| extensionUpload | API Extension Upload (5447) | page 30006 APIV2 - Aut. Extension Upload |
| file | sin tabla (carga de fichero) |  |
| permissionSets | Aggregate Permission Set *(tabla de sistema)* | page 30005 APIV2 - Aut. Permission Sets |
| userPermissions | Access Control *(tabla de sistema)* | page 30059 APIV2 - Aut. User Permissions |
| users | User *(tabla de sistema)* | page 30004 APIV2 - Aut. Users |

### microsoft/automation/v2.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| accessControls | Access Control *(tabla de sistema)* | page 20767 APIV2 - Access Control |
| aggregatePermissionSets | Aggregate Permission Set *(tabla de sistema)* | page 20770 APIV2 - Permission Sets |
| automationCompanies | Company *(tabla de sistema)* | page 30001 APIV2 - Aut. Companies |
| configurationPackages | Config. Package (8623) | page 30000 APIV2 - Aut. Config. Packages |
| expandedPermissionSets | Expanded Permission *(tabla de sistema)* | page 20766 APIV2 Expanded Permission Sets |
| extensionDeploymentStatus | NAV App Tenant Operation *(tabla de sistema)* | page 30007 APIV2 - Aut. Extension Depl. |
| extensions | Published Application *(tabla de sistema)* | page 30002 APIV2 - Aut. Extensions |
| extensionUpload | API Extension Upload (5447) | page 30006 APIV2 - Aut. Extension Upload |
| features | Feature Key *(tabla de sistema)* | page 30092 APIV2 - Feature Management |
| file | sin tabla (carga de fichero) |  |
| permissionSets | Aggregate Permission Set *(tabla de sistema)* | page 30005 APIV2 - Aut. Permission Sets |
| profiles | All Profile *(tabla de sistema)* | page 30074 APIV2 - Aut. Profiles |
| scheduledJobs | Job Queue Entry Buffer (479) | page 30068 APIV2 - Aut. Scheduled Jobs |
| securityGroupMembers | Security Group Member Buffer (9021) *temporal* | page 30081 APIV2 - Aut. Sec. Gr. Members |
| securityGroups | Security Group Buffer (9022) *temporal* | page 30082 APIV2 - Aut. Security Groups |
| userPermissions | Access Control *(tabla de sistema)* | page 30059 APIV2 - Aut. User Permissions |
| userPermissionSets | User Permissions Buffer (30432) | page 20769 APIV2 - User Permission Sets |
| users | User *(tabla de sistema)* | page 30004 APIV2 - Aut. Users |
| usersPermissions | User *(tabla de sistema)* | page 20768 APIV2 - Users Permissions |

### microsoft/cloudMigration/v1.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| cloudMigrationCompanies | Hybrid Company | page 40020 Cloud Migration Companies API |
| cloudMigrationStatus | Hybrid Replication Summary | page 40021 Cloud Migration Status API |
| cloudMigrationStatusDetails | Hybrid Replication Detail | page 40026 Cloud Mig Status Detail API |
| setupCloudMigration | Intelligent Cloud Setup | page 40023 Setup Cloud Migration API |
| sourceProductTypes | Hybrid Product Type | page 40024 Cloud Mig Product Type API |
| tableMappings | Migration Table Mapping | page 40022 Cloud Mig Table Mapping API |

### microsoft/dataverse/v1.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| dataverseEntityChanges | Dataverse Entity Change (5395) | page 5395 Dataverse Entity Changes API |

### microsoft/edocument/v1.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| eDocumentFileContent | E-Doc. File Content API Buffer (6130) *temporal* | page 6119 E-Doc. File Content API |
| eDocuments | E-Document (6121) | page 6112 E-Documents API |
| eDocumentServices | E-Document Service (6103) | page 6113 E-Document Services API |
| eDocumentServiceStatuses | E-Document Service Status (6138) | page 6118 E-Document Service Status API |
| newEDocuments | E-Document (6121) *temporal* | page 6115 New E-Documents API |

### microsoft/exciseTaxes/v1.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| itemExciseTaxes | Item Excise Tax (7415) | page 7417 Item Excise Tax API |

### microsoft/expense/beta
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| approverViews | Expense User (6923) | page 6969 Approver View API |
| employees | Employee (5200) | page 6917 Employees API |
| expenseActivityLogEntries | Expense Activity Log Entry (7100) | page 7122 Expense Activity Log API |
| expenseAgentAccessControls | Expense Agent Access Control (6943) | page 6984 Expense Agent Access Ctrl API |
| expenseAgentSetup | Expense Agent Setup (6930) | page 6942 Expense Agent Setup API |
| expenseApprovalSetups | Expense Approval Setup (6932) | page 6955 Expense Approval Setup API |
| expenseAttachments | Attachment Entity Buffer (5509) *temporal* | page 6950 Expense Attachments API |
| expenseCapabilities | Expense Capabilities Buffer (6914) *temporal* | page 7082 Expense Capabilities API |
| expenseCategories | Expense Category (6921) | page 6914 Expense Categories API |
| expenseGroups | Expense Group (6924) | page 6919 Expense Groups API |
| expenseItemizations | Expense Itemization (6902) | page 6935 Expense Itemizations API |
| expenseLocations | Expense Location (6925) | page 6921 Expense Locations API |
| expenseParticipants | Expense Participant (6904) | page 6936 Expense Participants API |
| expensePaymentMethods | Expense Payment Method (6913) | page 6907 Expense Payment Method API |
| expensePerDiemLocations | Expense Rule Header (6927) | query 7082 Expense Per Diem Locations |
| expenseperdiems | Expense Per Diem (6905) | page 6954 Expense Per Diem API |
| expensePolicies | Expense Policy (7092) | page 7104 Expense Policies API |
| expensePolicyEvaluations | Expense Policy Evaluation (7096) | page 7126 Expense Policy Evaluations API |
| expensePostingGroups | Expense Posting Group (6928) | page 6924 Expense Posting Groups API |
| expenseProjects | Expense Project Buf (7088) *temporal* | page 7092 Expense Projects API |
| expenseProjectsList | Job (167) | query 7079 Expense Projects List |
| expenseReportLineAttachments | Attachment Entity Buffer (5509) *temporal* | page 6908 Exp. Rep. Line Attachments API |
| expenseReportLineItemizations | Expense Report Line Item (6911) | page 6905 Expense Report Line Item API |
| expenseReportLineParticipants | Expense Report Line Particip. (6908) | page 6909 Exp. Report Line Particip. API |
| expenseReportLinePerDiems | Expense Report Line Per Diem (6909) | page 6915 Exp. Report Line Per Diem API |
| expenseReportLines | Expense Report Line (6907) | page 6929 Expense Report Lines API |
| expenseReportRuleViolations | Expense Report Rule Violation (6910) | page 6964 Exp. Rep. Rule Violations API |
| expenseReports | Expense Report Header (6906) | page 6928 Expense Reports API |
| expenseRuleConditions | Expense Rule Condition (6926) | page 6922 Expense Rule Conditions API |
| expenseRules | Expense Rule Header (6927) | page 6923 Expense Rules API |
| expenseRuleViolations | Expense Rule Violation (6903) | page 6963 Expense Rule Violations API |
| expenses | Expense (6900) | page 6927 Expenses API |
| expenseSubcategories | Expense Subcategory (6929) | page 6925 Expense Subcategories API |
| expenseUserAssignedPlanningLines | Expense User (6923) | query 7080 Expense User Assigned Plan Ln |
| expenseUserAssignedProjects | Expense User (6923) | query 7081 Expense User Assigned Projects |
| expenseUsers | Expense User (6923) | page 6918 Expense Users API |
| expenseVATSpecifications | Expense VAT Specification (6918) | page 7085 Expense VAT Spec. API |
| expenseVehicleTypes | Expense Vehicle Type (7108) | page 7107 Expense Vehicle Type API |
| locations | Location (14) | page 6958 Expense Location API |
| mileageRateSetups | Mileage Rate Setup (6939) | page 7131 Mileage Rate Setup API |
| outboxEmails | EA Outbox Email (6984) | page 6983 EA Outbox Email API |
| policiesToEvaluate | Exp. Policy To Eval Buffer (7106) *temporal* | page 7108 Exp. Policies To Eval API |
| postedExpensePolicyEvaluations | Posted Exp. Policy Evaluation (7105) | page 7105 Posted Policy Evaluations API |
| postedExpenseReportLineAttachments | Attachment Entity Buffer (5509) *temporal* | page 6926 Posted Exp. Rep. Line Att. API |
| postedExpenseReportLineItemizations | Posted Exp. Rep. Line Item (6919) | page 6906 Posted Exp. Rep. Line Item API |
| postedExpenseReportLines | Posted Expense Report Line (6916) | page 6913 Posted Exp. Report Lines API |
| postedExpenseReports | Posted Expense Report Header (6915) | page 6957 Posted Expense Reports API |
| spendRequestDetails | Spend Request Detail (6841) | page 7102 Spend Request Details API |
| spendRequests | Spend Request (6840) | page 7099 Spend Requests API |
| tenantFeedbackSettings | Tenant Feedback Setting (6986) *temporal* | page 6986 Tenant Feedback Setting API |
| travelers | Traveler (6938) | page 7103 Travelers API |
| travelRequestDetails | Spend Request Detail (6841) | page 7135 Travel Request Details API |
| travelRequests | Spend Request (6840) | page 7134 Travel Requests API |
| userConsumptions | Expense User (6923) | page 6968 Expense User Cons. API |

### microsoft/fabric/v1.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| fabricCompanies | Tenant Fabric Companies | page 48503 Fabric API Companies |
| fabricConfigPackages | Fabric Config Package (48501) | page 48504 Fabric API Config Packages |
| fabricExportDetails | Tenant Fabric Export Details | page 48506 Fabric API Export Details |
| fabricExportRuns | Tenant Fabric Export Summary | page 48505 Fabric API Export Summary |
| fabricSetups | Tenant Fabric Setup | page 48507 Fabric API Setup |
| fabricTables | Tenant Fabric Tables | page 48502 Fabric API Tables |

### microsoft/intercompany/v1.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| bufferIntercompanyCommentLines | Buffer IC Comment Line (603) | page 30416 API Buf IC Comment Lines |
| bufferIntercompanyDocumentDimensions | Buffer IC Document Dimension (604) | page 30417 API Buf IC Document Dimension |
| bufferIntercompanyInboxJournalLines | Buffer IC Inbox Jnl. Line (605) | page 30418 API Buf IC Inbox Jnl Line |
| bufferIntercompanyInboxPurchaseHeaders | Buffer IC Inbox Purch Header (607) | page 30420 API Buf IC Inbox Purch Header |
| bufferIntercompanyInboxPurchaseLines | Buffer IC Inbox Purchase Line (606) | page 30419 API Buf IC Inbox Purchase Line |
| bufferIntercompanyInboxSalesHeaders | Buffer IC Inbox Sales Header (608) | page 30421 API Buf IC Inbox Sales Header |
| bufferIntercompanyInboxSalesLines | Buffer IC Inbox Sales Line (609) | page 30422 API Buf IC Inbox Sales Line |
| bufferIntercompanyInboxTransactions | Buffer IC Inbox Transaction (610) | page 30423 API Buf IC Inbox Transaction |
| bufferIntercompanyInOutJournalLineDimensions | Buffer IC InOut Jnl. Line Dim. (611) | page 30424 API Buf IC InOut Jnl Line Dim |
| handledIntercompanyInboxTransactions | Handled IC Inbox Trans. (420) | page 30400 API - Handled IC Inbox Trans. |
| intercompanyDimensions | IC Dimension (411) | page 30402 API - IC Dimensions |
| intercompanyDimensionValues | IC Dimension Value (412) | page 30403 API - IC Dimension Values |
| intercompanyGeneralLedgerAccounts | IC G/L Account (410) | page 30405 API - IC G/L Accounts |
| intercompanyInboxTransactions | IC Inbox Transaction (418) | page 30411 API - IC Inbox Transactions |
| intercompanyIncomingNotification | IC Incoming Notification (613) | page 30415 API IC Incoming Notification |
| intercompanyOutgoingNotification | IC Outgoing Notification (612) | page 30425 API IC Outgoing Notification |
| intercompanyPartners | IC Partner (413) | page 30413 API - IC Partners |
| intercompanySetup | IC Setup (443) | page 30414 API - IC Setup |

### microsoft/powerbi/v2.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| reportLabels | Power BI Report Labels (6306) *temporal* | page 30078 APIV2 - Power BI Labels |

### microsoft/qualityManagement/v1.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| createQualityInspections | Name/Value Buffer (823) *temporal* | page 20415 Qlty. Create Inspection API |
| qualityInspections | Qlty. Inspection Header (20405) | page 20414 Qlty. Inspections API |
| qualityInspectionValues | Qlty. Inspection Header (20405) | query 20401 Qlty. Inspection Values |

### microsoft/reportInbox/v1.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| reportInboxCompanies | Report Inbox Company Buffer (478) | page 694 Report Inbox Companies API |
| reportInboxContents | Report Inbox (477) | page 691 Report Inbox Content API |
| reportInboxFiles | Report Inbox File Buffer (476) | page 692 Report Inbox File API |
| reportInboxItems | Report Inbox Item Buffer (473) | page 690 Report Inbox Items API |

### microsoft/reportsFinance/beta
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| accountingPeriods | Accounting Period (50) | page 30300 API Finance - Acc Periods |
| businessUnits | Business Unit (220) | page 30301 API Finance - Business Unit |
| customerLedgerEntries | Cust. Ledger Entry (21) | query 30302 API Fin - Cust Ledg Entry |
| customers | Customer (18) | page 30307 API Finance - Customer |
| detailedCustomerLedgerEntries | Detailed Cust. Ledg. Entry (379) | query 30301 API Fin - Dtld Cust Ledg Entry |
| detailedVendorLedgerEntries | Detailed Vendor Ledg. Entry (380) | query 30304 API Fin - Dtld Vend Ledg Entry |
| dimensionSetEntries | Dimension Set Entry (480) | page 30303 API Finance - Dim Set Entries |
| dimensionValues | Dimension Value (349) | page 30302 API Finance - Dimension Values |
| generalLedgerAccounts | G/L Account (15) | page 30304 API Finance - GL Account |
| generalLedgerBudgetEntries | G/L Budget Entry (96) | query 30305 API Finance - GL Budget Entry |
| generalLedgerBudgets | G/L Budget Name (95) | page 30305 API Finance - GL Budgets |
| generalLedgerEntries | G/L Entry (17) | query 30300 API Finance - GL Entry |
| vendorLedgerEntries | Vendor Ledger Entry (25) | query 30303 API Fin - Vend Ledg Entry |
| vendors | Vendor (23) | page 30308 API Finance - Vendor |

### microsoft/runtime/beta
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| apiRoutes | Name/Value Buffer (823) *temporal* | page 5462 API Routes |
| webhookLogs | Activity Log (710) | page 5461 API Webhook Logs |
| webhookSupportedResources | Name/Value Buffer (823) *temporal* | page 5460 Webhook Supported Resources |

### microsoft/subsBilling/v1.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| archivedBillingLines | Billing Line Archive (8064) | page 8022 Archived Billing Lines API |
| billingLines | Billing Line (8061) | page 8021 Billing Lines API |
| contractAnalysisEntries | Sub. Contr. Analysis Entry (8019) | page 8087 Contr. Analysis Entries API |
| customerContractDeferrals | Cust. Sub. Contract Deferral (8066) | page 8046 Cust. Contract Deferral API |
| customerContractLines | Cust. Sub. Contract Line (8062) | page 8045 Customer Contract Lines API |
| customerContracts | Customer Subscription Contract (8052) | page 8024 Customer Contracts API |
| generalLedgerSetup | General Ledger Setup (98) | page 8049 General Ledger Setup API |
| salesperson | Salesperson/Purchaser (13) | page 8050 Sales Person API |
| salesServiceCommitments | Sales Subscription Line (8068) | page 8019 Sales Service Commitments API |
| serviceCommitments | Subscription Line (8059) | page 8018 Service Commitments API |
| serviceObjects | Subscription Header (8057) | page 8020 Service Object API |
| usageDataGenericImports | Usage Data Generic Import (8018) | page 8039 Usage Data Generic Import API |
| usageDataImports | Usage Data Import (8013) | page 8040 Usage Data Import API |
| vendorContractDeferrals | Vend. Sub. Contract Deferral (8072) | page 8048 Vend. Contract Deferrals API |
| vendorContractLines | Vend. Sub. Contract Line (8065) | page 8047 Vendor Contract Lines API |
| vendorContracts | Vendor Subscription Contract (8063) | page 8023 Vendor Contracts API |

### microsoft/sustainability/v1.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| postedESGReportLines | Sust. Posted ESG Report Line (6232) | page 6334 Sust. Posted ESG Report Line |
| sustainabilityAccountCategories | Sustain. Account Category (6211) | page 6228 Sust. Account Categories |
| sustainabilityAccounts | Sustainability Account (6210) | page 6227 Sustainability Accounts |
| sustainabilityAccountSubcategories | Sustain. Account Subcategory (6212) | page 6229 Sust. Acc. Subcategory |
| sustainabilityGoals | Sustainability Goal (6219) | page 6337 Sustainability Goal |
| sustainabilityJournalLines | Sustainability Jnl. Line (6214) | page 6230 Sustainability Journal Line |
| sustainabilityLedgerEntries | Sustainability Ledger Entry (6216) | page 6231 Sustainability Ledg. Entries |
| sustainabilityPurchaseLines | Purchase Line (39) | page 6336 Sustainability Purchase Line |
| sustainabilityValueEntries | Sustainability Value Entry (6227) | page 6335 Sustainability Value Entry |

### microsoft/vatGroup/v1.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| vatGroupSubmissionLines | ¿? (no está en el paquete descargado) |  |
| vatGroupSubmissions | VAT Group Submission Header (4702) | page 4701 VAT Group Submissions |
| vatGroupSubmissionStatus | VAT Group Submission Header (4702) | query 4700 VAT Group Submission Status |

### v2.0
| Entidad | Tabla (ID) | Objeto API |
|---|---|---|
| accountingPeriods | Accounting Period (50) | page 30086 APIV2 - Accounting Periods |
| accounts | G/L Account (15) | page 30014 APIV2 - Accounts |
| agedAccountsPayables | Aged Report Entity (5499) *temporal* | page 30032 APIV2 - Aged AP |
| agedAccountsReceivables | Aged Report Entity (5499) *temporal* | page 30031 APIV2 - Aged AR |
| applyVendorEntries | Vendor Ledger Entry Buffer (2250) *temporal* | page 30073 APIV2 - Apply Vendor Entries |
| approvalEntries | Approval Entry (454) | page 30094 APIV2 - Approval Entries |
| approvalUserSetups | User Setup (91) | page 30095 APIV2 - Approval User Setup |
| assemblyOrderLines | Assembly Line (901) | page 30225 APIV2 - Assembly Order Lines |
| assemblyOrders | Assembly Header (900) | page 30224 APIV2 - Assembly Orders |
| attachments | Attachment Entity Buffer (5509) *temporal* | page 30039 APIV2 - Attachments |
| balanceSheets | Balance Sheet Buffer (5487) *temporal* | page 30033 APIV2 - Balance Sheet |
| bankAccounts | Bank Account (270) | page 30051 APIV2 - Bank Accounts |
| blanketPurchaseOrderLines | Purchase Line (39) | page 30201 APIV2 - Bl. Purch. Ord. Lines |
| blanketPurchaseOrders | Purchase Header (38) | page 30003 APIV2 - Bl. Purch. Orders |
| blanketSalesOrderLines | Sales Line (37) | page 30203 APIV2 - Bl. Sales Ord. Lines |
| blanketSalesOrders | Sales Header (36) | page 30058 APIV2 - Bl. Sales Orders |
| cashFlowStatements | Acc. Schedule Line Entity (5503) *temporal* | page 30026 APIV2 - Cash Flow Statement |
| companyInformation | Company Information (79) | page 30011 APIV2 - Company Information |
| contacts | Contact (5050) | page 30071 APIV2 - Contacts |
| contactsInformation | Contact Information Buffer (5049) *temporal* | page 30072 APIV2 - Contacts Information |
| countriesRegions | Country/Region (9) | page 30027 APIV2 - Countries/Regions |
| currencies | Currency (4) | page 30019 APIV2 - Currencies |
| currencyExchangeRates | Currency Exchange Rate (330) | page 30085 APIV2- Currency Exchange Rates |
| customerContacts | Contact (5050) | page 30089 APIV2 - CustContacts |
| customerFinancialDetails | Customer (18) | page 30048 APIV2 - Cust Financial Details |
| customerPaymentJournals | Gen. Journal Batch (232) | page 30013 APIV2 - Cust. Paym. Journals |
| customerPayments | Gen. Journal Line (81) | page 30055 APIV2 - Customer Payments |
| customerReturnReasons | Reason Code (231) | page 30077 APIV2 - Cust. Return Reasons |
| customers | Customer (18) | page 30009 APIV2 - Customers |
| customerSales | Customer (18) | query 30000 APIV2 - Customer Sales |
| defaultDimensions | Default Dimension (352) | page 30054 APIV2 - Default Dimensions |
| dimensions | Dimension (348) | page 30021 APIV2 - Dimensions |
| dimensionSetLines | Dimension Set Entry Buffer (5489) *temporal* | page 30022 APIV2 - Dimension Set Lines |
| dimensionValues | Dimension Value (349) | page 30040 APIV2 Dimension Values Entity |
| disputeStatus | Dispute Status (142) | page 30088 APIV2 - Dispute Status |
| documentAttachments | Attachment Entity Buffer (5509) *temporal* | page 30080 APIV2 - Document Attachments |
| employees | Employee (5200) | page 30017 APIV2 - Employees |
| fixedAssetLocations | FA Location (5609) | page 30097 APIV2 - FA Locations |
| fixedAssets | Fixed Asset (5600) | page 30098 APIV2 - Fixed Assets |
| generalLedgerEntries | G/L Entry (17) | page 30018 APIV2 - G/L Entries |
| generalLedgerSetup | General Ledger Setup (98) | page 30087 APIV2 - G/L Setup |
| generalProductPostingGroups | Gen. Product Posting Group (251) | page 30079 APIV2 - Gen. Prod. Post. Group |
| incomeStatements | Acc. Schedule Line Entity (5503) *temporal* | page 30035 APIV2 - Income Statement |
| inventoryPostingGroups | Inventory Posting Group (94) | page 30096 APIV2 - Inventory Post. Group |
| inventoryReceiptLines | Invt. Document Line (5851) | page 30243 APIV2 - Invt. Rcpt. Lines |
| inventoryReceipts | Invt. Document Header (5850) | page 30242 APIV2 - Invt. Receipts |
| inventoryShipmentLines | Invt. Document Line (5851) | page 30241 APIV2 - Invt. Shpt. Lines |
| inventoryShipments | Invt. Document Header (5850) | page 30240 APIV2 - Invt. Shipments |
| itemCategories | Item Category (5722) | page 30025 APIV2 - Item Categories |
| itemLedgerEntries | Item Ledger Entry (32) | page 30069 APIV2 - Item Ledger Entries |
| items | Item (27) | page 30008 APIV2 - Items |
| itemVariants | Item Variant (5401) | page 30052 APIV2 - Item Variants |
| jobQueueEntries | Job Queue Entry (472) | page 30091 APIV2 - Job Queue Entries |
| jobQueueLogEntries | Job Queue Log Entry (474) | page 30090 APIV2 - Job Queue Log Entries |
| journalLines | Gen. Journal Line (81) | page 30049 APIV2 - JournalLines |
| journals | Gen. Journal Batch (232) | page 30016 APIV2 - Journals |
| locations | Location (14) | page 30076 APIV2 - Locations |
| opportunities | Opportunity (5092) | page 30070 APIV2 - Opportunities |
| paymentMethods | Payment Method (289) | page 30020 APIV2 - Payment Methods |
| paymentTerms | Payment Terms (3) | page 30023 APIV2 - Payment Terms |
| pdfDocument | Attachment Entity Buffer (5509) *temporal* | page 30056 APIV2 - PDF Document |
| physicalInventoryOrderLines | Phys. Invt. Order Line (5876) | page 30233 APIV2 - Phys. Inv. Ord. Lines |
| physicalInventoryOrders | Phys. Invt. Order Header (5875) | page 30232 APIV2 - Phys. Invt. Orders |
| physicalInventoryRecordingLines | Phys. Invt. Record Line (5878) | page 30237 APIV2 - Phys. Inv. Rec. Lines |
| physicalInventoryRecordings | Phys. Invt. Record Header (5877) | page 30236 APIV2 - Phys. Invt. Recordings |
| pictures | Picture Entity (5468) *temporal* | page 30053 APIV2 - Pictures |
| postedApprovalEntries | Posted Approval Entry (456) | page 30093 APIV2 - Pstd. Approval Entries |
| postedAssemblyOrderLines | Posted Assembly Line (911) | page 30227 APIV2 - P. Asm. Order Lines |
| postedAssemblyOrders | Posted Assembly Header (910) | page 30226 APIV2 - P. Assembly Orders |
| postedDirectTransferLines | Direct Trans. Line (5857) | page 30211 APIV2 - P. Dir. Trans. Lines |
| postedDirectTransfers | Direct Trans. Header (5856) | page 30210 APIV2 - P. Direct Transfers |
| postedInventoryReceiptLines | Invt. Receipt Line (5853) | page 30247 APIV2 - P. Invt. Rcpt. Lines |
| postedInventoryReceipts | Invt. Receipt Header (5852) | page 30246 APIV2 - P. Invt. Receipts |
| postedInventoryShipmentLines | Invt. Shipment Line (5855) | page 30245 APIV2 - P. Invt. Shpt. Lines |
| postedInventoryShipments | Invt. Shipment Header (5854) | page 30244 APIV2 - P. Invt. Shipments |
| postedPhysicalInventoryOrderLines | Pstd. Phys. Invt. Order Line (5880) | page 30235 APIV2 - P. Phys. Inv. O. Lines |
| postedPhysicalInventoryOrders | Pstd. Phys. Invt. Order Hdr (5879) | page 30234 APIV2 - P. Phys. Invt. Orders |
| postedPhysicalInventoryRecordingLines | Pstd. Phys. Invt. Record Line (5882) | page 30239 APIV2 - P. Phys. Inv. R. Lines |
| postedPhysicalInventoryRecordings | Pstd. Phys. Invt. Record Hdr (5881) | page 30238 APIV2 - P. Phys. Inv. Recs. |
| projects | Job (167) | page 30050 APIV2 - Jobs |
| purchaseBlanketOrderArchiveLines | Purchase Line Archive (5110) | page 30231 APIV2 - P. Bl. O. Arch. Lines |
| purchaseBlanketOrderArchives | Purchase Header Archive (5109) | page 30230 APIV2 - P. Bl. Ord. Archives |
| purchaseCreditMemoLines | Purch. Inv. Line Aggregate → datos en Purchase Line (39) + Purch. Inv. Line (123) (5478) *temporal* | page 30084 APIV2 - Purch. Cr. Memo Lines |
| purchaseCreditMemos | Purch. Cr. Memo Entity Buffer → datos en Purchase Header (38) + Purch. Cr. Memo Hdr. (124) (5508) | page 30083 APIV2 - Purchase Credit Memos |
| purchaseInvoiceLines | Purch. Inv. Line Aggregate → datos en Purchase Line (39) + Purch. Inv. Line (123) (5478) *temporal* | page 30047 APIV2 - Purchase Invoice Lines |
| purchaseInvoices | Purch. Inv. Entity Aggregate → datos en Purchase Header (38) + Purch. Inv. Header (122) (5477) | page 30042 APIV2 - Purchase Invoices |
| purchaseOrderArchiveLines | Purchase Line Archive (5110) | page 30219 APIV2 - P. Ord. Arch. Lines |
| purchaseOrderArchives | Purchase Header Archive (5109) | page 30218 APIV2 - Purch. Ord. Archives |
| purchaseOrderLines | Purch. Inv. Line Aggregate → datos en Purchase Line (39) + Purch. Inv. Line (123) (5478) *temporal* | page 30067 APIV2 - Purchase Order Lines |
| purchaseOrders | Purchase Order Entity Buffer → datos en Purchase Header (38) (5496) | page 30066 APIV2 - Purchase Orders |
| purchaseQuoteArchiveLines | Purchase Line Archive (5110) | page 30217 APIV2 - P. Qt. Arch. Lines |
| purchaseQuoteArchives | Purchase Header Archive (5109) | page 30216 APIV2 - Purch. Qt. Archives |
| purchaseQuoteLines | Purchase Line (39) | page 30248 APIV2 - Purch. Quote Lines |
| purchaseQuotes | Purchase Header (38) | page 30099 APIV2 - Purch. Quotes |
| purchaseReceiptLines | Purch. Rcpt. Line (121) | page 30065 APIV2 - Purch Receipt Lines |
| purchaseReceipts | Purch. Rcpt. Header (120) | page 30064 APIV2 - Purchase Receipts |
| purchaseReturnOrderArchiveLines | Purchase Line Archive (5110) | page 30223 APIV2 - P. Ret. Ord. A. Lines |
| purchaseReturnOrderArchives | Purchase Header Archive (5109) | page 30222 APIV2 - P. Ret. Ord. Archives |
| purchaseReturnOrderLines | Purchase Line (39) | page 30249 APIV2 - Purch. Ret. Ord. Lines |
| purchaseReturnOrders | Purchase Header (38) | page 30250 APIV2 - Purch. Ret. Orders |
| purchaseReturnShipments | Return Shipment Header (6650) | page 30200 APIV2 - Purch. Ret. Shpts. |
| retainedEarningsStatements | Acc. Schedule Line Entity (5503) *temporal* | page 30029 APIV2 - Retained Earnings |
| returnReceipts | Return Receipt Header (6660) | page 30252 APIV2 - Return Receipts |
| salesBlanketOrderArchiveLines | Sales Line Archive (5108) | page 30229 APIV2 - S. Bl. O. Arch. Lines |
| salesBlanketOrderArchives | Sales Header Archive (5107) | page 30228 APIV2 - S. Bl. Ord. Archives |
| salesCreditMemoLines | Sales Invoice Line Aggregate → datos en Sales Line (37) + Sales Invoice Line (113) (5476) *temporal* | page 30046 APIV2 - Sales Credit Mem Lines |
| salesCreditMemos | Sales Cr. Memo Entity Buffer → datos en Sales Header (36) + Sales Cr.Memo Header (114) (5507) | page 30038 APIV2 - Sales Credit Memos |
| salesInvoiceLines | Sales Invoice Line Aggregate → datos en Sales Line (37) + Sales Invoice Line (113) (5476) *temporal* | page 30043 APIV2 - Sales Invoice Lines |
| salesInvoices | Sales Invoice Entity Aggregate → datos en Sales Header (36) + Sales Invoice Header (112) (5475) | page 30012 APIV2 - Sales Invoices |
| salesOrderArchiveLines | Sales Line Archive (5108) | page 30215 APIV2 - S. Ord. Arch. Lines |
| salesOrderArchives | Sales Header Archive (5107) | page 30214 APIV2 - Sales Ord. Archives |
| salesOrderLines | Sales Invoice Line Aggregate → datos en Sales Line (37) + Sales Invoice Line (113) (5476) *temporal* | page 30044 APIV2 - Sales Order Lines |
| salesOrders | Sales Order Entity Buffer → datos en Sales Header (36) (5495) | page 30028 APIV2 - Sales Orders |
| salespeoplePurchasers | Salesperson/Purchaser (13) | page 30075 APIV2 - Salesperson/Purchaser |
| salesQuoteArchiveLines | Sales Line Archive (5108) | page 30213 APIV2 - Sales Qt. Arch. Lines |
| salesQuoteArchives | Sales Header Archive (5107) | page 30212 APIV2 - Sales Qt. Archives |
| salesQuoteLines | Sales Invoice Line Aggregate → datos en Sales Line (37) + Sales Invoice Line (113) (5476) *temporal* | page 30045 APIV2 - Sales Quote Lines |
| salesQuotes | Sales Quote Entity Buffer → datos en Sales Header (36) (5505) | page 30037 APIV2 - Sales Quotes |
| salesReturnOrderArchiveLines | Sales Line Archive (5108) | page 30221 APIV2 - S. Ret. Ord. A. Lines |
| salesReturnOrderArchives | Sales Header Archive (5107) | page 30220 APIV2 - S. Ret. Ord. Archives |
| salesReturnOrderLines | Sales Line (37) | page 30202 APIV2 - Sales Ret. Ord. Lines |
| salesReturnOrders | Sales Header (36) | page 30251 APIV2 - Sales Ret. Orders |
| salesShipmentLines | Sales Shipment Line (111) | page 30063 APIV2 - Sales Shipment Lines |
| salesShipments | Sales Shipment Header (110) | page 30062 APIV2 - Sales Shipments |
| shipmentMethods | Shipment Method (10) | page 30024 APIV2 - Shipment Methods |
| taxAreas | Tax Area Buffer (5504) *temporal* | page 30036 APIV2 - Tax Areas |
| taxGroups | Tax Group Buffer (5480) *temporal* | page 30015 APIV2 - Tax Groups |
| timeRegistrationEntries | Employee Time Reg Buffer (5510) *temporal* | page 30041 APIV2 - Time Registr. Entries |
| transferOrderLines | Transfer Line (5741) | page 30205 APIV2 - Trans. Order Lines |
| transferOrders | Transfer Header (5740) | page 30204 APIV2 - Transfer Orders |
| transferReceiptLines | Transfer Receipt Line (5747) | page 30209 APIV2 - Trans. Rcpt. Lines |
| transferReceipts | Transfer Receipt Header (5746) | page 30208 APIV2 - Trans. Receipts |
| transferShipmentLines | Transfer Shipment Line (5745) | page 30207 APIV2 - Trans. Shpt. Lines |
| transferShipments | Transfer Shipment Header (5744) | page 30206 APIV2 - Trans. Shipments |
| trialBalances | Trial Balance Entity Buffer (5488) *temporal* | page 30034 APIV2 - Trial Balance |
| unitsOfMeasure | Unit of Measure (204) | page 30030 APIV2 - Units of Measure |
| vendorPaymentJournals | Gen. Journal Batch (232) | page 30061 APIV2 - Vendor Paym. Journals |
| vendorPayments | Gen. Journal Line (81) | page 30060 APIV2 - Vendor Payments |
| vendorPurchases | Vendor (23) | query 30001 APIV2 - Vendor Purchases |
| vendors | Vendor (23) | page 30010 APIV2 - Vendors |
| workflowApprovers | Workflow Approvers Buffer (1573) *temporal* | page 2148 APIV2 - Workflow Approvers |
| workflowResponseOptions | Workflow Step Argument (1523) | page 2146 APIV2 - Workflow Resp. Options |
| workflows | Workflow (1501) | page 2145 APIV2 - Workflows |
| workflowSteps | Workflow Step (1502) | page 2147 APIV2 - Workflow Steps |
