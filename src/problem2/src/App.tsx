import CurrencySwap from './pages/CurrencySwapPage';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex justify-center p-4">
            <ErrorBoundary>
                <CurrencySwap />
            </ErrorBoundary>
        </div>
    );
}
