import React, { useState, useEffect } from 'react';
import { useRaceStore } from './stores/useRaceStore.ts';
import { Navbar } from './components/common/Navbar.tsx';
import { Footer } from './components/common/Footer.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { LobbyPage } from './pages/LobbyPage.tsx';
import { RacePage } from './pages/RacePage.tsx';
import { LeaderboardPage } from './pages/LeaderboardPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { AuthModal } from './components/common/AuthModal.tsx';
import { AlertCircle, X, WifiOff } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'lobby' | 'race' | 'leaderboard' | 'profile'>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const {
    user,
    isConnected,
    currentRoom,
    publicRooms,
    isLoadingRoom,
    errorMessage,
    initAuth,
    login,
    register,
    playGuest,
    logout,
    updateCar,
    quickMatch,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    sendProgress,
    requestRematch,
    fetchPublicRooms,
    clearError,
  } = useRaceStore();

  // Initialize auth & socket
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // When room becomes active, switch tab to 'race'
  useEffect(() => {
    if (currentRoom) {
      setCurrentTab('race');
    } else if (currentTab === 'race') {
      setCurrentTab('lobby');
    }
  }, [currentRoom]);

  // When switching to lobby, fetch public rooms
  useEffect(() => {
    if (currentTab === 'lobby') {
      fetchPublicRooms();
    }
  }, [currentTab, fetchPublicRooms]);

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-cyan-500/30">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={logout}
        activeRoomId={currentRoom?.id}
      />

      {/* Connection Indicator banner if offline */}
      {!isConnected && (
        <div className="bg-amber-950/80 border-b border-amber-600/40 px-4 py-1.5 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Serverga ulanish tiklanmoqda... Real-time ulanish kutilmoqda.</span>
        </div>
      )}

      {/* Global Error Alert Banner */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-4 w-full">
          <div className="bg-rose-950/90 border border-rose-500/50 rounded-2xl p-3 px-4 flex items-center justify-between text-rose-200 text-xs shadow-xl animate-bounce">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={clearError}
              className="text-rose-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Pages Content */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'home' && (
          <LandingPage
            onPlayNow={() => setCurrentTab('lobby')}
            onExploreLeaderboard={() => setCurrentTab('leaderboard')}
          />
        )}

        {currentTab === 'lobby' && (
          <LobbyPage
            onQuickMatch={quickMatch}
            onCreateRoom={createRoom}
            onJoinByCode={joinRoom}
            publicRooms={publicRooms}
            onRefreshRooms={fetchPublicRooms}
            selectedCarId={user?.carId || 'car-cyan'}
            onSelectCar={updateCar}
            isLoading={isLoadingRoom}
          />
        )}

        {currentTab === 'race' && currentRoom && (
          <RacePage
            room={currentRoom}
            currentUserId={user?.id || ''}
            onToggleReady={toggleReady}
            onSendProgress={sendProgress}
            onLeaveRoom={leaveRoom}
            onRematch={requestRematch}
          />
        )}

        {currentTab === 'leaderboard' && <LeaderboardPage />}

        {currentTab === 'profile' && user && (
          <ProfilePage
            user={user}
            onUpdateCar={updateCar}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={login}
        onRegister={register}
        onPlayGuest={playGuest}
      />
    </div>
  );
}
