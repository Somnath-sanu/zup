# React (Vite) + shadcn-ui E2B Sandbox Template

This template creates an E2B sandbox with a React application built using Vite and configured with shadcn-ui components.

## Features

- ⚡ **Vite** - Lightning fast HMR and build tool
- ⚛️ **React 18** - Latest React with TypeScript support
- 🎨 **shadcn-ui** - Beautiful, accessible components
- 🎭 **Tailwind CSS** - Utility-first CSS framework
- 🌗 **Dark Mode** - Built-in dark mode support
- 📦 **All shadcn components** - Pre-installed and ready to use

## Template Structure

- `e2b.Dockerfile` - Docker configuration for the sandbox
- `e2b.toml` - E2B template configuration
- `compile_page.sh` - Script to start and health-check the Vite dev server

## Building the Template

To build this E2B sandbox template, run:

```bash
e2b template build
```

This will:

1. Create a Vite + React + TypeScript application
2. Install and configure Tailwind CSS
3. Set up shadcn-ui with all components
4. Configure path aliases (@/components, @/lib/utils)
5. Start the development server on port 5173

## Using the Template

Once built, you can create a sandbox using:

### JavaScript/TypeScript

```javascript
import { Sandbox } from "e2b";
const sandbox = await Sandbox.create("vibe-react-vite-shanu");
```

### Python

```python
from e2b import Sandbox
sandbox = Sandbox("vibe-react-vite-shanu")
```

## Development Server

The Vite dev server runs on port **5173** and is accessible via the E2B sandbox's network.

## Key Differences from Next.js Template

1. **Port**: Vite uses port `5173` instead of `3000`
2. **Dev Server**: Uses `npm run dev -- --host` instead of `npx next dev`
3. **Build Tool**: Vite instead of Next.js/Turbopack
4. **Configuration**: Vite uses `vite.config.ts` for path aliases and server config
5. **Routing**: Client-side routing only (no server-side rendering)

## shadcn-ui Configuration

The template includes:

- All shadcn-ui components pre-installed
- Neutral color scheme (customizable)
- Dark mode support
- CSS variables for theming
- Utility function (`cn`) for class merging

## Customization

You can customize the template by:

1. Modifying `e2b.Dockerfile` to add more dependencies
2. Changing the shadcn-ui theme in `components.json`
3. Updating Tailwind configuration in `tailwind.config.js`
4. Adding custom components in the build process

## Troubleshooting

If the sandbox fails to start:

1. Check that port 5173 is not blocked
2. Ensure all npm dependencies installed correctly
3. Verify the health check in `compile_page.sh` is working
4. Check E2B logs for build errors
