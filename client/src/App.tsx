// client/src/App.tsx
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { HeroBanner } from './components/home/HeroBanner';
import { CategoryChips } from './components/home/CategoryChips';
import { GameCard } from './components/home/GameCard';
import { QuickPlaySection } from './components/home/QuickPlaySection';
import { PromoBanner } from './components/home/PromoBanner';
import { Footer } from './components/layout/Footer';
import { ProfileModal } from './components/profile/ProfileModal';
import { GameModeModal } from './components/lobby/GameModeModal';
import { RoomInviteModal } from './components/lobby/RoomInviteModal';
import { ComingSoonModal } from './components/lobby/ComingSoonModal';
import { GameShell } from './components/game/GameShell';
import { CANVA_GAMES, GAMES, CanvaGameItem } from './data/games';
import {
  BotDifficulty,
  GameMetadata,
  GameMode,
  MultiplayerMatchData,
  UserProfile
} from './types';
import { getStoredProfile } from './services/storage';
import { getSocket } from './services/socket';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<'multiplayer' | 'leaderboard' | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<string>('home');

  // Real-time scroll spy for active navbar link
  useEffect(() => {
    const handleScroll = () => {
      const gamesSection = document.getElementById('games');
      if (window.scrollY < 200) {
        setActiveNav('home');
      } else if (gamesSection && gamesSection.getBoundingClientRect().top <= 300) {
        setActiveNav('games');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Modal for launching game options
  const [selectedGameForModal, setSelectedGameForModal] = useState<GameMetadata | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<GameMode>('bot');

  // Incoming Room Invite from URL (?room=XYZ&game=...)
  const [inviteRoomId, setInviteRoomId] = useState<string | null>(null);
  const [inviteGameId, setInviteGameId] = useState<string | null>(null);

  // Active game session
  const [activeGame, setActiveGame] = useState<GameMetadata | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('bot');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');
  const [multiplayerData, setMultiplayerData] = useState<MultiplayerMatchData | null>(null);

  // Initial socket registration & URL room check
  useEffect(() => {
    const socket = getSocket();
    socket.emit('register_user', profile);

    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const gameParam = params.get('game');

    if (roomParam) {
      setInviteRoomId(roomParam.toUpperCase());
      setInviteGameId(gameParam);
    }
  }, [profile]);

  // Handle selecting a game card (defaults to bot tab)
  const handleSelectCanvaGame = (item: CanvaGameItem) => {
    const matched = GAMES.find(g => g.id === item.gameEngineId) || GAMES[0];
    const customGameMeta: GameMetadata = {
      ...matched,
      title: item.title,
      description: item.description,
      rules: item.rules
    };
    setModalInitialTab('bot');
    setSelectedGameForModal(customGameMeta);
  };

  // Play With Friends button: picks a random game from all our games and opens Friend Room tab
  const handlePlayWithFriends = () => {
    const randomIndex = Math.floor(Math.random() * CANVA_GAMES.length);
    const randomItem = CANVA_GAMES[randomIndex];
    const matched = GAMES.find(g => g.id === randomItem.gameEngineId) || GAMES[0];
    const customGameMeta: GameMetadata = {
      ...matched,
      title: randomItem.title,
      description: randomItem.description,
      rules: randomItem.rules
    };
    setModalInitialTab('room');
    setSelectedGameForModal(customGameMeta);
  };

  // Launch Bot Game
  const handleStartBotGame = (difficulty: BotDifficulty) => {
    if (!selectedGameForModal) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    setActiveGame(selectedGameForModal);
    setGameMode('bot');
    setBotDifficulty(difficulty);
    setMultiplayerData(null);
    setSelectedGameForModal(null);
  };

  // Launch Multiplayer Game (from room or matchmaking)
  const handleStartMultiplayerGame = (matchData: MultiplayerMatchData) => {
    const game = GAMES.find(g => g.id === matchData.gameId) || selectedGameForModal || GAMES[0];
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    setActiveGame(game);
    setGameMode(matchData.roomId.startsWith('M_') ? 'match' : 'room');
    setMultiplayerData(matchData);
    setSelectedGameForModal(null);
    setInviteRoomId(null);
  };

  // Exit from active game back to hub
  const handleExitGame = () => {
    if (multiplayerData) {
      const socket = getSocket();
      socket.emit('leave_room', { roomId: multiplayerData.roomId });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    setActiveGame(null);
    setMultiplayerData(null);
  };

  // Filter games based on selected category chip
  const filteredCanvaGames = activeCategory
    ? CANVA_GAMES.filter(g =>
      g.category.toLowerCase() === activeCategory.toLowerCase() ||
      g.categories?.some(c => c.toLowerCase() === activeCategory.toLowerCase())
    )
    : CANVA_GAMES;

  // If in an active game session, render full GameShell
  if (activeGame) {
    return (
      <GameShell
        gameId={activeGame.id}
        mode={gameMode}
        botDifficulty={botDifficulty}
        multiplayerData={multiplayerData}
        onExit={handleExitGame}
      />
    );
  }

  return (
    <div className="w-full min-h-screen text-[#f7f7ff] overflow-x-hidden selection:bg-[#72ecee] selection:text-[#10142b]" style={{ background: '#080b1c' }}>
      {/* Exact Canva Floating Glass Header */}
      <Navbar
        profile={profile}
        activeNav={activeNav}
        onSelectNav={(nav) => setActiveNav(nav)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenComingSoon={(feature) => setComingSoonFeature(feature)}
      />

      {/* Main Shell Container */}
      <main id="home" className="shell">
        {/* 1. Hero Section with Floating 3D Showcase (Pure decorative visual) */}
        <HeroBanner
          onExploreGames={() => {
            document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onPlayWithFriends={handlePlayWithFriends}
        />

        {/* 2. GOT A MINUTE? Pick up and play */}
        <QuickPlaySection
          items={CANVA_GAMES}
          onSelect={handleSelectCanvaGame}
        />

        {/* 3. FIND YOUR VIBE / What are you in the mood for? Categories */}


        {/* 4. All Games Section (Renamed from Trending Games, displaying our real games) */}
        <section id="games" className="section" aria-labelledby="all-games-title" style={{ padding: '34px 0 62px', scrollMarginTop: '110px' }}>
          {/* Section Heading: Title on left, Note on right (stacks cleanly on mobile) */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 mb-5">
            <div>
              <p
                className="eyebrow"
                style={{
                  color: '#75e9ed',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  margin: '0 0 6px'
                }}
              >
                THE GOOD STUFF
              </p>
              <h2
                id="all-games-title"
                style={{
                  color: '#f7f7ff',
                  fontWeight: 800,
                  fontSize: 'clamp(28px, 3.5vw, 42px)',
                  letterSpacing: '-0.05em',
                  margin: 0
                }}
              >
                All Games
              </h2>
            </div>
            <span
              className="section-note text-sm text-[#9fa9c4]"
            >
              Find your next little obsession.
            </span>
          </div>

          {/* Category Chips Bar: Horizontal swipeable on mobile, wrap on PC */}
          <div className="mb-6">
            <CategoryChips
              activeCategory={activeCategory}
              onSelectCategory={(cat) => setActiveCategory(cat)}
            />
          </div>

          {/* 4-Column Responsive Game Grid Matching Canva Design */}
          <div
            className="game-grid"
            id="game-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '20px'
            }}
          >
            {filteredCanvaGames.map((item) => (
              <GameCard
                key={item.id}
                item={item}
                onSelect={handleSelectCanvaGame}
              />
            ))}
          </div>

          {filteredCanvaGames.length === 0 && (
            <p className="empty" style={{ color: '#bbc3db', padding: '24px 0' }}>
              No games in this category yet. Try another.
            </p>
          )}
        </section>

        {/* 5. Multiplayer Promo: Good games. Great company. */}
        <PromoBanner
          onPlayWithFriends={handlePlayWithFriends}
        />
      </main>

      {/* Exact Canva Footer */}
      <Footer onOpenProfile={() => setIsProfileOpen(true)} />

      {/* Game Mode Selector Modal (Bot AI, Friend Room, Online Match with 30s timers) */}
      <GameModeModal
        game={selectedGameForModal}
        isOpen={!!selectedGameForModal}
        initialTab={modalInitialTab}
        onClose={() => setSelectedGameForModal(null)}
        onStartBotGame={handleStartBotGame}
        onStartMultiplayerGame={handleStartMultiplayerGame}
      />

      {/* Incoming URL Shared Room Invite Modal */}
      <RoomInviteModal
        roomId={inviteRoomId || ''}
        gameIdParam={inviteGameId}
        isOpen={!!inviteRoomId}
        onClose={() => {
          setInviteRoomId(null);
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
        onJoined={handleStartMultiplayerGame}
      />

      {/* User Profile / Guest Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onUpdateProfile={(updated) => setProfile(updated)}
      />

      {/* Feature Coming Soon Modal (Multiplayer & Leaderboards) */}
      <ComingSoonModal
        feature={comingSoonFeature}
        isOpen={!!comingSoonFeature}
        onClose={() => setComingSoonFeature(null)}
        onOpenPlayWithFriends={handlePlayWithFriends}
        onOpenProfile={() => setIsProfileOpen(true)}
      />
    </div>
  );
};
