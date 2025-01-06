# Next Insurance - Premium Calculation Service

## Automobile Insurance Premium Calculation API

### Project Overview

Next Insurance provides a flexible, autonomous, and performant API for calculating automobile insurance premiums. The service is designed with a focus on modularity, extensibility, and adherence to SOLID principles.

### Architecture

#### Key Design Patterns
- **Adapter Pattern**: Allows for multiple configuration providers (JSON, Database)
- **Strategy Pattern**: Enables flexible premium calculation strategies
- **Dependency Inversion**: Depends on abstractions, not concrete implementations

### Components

#### 1. Types (`/engine/types/premium.types.ts`)
- Strongly typed enums for vehicle categories, body types, and coverage options
- Comprehensive interfaces for calculation parameters and results

#### 2. Configuration Interface (`/engine/interfaces/config-provider.interface.ts`)
- Defines a generic interface for configuration providers
- Supports base configurations, coverage details, and calculation constants

#### 3. JSON Configuration Adapter (`/engine/adapters/json-config.adapter.ts`)
- Implements `IPremiumConfigProvider` for JSON-based configurations
- Loads and parses configuration from `/config/premium.config.json`

#### 4. Premium Calculation Service (`/engine/service.premium.ts`)
- Core service for premium calculations
- Supports multiple vehicle categories
- Calculates base premiums, coverage premiums, and additional options

### Configuration

The service uses a flexible JSON configuration (`/config/premium.config.json`) that allows easy modification of:
- Base premiums by vehicle category
- Coverage rates and minimum premiums
- Additional options (passengers, defense, roadside assistance)
- Tax rates and calculation constants

### Features

- Dynamic premium calculation based on vehicle characteristics
- Support for multiple vehicle categories
- Flexible coverage options
- Fleet and electric vehicle discounts
- Prorated premium calculations

### Supported Vehicle Categories
- Tourism
- Commercial
- Public Transport
- Passenger Transport

### Extensibility
- Easy to add new vehicle categories
- Simple configuration updates
- Supports different configuration providers

### Development

#### Prerequisites
- TypeScript
- Node.js

#### Installation
```bash
npm install
```

#### Running Tests
```bash
npm test
```

### License
[Specify your license here]

### Contributing
Please read `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.
