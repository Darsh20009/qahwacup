# Overview

This is a digital coffee menu application called "قهوة كوب" (Coffee Cup) built as a full-stack web application. The system provides an Arabic-first interface for browsing coffee items, managing a shopping cart, and placing orders with multiple payment methods. It features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Drizzle ORM for database management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React 18 using TypeScript and follows a component-based architecture with:
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API for cart state management with session-based persistence
- **UI Framework**: Shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with a custom Arabic-focused coffee shop theme featuring dark backgrounds and gold accents
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query for server state management and caching

## Backend Architecture
The server uses Express.js with TypeScript in a RESTful API pattern:
- **Framework**: Express.js with middleware for JSON parsing and logging
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: In-memory storage with session-based cart persistence
- **File Structure**: Modular design separating routes, storage layer, and server configuration

## Key Features
- **Multi-language Support**: Arabic-first with RTL layout and English fallbacks
- **Shopping Cart**: Session-based cart with add/remove/update functionality
- **Order Management**: Complete order lifecycle from creation to payment processing
- **Payment Integration**: Multiple payment methods including cash, digital wallets (STC Pay, Alinma Pay), and bank transfers
- **PDF Generation**: Client-side receipt generation for completed orders
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Database Schema
The system uses four main entities:
- **Coffee Items**: Product catalog with multilingual names, pricing, categories, and availability status
- **Orders**: Order tracking with status management and payment details
- **Order Items**: Detailed line items for each order
- **Cart Items**: Session-based temporary storage for shopping cart state

## Component Architecture
- **Page Components**: Splash screen, menu browsing, product details, and cart management
- **UI Components**: Reusable Shadcn/ui components with Arabic localization
- **Modal System**: Cart and checkout modals for streamlined user experience
- **Animation**: CSS animations for loading states and interactive feedback

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router

## UI and Styling Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives for complex components
- **tailwindcss**: Utility-first CSS framework with custom theming
- **class-variance-authority**: Type-safe component variant management
- **clsx**: Conditional className utility

## Form and Validation Dependencies
- **react-hook-form**: Performant form library with validation
- **@hookform/resolvers**: Form validation resolvers
- **zod**: TypeScript-first schema validation

## Development and Build Dependencies
- **vite**: Fast development server and build tool
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds

## Arabic Language Support
- **Google Fonts**: Cairo and Amiri font families for Arabic typography
- **Font Awesome**: Icon library for consistent iconography

## PDF and Document Generation
- **Browser APIs**: Canvas and DOM manipulation for client-side PDF generation

## Database and Storage
- **connect-pg-simple**: PostgreSQL session store (configured but using in-memory for development)
- **drizzle-kit**: Database migration and schema management tools