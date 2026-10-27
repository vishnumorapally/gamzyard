// client/src/components/lobby/GameModeModal.tsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Bot,
  Users2,
  Globe,
  Copy,
  Check,
  Play,
  RotateCw,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { BotDifficulty, GameMetadata, GameMode, MultiplayerMatchData } from '../../types';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { getStoredProfile } from '../../services/storage';

interface GameModeModalProps {
  game: GameMetadata | null;
  isOpen: boolean;
  initialTab?: GameMode;
  onClose: () => void;
  onStartBotGame: (difficulty: BotDifficulty) => void;
  onStartMultiplayerGame: (matchData: MultiplayerMatchData) => void;
}

export const GameModeModal: React.FC<GameModeModalProps> = ({
  game,
  isOpen,
  initialTab = 'bot',
  onClose,
  onStartBotGame,
  onStartMultiplayerGame
}) => {
  const [selectedTab, setSelectedTab] = useState<GameMode>(initialTab);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');

  // Private room state
  const [roomAction, setRoomAction] = useState<'create' | 'join'>('create');
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [joinInputCode, setJoinInputCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);

  // Matchmaking state
  const [isSearchingMatch, setIsSearchingMatch] = useState<boolean>(false);
  const [searchSeconds, setSearchSeconds] = useState<number>(0);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setSelectedTab(initialTab);
      setCreatedRoomId(null);
      setJoinInputCode('');
      setJoinError(null);
      setIsSearchingMatch(false);
      setSearchSeconds(0);
    }
  }, [isOpen, initialTab]);

  // Matchmaking timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearchingMatch) {
      interval = setInterval(() => {
        setSearchSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSearchingMatch]);

  // Socket event listeners for rooms & matchmaking
  useEffect(() => {
    if (!isOpen || !game) return;

    const socket = getSocket();

    const handleRoomCreated = (data: { roomId: string; gameId: string }) => {
      setCreatedRoomId(data.roomId);
      setIsCreatingRoom(false);
      sound.play('match');
    };

    const handleRoomJoined = (data: MultiplayerMatchData) => {
      sound.play('win');
      onStartMultiplayerGame(data);
    };

    const handleMatchFound = (data: MultiplayerMatchData) => {
      setIsSearchingMatch(false);
      sound.play('win');
      onStartMultiplayerGame(data);
    };

    const handleJoinError = (data: { message: string }) => {
      setJoinError(data.message);
      sound.play('loss');
    };

    socket.on('room_created', handleRoomCreated);
    socket.on('room_joined', handleRoomJoined);
    socket.on('match_found', handleMatchFound);
    socket.on('join_error', handleJoinError);

    return () => {
      socket.off('room_created', handleRoomCreated);
      socket.off('room_joined', handleRoomJoined);
      socket.off('match_found', handleMatchFound);
      socket.off('join_error', handleJoinError);
    };
  }, [isOpen, game, onStartMultiplayerGame]);

  if (!isOpen || !game) return null;

  // Private room handlers
  const handleCreateRoom = () => {
    setIsCreatingRoom(true);
    setJoinError(null);
    sound.play('click');
    const socket = getSocket();
    socket.emit('create_room', { gameId: game.id });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInputCode.trim()) return;
    setJoinError(null);
    sound.play('click');
    const socket = getSocket();
    socket.emit('join_room', { roomId: joinInputCode.trim(), gameId: game.id });
  };

  const handleCopyCode = () => {
    if (createdRoomId) {
      navigator.clipboard.writeText(createdRoomId);
      setCopiedCode(true);
      sound.play('click');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (createdRoomId) {
      const inviteUrl = `${window.location.origin}/?room=${createdRoomId}&game=${game.id}`;
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      sound.play('click');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Matchmaking handlers
  const handleStartMatchmaking = () => {
    setIsSearchingMatch(true);
    setSearchSeconds(0);
    sound.play('match');
    const socket = getSocket();
    const user = getStoredProfile();
    socket.emit('find_match', { gameId: game.id, user });
  };

  const handleCancelMatchmaking = () => {
    setIsSearchingMatch(false);
    sound.play('click');
    const socket = getSocket();
    socket.emit('cancel_matchmaking', { gameId: game.id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-gray-900 border border-gray-800 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Glow ambient */}
        <div
          className="absolute -top-20 -left-20 w-44 h-44 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: game.accentColor }}
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-800">
          <div>
            <div className="flex items-center space-x-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: game.accentColor }}
              />
              <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400">
                {game.category} • {game.avgTime}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-0.5">{game.title}</h2>
          </div>
          <button
            onClick={() => { onClose(); sound.play('click'); }}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Main Mode Selection Tabs */}
        <div className="grid grid-cols-3 gap-2 my-5 bg-gray-950 p-1.5 rounded-2xl border border-gray-800">
          <button
            onClick={() => { setSelectedTab('bot'); sound.play('click'); }}
            className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              selectedTab === 'bot'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-neon-cyan'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Play vs Bot</span>
          </button>

          <button
            onClick={() => { setSelectedTab('room'); sound.play('click'); }}
            className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              selectedTab === 'room'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-neon-purple'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Users2 className="w-4 h-4" />
            <span>Friend Room</span>
          </button>

          <button
            onClick={() => { setSelectedTab('match'); sound.play('click'); }}
            className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              selectedTab === 'match'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-neon-emerald'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Online Match</span>
          </button>
        </div>

        {/* --- TAB 1: PLAY VS BOT --- */}
        {selectedTab === 'bot' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-gray-950/70 p-4 rounded-2xl border border-gray-800">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Select Bot AI Difficulty</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as BotDifficulty[]).map((diff) => {
                  const isSelected = botDifficulty === diff;
                  const label = diff === 'easy' ? 'Casual' : diff === 'medium' ? 'Tactical' : 'Master AI';
                  const colorClass = diff === 'easy' ? 'text-emerald-400' : diff === 'medium' ? 'text-amber-400' : 'text-rose-400';

                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => { setBotDifficulty(diff); sound.play('click'); }}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-400/50 shadow-neon-cyan'
                          : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <span className={`text-sm font-black capitalize ${colorClass}`}>
                        {diff}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                sound.play('match');
                onStartBotGame(botDifficulty);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-neon-cyan active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Match vs Bot</span>
            </button>
          </div>
        )}

        {/* --- TAB 2: FRIEND ROOM --- */}
        {selectedTab === 'room' && (
          <div className="space-y-4 animate-fade-in">
            {/* Create vs Join Sub-tabs */}
            <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800">
              <button
                type="button"
                onClick={() => { setRoomAction('create'); sound.play('click'); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  roomAction === 'create' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Create Room
              </button>
              <button
                type="button"
                onClick={() => { setRoomAction('join'); sound.play('click'); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  roomAction === 'join' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Join Existing Room
              </button>
            </div>

            {roomAction === 'create' ? (
              <div className="bg-gray-950/80 p-5 rounded-2xl border border-gray-800 text-center space-y-4">
                {!createdRoomId ? (
                  <div>
                    <p className="text-xs text-gray-300 mb-4">
                      Create an invite-only private room. Share the 6-character room code or direct link with your friend to play together!
                    </p>
                    <button
                      onClick={handleCreateRoom}
                      disabled={isCreatingRoom}
                      className="py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold rounded-xl shadow-neon-purple active:scale-95 transition-all text-sm uppercase tracking-wider inline-flex items-center space-x-2"
                    >
                      {isCreatingRoom ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>Generate Room Code</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                      Your Private Room Code
                    </div>
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-widest font-mono">
                      {createdRoomId}
                    </div>

                    <div className="flex items-center justify-center space-x-2 pt-1">
                      <button
                        onClick={handleCopyCode}
                        className="py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-bold text-gray-200 border border-gray-700 flex items-center space-x-1.5 transition-all"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
                      </button>

                      <button
                        onClick={handleCopyLink}
                        className="py-2 px-3 bg-purple-600/30 hover:bg-purple-600/50 rounded-xl text-xs font-bold text-purple-200 border border-purple-500/40 flex items-center space-x-1.5 transition-all"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-xs text-amber-400/90 bg-amber-950/30 py-2 rounded-xl border border-amber-900/40">
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Waiting for your friend to enter the room...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleJoinRoom} className="bg-gray-950/80 p-5 rounded-2xl border border-gray-800 space-y-3">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Enter 6-Character Room Code
                </label>
                <input
                  type="text"
                  value={joinInputCode}
                  onChange={(e) => setJoinInputCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 7K8F2M"
                  maxLength={10}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono text-center tracking-widest text-lg font-bold focus:outline-none focus:border-purple-400"
                />

                {joinError && (
                  <div className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-900/60">
                    {joinError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!joinInputCode.trim()}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-neon-purple active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2"
                >
                  <span>Connect & Join</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* --- TAB 3: ONLINE MATCHMAKING --- */}
        {selectedTab === 'match' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-gray-950/80 p-6 rounded-2xl border border-gray-800 text-center flex flex-col items-center">
              {!isSearchingMatch ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-neon-emerald">
                    <Globe className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Find a Random Opponent</h3>
                    <p className="text-xs text-gray-400 max-w-sm mt-1">
                      Enter the global matchmaking queue. You will be matched with any online player searching for a game of {game.title}!
                    </p>
                  </div>
                  <button
                    onClick={handleStartMatchmaking}
                    className="py-3.5 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl shadow-neon-emerald active:scale-95 transition-all text-sm uppercase tracking-wider inline-flex items-center space-x-2"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Find Opponent Now</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-ping" />
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shadow-neon-emerald">
                      <Globe className="w-8 h-8 text-emerald-400 animate-spin" />
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-white">
                      Searching for opponent in {game.title}...
                    </div>
                    <div className="text-xs font-mono text-emerald-400 mt-1">
                      Time Elapsed: 00:{searchSeconds < 10 ? `0${searchSeconds}` : searchSeconds}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                    <button
                      onClick={handleCancelMatchmaking}
                      className="py-2 px-5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl border border-gray-700 text-xs transition-all"
                    >
                      Cancel Search
                    </button>
                    {/* Simulated Instant Match for Solo Testing */}
                    <button
                      onClick={() => {
                        handleCancelMatchmaking();
                        onStartBotGame('hard');
                      }}
                      className="py-2 px-4 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-semibold rounded-xl border border-emerald-500/40 text-xs transition-all"
                      title="Instantly matches with an AI Challenger so you can test right away"
                    >
                      ⚡ Practice vs Challenger Bot
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game Rules / Instructions Accordion Footer */}
        <div className="mt-5 pt-4 border-t border-gray-800/80">
          <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-semibold mb-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>How to Play {game.title}:</span>
          </div>
          <ul className="text-[11px] text-gray-400 space-y-1 list-disc list-inside">
            {game.rules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
