// client/src/games/carrom/CarromGame.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Bot, User, Zap, ChevronLeft, ChevronRight, Disc } from 'lucide-react';
import { BotDifficulty, GameMode, MultiplayerMatchData } from '../../types';
import {
  BOARD_SIZE,
  POCKETS,
  POCKET_RADIUS,
  STRIKER_RADIUS,
  STRIKER_MASS,
  CarromDisc,
  Striker,
  createInitialDiscs,
  stepPhysics,
  getCarromBotShot,
  calculateAimTrajectory
} from './physics';
import { sound } from '../../services/sound';
import { getSocket } from '../../services/socket';
import { recordGameResult } from '../../services/storage';
import { useTurnTimer } from '../../hooks/useTurnTimer';
import { TimerBar } from '../../components/game/TimerBar';
import { RematchActions } from '../../components/game/RematchActions';

interface CarromGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerCount?: number;
  multiplayerData?: MultiplayerMatchData | null;
  onExit: () => void;
}

export const CarromGame: React.FC<CarromGameProps> = ({
  mode,
  botDifficulty = 'medium',
  playerCount = 2,
  multiplayerData,
  onExit
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isMultiplayer = mode !== 'bot';
  const myPlayerRole: 'p1' | 'p2' = useMemo(() => {
    if (mode === 'bot') return 'p1';
    if (!multiplayerData) return 'p1';
    if (multiplayerData.allPlayers && multiplayerData.you) {
      const idx = multiplayerData.allPlayers.findIndex(
        p => (p.socketId && p.socketId === multiplayerData.you?.socketId) ||
             (p.id && p.id === multiplayerData.you?.id) ||
             (p.name && p.name === multiplayerData.you?.name && !p.isBot)
      );
      if (idx !== -1) return idx === 0 ? 'p1' : 'p2';
    }
    return multiplayerData?.yourRole === 'player2' ? 'p2' : 'p1';
  }, [mode, multiplayerData]);

  // Game state
  const [currentTurn, setCurrentTurn] = useState<'p1' | 'p2'>('p1');
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [isOver, setIsOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Position striker, adjust aim & strike!');
  const [moveCount, setMoveCount] = useState<number>(0);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  // Tactical Controls & Aim
  const [strikerBaselineX, setStrikerBaselineX] = useState(BOARD_SIZE / 2);
  const [aimAngleDeg, setAimAngleDeg] = useState(270); // 270 deg = straight up
  const [shotPower, setShotPower] = useState(19); // 6 to 26

  // Mouse / Touch Drag state
  const [isDraggingStriker, setIsDraggingStriker] = useState(false);
  const [isDraggingAim, setIsDraggingAim] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);

  // Internal mutable physics refs
  const discsRef = useRef<CarromDisc[]>(createInitialDiscs());
  const strikerRef = useRef<Striker>({
    x: BOARD_SIZE / 2,
    y: BOARD_SIZE - 95,
    vx: 0,
    vy: 0,
    radius: STRIKER_RADIUS,
    mass: STRIKER_MASS,
    isMoving: false,
    baseY: BOARD_SIZE - 95,
    scale: 1
  });

  const isSimulatingRef = useRef(false);
  const isMyTurn = isMultiplayer ? currentTurn === myPlayerRole : currentTurn === 'p1';

  // Turn timer
  const handleTimeoutLoss = useCallback(() => {
    if (isOver) return;
    setIsOver(true);
    sound.play('loss');
    recordGameResult('loss');
  }, [isOver]);

  const { timeLeft, percent } = useTurnTimer({
    isActive: !isOver && !isSimulatingRef.current,
    isMyTurn,
    turnKey: `${moveCount}-${currentTurn}`,
    initialTime: 30,
    onTimeout: handleTimeoutLoss
  });

  const resetStriker = useCallback((player: 'p1' | 'p2') => {
    const isP1 = player === 'p1';
    const baseY = isP1 ? BOARD_SIZE - 95 : 95;
    strikerRef.current = {
      x: BOARD_SIZE / 2,
      y: baseY,
      vx: 0,
      vy: 0,
      radius: STRIKER_RADIUS,
      mass: STRIKER_MASS,
      isMoving: false,
      baseY,
      scale: 1
    };
    setStrikerBaselineX(BOARD_SIZE / 2);
    setAimAngleDeg(isP1 ? 270 : 90);
  }, []);

  const checkVictory = useCallback(() => {
    const whitePocketed = discsRef.current.filter(d => d.type === 'white' && d.pocketed).length;
    const blackPocketed = discsRef.current.filter(d => d.type === 'black' && d.pocketed).length;
    const queenPocketed = discsRef.current.some(d => d.type === 'queen' && d.pocketed);

    if (whitePocketed === 4 || blackPocketed === 4 || (queenPocketed && (whitePocketed >= 3 || blackPocketed >= 3)) || p1Score >= 45 || p2Score >= 45) {
      setIsOver(true);
      const win = p1Score >= p2Score ? 'p1' : 'p2';
      const isMeWinner = win === myPlayerRole || (!isMultiplayer && win === 'p1');
      if (isMeWinner) {
        sound.play('win');
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        recordGameResult('win');
      } else {
        sound.play('loss');
        recordGameResult('loss');
      }
    }
  }, [p1Score, p2Score, myPlayerRole, isMultiplayer]);

  const executeStrike = useCallback((impulseX: number, impulseY: number, customStrikerX?: number) => {
    if (isSimulatingRef.current) return;

    if (customStrikerX !== undefined) {
      strikerRef.current.x = customStrikerX;
    }
    strikerRef.current.vx = impulseX;
    strikerRef.current.vy = impulseY;
    strikerRef.current.isMoving = true;
    isSimulatingRef.current = true;
    sound.play('move');
    setMoveCount(c => c + 1);

    const pocketedInThisTurn: CarromDisc[] = [];
    let hadFoul = false;

    const animLoop = () => {
      const { newlyPocketed, strikerFoul, isStillMoving } = stepPhysics(
        strikerRef.current,
        discsRef.current
      );

      if (newlyPocketed.length > 0) {
        sound.play('capture');
        pocketedInThisTurn.push(...newlyPocketed);
      }
      if (strikerFoul) {
        hadFoul = true;
      }

      if (isStillMoving) {
        requestAnimationFrame(animLoop);
      } else {
        isSimulatingRef.current = false;

        let pointsGained = 0;
        let pocketedMyPiece = false;

        pocketedInThisTurn.forEach(disc => {
          if (disc.type === 'queen') {
            pointsGained += 25;
            pocketedMyPiece = true;
          } else if (disc.type === 'white') {
            if (currentTurn === 'p1') {
              pointsGained += 10;
              pocketedMyPiece = true;
            } else {
              pointsGained -= 5;
            }
          } else if (disc.type === 'black') {
            if (currentTurn === 'p2') {
              pointsGained += 10;
              pocketedMyPiece = true;
            } else {
              pointsGained -= 5;
            }
          }
        });

        if (hadFoul) {
          pointsGained -= 5;
          sound.play('loss');
          setStatusMessage('Foul! Striker pocketed (-5 pts).');
        }

        if (currentTurn === 'p1') {
          setP1Score(prev => Math.max(0, prev + pointsGained));
        } else {
          setP2Score(prev => Math.max(0, prev + pointsGained));
        }

        const getsExtraTurn = pocketedMyPiece && !hadFoul;
        const nextTurn = getsExtraTurn ? currentTurn : currentTurn === 'p1' ? 'p2' : 'p1';

        setCurrentTurn(nextTurn);
        resetStriker(nextTurn);

        if (getsExtraTurn) {
          setStatusMessage('Pocketed target piece! Bonus turn!');
        } else {
          setStatusMessage(`Turn passed to ${nextTurn === 'p1' ? 'Player 1' : 'Player 2'}`);
        }

        checkVictory();
      }
    };

    requestAnimationFrame(animLoop);
  }, [currentTurn, resetStriker, checkVictory]);

  // Bot Turn Trigger
  useEffect(() => {
    if (mode === 'bot' && currentTurn === 'p2' && !isOver && !isSimulatingRef.current) {
      const timer = setTimeout(() => {
        const botShot = getCarromBotShot(strikerRef.current, discsRef.current, botDifficulty);
        executeStrike(botShot.impulseX, botShot.impulseY, botShot.strikerX);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, mode, isOver, botDifficulty, executeStrike]);

  // Multiplayer opponent sync
  useEffect(() => {
    if (!isMultiplayer) return;
    const socket = getSocket();
    const handleRemoteMove = (payload: any) => {
      const move = payload?.move;
      if (move && typeof move.impulseX === 'number' && typeof move.impulseY === 'number') {
        executeStrike(move.impulseX, move.impulseY, move.strikerX);
      }
    };

    const handleOpponentLeft = () => {
      setOpponentLeft(true);
      setIsOver(true);
      sound.play('win');
    };

    socket?.on('opponent_move', handleRemoteMove);
    socket?.on('opponent_left', handleOpponentLeft);
    return () => {
      socket?.off('opponent_move', handleRemoteMove);
      socket?.off('opponent_left', handleOpponentLeft);
    };
  }, [isMultiplayer, executeStrike]);

  // Trigger user strike action
  const handleFireStrike = () => {
    if (!isMyTurn || isSimulatingRef.current || isOver) return;

    const angleRad = (aimAngleDeg * Math.PI) / 180;
    const impulseX = Math.cos(angleRad) * shotPower;
    const impulseY = Math.sin(angleRad) * shotPower;

    executeStrike(impulseX, impulseY, strikerBaselineX);

    if (isMultiplayer && multiplayerData?.roomId) {
      const socket = getSocket();
      socket?.emit('make_move', {
        roomId: multiplayerData.roomId,
        move: { impulseX, impulseY, strikerX: strikerBaselineX }
      });
    }
  };

  // Canvas Mouse / Touch events for direct board interaction
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scale = BOARD_SIZE / rect.width;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scale,
      y: (clientY - rect.top) * scale
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMyTurn || isSimulatingRef.current || isOver) return;
    const { x, y } = getCanvasCoords(e);
    const strikerY = strikerRef.current.baseY;

    // Check if touching near striker to position on baseline
    if (Math.hypot(x - strikerBaselineX, y - strikerY) < 35) {
      setIsDraggingStriker(true);
      const clampedX = Math.max(120, Math.min(BOARD_SIZE - 120, x));
      setStrikerBaselineX(clampedX);
      strikerRef.current.x = clampedX;
    } else {
      // Direct aiming
      setIsDraggingAim(true);
      setDragStart({ x, y });
      setDragCurrent({ x, y });

      const dx = x - strikerBaselineX;
      const dy = y - strikerY;
      const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
      const normalizedDeg = (deg + 360) % 360;
      setAimAngleDeg(normalizedDeg);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isSimulatingRef.current || isOver) return;
    const { x, y } = getCanvasCoords(e);

    if (isDraggingStriker) {
      const clampedX = Math.max(120, Math.min(BOARD_SIZE - 120, x));
      setStrikerBaselineX(clampedX);
      strikerRef.current.x = clampedX;
    } else if (isDraggingAim && dragStart) {
      setDragCurrent({ x, y });
      const strikerY = strikerRef.current.baseY;
      const dx = x - strikerBaselineX;
      const dy = y - strikerY;
      const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
      const normalizedDeg = (deg + 360) % 360;
      setAimAngleDeg(normalizedDeg);

      // Slingshot or direct pull power
      const pullDist = Math.hypot(x - dragStart.x, y - dragStart.y);
      if (pullDist > 15) {
        setShotPower(Math.min(26, Math.max(8, Math.round(pullDist / 7))));
      }
    }
  };

  const handlePointerUp = () => {
    if (isDraggingStriker) {
      setIsDraggingStriker(false);
    } else if (isDraggingAim) {
      setIsDraggingAim(false);
      setDragStart(null);
      setDragCurrent(null);
    }
  };

  // High Fidelity 60FPS Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

      // 1. Heavy Polished Rosewood Outer Frame with Bevel & Miters
      const frameGrad = ctx.createLinearGradient(0, 0, BOARD_SIZE, BOARD_SIZE);
      frameGrad.addColorStop(0, '#3b180d');
      frameGrad.addColorStop(0.5, '#260e06');
      frameGrad.addColorStop(1, '#1b0903');
      ctx.fillStyle = frameGrad;
      ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);

      // Frame Inner Shadow / Cushion Bumper
      ctx.strokeStyle = '#5a2512';
      ctx.lineWidth = 6;
      ctx.strokeRect(18, 18, BOARD_SIZE - 36, BOARD_SIZE - 36);

      // Corner Miter Lines
      ctx.strokeStyle = '#1a0802';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(42, 42);
      ctx.moveTo(BOARD_SIZE, 0); ctx.lineTo(BOARD_SIZE - 42, 42);
      ctx.moveTo(0, BOARD_SIZE); ctx.lineTo(42, BOARD_SIZE - 42);
      ctx.moveTo(BOARD_SIZE, BOARD_SIZE); ctx.lineTo(BOARD_SIZE - 42, BOARD_SIZE - 42);
      ctx.stroke();

      // 2. Tournament Birchwood Playing Board
      const boardGrad = ctx.createRadialGradient(
        BOARD_SIZE / 2, BOARD_SIZE / 2, 40,
        BOARD_SIZE / 2, BOARD_SIZE / 2, BOARD_SIZE * 0.7
      );
      boardGrad.addColorStop(0, '#f9edd8');
      boardGrad.addColorStop(0.85, '#edd2aa');
      boardGrad.addColorStop(1, '#dfbe8f');
      ctx.fillStyle = boardGrad;
      ctx.fillRect(42, 42, BOARD_SIZE - 84, BOARD_SIZE - 84);

      // Playing border rim
      ctx.strokeStyle = '#291007';
      ctx.lineWidth = 3;
      ctx.strokeRect(42, 42, BOARD_SIZE - 84, BOARD_SIZE - 84);

      // 3. Corner Pockets (Deep Mesh Holes)
      POCKETS.forEach(p => {
        // Outer Brass/Chrome rim
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS + 3, 0, Math.PI * 2);
        ctx.fillStyle = '#b45309';
        ctx.fill();

        // Inner Void hole with depth shadow
        const pocketHoleGrad = ctx.createRadialGradient(p.x - 3, p.y - 3, 2, p.x, p.y, POCKET_RADIUS);
        pocketHoleGrad.addColorStop(0, '#1c1917');
        pocketHoleGrad.addColorStop(0.7, '#0c0a09');
        pocketHoleGrad.addColorStop(1, '#000000');
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = pocketHoleGrad;
        ctx.fill();

        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // 4. Traditional Baseline Markings (Double Lines with End Circles)
      const drawBaseline = (y1: number, y2: number) => {
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1.5;

        // Double rail
        ctx.beginPath();
        ctx.moveTo(120, y1); ctx.lineTo(BOARD_SIZE - 120, y1);
        ctx.moveTo(120, y2); ctx.lineTo(BOARD_SIZE - 120, y2);
        ctx.stroke();

        const midY = (y1 + y2) / 2;

        // Left End Circle
        ctx.beginPath();
        ctx.arc(120, midY, 14, 0, Math.PI * 2);
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(120, midY, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#dc2626';
        ctx.fill();

        // Right End Circle
        ctx.beginPath();
        ctx.arc(BOARD_SIZE - 120, midY, 14, 0, Math.PI * 2);
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(BOARD_SIZE - 120, midY, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#dc2626';
        ctx.fill();
      };

      // Player 1 Bottom Baseline
      drawBaseline(BOARD_SIZE - 100, BOARD_SIZE - 90);
      // Player 2 Top Baseline
      drawBaseline(90, 100);

      // Left & Right Vertical Decorative Baselines
      const drawVerticalBaseline = (x1: number, x2: number) => {
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, 120); ctx.lineTo(x1, BOARD_SIZE - 120);
        ctx.moveTo(x2, 120); ctx.lineTo(x2, BOARD_SIZE - 120);
        ctx.stroke();

        const midX = (x1 + x2) / 2;
        [120, BOARD_SIZE - 120].forEach(y => {
          ctx.beginPath();
          ctx.arc(midX, y, 14, 0, Math.PI * 2);
          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(midX, y, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#dc2626';
          ctx.fill();
        });
      };
      drawVerticalBaseline(90, 100);
      drawVerticalBaseline(BOARD_SIZE - 100, BOARD_SIZE - 90);

      // 5. Corner Arrows pointing to Pockets
      const drawCornerArrow = (cornerX: number, cornerY: number) => {
        const cx = BOARD_SIZE / 2;
        const cy = BOARD_SIZE / 2;
        const angle = Math.atan2(cornerY - cy, cornerX - cx);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(70, 0);
        ctx.lineTo(210, 0);
        ctx.stroke();

        // Arrow head pointing to pocket
        ctx.beginPath();
        ctx.moveTo(210, 0);
        ctx.lineTo(195, -8);
        ctx.lineTo(195, 8);
        ctx.closePath();
        ctx.fillStyle = '#dc2626';
        ctx.fill();

        // Arc barrier near center
        ctx.beginPath();
        ctx.arc(70, 0, 16, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();

        ctx.restore();
      };
      drawCornerArrow(42, 42);
      drawCornerArrow(BOARD_SIZE - 42, 42);
      drawCornerArrow(42, BOARD_SIZE - 42);
      drawCornerArrow(BOARD_SIZE - 42, BOARD_SIZE - 42);

      // 6. Central Sunburst & Bullseye
      const center = BOARD_SIZE / 2;
      // Outer concentric ring
      ctx.beginPath();
      ctx.arc(center, center, 46, 0, Math.PI * 2);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Delicate 12-petaled sunburst
      for (let i = 0; i < 12; i++) {
        const rad = (i * Math.PI) / 6;
        ctx.beginPath();
        ctx.moveTo(center + Math.cos(rad) * 16, center + Math.sin(rad) * 16);
        ctx.lineTo(center + Math.cos(rad) * 44, center + Math.sin(rad) * 44);
        ctx.strokeStyle = i % 2 === 0 ? '#dc2626' : '#d97706';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Red Bullseye Spot
      ctx.beginPath();
      ctx.arc(center, center, 13, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 7. Render 3D Carrom Discs (Coins)
      discsRef.current.forEach(disc => {
        if (disc.pocketed) return;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.45)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;

        const discGrad = ctx.createRadialGradient(
          disc.x - disc.radius * 0.35,
          disc.y - disc.radius * 0.35,
          1,
          disc.x,
          disc.y,
          disc.radius
        );

        if (disc.type === 'queen') {
          discGrad.addColorStop(0, '#f87171');
          discGrad.addColorStop(0.65, '#dc2626');
          discGrad.addColorStop(1, '#991b1b');
        } else if (disc.type === 'white') {
          discGrad.addColorStop(0, '#ffffff');
          discGrad.addColorStop(0.7, '#f1f5f9');
          discGrad.addColorStop(1, '#cbd5e1');
        } else {
          discGrad.addColorStop(0, '#475569');
          discGrad.addColorStop(0.7, '#1e293b');
          discGrad.addColorStop(1, '#090d16');
        }

        ctx.beginPath();
        ctx.arc(disc.x, disc.y, disc.radius * disc.scale, 0, Math.PI * 2);
        ctx.fillStyle = discGrad;
        ctx.fill();

        ctx.restore();

        // Concentric inner groove
        ctx.beginPath();
        ctx.arc(disc.x, disc.y, disc.radius * 0.55 * disc.scale, 0, Math.PI * 2);
        ctx.strokeStyle = disc.type === 'white' ? 'rgba(148,163,184,0.6)' : disc.type === 'queen' ? 'rgba(254,240,138,0.7)' : 'rgba(100,116,139,0.5)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Center jewel on queen
        if (disc.type === 'queen') {
          ctx.beginPath();
          ctx.arc(disc.x, disc.y, disc.radius * 0.22, 0, Math.PI * 2);
          ctx.fillStyle = '#fbbf24';
          ctx.fill();
        }
      });

      // 8. Striker Rendering
      const striker = strikerRef.current;
      const displayStrikerX = striker.isMoving ? striker.x : strikerBaselineX;
      const displayStrikerY = striker.isMoving ? striker.y : striker.baseY;

      ctx.save();
      ctx.shadowColor = currentTurn === 'p1' ? 'rgba(6,182,212,0.5)' : 'rgba(168,85,247,0.5)';
      ctx.shadowBlur = 8;

      const strikerGrad = ctx.createRadialGradient(
        displayStrikerX - striker.radius * 0.35,
        displayStrikerY - striker.radius * 0.35,
        2,
        displayStrikerX,
        displayStrikerY,
        striker.radius
      );

      if (currentTurn === 'p1') {
        strikerGrad.addColorStop(0, '#e0f2fe');
        strikerGrad.addColorStop(0.4, '#38bdf8');
        strikerGrad.addColorStop(0.85, '#0284c7');
        strikerGrad.addColorStop(1, '#075985');
      } else {
        strikerGrad.addColorStop(0, '#f5d0fe');
        strikerGrad.addColorStop(0.4, '#c084fc');
        strikerGrad.addColorStop(0.85, '#9333ea');
        strikerGrad.addColorStop(1, '#6b21a8');
      }

      ctx.beginPath();
      ctx.arc(displayStrikerX, displayStrikerY, striker.radius * striker.scale, 0, Math.PI * 2);
      ctx.fillStyle = strikerGrad;
      ctx.fill();

      ctx.restore();

      // Striker outer rim highlight and inner rings
      ctx.beginPath();
      ctx.arc(displayStrikerX, displayStrikerY, striker.radius * striker.scale, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(displayStrikerX, displayStrikerY, striker.radius * 0.55 * striker.scale, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Center jewel on striker
      ctx.beginPath();
      ctx.arc(displayStrikerX, displayStrikerY, striker.radius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // 9. Interactive Aim Ray & Ghost Ball Simulation
      if (isMyTurn && !striker.isMoving && !isOver) {
        const aimRad = (aimAngleDeg * Math.PI) / 180;
        const trajectory = calculateAimTrajectory(
          displayStrikerX,
          displayStrikerY,
          aimRad,
          discsRef.current
        );

        // Striker Aim Ray
        ctx.beginPath();
        ctx.moveTo(displayStrikerX, displayStrikerY);
        ctx.lineTo(trajectory.hitX, trajectory.hitY);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ghost Striker at Collision Point
        ctx.beginPath();
        ctx.arc(trajectory.hitX, trajectory.hitY, STRIKER_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Target Disc Deflection Vector
        if (trajectory.targetDisc && trajectory.targetAngle !== undefined) {
          const target = trajectory.targetDisc;
          const arrowLen = 50;
          const arrowEndX = target.x + Math.cos(trajectory.targetAngle) * arrowLen;
          const arrowEndY = target.y + Math.sin(trajectory.targetAngle) * arrowLen;

          ctx.beginPath();
          ctx.moveTo(target.x, target.y);
          ctx.lineTo(arrowEndX, arrowEndY);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Arrowhead
          ctx.beginPath();
          ctx.arc(arrowEndX, arrowEndY, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#fbbf24';
          ctx.fill();
        }

        // Power Arc around Striker
        ctx.beginPath();
        const startArc = aimRad - Math.PI / 4;
        const endArc = startArc + (Math.PI / 2) * (shotPower / 26);
        ctx.arc(displayStrikerX, displayStrikerY, striker.radius + 8, startArc, endArc);
        ctx.strokeStyle = shotPower > 20 ? '#ef4444' : shotPower > 14 ? '#f59e0b' : '#10b981';
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    isMyTurn,
    strikerBaselineX,
    aimAngleDeg,
    shotPower,
    currentTurn,
    isOver
  ]);

  const handleRestart = () => {
    discsRef.current = createInitialDiscs();
    setP1Score(0);
    setP2Score(0);
    setIsOver(false);
    setCurrentTurn('p1');
    resetStriker('p1');
    setMoveCount(0);
    setStatusMessage('Position striker, adjust aim & strike!');
  };

  const remainingWhite = discsRef.current.filter(d => d.type === 'white' && !d.pocketed).length;
  const remainingBlack = discsRef.current.filter(d => d.type === 'black' && !d.pocketed).length;
  const queenOnBoard = discsRef.current.some(d => d.type === 'queen' && !d.pocketed);

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-2 py-4 select-none">
      {/* Top Header stats */}
      <div className="w-full flex items-center justify-between bg-stone-900/95 border border-amber-900/40 rounded-2xl p-4 mb-3 backdrop-blur-md shadow-2xl">
        {/* Player 2 / Bot */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-lg">
            {mode === 'bot' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>{mode === 'bot' ? `Cyber Bot (${botDifficulty})` : multiplayerData?.opponent?.name || 'Opponent'}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-600 inline-block" />
            </div>
            <div className="text-xl font-black text-purple-300">
              {p2Score} <span className="text-xs font-normal text-stone-400">pts</span>
            </div>
            <div className="text-[10px] text-stone-400 flex items-center gap-1">
              <span>{remainingBlack} Black coins left</span>
            </div>
          </div>
        </div>

        {/* Center Match Status */}
        <div className="text-center px-2">
          <div
            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm transition-all ${
              isOver
                ? 'bg-stone-800 text-stone-400 border-stone-700'
                : currentTurn === myPlayerRole
                ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/60 ring-2 ring-cyan-500/20 animate-pulse'
                : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
            }`}
          >
            {isOver
              ? 'Match Ended'
              : currentTurn === myPlayerRole
              ? 'Your Strike'
              : mode === 'bot' ? "Bot Aiming..." : "Opponent's Turn..."}
          </div>
          <div className="text-[11px] text-amber-200/90 font-medium mt-1.5 max-w-[260px] truncate">
            {statusMessage}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            Queen: {queenOnBoard ? '✦ In Play (25 pts)' : '✓ Pocketed'}
          </div>
        </div>

        {/* Player 1 / You */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider flex items-center justify-end gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-100 border border-slate-300 inline-block" />
              <span>{multiplayerData?.you?.name || 'You'}</span>
            </div>
            <div className="text-xl font-black text-cyan-300">
              {p1Score} <span className="text-xs font-normal text-stone-400">pts</span>
            </div>
            <div className="text-[10px] text-stone-400 flex items-center justify-end gap-1">
              <span>{remainingWhite} White coins left</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-lg">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="w-full mb-3">
        <TimerBar
          timeLeft={timeLeft}
          percent={percent}
          isMyTurn={isMyTurn}
          gameOver={isOver}
          statusText={statusMessage}
        />
      </div>

      {/* Main Authentic Carrom Board */}
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="relative p-2.5 rounded-[32px] bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 border-4 border-amber-800/80 shadow-2xl shadow-black">
          <canvas
            ref={canvasRef}
            width={BOARD_SIZE}
            height={BOARD_SIZE}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            className="w-[330px] h-[330px] sm:w-[480px] sm:h-[480px] rounded-2xl cursor-crosshair touch-none select-none"
          />
        </div>

        {/* Tactical Striker & Aim Control Deck */}
        {isMyTurn && !strikerRef.current.isMoving && !isOver && (
          <div className="w-full max-w-lg flex flex-col gap-3 bg-stone-900/90 border border-stone-800 p-4 rounded-3xl shadow-xl">
            {/* Baseline Placement Controls */}
            <div className="flex flex-col gap-1.5">
              <div className="w-full flex justify-between items-center text-xs text-stone-300 font-bold">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Disc className="w-4 h-4" /> Striker Baseline Position
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { setStrikerBaselineX(140); strikerRef.current.x = 140; }}
                    className="px-2 py-0.5 rounded text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-300"
                  >
                    Left
                  </button>
                  <button
                    onClick={() => { setStrikerBaselineX(BOARD_SIZE / 2); strikerRef.current.x = BOARD_SIZE / 2; }}
                    className="px-2 py-0.5 rounded text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-300"
                  >
                    Center
                  </button>
                  <button
                    onClick={() => { setStrikerBaselineX(BOARD_SIZE - 140); strikerRef.current.x = BOARD_SIZE - 140; }}
                    className="px-2 py-0.5 rounded text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-300"
                  >
                    Right
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={120}
                max={BOARD_SIZE - 120}
                value={strikerBaselineX}
                onChange={e => {
                  const val = Number(e.target.value);
                  setStrikerBaselineX(val);
                  strikerRef.current.x = val;
                }}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-stone-800 rounded-lg"
              />
            </div>

            {/* Aim Direction & Precision Controls */}
            <div className="flex flex-col gap-1.5">
              <div className="w-full flex justify-between items-center text-xs text-stone-300 font-bold">
                <span>Aim Angle ({Math.round(aimAngleDeg)}°)</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAimAngleDeg(a => (a - 3 + 360) % 360)}
                    className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-cyan-400"
                    title="Fine-tune left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAimAngleDeg(a => (a + 3) % 360)}
                    className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-cyan-400"
                    title="Fine-tune right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={180}
                max={360}
                value={aimAngleDeg}
                onChange={e => setAimAngleDeg(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-stone-800 rounded-lg"
              />
            </div>

            {/* Power & Strike Action */}
            <div className="flex items-center gap-4 pt-1">
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold text-stone-300">
                  <span>Strike Force</span>
                  <span className={shotPower > 20 ? 'text-rose-400' : 'text-amber-400'}>
                    {Math.round((shotPower / 26) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={26}
                  value={shotPower}
                  onChange={e => setShotPower(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
                />
              </div>

              <button
                onClick={handleFireStrike}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/30 flex items-center gap-2 transform active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4 fill-white" />
                Strike!
              </button>
            </div>

            <div className="text-center text-[10px] text-stone-400">
              Tip: You can also tap & drag directly on the board to aim and pull back power!
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 w-full flex justify-center">
        <RematchActions
          gameOver={isOver}
          mode={mode}
          multiplayerData={multiplayerData}
          onReset={handleRestart}
          onExit={onExit}
          themeColor="cyan"
          maxWidthClass="max-w-md"
          opponentLeft={opponentLeft}
        />
      </div>
    </div>
  );
};

export default CarromGame;
