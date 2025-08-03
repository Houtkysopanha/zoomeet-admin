# Zoomeet Admin

This project is a Nuxt.js application designed for managing events and bookings. It includes a comprehensive admin section with various features to facilitate event management.

## Project Structure

- **`components/`**: Contains reusable Vue components used across the application.
- **`layouts/`**: Defines the layout structure for different pages.
- **`pages/`**: Contains Vue files for different pages of the application, including:
  - **`admin/`**: Administrative pages for managing events, bookings, users, and more.
  - **`index.vue`**: The main or home page of the application.
  - **`login.vue`**: The login page for user authentication.
- **`plugins/`**: Vue plugins used in the application.
- **`assets/`**: Static assets like images and styles.
- **`server/`**: Server-side code for handling backend logic.
- **`nuxt.config.ts`**: Configuration file for Nuxt.js.
- **`tailwind.config.js`**: Configuration for Tailwind CSS.

## Key Features

- **Event Management**: Create, view, and manage events with detailed statistics and information.
- **Booking Management**: Manage bookings with features like search, sort, pagination, and actions (e.g., refund, remove).
- **User Management**: Administer user roles and profiles.
- **Responsive Design**: Utilizes Tailwind CSS for a responsive and modern UI.
- **Interactive Elements**: Includes interactive components like data tables, dropdowns, and action menus.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Additional Information

For more details on the components and their usage, refer to the source code and comments within the files. The project is structured to facilitate easy navigation and understanding of the codebase.
