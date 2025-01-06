-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `api_keys` (
	`id` int(10) AUTO_INCREMENT NOT NULL,
	`userId` varchar(36) NOT NULL,
	`apiKey` varchar(64) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`environment` enum('PRODUCTION','SANDBOX','DEVELOPMENT') NOT NULL DEFAULT 'DEVELOPMENT',
	`expiresAt` datetime,
	`lastUsedAt` datetime,
	`rateLimit` int(11) NOT NULL DEFAULT 100,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`permissions` json,
	`metadata` json,
	`createdAt` datetime DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` datetime DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `apiKey` UNIQUE(`apiKey`)
);
--> statement-breakpoint
CREATE TABLE `api_logs` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`user_id` int(11),
	`endpoint` varchar(255) NOT NULL,
	`method` varchar(10) NOT NULL,
	`request_headers` text,
	`request_body` text,
	`response_code` int(3) NOT NULL,
	`response_body` text,
	`ip_address` varchar(45) NOT NULL,
	`user_agent` varchar(255),
	`duration` float,
	`created_at` datetime NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` varchar(36) NOT NULL,
	`customerCode` varchar(10) NOT NULL,
	`lastName` varchar(50) NOT NULL,
	`firstName` varchar(50) NOT NULL,
	`idNumber` varchar(20) NOT NULL,
	`phoneNumber` varchar(15) NOT NULL,
	`email` varchar(255),
	`address` text NOT NULL,
	`countryCode` varchar(2) NOT NULL,
	`birthDate` date NOT NULL,
	`createdAt` datetime DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` datetime DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `customerCode` UNIQUE(`customerCode`),
	CONSTRAINT `idNumber` UNIQUE(`idNumber`)
);
--> statement-breakpoint
CREATE TABLE `engine_calculation_components` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`component_type` enum('base','multiplier','addition','subtraction','percentage') NOT NULL,
	`priority` int(11) DEFAULT 0,
	`is_active` tinyint DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `code` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `engine_calculation_formulas` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`is_active` tinyint DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `code` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `engine_component_conditions` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`component_id` int(11) NOT NULL,
	`ref_condition_id` int(11) NOT NULL,
	`variable_id` int(11) NOT NULL,
	`value_start` varchar(255) NOT NULL,
	`value_end` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `engine_component_values` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`component_id` int(11) NOT NULL,
	`category_id` int(11) NOT NULL,
	`value_type` enum('fixed','percentage','multiplier') NOT NULL,
	`value` decimal(10,4) NOT NULL,
	`min_value` decimal(15,2),
	`max_value` decimal(15,2),
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `engine_formula_components` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`formula_id` int(11) NOT NULL,
	`component_id` int(11) NOT NULL,
	`execution_order` int(11) NOT NULL,
	`is_optional` tinyint DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `engine_ref_conditions` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`operator` enum('equals','not_equals','greater','less','between','in','not_in') NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `code` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `engine_ref_operation_types` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `code` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `engine_ref_variables` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`data_type` enum('numeric','boolean','string','date') NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `code` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `insurance_base_rates` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`category` varchar(50) NOT NULL,
	`sub_category` varchar(50),
	`fiscal_power` varchar(20) NOT NULL,
	`rate` decimal(10,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `insurance_categories` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`ref_category_id` int(11) NOT NULL,
	`power_category` varchar(50),
	`max_weight` decimal(10,2),
	`max_seats` int(11),
	`is_active` tinyint DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `code` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `insurance_certificate` (
	`id` bigint(20) AUTO_INCREMENT NOT NULL,
	`certificate_number` varchar(100),
	`registration_number` varchar(100),
	`chassis_number` varchar(100),
	`policy_number` varchar(100),
	CONSTRAINT `UK_CERTIFIATE_CHECK` UNIQUE(`certificate_number`,`registration_number`,`chassis_number`,`policy_number`)
);
--> statement-breakpoint
CREATE TABLE `insurance_coverages` (
	`id` bigint(20) AUTO_INCREMENT NOT NULL,
	`coverage_code` varchar(50) NOT NULL,
	`coverage_name` varchar(100) NOT NULL,
	`description` text,
	`options` json,
	`rules` json,
	`is_active` tinyint DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coverage_code` UNIQUE(`coverage_code`)
);
--> statement-breakpoint
CREATE TABLE `insurance_packs` (
	`id` bigint(20) AUTO_INCREMENT NOT NULL,
	`pack_code` varchar(50) NOT NULL,
	`pack_name` varchar(100) NOT NULL,
	`pack_description` text,
	`options` json,
	`configuration` json,
	`is_active` tinyint DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pack_code` UNIQUE(`pack_code`)
);
--> statement-breakpoint
CREATE TABLE `insurance_pack_categories` (
	`pack_id` int(11) NOT NULL,
	`category_id` int(11) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `insurance_pack_coverages` (
	`id` bigint(20) AUTO_INCREMENT NOT NULL,
	`pack_id` bigint(20) NOT NULL,
	`coverage_id` bigint(20) NOT NULL,
	`is_main_coverage` tinyint DEFAULT 0,
	`options` json,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `uk_pack_coverage` UNIQUE(`pack_id`,`coverage_id`)
);
--> statement-breakpoint
CREATE TABLE `insurance_policies` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`reference_number` varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `insurance_rules` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`type` varchar(50) NOT NULL,
	`category` varchar(50) NOT NULL,
	`condition_expression` text NOT NULL,
	`parameters` json,
	`priority` int(3) NOT NULL DEFAULT 0,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `insurance_simulations` (
	`id` bigint(20) AUTO_INCREMENT NOT NULL,
	`pack_id` bigint(20),
	`reference_number` varchar(20) NOT NULL,
	`simulation_date` datetime NOT NULL,
	`status` enum('draft','completed','expired') NOT NULL DEFAULT 'draft',
	`client_type` enum('individual','company') NOT NULL,
	`client_name` varchar(100),
	`client_email` varchar(100),
	`client_phone` varchar(20),
	`validity_period` int(11) DEFAULT 7,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reference_number` UNIQUE(`reference_number`)
);
--> statement-breakpoint
CREATE TABLE `insurance_simulation_coverages` (
	`id` bigint(20) AUTO_INCREMENT NOT NULL,
	`simulation_id` bigint(20) NOT NULL,
	`coverage_type` varchar(50) NOT NULL,
	`is_main_coverage` tinyint DEFAULT 1,
	`options` json,
	`premium_amount` decimal(15,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `insurance_simulation_discounts` (
	`id` bigint(20) AUTO_INCREMENT NOT NULL,
	`simulation_id` bigint(20) NOT NULL,
	`discount_type` varchar(50) NOT NULL,
	`discount_rate` decimal(5,2) NOT NULL,
	`discount_amount` decimal(15,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `insurance_simulation_history` (
	`id` bigint(20) AUTO_INCREMENT NOT NULL,
	`simulation_id` bigint(20) NOT NULL,
	`action` varchar(50) NOT NULL,
	`action_date` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`action_by` varchar(100),
	`details` json
);
--> statement-breakpoint
CREATE TABLE `insurance_simulation_results` (
	`id` bigint(20) AUTO_INCREMENT NOT NULL,
	`simulation_id` bigint(20) NOT NULL,
	`base_premium` decimal(15,2) NOT NULL,
	`net_premium` decimal(15,2) NOT NULL,
	`taxes` json NOT NULL,
	`accessories` json NOT NULL,
	`fixed_costs` json NOT NULL,
	`total_amount` decimal(15,2) NOT NULL,
	`prorated_amount` decimal(15,2) NOT NULL,
	`coverage_period` int(11) NOT NULL,
	`period_type` enum('months','days') NOT NULL,
	`calculation_details` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `uk_simulation` UNIQUE(`simulation_id`)
);
--> statement-breakpoint
CREATE TABLE `insurance_simulation_vehicles` (
	`id` bigint(20) AUTO_INCREMENT NOT NULL,
	`simulation_id` bigint(20) NOT NULL,
	`category` int(11) NOT NULL,
	`registration_number` varchar(20),
	`chassis_number` varchar(20),
	`horse_power` int(11) NOT NULL,
	`color` varchar(20),
	`body_type` varchar(50),
	`circulation_zone` varchar(50),
	`fuel_type` enum('essence','diesel') NOT NULL,
	`original_value` decimal(15,2),
	`current_value` decimal(15,2),
	`vehicle_age` int(11),
	`seats_number` int(11),
	`make` varchar(50),
	`model` varchar(50),
	`first_use_date` date,
	`first_registration_date` date,
	`empty_weight` double,
	`max_weight` double,
	`payload` double,
	`usage` varchar(50),
	`has_trailer` int(1) DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `migrations` (
	`id` bigint(20) unsigned AUTO_INCREMENT NOT NULL,
	`version` varchar(255) NOT NULL,
	`class` varchar(255) NOT NULL,
	`group` varchar(255) NOT NULL,
	`namespace` varchar(255) NOT NULL,
	`time` int(11) NOT NULL,
	`batch` int(11) unsigned NOT NULL
);
--> statement-breakpoint
CREATE TABLE `param_vehicle_categories` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` varchar(10) NOT NULL,
	`description` varchar(100) NOT NULL,
	`usage_type` varchar(100) NOT NULL,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` datetime DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` datetime DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `UK_CAT_CODE` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `passenger_surcharges` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`seats` int(3) NOT NULL,
	`category` varchar(50) NOT NULL,
	`surcharge` decimal(10,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`numero` varchar(100) NOT NULL,
	`customer_data` json NOT NULL,
	`vehicle_data` json NOT NULL,
	`coverage_data` json NOT NULL,
	`premium_details` json NOT NULL,
	`valid_until` datetime NOT NULL,
	`status` enum('pending','accepted','expired') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `UK_QUOTE_NUM` UNIQUE(`numero`)
);
--> statement-breakpoint
CREATE TABLE `ref_categories` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` varchar(10) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`min_power` int(11) DEFAULT 0,
	`max_power` int(11) DEFAULT 999,
	`parent_id` int(11),
	`is_active` tinyint DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `code` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `ref_category_old` (
	`id` int(11) unsigned AUTO_INCREMENT NOT NULL,
	`code` varchar(10) NOT NULL,
	`nom` varchar(100) NOT NULL,
	`description` text,
	`code_tarif` varchar(10) NOT NULL,
	`vehicule_type` enum('tourism','commercial','transport_marchandise','transport_personne','deux_roues','engin_chantier','agricole','remorque','special') NOT NULL DEFAULT 'tourism',
	`min_weight` decimal(10,2),
	`max_weight` decimal(10,2),
	`min_place` int(11),
	`max_place` int(11),
	`is_active` tinyint NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `code` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `ref_circulation_zones` (
	`code` varchar(10) NOT NULL,
	`description` varchar(50) NOT NULL,
	`coverage` varchar(100) NOT NULL,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` datetime DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` datetime DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `ref_coverage` (
	`id` bigint(20) AUTO_INCREMENT NOT NULL,
	`coverage_code` varchar(50) NOT NULL,
	`coverage_name` varchar(100) NOT NULL,
	`description` text,
	`options` json,
	`rules` json,
	`is_active` tinyint DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coverage_code` UNIQUE(`coverage_code`)
);
--> statement-breakpoint
CREATE TABLE `ref_fuel_types` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`category` enum('fossil','electric','hybrid','alternative') NOT NULL,
	`power_conversion_factor` decimal(10,4) DEFAULT '1.0000',
	`risk_factor` decimal(10,4) DEFAULT '1.0000',
	`eco_bonus` decimal(10,4) DEFAULT '0.0000',
	`sorting_order` int(11) DEFAULT 0,
	`is_active` tinyint DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `code` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `ref_vehicle_body_types` (
	`id` bigint(20) AUTO_INCREMENT NOT NULL,
	`code` varchar(10) NOT NULL,
	`name` varchar(100) NOT NULL,
	`name_fr` varchar(100) NOT NULL,
	`category` varchar(50) NOT NULL,
	`description` text,
	`seats_min` int(11) NOT NULL DEFAULT 1,
	`seats_max` int(11),
	`weight_class` varchar(20),
	`usage_type` varchar(50),
	`international_code` varchar(20),
	`sort_order` int(11) DEFAULT 0,
	`is_active` tinyint DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `code` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `ref_vehicle_brands` (
	`code` varchar(10) NOT NULL,
	`name` varchar(50) NOT NULL,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` datetime DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` datetime DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `ref_vehicle_categories` (
	`id` smallint(6) NOT NULL,
	`code` varchar(10) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`parent_id` smallint(6),
	`is_active` tinyint DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `code` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `ref_vehicle_manufacturers` (
	`id` bigint(20) unsigned AUTO_INCREMENT NOT NULL,
	`code` varchar(10) NOT NULL,
	`name` varchar(100) NOT NULL,
	`display_name` varchar(100),
	`short_name` varchar(20),
	`country_code` char(2),
	`website` varchar(255),
	`logo_url` varchar(255),
	`description` text,
	`status` enum('active','inactive','pending') NOT NULL DEFAULT 'active',
	`is_verified` tinyint NOT NULL DEFAULT 0,
	`is_locked` tinyint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP' ON UPDATE CURRENT_TIMESTAMP,
	`created_by` bigint(20) unsigned,
	`updated_by` bigint(20) unsigned,
	CONSTRAINT `uk_manufacturer_code` UNIQUE(`code`),
	CONSTRAINT `uk_manufacturer_name` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `ref_vehicle_models` (
	`code` varchar(10) NOT NULL,
	`brandCode` varchar(10) NOT NULL,
	`name` varchar(50) NOT NULL,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` datetime DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` datetime DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int(10) AUTO_INCREMENT NOT NULL,
	`username` varchar(50) NOT NULL,
	`password` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` enum('ADMIN','USER','API') NOT NULL DEFAULT 'USER',
	`isActive` tinyint DEFAULT 1,
	`lastLogin` datetime,
	`createdAt` datetime DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` datetime DEFAULT 'CURRENT_TIMESTAMP',
	`deletedAt` datetime DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `username` UNIQUE(`username`),
	CONSTRAINT `email` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `user_tokens` (
	`id` int(10) AUTO_INCREMENT NOT NULL,
	`userId` int(10) NOT NULL,
	`token` text NOT NULL,
	`expiresAt` datetime NOT NULL,
	`lastUsedAt` datetime,
	`createdAt` datetime DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` datetime DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE INDEX `idx_api_key` ON `api_keys` (`apiKey`);--> statement-breakpoint
CREATE INDEX `idx_user` ON `api_keys` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_active_expiry` ON `api_keys` (`isActive`,`expiresAt`);--> statement-breakpoint
CREATE INDEX `idx_api_keys_last_used` ON `api_keys` (`lastUsedAt`);--> statement-breakpoint
CREATE INDEX `idx_api_keys_environment` ON `api_keys` (`environment`);--> statement-breakpoint
CREATE INDEX `idx_user` ON `api_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_endpoint` ON `api_logs` (`endpoint`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `api_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_response_code` ON `api_logs` (`response_code`);--> statement-breakpoint
CREATE INDEX `idx_customer_code` ON `customers` (`customerCode`);--> statement-breakpoint
CREATE INDEX `idx_id_number` ON `customers` (`idNumber`);--> statement-breakpoint
CREATE INDEX `category_sub_category_fiscal_power` ON `insurance_base_rates` (`category`,`sub_category`,`fiscal_power`);--> statement-breakpoint
CREATE INDEX `idx_code` ON `insurance_categories` (`code`);--> statement-breakpoint
CREATE INDEX `idx_category` ON `insurance_categories` (`ref_category_id`);--> statement-breakpoint
CREATE INDEX `idx_active` ON `insurance_categories` (`is_active`);--> statement-breakpoint
CREATE INDEX `UK_CERTIFICATE` ON `insurance_certificate` (`certificate_number`);--> statement-breakpoint
CREATE INDEX `idx_coverage_code` ON `insurance_coverages` (`coverage_code`);--> statement-breakpoint
CREATE INDEX `idx_active` ON `insurance_coverages` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_pack_code` ON `insurance_packs` (`pack_code`);--> statement-breakpoint
CREATE INDEX `idx_active` ON `insurance_packs` (`is_active`);--> statement-breakpoint
CREATE INDEX `coverage_id` ON `insurance_pack_coverages` (`coverage_id`);--> statement-breakpoint
CREATE INDEX `type_category_status` ON `insurance_rules` (`type`,`category`,`status`);--> statement-breakpoint
CREATE INDEX `idx_reference` ON `insurance_simulations` (`reference_number`);--> statement-breakpoint
CREATE INDEX `idx_client` ON `insurance_simulations` (`client_type`,`client_name`);--> statement-breakpoint
CREATE INDEX `idx_date` ON `insurance_simulations` (`simulation_date`);--> statement-breakpoint
CREATE INDEX `idx_simulation_coverage` ON `insurance_simulation_coverages` (`simulation_id`,`coverage_type`);--> statement-breakpoint
CREATE INDEX `idx_simulation` ON `insurance_simulation_discounts` (`simulation_id`);--> statement-breakpoint
CREATE INDEX `idx_simulation` ON `insurance_simulation_history` (`simulation_id`);--> statement-breakpoint
CREATE INDEX `idx_simulation` ON `insurance_simulation_vehicles` (`simulation_id`);--> statement-breakpoint
CREATE INDEX `category_seats` ON `passenger_surcharges` (`category`,`seats`);--> statement-breakpoint
CREATE INDEX `status_valid_until` ON `quotes` (`status`,`valid_until`);--> statement-breakpoint
CREATE INDEX `parent_id` ON `ref_categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX `idx_code` ON `ref_categories` (`code`);--> statement-breakpoint
CREATE INDEX `idx_active` ON `ref_categories` (`is_active`);--> statement-breakpoint
CREATE INDEX `vehicule_type` ON `ref_category_old` (`vehicule_type`);--> statement-breakpoint
CREATE INDEX `code_tarif` ON `ref_category_old` (`code_tarif`);--> statement-breakpoint
CREATE INDEX `idx_coverage_code` ON `ref_coverage` (`coverage_code`);--> statement-breakpoint
CREATE INDEX `idx_active` ON `ref_coverage` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_code` ON `ref_fuel_types` (`code`);--> statement-breakpoint
CREATE INDEX `idx_category` ON `ref_fuel_types` (`category`);--> statement-breakpoint
CREATE INDEX `idx_active` ON `ref_fuel_types` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_code` ON `ref_vehicle_body_types` (`code`);--> statement-breakpoint
CREATE INDEX `idx_category` ON `ref_vehicle_body_types` (`category`);--> statement-breakpoint
CREATE INDEX `idx_active_sort` ON `ref_vehicle_body_types` (`is_active`,`sort_order`);--> statement-breakpoint
CREATE INDEX `idx_manufacturer_status` ON `ref_vehicle_manufacturers` (`status`);--> statement-breakpoint
CREATE INDEX `idx_manufacturer_country` ON `ref_vehicle_manufacturers` (`country_code`);--> statement-breakpoint
CREATE INDEX `idx_brand` ON `ref_vehicle_models` (`brandCode`);--> statement-breakpoint
CREATE INDEX `idx_username` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `idx_user_tokens_user` ON `user_tokens` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_user_tokens_expiry` ON `user_tokens` (`expiresAt`);--> statement-breakpoint
ALTER TABLE `insurance_categories` ADD CONSTRAINT `insurance_categories_ibfk_1` FOREIGN KEY (`ref_category_id`) REFERENCES `ref_categories`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `insurance_pack_coverages` ADD CONSTRAINT `insurance_pack_coverages_ibfk_1` FOREIGN KEY (`pack_id`) REFERENCES `insurance_packs`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `insurance_pack_coverages` ADD CONSTRAINT `insurance_pack_coverages_ibfk_2` FOREIGN KEY (`coverage_id`) REFERENCES `insurance_coverages`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `insurance_simulation_coverages` ADD CONSTRAINT `insurance_simulation_coverages_ibfk_1` FOREIGN KEY (`simulation_id`) REFERENCES `insurance_simulations`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `insurance_simulation_discounts` ADD CONSTRAINT `insurance_simulation_discounts_ibfk_1` FOREIGN KEY (`simulation_id`) REFERENCES `insurance_simulations`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `insurance_simulation_history` ADD CONSTRAINT `insurance_simulation_history_ibfk_1` FOREIGN KEY (`simulation_id`) REFERENCES `insurance_simulations`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `insurance_simulation_results` ADD CONSTRAINT `insurance_simulation_results_ibfk_1` FOREIGN KEY (`simulation_id`) REFERENCES `insurance_simulations`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `insurance_simulation_vehicles` ADD CONSTRAINT `insurance_simulation_vehicles_ibfk_1` FOREIGN KEY (`simulation_id`) REFERENCES `insurance_simulations`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `ref_categories` ADD CONSTRAINT `ref_categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `ref_categories`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `ref_vehicle_models` ADD CONSTRAINT `ref_vehicle_models_ibfk_1` FOREIGN KEY (`brandCode`) REFERENCES `ref_vehicle_brands`(`code`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `user_tokens` ADD CONSTRAINT `fk_user_tokens_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;
*/