# Project Structure Overview

This document provides an overview of the project structure for the Zoomeet Admin application.

## Directory Structure

```
/Users/houtkysopanha/Desktop/zoomet-admin
├── .git/                   # Git repository metadata
├── .nuxt/                  # Nuxt.js build directory
├── .output/                # Output directory for build artifacts
├── .qodo/                  # Qodo configuration or metadata
├── app.vue                 # Main Vue component file
├── assets/                 # Static assets like images and styles
├── components/             # Reusable Vue components
├── layouts/                # Layouts for different pages
├── middleware/             # Middleware functions for handling requests
├── node_modules/           # Installed npm packages
├── nuxt.config.ts          # Configuration file for Nuxt.js
├── package-lock.json       # Lockfile for npm dependencies
├── package.json            # Project metadata and dependencies
├── pages/                  # Vue files for different pages
│   ├���─ admin/              # Administrative pages
│   ├── index.vue           # Main or home page
│   └── login.vue           # Login page
├── plugins/                # Vue plugins used in the application
├── public/                 # Publicly accessible files
├── README.md               # Project documentation
├── server/                 # Server-side code
├── tailwind.config.js      # Configuration for Tailwind CSS
├── text.md                 # Additional notes or documentation
└── tsconfig.json           # TypeScript configuration file
```

## Key Components

- **Components**: Reusable Vue components that can be used across different pages.
- **Layouts**: Define the structure and layout of different pages.
- **Pages**: Contains the main content and logic for each page of the application.
- **Plugins**: Extend Vue functionality with additional features.
- **Server**: Contains server-side logic and API endpoints.

This structure is designed to facilitate easy navigation and understanding of the codebase.
