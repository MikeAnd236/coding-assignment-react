# Client

This is the React implementation of the Tickets webapp.

### Tech Stack

- React.js (Hooks, Functional Components)

- TypeScript for type safety

- Ant Design for UI components and layout

- Axios for API requests

### Installation

```bash
# Install dependencies
yarn install
```

### Running the Application

```bash
# Start the development server
yarn start

# or using nx
yarn nx serve client
```

### Running Tests

```bash
# Run all tests
yarn nx test client

# Run specific test file
yarn nx test client --testFile="src/app/tickets/tickets.spec.tsx"
yarn nx test client --testFile="src/app/ticket-details/ticket-details.spec.tsx"
```

### Development

The application uses:

- React 18 with functional components and hooks

- TypeScript for enhanced development experience

- Ant Design components for consistent UI

- Axios for HTTP requests with proper error handling
