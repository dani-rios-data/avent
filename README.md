# Avent Marketing Dashboard

Avent Marketing Dashboard is a modern web application for exploring advertising, social media, and e-commerce metrics. Built with React and Vite, it offers a fast developer experience and a clean, responsive interface.

## Features
- Multi-tab dashboard covering Ads & Posts Overview, Brand Manufacturer, DME Providers, Social Media, and Amazon Reviews
- Data loading from CSV files with derived metrics and interactive visualizations
- Client-side caching and asynchronous data fetching powered by React Query
- Responsive design and accessible components using Tailwind CSS and shadcn/ui (Radix UI)
- Routing with React Router and rich charts via Recharts

## Tech Stack
- **Framework:** React 18, React Router, React Query
- **Language:** TypeScript
- **Build Tool:** Vite
- **UI & Styling:** Tailwind CSS, shadcn/ui, Radix UI, lucide-react icons
- **Data & Validation:** Recharts, React Hook Form, Zod, date-fns
- **Package Manager:** npm

## Project Structure
```
.
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components and dashboard tabs
│   ├── hooks/            # Custom hooks including CSV data loading
│   ├── pages/            # Route components
│   ├── assets/           # Images and other asset files
│   └── main.tsx          # Application entry point
├── package.json          # Project metadata and scripts
├── vite.config.ts        # Vite configuration
└── tailwind.config.ts    # Tailwind configuration
```

## Getting Started
### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
git clone <repository-url>
cd avent
npm install
```

### Development
```bash
npm run dev
```
Serves the app with hot module replacement.

### Build
```bash
npm run build
```
Generates an optimized production bundle in `dist/`.

### Preview
```bash
npm run preview
```
Serves the production build locally.

## Scripts
- `npm run dev` – start a development server
- `npm run build` – create a production build
- `npm run build:dev` – development-mode build
- `npm run lint` – run ESLint
- `npm run preview` – preview the production build

## Data Processing
Python utilities (`check_dates.py`, `filter_csv_files.py`) assist with preparing CSV datasets consumed by the dashboard.

## Contributing
Pull requests are welcome. Please open an issue to discuss major changes before submitting.

