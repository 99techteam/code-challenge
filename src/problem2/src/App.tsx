// src/App.tsx
import { Index } from './pages/Index';
import { NotFound } from './pages/NotFound';

// Object-based routing
const routes: Record<string, React.ComponentType> = {
	'/': Index,
	'/404': NotFound,
};

function App() {
	// Simple client-side route matching
	const path = window.location.pathname;
	const PageComponent = routes[path] ?? NotFound;

	return <PageComponent />;
}

export default App;
