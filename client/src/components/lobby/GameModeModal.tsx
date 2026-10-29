import React, { useState, useEffect, useCallback } from 'react';
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
  Info,
  UserPlus,
  Users
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
  onStartBotGame: (difficulty: BotDifficulty, playerCount?: number) => void;
  onStartMultiplayerGame: (matchData: MultiplayerMatchData) => void;
}

const MULTI_CAPACITY_GAMES = [
  'ludo',
  'snakes-and-ladders',
  'chowka-bara',
  'pachisi',
  'carrom',
  'antakshari',
  'name-place-animal-thing',
  'truth-or-dare',
  'never-have-i-ever',
  'who-knows-me-best',
  'most-likely-to',
  'two-truths-and-a-lie',
  'would-you-rather',
  'rapid-fire',
  'dumb-charades',
  'guess-the-movie',
  'guess-the-song',
  'guess-the-word',
  'imposter-word',
  'mafia',
  'spyfall',
  'word-chain',
  'wordle',
  'hangman',
  'word-builder',
  'anagrams',
  'unscramble',
  'last-letter',
  'alphabet-categories',
  'forbidden-word',
  'rhyme-battle',
  'sentence-builder',
  'emoji-movie-guess',
  'memory-match',
  'math-battle'
];

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
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<number>(4);

  // Private room state
  const [roomAction, setRoomAction] = useState<'create' | 'join'>('create');
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [joinInputCode, setJoinInputCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);

  // Matchmaking state
  const [isSearchingMatch, setIsSearchingMatch] = useState<boolean>(false);
  const [searchSeconds, setSearchSeconds] = useState<number>(0);

  const supportsMultiCapacity = game ? MULTI_CAPACITY_GAMES.includes(game.id) : false;

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setSelectedTab(initialTab);
      setCreatedRoomId(null);
      setRoomData(null);
      setJoinInputCode('');
      setJoinError(null);
      setIsSearchingMatch(false);
      setSearchSeconds(0);
      setSelectedPlayerCount(game?.id === 'carrom' ? 2 : 4);
    }
  }, [isOpen, initialTab, game]);

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

    const handleRoomCreated = (data: { roomId: string; gameId: string; room: any }) => {
      setCreatedRoomId(data.roomId);
      setRoomData(data.room);
      setIsCreatingRoom(false);
      sound.play('match');
    };

    const handleRoomUpdate = (data: { room: any }) => {
      setRoomData(data.room);
      sound.play('tick');
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
    socket.on('room_update', handleRoomUpdate);
    socket.on('room_joined', handleRoomJoined);
    socket.on('match_found', handleMatchFound);
    socket.on('join_error', handleJoinError);

    return () => {
      socket.off('room_created', handleRoomCreated);
      socket.off('room_update', handleRoomUpdate);
      socket.off('room_joined', handleRoomJoined);
      socket.off('match_found', handleMatchFound);
      socket.off('join_error', handleJoinError);
    };
  }, [isOpen, game, onStartMultiplayerGame]);

  // Private room handlers
  const handleCreateRoom = useCallback(() => {
    if (!game) return;
    setIsCreatingRoom(true);
    setJoinError(null);
    const socket = getSocket();
    socket.emit('create_room', {
      gameId: game.id,
      maxPlayers: supportsMultiCapacity ? 4 : 2
    });
  }, [game, supportsMultiCapacity]);

  // Auto-create private room when opening Friend Room tab
  useEffect(() => {
    if (isOpen && game && selectedTab === 'room' && roomAction === 'create' && !createdRoomId && !isCreatingRoom) {
      handleCreateRoom();
    }
  }, [isOpen, game, selectedTab, roomAction, createdRoomId, isCreatingRoom, handleCreateRoom]);

  const handleAddBotToRoom = () => {
    if (!createdRoomId) return;
    sound.play('click');
    const socket = getSocket();
    socket.emit('add_bot_to_room', { roomId: createdRoomId });
  };

  const handleStartRoomGame = () => {
    if (!createdRoomId) return;
    sound.play('click');
    const socket = getSocket();
    socket.emit('start_room_game', { roomId: createdRoomId });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInputCode.trim() || !game) return;
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
    if (createdRoomId && game) {
      const inviteUrl = `${window.location.origin}/?room=${createdRoomId}&game=${game.id}`;
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      sound.play('click');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Matchmaking handlers
  const handleStartMatchmaking = () => {
    if (!game) return;
    setIsSearchingMatch(true);
    setSearchSeconds(0);
    sound.play('match');
    const socket = getSocket();
    const user = getStoredProfile();
    socket.emit('find_match', { gameId: game.id, user });
  };

  const handleCancelMatchmaking = () => {
    if (!game) return;
    setIsSearchingMatch(false);
    sound.play('click');
    const socket = getSocket();
    socket.emit('cancel_matchmaking', { gameId: game.id });
  };

  if (!isOpen || !game) return null;

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
            {/* Player Count option for multi-player traditional games */}
            {supportsMultiCapacity && (
              <div className="bg-gray-950/70 p-4 rounded-2xl border border-gray-800">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Number of Players</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4].map(count => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => { setSelectedPlayerCount(count); sound.play('click'); }}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        selectedPlayerCount === count
                          ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-400/50 shadow-neon-cyan'
                          : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <span className="text-sm font-black text-cyan-400">{count} Players</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        {count === 2 ? '1v1 Match' : count === 3 ? '3-Way Battle' : 'Full 4-Player'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                onStartBotGame(botDifficulty, supportsMultiCapacity ? selectedPlayerCount : 2);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-neon-cyan active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Match vs Bot</span>
            </button>
          </div>
        )}

        {/* --- TAB 2: FRIEND ROOM & LIVE LOBBY --- */}
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
                  <div className="py-10 flex flex-col items-center justify-center space-y-3">
                    <RotateCw className="w-8 h-8 text-purple-400 animate-spin" />
                    <span className="text-sm font-bold text-gray-300">Creating Room Lobby...</span>
                    <button
                      onClick={handleCreateRoom}
                      className="mt-2 text-xs text-purple-400 underline hover:text-purple-300"
                    >
                      Click if taking too long
                    </button>
                  </div>
                ) : (
                  /* Interactive Live Lobby Arena */
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          Room Code
                        </div>
                        <div className="text-2xl font-black text-purple-400 font-mono tracking-widest">
                          {createdRoomId}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyCode}
                          className="py-1.5 px-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-bold text-gray-200 border border-gray-700 flex items-center space-x-1"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={handleCopyLink}
                          className="py-1.5 px-3 bg-purple-600/30 hover:bg-purple-600/50 rounded-xl text-xs font-bold text-purple-200 border border-purple-500/40 flex items-center space-x-1"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Invite Link</span>
                        </button>
                      </div>
                    </div>

                    {/* Player Slots In Lobby */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-300">
                        <span>Lobby Seats ({roomData?.players?.length || 1}/{roomData?.maxPlayers || (supportsMultiCapacity ? 4 : 2)})</span>
                        <span className={(roomData?.players?.length || 1) >= 2 ? 'text-emerald-400' : 'text-amber-400'}>
                          {(roomData?.players?.length || 1) >= 2 ? '✓ Ready to Start' : 'Waiting for Players...'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Array.from({ length: roomData?.maxPlayers || (supportsMultiCapacity ? 4 : 2) }).map((_, idx) => {
                          const player = roomData?.players?.[idx];
                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                                player
                                  ? player.isBot
                                    ? 'bg-purple-950/20 border-purple-500/40'
                                    : 'bg-gray-900 border-purple-500/50 shadow-neon-purple'
                                  : 'bg-gray-950/60 border-dashed border-gray-800'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-sm font-bold text-white shadow">
                                  {player?.isBot ? '🤖' : player?.isHost ? '👑' : player ? '👤' : idx + 1}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <span>{player ? player.name : `Slot ${idx + 1}`}</span>
                                  </div>
                                  <div className="text-[10px] text-gray-400">
                                    {player?.isHost
                                      ? '👑 Host'
                                      : player?.isBot
                                      ? '🤖 AI Bot'
                                      : player
                                      ? '👤 Player'
                                      : 'Open Seat'}
                                  </div>
                                </div>
                              </div>

                              {!player && (
                                <button
                                  type="button"
                                  onClick={handleAddBotToRoom}
                                  className="text-[10px] font-bold px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-lg border border-purple-500/30 transition-colors"
                                >
                                  + Add Bot
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Helper Guidance */}
                    <p className="text-[11px] text-gray-400 text-center">
                      {(roomData?.players?.length || 1) < 2
                        ? 'Share the room code with a friend, or tap "+ Add AI Bot" to play!'
                        : 'At least 2 players are in the lobby! You can start now, or add more bots/friends.'}
                    </p>

                    {/* Host Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      {(roomData?.players?.length || 1) < (roomData?.maxPlayers || (supportsMultiCapacity ? 4 : 2)) && (
                        <button
                          type="button"
                          onClick={handleAddBotToRoom}
                          className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-purple-300 font-bold rounded-xl border border-purple-500/30 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                        >
                          <UserPlus className="w-4 h-4 text-purple-400" />
                          <span>+ Add AI Bot</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleStartRoomGame}
                        disabled={(roomData?.players?.length || 1) < 2}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 text-white font-black rounded-xl shadow-neon-purple text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>
                          {(roomData?.players?.length || 1) < 2
                            ? 'Waiting for Players'
                            : `Start Game (${roomData?.players?.length} Players)`}
                        </span>
                      </button>
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
                    <button
                      onClick={() => {
                        handleCancelMatchmaking();
                        onStartBotGame('hard');
                      }}
                      className="py-2 px-4 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-semibold rounded-xl border border-emerald-500/40 text-xs transition-all"
                    >
                      ⚡ Play vs AI Bot Now
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
