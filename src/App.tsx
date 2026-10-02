import React from 'react';
import { StudioProvider } from './store/studioContext';
import { StudioLayout } from './components/layout/StudioLayout';

export const App: React.FC = () => {
  return (
    <StudioProvider>
      <div className="w-screen h-screen h-[100dvh] flex flex-col bg-studio-bg text-zinc-100 overflow-hidden">
        <StudioLayout />
      </div>
    </StudioProvider>
  );
};

export default App;
