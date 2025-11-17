# IP Lookup React

A React + TypeScript application with full CI/CD pipeline and unit testing setup.

## Features

- React 19 with TypeScript
- Jest + React Testing Library for unit tests
- Webpack for bundling and development
- ESLint for code quality
- GitHub Actions CI/CD pipeline

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm (comes with Node.js)

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building

Build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Testing

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Linting

Run ESLint:

```bash
npm run lint
```

Fix linting issues automatically:

```bash
npm run lint:fix
```

### Type Checking

Check TypeScript types:

```bash
npm run type-check
```

## CI/CD

The project includes GitHub Actions workflows:

- **CI Pipeline** (`.github/workflows/ci.yml`):
  - Runs tests on multiple Node.js versions (18.x, 20.x)
  - Performs linting and type checking
  - Generates test coverage reports
  - Builds the application

- **GitHub Pages Deployment** (`.github/workflows/deploy.yml`):
  - Automatically deploys to GitHub Pages on pushes to `main` branch
  - Uses the modern GitHub Pages deployment workflow

## Deployment

### GitHub Pages

The app is configured to deploy automatically to GitHub Pages:

1. **Enable GitHub Pages in your repository:**
   - Go to your repository settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions"

2. **Automatic Deployment:**
   - The workflow (`.github/workflows/deploy.yml`) will automatically deploy when you push to the `main` branch
   - Your app will be available at: `https://[your-username].github.io/[repository-name]/`

3. **Manual Deployment:**
   - You can also trigger deployment manually from the "Actions" tab by running the "Deploy to GitHub Pages" workflow

**Note:** The webpack configuration automatically adjusts the `publicPath` based on your repository name, so it should work out of the box!

## Project Structure

```
ip-lookup-react/
├── .github/
│   └── workflows/
│       ├── ci.yml          # CI/CD pipeline
│       └── deploy.yml      # GitHub Pages deployment
├── src/
│   ├── App.tsx             # Main app component
│   ├── App.test.tsx        # App component tests
│   ├── main.tsx            # Application entry point
│   ├── index.css           # Global styles
│   └── setupTests.ts       # Jest test setup
├── .eslintrc.cjs           # ESLint configuration
├── .gitignore              # Git ignore rules
├── jest.config.js          # Jest configuration
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
├── webpack.config.js       # Webpack configuration
└── index.html              # HTML template
```

## Scripts

- `npm run dev` - Start Webpack dev server (opens browser automatically)
- `npm run build` - Build for production (outputs to `dist` directory)
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Check TypeScript types