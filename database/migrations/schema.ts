import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, unique, int, varchar, text, mysqlEnum, datetime, tinyint, json, float, date, timestamp, decimal, foreignKey, double, smallint, char } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"


export const apiKeys = mysqlTable("api_keys", {
	id: int("id").autoincrement().notNull(),
	userId: varchar("userId", { length: 36 }).notNull(),
	apiKey: varchar("apiKey", { length: 64 }).notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	description: text("description"),
	environment: mysqlEnum("environment", ['PRODUCTION','SANDBOX','DEVELOPMENT']).default('DEVELOPMENT').notNull(),
	expiresAt: datetime("expiresAt", { mode: 'string'}),
	lastUsedAt: datetime("lastUsedAt", { mode: 'string'}),
	rateLimit: int("rateLimit").default(100).notNull(),
	isActive: tinyint("isActive").default(1).notNull(),
	permissions: json("permissions"),
	metadata: json("metadata"),
	createdAt: datetime("createdAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
	updatedAt: datetime("updatedAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
},
(table) => {
	return {
		idxApiKey: index("idx_api_key").on(table.apiKey),
		idxUser: index("idx_user").on(table.userId),
		idxActiveExpiry: index("idx_active_expiry").on(table.isActive, table.expiresAt),
		idxApiKeysLastUsed: index("idx_api_keys_last_used").on(table.lastUsedAt),
		idxApiKeysEnvironment: index("idx_api_keys_environment").on(table.environment),
		apiKey: unique("apiKey").on(table.apiKey),
	}
});

export const apiLogs = mysqlTable("api_logs", {
	id: int("id").autoincrement().notNull(),
	userId: int("user_id"),
	endpoint: varchar("endpoint", { length: 255 }).notNull(),
	method: varchar("method", { length: 10 }).notNull(),
	requestHeaders: text("request_headers"),
	requestBody: text("request_body"),
	responseCode: int("response_code").notNull(),
	responseBody: text("response_body"),
	ipAddress: varchar("ip_address", { length: 45 }).notNull(),
	userAgent: varchar("user_agent", { length: 255 }),
	duration: float("duration"),
	createdAt: datetime("created_at", { mode: 'string'}).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => {
	return {
		idxUser: index("idx_user").on(table.userId),
		idxEndpoint: index("idx_endpoint").on(table.endpoint),
		idxCreatedAt: index("idx_created_at").on(table.createdAt),
		idxResponseCode: index("idx_response_code").on(table.responseCode),
	}
});

export const customers = mysqlTable("customers", {
	id: varchar("id", { length: 36 }).notNull(),
	customerCode: varchar("customerCode", { length: 10 }).notNull(),
	lastName: varchar("lastName", { length: 50 }).notNull(),
	firstName: varchar("firstName", { length: 50 }).notNull(),
	idNumber: varchar("idNumber", { length: 20 }).notNull(),
	phoneNumber: varchar("phoneNumber", { length: 15 }).notNull(),
	email: varchar("email", { length: 255 }),
	address: text("address").notNull(),
	countryCode: varchar("countryCode", { length: 2 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	birthDate: date("birthDate", { mode: 'string' }).notNull(),
	createdAt: datetime("createdAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
	updatedAt: datetime("updatedAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
},
(table) => {
	return {
		idxCustomerCode: index("idx_customer_code").on(table.customerCode),
		idxIdNumber: index("idx_id_number").on(table.idNumber),
		customerCode: unique("customerCode").on(table.customerCode),
		idNumber: unique("idNumber").on(table.idNumber),
	}
});

export const engineCalculationComponents = mysqlTable("engine_calculation_components", {
	id: int("id").autoincrement().notNull(),
	code: varchar("code", { length: 50 }).notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	componentType: mysqlEnum("component_type", ['base','multiplier','addition','subtraction','percentage']).notNull(),
	priority: int("priority").default(0),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => {
	return {
		code: unique("code").on(table.code),
	}
});

export const engineCalculationFormulas = mysqlTable("engine_calculation_formulas", {
	id: int("id").autoincrement().notNull(),
	code: varchar("code", { length: 50 }).notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	description: text("description"),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => {
	return {
		code: unique("code").on(table.code),
	}
});

export const engineComponentConditions = mysqlTable("engine_component_conditions", {
	id: int("id").autoincrement().notNull(),
	componentId: int("component_id").notNull(),
	refConditionId: int("ref_condition_id").notNull(),
	variableId: int("variable_id").notNull(),
	valueStart: varchar("value_start", { length: 255 }).notNull(),
	valueEnd: varchar("value_end", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const engineComponentValues = mysqlTable("engine_component_values", {
	id: int("id").autoincrement().notNull(),
	componentId: int("component_id").notNull(),
	categoryId: int("category_id").notNull(),
	valueType: mysqlEnum("value_type", ['fixed','percentage','multiplier']).notNull(),
	value: decimal("value", { precision: 10, scale: 4 }).notNull(),
	minValue: decimal("min_value", { precision: 15, scale: 2 }),
	maxValue: decimal("max_value", { precision: 15, scale: 2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const engineFormulaComponents = mysqlTable("engine_formula_components", {
	id: int("id").autoincrement().notNull(),
	formulaId: int("formula_id").notNull(),
	componentId: int("component_id").notNull(),
	executionOrder: int("execution_order").notNull(),
	isOptional: tinyint("is_optional").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const engineRefConditions = mysqlTable("engine_ref_conditions", {
	id: int("id").autoincrement().notNull(),
	code: varchar("code", { length: 50 }).notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	operator: mysqlEnum("operator", ['equals','not_equals','greater','less','between','in','not_in']).notNull(),
	description: text("description"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => {
	return {
		code: unique("code").on(table.code),
	}
});

export const engineRefOperationTypes = mysqlTable("engine_ref_operation_types", {
	id: int("id").autoincrement().notNull(),
	code: varchar("code", { length: 20 }).notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	description: text("description"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => {
	return {
		code: unique("code").on(table.code),
	}
});

export const engineRefVariables = mysqlTable("engine_ref_variables", {
	id: int("id").autoincrement().notNull(),
	code: varchar("code", { length: 50 }).notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	dataType: mysqlEnum("data_type", ['numeric','boolean','string','date']).notNull(),
	description: text("description"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => {
	return {
		code: unique("code").on(table.code),
	}
});

export const insuranceBaseRates = mysqlTable("insurance_base_rates", {
	id: int("id").autoincrement().notNull(),
	category: varchar("category", { length: 50 }).notNull(),
	subCategory: varchar("sub_category", { length: 50 }),
	fiscalPower: varchar("fiscal_power", { length: 20 }).notNull(),
	rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => {
	return {
		categorySubCategoryFiscalPower: index("category_sub_category_fiscal_power").on(table.category, table.subCategory, table.fiscalPower),
	}
});

export const insuranceCategories = mysqlTable("insurance_categories", {
	id: int("id").autoincrement().notNull(),
	code: varchar("code", { length: 20 }).notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	description: text("description"),
	refCategoryId: int("ref_category_id").notNull().references(() => refCategories.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	powerCategory: varchar("power_category", { length: 50 }),
	maxWeight: decimal("max_weight", { precision: 10, scale: 2 }),
	maxSeats: int("max_seats"),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
},
(table) => {
	return {
		idxCode: index("idx_code").on(table.code),
		idxCategory: index("idx_category").on(table.refCategoryId),
		idxActive: index("idx_active").on(table.isActive),
		code: unique("code").on(table.code),
	}
});

export const insuranceCertificate = mysqlTable("insurance_certificate", {
	id: bigint("id", { mode: "number" }).autoincrement().notNull(),
	certificateNumber: varchar("certificate_number", { length: 100 }),
	registrationNumber: varchar("registration_number", { length: 100 }),
	chassisNumber: varchar("chassis_number", { length: 100 }),
	policyNumber: varchar("policy_number", { length: 100 }),
},
(table) => {
	return {
		ukCertificate: index("UK_CERTIFICATE").on(table.certificateNumber),
		ukCertifiateCheck: unique("UK_CERTIFIATE_CHECK").on(table.certificateNumber, table.registrationNumber, table.chassisNumber, table.policyNumber),
	}
});

export const insuranceCoverages = mysqlTable("insurance_coverages", {
	id: bigint("id", { mode: "number" }).autoincrement().notNull(),
	coverageCode: varchar("coverage_code", { length: 50 }).notNull(),
	coverageName: varchar("coverage_name", { length: 100 }).notNull(),
	description: text("description"),
	options: json("options"),
	rules: json("rules"),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
},
(table) => {
	return {
		idxCoverageCode: index("idx_coverage_code").on(table.coverageCode),
		idxActive: index("idx_active").on(table.isActive),
		coverageCode: unique("coverage_code").on(table.coverageCode),
	}
});

export const insurancePacks = mysqlTable("insurance_packs", {
	id: bigint("id", { mode: "number" }).autoincrement().notNull(),
	packCode: varchar("pack_code", { length: 50 }).notNull(),
	packName: varchar("pack_name", { length: 100 }).notNull(),
	packDescription: text("pack_description"),
	options: json("options"),
	configuration: json("configuration"),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
},
(table) => {
	return {
		idxPackCode: index("idx_pack_code").on(table.packCode),
		idxActive: index("idx_active").on(table.isActive),
		packCode: unique("pack_code").on(table.packCode),
	}
});

export const insurancePackCategories = mysqlTable("insurance_pack_categories", {
	packId: int("pack_id").notNull(),
	categoryId: int("category_id").notNull(),
});

export const insurancePackCoverages = mysqlTable("insurance_pack_coverages", {
	id: bigint("id", { mode: "number" }).autoincrement().notNull(),
	packId: bigint("pack_id", { mode: "number" }).notNull().references(() => insurancePacks.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	coverageId: bigint("coverage_id", { mode: "number" }).notNull().references(() => insuranceCoverages.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	isMainCoverage: tinyint("is_main_coverage").default(0),
	options: json("options"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => {
	return {
		coverageId: index("coverage_id").on(table.coverageId),
		ukPackCoverage: unique("uk_pack_coverage").on(table.packId, table.coverageId),
	}
});

export const insurancePolicies = mysqlTable("insurance_policies", {
	id: int("id").autoincrement().notNull(),
	referenceNumber: varchar("reference_number", { length: 100 }).notNull(),
});

export const insuranceRules = mysqlTable("insurance_rules", {
	id: int("id").autoincrement().notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	description: text("description"),
	type: varchar("type", { length: 50 }).notNull(),
	category: varchar("category", { length: 50 }).notNull(),
	conditionExpression: text("condition_expression").notNull(),
	parameters: json("parameters"),
	priority: int("priority").default(0).notNull(),
	status: mysqlEnum("status", ['active','inactive']).default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
},
(table) => {
	return {
		typeCategoryStatus: index("type_category_status").on(table.type, table.category, table.status),
	}
});

export const insuranceSimulations = mysqlTable("insurance_simulations", {
	id: bigint("id", { mode: "number" }).autoincrement().notNull(),
	packId: bigint("pack_id", { mode: "number" }),
	referenceNumber: varchar("reference_number", { length: 20 }).notNull(),
	simulationDate: datetime("simulation_date", { mode: 'string'}).notNull(),
	status: mysqlEnum("status", ['draft','completed','expired']).default('draft').notNull(),
	clientType: mysqlEnum("client_type", ['individual','company']).notNull(),
	clientName: varchar("client_name", { length: 100 }),
	clientEmail: varchar("client_email", { length: 100 }),
	clientPhone: varchar("client_phone", { length: 20 }),
	validityPeriod: int("validity_period").default(7),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
},
(table) => {
	return {
		idxReference: index("idx_reference").on(table.referenceNumber),
		idxClient: index("idx_client").on(table.clientType, table.clientName),
		idxDate: index("idx_date").on(table.simulationDate),
		referenceNumber: unique("reference_number").on(table.referenceNumber),
	}
});

export const insuranceSimulationCoverages = mysqlTable("insurance_simulation_coverages", {
	id: bigint("id", { mode: "number" }).autoincrement().notNull(),
	simulationId: bigint("simulation_id", { mode: "number" }).notNull().references(() => insuranceSimulations.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	coverageType: varchar("coverage_type", { length: 50 }).notNull(),
	isMainCoverage: tinyint("is_main_coverage").default(1),
	options: json("options"),
	premiumAmount: decimal("premium_amount", { precision: 15, scale: 2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => {
	return {
		idxSimulationCoverage: index("idx_simulation_coverage").on(table.simulationId, table.coverageType),
	}
});

export const insuranceSimulationDiscounts = mysqlTable("insurance_simulation_discounts", {
	id: bigint("id", { mode: "number" }).autoincrement().notNull(),
	simulationId: bigint("simulation_id", { mode: "number" }).notNull().references(() => insuranceSimulations.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	discountType: varchar("discount_type", { length: 50 }).notNull(),
	discountRate: decimal("discount_rate", { precision: 5, scale: 2 }).notNull(),
	discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => {
	return {
		idxSimulation: index("idx_simulation").on(table.simulationId),
	}
});

export const insuranceSimulationHistory = mysqlTable("insurance_simulation_history", {
	id: bigint("id", { mode: "number" }).autoincrement().notNull(),
	simulationId: bigint("simulation_id", { mode: "number" }).notNull().references(() => insuranceSimulations.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	action: varchar("action", { length: 50 }).notNull(),
	actionDate: timestamp("action_date", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	actionBy: varchar("action_by", { length: 100 }),
	details: json("details"),
},
(table) => {
	return {
		idxSimulation: index("idx_simulation").on(table.simulationId),
	}
});

export const insuranceSimulationResults = mysqlTable("insurance_simulation_results", {
	id: bigint("id", { mode: "number" }).autoincrement().notNull(),
	simulationId: bigint("simulation_id", { mode: "number" }).notNull().references(() => insuranceSimulations.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	basePremium: decimal("base_premium", { precision: 15, scale: 2 }).notNull(),
	netPremium: decimal("net_premium", { precision: 15, scale: 2 }).notNull(),
	taxes: json("taxes").notNull(),
	accessories: json("accessories").notNull(),
	fixedCosts: json("fixed_costs").notNull(),
	totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
	proratedAmount: decimal("prorated_amount", { precision: 15, scale: 2 }).notNull(),
	coveragePeriod: int("coverage_period").notNull(),
	periodType: mysqlEnum("period_type", ['months','days']).notNull(),
	calculationDetails: json("calculation_details").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => {
	return {
		ukSimulation: unique("uk_simulation").on(table.simulationId),
	}
});

export const insuranceSimulationVehicles = mysqlTable("insurance_simulation_vehicles", {
	id: bigint("id", { mode: "number" }).autoincrement().notNull(),
	simulationId: bigint("simulation_id", { mode: "number" }).notNull().references(() => insuranceSimulations.id, { onDelete: "restrict", onUpdate: "restrict" } ),
	category: int("category").notNull(),
	registrationNumber: varchar("registration_number", { length: 20 }),
	chassisNumber: varchar("chassis_number", { length: 20 }),
	horsePower: int("horse_power").notNull(),
	color: varchar("color", { length: 20 }),
	bodyType: varchar("body_type", { length: 50 }),
	circulationZone: varchar("circulation_zone", { length: 50 }),
	fuelType: mysqlEnum("fuel_type", ['essence','diesel']).notNull(),
	originalValue: decimal("original_value", { precision: 15, scale: 2 }),
	currentValue: decimal("current_value", { precision: 15, scale: 2 }),
	vehicleAge: int("vehicle_age"),
	seatsNumber: int("seats_number"),
	make: varchar("make", { length: 50 }),
	model: varchar("model", { length: 50 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	firstUseDate: date("first_use_date", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	firstRegistrationDate: date("first_registration_date", { mode: 'string' }),
	emptyWeight: double("empty_weight"),
	maxWeight: double("max_weight"),
	payload: double("payload"),
	usage: varchar("usage", { length: 50 }),
	hasTrailer: int("has_trailer").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => {
	return {
		idxSimulation: index("idx_simulation").on(table.simulationId),
	}
});

export const migrations = mysqlTable("migrations", {
	id: bigint("id", { mode: "number" }).autoincrement().notNull(),
	version: varchar("version", { length: 255 }).notNull(),
	class: varchar("class", { length: 255 }).notNull(),
	group: varchar("group", { length: 255 }).notNull(),
	namespace: varchar("namespace", { length: 255 }).notNull(),
	time: int("time").notNull(),
	batch: int("batch").notNull(),
});

export const paramVehicleCategories = mysqlTable("param_vehicle_categories", {
	id: int("id").autoincrement().notNull(),
	code: varchar("code", { length: 10 }).notNull(),
	description: varchar("description", { length: 100 }).notNull(),
	usageType: varchar("usage_type", { length: 100 }).notNull(),
	isActive: tinyint("isActive").default(1).notNull(),
	createdAt: datetime("createdAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
	updatedAt: datetime("updatedAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
},
(table) => {
	return {
		ukCatCode: unique("UK_CAT_CODE").on(table.code),
	}
});

export const passengerSurcharges = mysqlTable("passenger_surcharges", {
	id: int("id").autoincrement().notNull(),
	seats: int("seats").notNull(),
	category: varchar("category", { length: 50 }).notNull(),
	surcharge: decimal("surcharge", { precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
},
(table) => {
	return {
		categorySeats: index("category_seats").on(table.category, table.seats),
	}
});

export const quotes = mysqlTable("quotes", {
	id: int("id").autoincrement().notNull(),
	numero: varchar("numero", { length: 100 }).notNull(),
	customerData: json("customer_data").notNull(),
	vehicleData: json("vehicle_data").notNull(),
	coverageData: json("coverage_data").notNull(),
	premiumDetails: json("premium_details").notNull(),
	validUntil: datetime("valid_until", { mode: 'string'}).notNull(),
	status: mysqlEnum("status", ['pending','accepted','expired']).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
},
(table) => {
	return {
		statusValidUntil: index("status_valid_until").on(table.status, table.validUntil),
		ukQuoteNum: unique("UK_QUOTE_NUM").on(table.numero),
	}
});

export const refCategories = mysqlTable("ref_categories", {
	id: int("id").autoincrement().notNull(),
	code: varchar("code", { length: 10 }).notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	description: text("description"),
	minPower: int("min_power").default(0),
	maxPower: int("max_power").default(999),
	parentId: int("parent_id"),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
},
(table) => {
	return {
		parentId: index("parent_id").on(table.parentId),
		idxCode: index("idx_code").on(table.code),
		idxActive: index("idx_active").on(table.isActive),
		refCategoriesIbfk1: foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "ref_categories_ibfk_1"
		}).onUpdate("restrict").onDelete("restrict"),
		code: unique("code").on(table.code),
	}
});

export const refCategoryOld = mysqlTable("ref_category_old", {
	id: int("id").autoincrement().notNull(),
	code: varchar("code", { length: 10 }).notNull(),
	nom: varchar("nom", { length: 100 }).notNull(),
	description: text("description"),
	codeTarif: varchar("code_tarif", { length: 10 }).notNull(),
	vehiculeType: mysqlEnum("vehicule_type", ['tourism','commercial','transport_marchandise','transport_personne','deux_roues','engin_chantier','agricole','remorque','special']).default('tourism').notNull(),
	minWeight: decimal("min_weight", { precision: 10, scale: 2 }),
	maxWeight: decimal("max_weight", { precision: 10, scale: 2 }),
	minPlace: int("min_place"),
	maxPlace: int("max_place"),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
},
(table) => {
	return {
		vehiculeType: index("vehicule_type").on(table.vehiculeType),
		codeTarif: index("code_tarif").on(table.codeTarif),
		code: unique("code").on(table.code),
	}
});

export const refCirculationZones = mysqlTable("ref_circulation_zones", {
	code: varchar("code", { length: 10 }).notNull(),
	description: varchar("description", { length: 50 }).notNull(),
	coverage: varchar("coverage", { length: 100 }).notNull(),
	isActive: tinyint("isActive").default(1).notNull(),
	createdAt: datetime("createdAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
	updatedAt: datetime("updatedAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
});

export const refCoverage = mysqlTable("ref_coverage", {
	id: bigint("id", { mode: "number" }).autoincrement().notNull(),
	coverageCode: varchar("coverage_code", { length: 50 }).notNull(),
	coverageName: varchar("coverage_name", { length: 100 }).notNull(),
	description: text("description"),
	options: json("options"),
	rules: json("rules"),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
},
(table) => {
	return {
		idxCoverageCode: index("idx_coverage_code").on(table.coverageCode),
		idxActive: index("idx_active").on(table.isActive),
		coverageCode: unique("coverage_code").on(table.coverageCode),
	}
});

export const refFuelTypes = mysqlTable("ref_fuel_types", {
	id: int("id").autoincrement().notNull(),
	code: varchar("code", { length: 20 }).notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	description: text("description"),
	category: mysqlEnum("category", ['fossil','electric','hybrid','alternative']).notNull(),
	powerConversionFactor: decimal("power_conversion_factor", { precision: 10, scale: 4 }).default('1.0000'),
	riskFactor: decimal("risk_factor", { precision: 10, scale: 4 }).default('1.0000'),
	ecoBonus: decimal("eco_bonus", { precision: 10, scale: 4 }).default('0.0000'),
	sortingOrder: int("sorting_order").default(0),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
},
(table) => {
	return {
		idxCode: index("idx_code").on(table.code),
		idxCategory: index("idx_category").on(table.category),
		idxActive: index("idx_active").on(table.isActive),
		code: unique("code").on(table.code),
	}
});

export const refVehicleBodyTypes = mysqlTable("ref_vehicle_body_types", {
	id: bigint("id", { mode: "number" }).autoincrement().notNull(),
	code: varchar("code", { length: 10 }).notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	nameFr: varchar("name_fr", { length: 100 }).notNull(),
	category: varchar("category", { length: 50 }).notNull(),
	description: text("description"),
	seatsMin: int("seats_min").default(1).notNull(),
	seatsMax: int("seats_max"),
	weightClass: varchar("weight_class", { length: 20 }),
	usageType: varchar("usage_type", { length: 50 }),
	internationalCode: varchar("international_code", { length: 20 }),
	sortOrder: int("sort_order").default(0),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
},
(table) => {
	return {
		idxCode: index("idx_code").on(table.code),
		idxCategory: index("idx_category").on(table.category),
		idxActiveSort: index("idx_active_sort").on(table.isActive, table.sortOrder),
		code: unique("code").on(table.code),
	}
});

export const refVehicleBrands = mysqlTable("ref_vehicle_brands", {
	code: varchar("code", { length: 10 }).notNull(),
	name: varchar("name", { length: 50 }).notNull(),
	isActive: tinyint("isActive").default(1).notNull(),
	createdAt: datetime("createdAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
	updatedAt: datetime("updatedAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
});

export const refVehicleCategories = mysqlTable("ref_vehicle_categories", {
	id: smallint("id").notNull(),
	code: varchar("code", { length: 10 }).notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	description: text("description"),
	parentId: smallint("parent_id"),
	isActive: tinyint("is_active").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => {
	return {
		code: unique("code").on(table.code),
	}
});

export const refVehicleManufacturers = mysqlTable("ref_vehicle_manufacturers", {
	id: bigint("id", { mode: "number" }).autoincrement().notNull(),
	code: varchar("code", { length: 10 }).notNull(),
	name: varchar("name", { length: 100 }).notNull(),
	displayName: varchar("display_name", { length: 100 }),
	shortName: varchar("short_name", { length: 20 }),
	countryCode: char("country_code", { length: 2 }),
	website: varchar("website", { length: 255 }),
	logoUrl: varchar("logo_url", { length: 255 }),
	description: text("description"),
	status: mysqlEnum("status", ['active','inactive','pending']).default('active').notNull(),
	isVerified: tinyint("is_verified").default(0).notNull(),
	isLocked: tinyint("is_locked").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').onUpdateNow().notNull(),
	createdBy: bigint("created_by", { mode: "number" }),
	updatedBy: bigint("updated_by", { mode: "number" }),
},
(table) => {
	return {
		idxManufacturerStatus: index("idx_manufacturer_status").on(table.status),
		idxManufacturerCountry: index("idx_manufacturer_country").on(table.countryCode),
		ukManufacturerCode: unique("uk_manufacturer_code").on(table.code),
		ukManufacturerName: unique("uk_manufacturer_name").on(table.name),
	}
});

export const refVehicleModels = mysqlTable("ref_vehicle_models", {
	code: varchar("code", { length: 10 }).notNull(),
	brandCode: varchar("brandCode", { length: 10 }).notNull().references(() => refVehicleBrands.code, { onDelete: "restrict", onUpdate: "restrict" } ),
	name: varchar("name", { length: 50 }).notNull(),
	isActive: tinyint("isActive").default(1).notNull(),
	createdAt: datetime("createdAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
	updatedAt: datetime("updatedAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
},
(table) => {
	return {
		idxBrand: index("idx_brand").on(table.brandCode),
	}
});

export const users = mysqlTable("users", {
	id: int("id").autoincrement().notNull(),
	username: varchar("username", { length: 50 }).notNull(),
	password: varchar("password", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	role: mysqlEnum("role", ['ADMIN','USER','API']).default('USER').notNull(),
	isActive: tinyint("isActive").default(1),
	lastLogin: datetime("lastLogin", { mode: 'string'}),
	createdAt: datetime("createdAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
	updatedAt: datetime("updatedAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
	deletedAt: datetime("deletedAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
},
(table) => {
	return {
		idxUsername: index("idx_username").on(table.username),
		username: unique("username").on(table.username),
		email: unique("email").on(table.email),
	}
});

export const userTokens = mysqlTable("user_tokens", {
	id: int("id").autoincrement().notNull(),
	userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	token: text("token").notNull(),
	expiresAt: datetime("expiresAt", { mode: 'string'}).notNull(),
	lastUsedAt: datetime("lastUsedAt", { mode: 'string'}),
	createdAt: datetime("createdAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
	updatedAt: datetime("updatedAt", { mode: 'string'}).default('CURRENT_TIMESTAMP'),
},
(table) => {
	return {
		idxUserTokensUser: index("idx_user_tokens_user").on(table.userId),
		idxUserTokensExpiry: index("idx_user_tokens_expiry").on(table.expiresAt),
	}
});