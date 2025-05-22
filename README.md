# Enterprise Next.js Frontend Starter

## Description

This is an enterprise-grade Next.js frontend application that provides a modern, responsive, and maintainable user interface. Built with TypeScript and following React best practices, it implements a robust authentication system, internationalization support, and real-time features using WebSocket integration.

This frontend application is designed to work in conjunction with the [NestJS Starter](https://github.com/KieronWiltshire/nestjs-starter) backend repository, which provides the necessary API endpoints and real-time functionality. It is recommended to use the NestJS Starter as the backend for this application.

## Table of Contents
- [Description](#description)
- [Backend Integration](#backend-integration)
- [Features](#features)
  - [Authentication](#authentication)
  - [Internationalization](#internationalization)
- [Installation](#installation)
  - [Dependencies](#dependencies)
  - [Environment Setup](#environment-setup)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Development Guidelines](#development-guidelines)
  - [State Management](#state-management)
  - [Form Handling](#form-handling)
  - [Styling](#styling)
  - [Adding New Features](#adding-new-features)
- [Stay in touch](#stay-in-touch)
- [License](#license)

## Backend Integration

This frontend application is designed to work seamlessly with the [NestJS Starter](https://github.com/KieronWiltshire/nestjs-starter) backend repository.

To set up the complete system:

1. Clone and set up the [NestJS Starter](https://github.com/KieronWiltshire/nestjs-starter) backend repository
2. Configure the backend environment variables
3. Set the `API_URL` in this frontend's `.env.local` to point to your backend instance
4. Follow the backend repository's documentation for additional setup steps

## Features

- 🔐 **Authentication & Security**
  - Secure session management with iron-session
  - JWT token handling
  - Protected routes and middleware
  - WorkOS integration for enterprise authentication
  > **Note:** This implementation does not include organization/tenant management features. For multi-tenant applications, additional development would be required.

- 🌐 **Internationalization**
  - Multi-language support with next-intl
  - RTL/LTR layout support
  - Message management system

- 🎨 **UI/UX**
  - Modern component library with Radix UI
  - Responsive design with Tailwind CSS
  - Dark/Light theme support
  - Custom animations and transitions

- 🔄 **State Management & Data Flow**
  - React Hook Form for form handling
  - Zod for schema validation
  - Real-time updates with Socket.IO

- 📧 **Email System**
  - React Email for template management
  - Plunk integration for email delivery
  - Custom email components

- 🛠️ **Development Tools**
  - TypeScript for type safety
  - ESLint for code quality
  - Turbopack for fast development
  - Hot module replacement

## Installation

### Dependencies

This project requires Node.js 18.x or later. Install dependencies using:

```bash
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Configure the following environment variables:
   - `APP_URL`: Frontend application URL
   - `APP_SECRET`: Secret for session encryption
   - `API_URL`: Backend API URL
   - `WORKOS_API_KEY`: WorkOS API key for authentication
   - `WORKOS_CLIENT_ID`: WorkOS client ID
   - `NEXT_PUBLIC_WORKOS_REDIRECT_URI`: WorkOS redirect URI for authentication
   - `PLUNK_API_KEY`: Plunk API key for email delivery

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Building for Production

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## Testing

Run the test suite:

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Project Structure

```
src/
├── actions/       # Server actions and API calls
├── app/           # Next.js app router pages
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── i18n/          # Internationalization files
├── lib/           # Utility functions and configurations
├── providers/     # React context providers
├── schema/        # Zod validation schemas
└── types/         # TypeScript type definitions
```

## Development Guidelines

### State Management

- Keep state as local as possible
- Implement proper loading and error states

### Form Handling

- Use React Hook Form for all forms
- Implement Zod schemas for validation
- Handle form errors gracefully
- Use controlled components when necessary

### Styling

- Follow Tailwind CSS best practices
- Use CSS modules for component-specific styles
- Implement responsive design patterns
- Follow the design system guidelines

### Adding New Features

When adding new features, follow these steps:

1. Create necessary components in the `src/components` directory
2. Add types in the `src/types` directory
3. Implement validation schemas in the `src/schema` directory
4. Add server actions in the `src/actions` directory
5. Create pages in the `src/app` directory
6. Add translations in the `messages` directory
7. Implement tests
8. Update documentation

## Stay in touch

- Authors
    - [Kieron Wiltshire](mailto:kieron.wiltshire@outlook.com)

## License

MIT License

Copyright (c) 2025 Kieron Wiltshire

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
