# Updated Package.json Scripts for Environment Management

Add these scripts to your package.json to properly manage environments:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development nuxt dev",
    "dev:prod": "NODE_ENV=production nuxt dev",
    "build": "NODE_ENV=production nuxt build",
    "build:dev": "NODE_ENV=development nuxt build",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  }
}
```

## Usage:
- `npm run dev` - Development with dev APIs
- `npm run dev:prod` - Development with production APIs (for testing)
- `npm run build` - Production build
- `npm run build:dev` - Development build