import { MainErrorFallback } from '@/components/errors/main';
import { Spinner } from '@/components/ui/spinner';

import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';


type AppProviderProps = {
    children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {

    return (
        <Suspense
            fallback={
                <div className="flex h-screen w-screen items-center justify-center">
                    <Spinner size="xl" />
                </div>
            }
        >
            <ErrorBoundary FallbackComponent={MainErrorFallback}>

                {children}

            </ErrorBoundary>
        </Suspense>
    );
};