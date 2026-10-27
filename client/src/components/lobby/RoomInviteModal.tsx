// client/src/components/lobby/RoomInviteModal.tsx
import React, { useEffect, useState } from 'react';
import { Users, Swords, AlertCircle, Play, X, ShieldAlert, Sparkles, Clock } from 'lucide-react';
import { GameMetadata, MultiplayerMatchData } from '../../types';
import { GAMES } from '../../data/games';
import { getSocket } from '../../services/socket';
import { sound } from '../../services/sound';

interface RoomInviteModalProps {
  roomId: string;
  gameIdParam?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onJoined: (matchData: MultiplayerMatchData) => void;
}

interface RoomDetails {
  roomId: string;
  gameId: string;
  hostName: string;
  hostAvatar: string;
  isFull: boolean;
}

export const RoomInviteModal: React.FC<RoomInviteModalProps> = ({
  roomId,
  gameIdParam,
  isOpen,
  onClose,
  onJoined
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !roomId) return;

    setLoading(true);
    setErrorMsg(null);

    // 1. Fetch room info from server
    fetch(`/api/room/${roomId}`)
      .then(res => {
        if (!res.ok) throw new Error('Room not found or expired');
        return res.json();
      })
      .then((data: RoomDetails) => {
        setRoomDetails(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback: if gameIdParam was in URL, create basic info
        if (gameIdParam) {
          setRoomDetails({
            roomId: roomId.toUpperCase(),
            gameId: gameIdParam,
            hostName: 'Friend',
            hostAvatar: 'fox',
            isFull: false
          });
          setLoading(false);
        } else {
          setErrorMsg(`Room "${roomId}" was not found or has ended. The host might have left.`);
          setLoading(false);
        }
      });
  }, [isOpen, roomId, gameIdParam]);

  // Socket listener for room joined
  useEffect(() => {
    if (!isOpen) return;

    const socket = getSocket();

    const handleRoomJoined = (data: MultiplayerMatchData) => {
      setIsJoining(false);
      sound.play('win');
      onJoined(data);
    };

    const handleJoinError = (data: { message: string }) => {
      setIsJoining(false);
      setErrorMsg(data.message);
      sound.play('loss');
    };

    socket.on('room_joined', handleRoomJoined);
    socket.on('join_error', handleJoinError);

    return () => {
      socket.off('room_joined', handleRoomJoined);
      socket.off('join_error', handleJoinError);
    };
  }, [isOpen, onJoined]);

  if (!isOpen) return null;

  const targetGame: GameMetadata = (roomDetails && GAMES.find(g => g.id === roomDetails.gameId))
    || (gameIdParam && GAMES.find(g => g.id === gameIdParam))
    || GAMES[0];

  const handleJoin = () => {
    setIsJoining(true);
    setErrorMsg(null);
    sound.play('click');
    const socket = getSocket();
    socket.emit('join_room', {
      roomId: roomId.toUpperCase(),
      gameId: targetGame.id
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0f1124] border-2 border-purple-500/40 rounded-3xl p-6 shadow-2xl shadow-purple-950/60 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-cyan-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Private Party Invitation</h3>
              <p className="text-[11px] text-gray-400">Incoming room challenge</p>
            </div>
          </div>
          <button
            onClick={() => { onClose(); sound.play('click'); }}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
            <p className="text-xs text-gray-400 font-semibold">Connecting to Game Room {roomId}...</p>
          </div>
        ) : errorMsg ? (
          /* Error State */
          <div className="py-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Cannot Enter Room</h4>
              <p className="text-xs text-rose-300 mt-1 max-w-xs mx-auto">{errorMsg}</p>
            </div>
            <button
              onClick={() => { onClose(); sound.play('click'); }}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Browse Games Arena
            </button>
          </div>
        ) : (
          /* Invitation Details */
          <div className="py-5 space-y-4">
            <div className="bg-gray-950/80 p-4 rounded-2xl border border-gray-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/50 px-2.5 py-1 rounded-md border border-cyan-800/40">
                  {targetGame.category}
                </span>
                <span className="flex items-center space-x-1 text-xs text-amber-400 font-mono font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>30s Blitz Turns</span>
                </span>
              </div>

              <div>
                <div className="text-xl font-black text-white">{targetGame.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{targetGame.tagline}</div>
              </div>

              <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Host:</span>
                  <span className="font-bold text-purple-300">
                    {roomDetails?.hostName || 'Player'}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 font-mono font-bold text-xs bg-gray-900 px-2.5 py-1 rounded-lg border border-gray-800 text-gray-200">
                  <span className="text-gray-500">CODE:</span>
                  <span className="text-cyan-400">{roomId.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Accept & Join Button */}
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-neon-purple active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              {isJoining ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Entering Room...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Accept & Enter Match Now</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
