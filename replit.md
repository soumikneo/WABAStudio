# WhatsApp Business Intelligence & Compliance Platform

## Overview

This is a comprehensive WhatsApp Business API management platform designed to solve the critical challenges businesses face with WhatsApp template management and compliance. The platform acts as an intelligent wrapper around Meta's WhatsApp Cloud API, providing advanced features for template creation, AI-powered validation, real-time compliance monitoring, and team collaboration.

The application positions itself as "Stripe for WhatsApp Business API" - making the complex and error-prone WhatsApp Business API accessible and safe for businesses to use. It addresses the industry-wide problem of high template rejection rates (67% on first submission) and the risk of account bans due to policy violations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod schema validation
- **Real-time Updates**: WebSocket client for live collaboration and notifications

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful APIs with WebSocket support for real-time features
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit's OIDC authentication system with session management
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple

### Database Design
- **Primary Database**: PostgreSQL (via Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema versioning
- **Key Tables**:
  - Users and authentication sessions
  - WhatsApp Business Accounts (WABA) management
  - Template storage with versioning and metadata
  - Compliance events and violation tracking
  - AI validation results and analytics
  - Team activity logs and audit trails
  - Webhook event logging

### API Integration Layer
- **WhatsApp Business API**: Direct integration with Meta's Graph API v18.0
- **AI Services**: OpenAI GPT-5 integration for template validation and auto-fixing
- **External Services**: Neon serverless PostgreSQL for database hosting

### Real-time Features
- **WebSocket Server**: Custom WebSocket implementation for live collaboration
- **Event Broadcasting**: Room-based messaging for team collaboration features
- **Live Updates**: Real-time template updates, compliance alerts, and team activity

### Authentication & Security
- **Authentication Provider**: Replit OIDC with automatic user provisioning
- **Session Management**: Secure session storage with PostgreSQL backend
- **Authorization**: Role-based access control for team collaboration features
- **API Security**: Protected routes with authentication middleware

### Development & Deployment
- **Build System**: Vite for frontend bundling with hot module replacement
- **Production Build**: esbuild for server-side bundling and optimization
- **Development Tools**: 
  - TypeScript for type safety across the stack
  - Custom logging and error handling middleware
  - Replit integration for development environment

### Key Architectural Decisions
1. **Monorepo Structure**: Shared schema and types between client/server for consistency
2. **Type Safety**: Full TypeScript coverage with Zod validation for runtime safety
3. **Real-time First**: WebSocket integration for collaborative features and live updates
4. **Compliance Focus**: Dedicated compliance monitoring and event tracking systems
5. **AI Integration**: OpenAI services for intelligent template validation and optimization

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit OIDC authentication service
- **File Storage**: Local file system (expandable to cloud storage)

### Third-party APIs
- **WhatsApp Business API**: Meta's Graph API v18.0 for template management and messaging
- **OpenAI API**: GPT-5 model for AI-powered template validation and auto-fixing
- **Replit Services**: Development environment and deployment platform

### Key Libraries & Frameworks
- **Frontend**: React, TanStack Query, Wouter, shadcn/ui, Tailwind CSS
- **Backend**: Express.js, Drizzle ORM, Passport.js, WebSocket (ws)
- **Database**: @neondatabase/serverless, drizzle-orm, connect-pg-simple
- **Validation**: Zod for schema validation and type inference
- **Development**: Vite, TypeScript, esbuild for build tooling

### Monitoring & Analytics
- **Error Tracking**: Built-in error handling and logging system
- **Performance**: Custom metrics collection for template performance analytics
- **Compliance Tracking**: Real-time webhook monitoring for policy violation detection