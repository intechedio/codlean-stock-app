# Codlean Stock App

Local-first stock & warehouse management application built with React, TypeScript, Zustand, and TailwindCSS.

## Features

- **Authentication**: Login with admin/12345
- **Warehouse Management**: Create, edit (inline with auto-save), and manage warehouses
- **Inventory Management**: 
  - Stock In (with serial tracking support)
  - Stock Out (with lot selection)
  - Real-time stock tracking per warehouse
  - Movement history
- **Global Stock View**: System-wide aggregated stock with search and pagination
- **Data Persistence**: All data persists to localStorage (key: `codlean-stock-app`)

## Tech Stack

- React 18 + TypeScript
- Vite
- Zustand (with persist middleware)
- TailwindCSS + shadcn/ui primitives
- React Router v6
- React Hook Form + Zod
- Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

First install test dependencies:
```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Then run tests:
```bash
npm test
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
  app/              # App routing and layout
  components/       # Reusable UI components
    form/          # React Hook Form wrappers
    table/         # Table primitives
    ui/            # shadcn-like primitives
  features/         # Feature modules
    auth/          # Authentication
    catalog/       # Materials, suppliers, customers
    warehouses/    # Warehouse management
    inventory/     # Stock management
    stocks/        # Global stock view
  lib/             # Utilities, schemas, helpers
```

## Default Credentials

- Username: `admin`
- Password: `12345`

## Data Model

- **Warehouses**: Production or Loading warehouses with active/inactive status
- **Materials**: Items with tracking type (Serial or Normal) and units
- **Stock Lots**: Warehouse-specific stock records (aggregated for Normal, per-serial for Seri Takip)
- **Movements**: IN/OUT transactions with line items

## Notes

- All data is stored in browser localStorage
- Serial numbers must be unique system-wide
- Stock operations update lots and create movement records
- Warehouse edits are auto-saved with 500ms debounce