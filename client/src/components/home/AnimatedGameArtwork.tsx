// client/src/components/home/AnimatedGameArtwork.tsx
import React from 'react';
import { GameId } from '../../types';

interface AnimatedGameArtworkProps {
  gameEngineId: GameId;
  artClass: string;
}

export const AnimatedGameArtwork: React.FC<AnimatedGameArtworkProps> = ({ gameEngineId, artClass }) => {
  return (
    <div className={`art ${artClass} relative overflow-hidden select-none`}>
      {/* 1. CHESS MASTER ANIMATION */}
      {gameEngineId === 'chess' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          {/* Subtle Grid Backdrop */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#b58aff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Animated 3D Isometric Mini Board */}
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="chessGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="chessGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#312e81" stopOpacity="0.6" />
              </linearGradient>
              <filter id="chessGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Isometric Board Isometric Diamonds */}
            <g transform="translate(140, 95) scale(1, 0.58) rotate(45)">
              <rect x="-60" y="-60" width="30" height="30" fill="url(#chessGrad1)" stroke="#818cf8" strokeWidth="1" />
              <rect x="-30" y="-60" width="30" height="30" fill="url(#chessGrad2)" stroke="#818cf8" strokeWidth="1" />
              <rect x="0" y="-60" width="30" height="30" fill="url(#chessGrad1)" stroke="#818cf8" strokeWidth="1" />
              <rect x="30" y="-60" width="30" height="30" fill="url(#chessGrad2)" stroke="#818cf8" strokeWidth="1" />

              <rect x="-60" y="-30" width="30" height="30" fill="url(#chessGrad2)" stroke="#818cf8" strokeWidth="1" />
              <rect x="-30" y="-30" width="30" height="30" fill="url(#chessGrad1)" stroke="#818cf8" strokeWidth="1" />
              <rect x="0" y="-30" width="30" height="30" fill="url(#chessGrad2)" stroke="#818cf8" strokeWidth="1" />
              <rect x="30" y="-30" width="30" height="30" fill="url(#chessGrad1)" stroke="#818cf8" strokeWidth="1" />

              <rect x="-60" y="0" width="30" height="30" fill="url(#chessGrad1)" stroke="#818cf8" strokeWidth="1" />
              <rect x="-30" y="0" width="30" height="30" fill="url(#chessGrad2)" stroke="#818cf8" strokeWidth="1" />
              <rect x="0" y="0" width="30" height="30" fill="url(#chessGrad1)" stroke="#818cf8" strokeWidth="1" />
              <rect x="30" y="0" width="30" height="30" fill="url(#chessGrad2)" stroke="#818cf8" strokeWidth="1" />

              <rect x="-60" y="30" width="30" height="30" fill="url(#chessGrad2)" stroke="#818cf8" strokeWidth="1" />
              <rect x="-30" y="30" width="30" height="30" fill="url(#chessGrad1)" stroke="#818cf8" strokeWidth="1" />
              <rect x="0" y="30" width="30" height="30" fill="url(#chessGrad2)" stroke="#818cf8" strokeWidth="1" />
              <rect x="30" y="30" width="30" height="30" fill="url(#chessGrad1)" stroke="#818cf8" strokeWidth="1" />
            </g>

            {/* Floating Royal Pieces with Glowing Breathing Animations */}
            {/* King Piece */}
            <g className="animate-bounce" style={{ animationDuration: '3.2s' }}>
              <circle cx="160" cy="50" r="18" fill="#ffd700" opacity="0.15" filter="url(#chessGlow)" />
              <text x="160" y="58" fontSize="38" textAnchor="middle" fill="#ffe066" filter="url(#chessGlow)" style={{ userSelect: 'none' }}>
                ♚
              </text>
            </g>

            {/* Knight Piece */}
            <g className="animate-bounce" style={{ animationDuration: '2.6s', animationDelay: '0.8s' }}>
              <circle cx="105" cy="65" r="16" fill="#72ecee" opacity="0.15" filter="url(#chessGlow)" />
              <text x="105" y="73" fontSize="32" textAnchor="middle" fill="#72ecee" filter="url(#chessGlow)" style={{ userSelect: 'none' }}>
                ♞
              </text>
            </g>

            {/* Laser Checkmate Ray */}
            <line x1="120" y1="62" x2="145" y2="52" stroke="#b58aff" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
          </svg>
        </div>
      )}

      {/* 2. CONNECT FOUR ANIMATION */}
      {gameEngineId === 'connect-four' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="c4Glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connect 4 Blue Stand Frame */}
            <rect x="45" y="25" width="190" height="110" rx="16" fill="#1e295d" stroke="#5be9ed" strokeWidth="2" opacity="0.9" />

            {/* Grid Holes */}
            {[0, 1, 2, 3, 4, 5].map((col) => (
              <React.Fragment key={col}>
                {[0, 1, 2].map((row) => (
                  <circle
                    key={`${col}-${row}`}
                    cx={70 + col * 28}
                    cy={48 + row * 28}
                    r="10.5"
                    fill="#0a0f26"
                    stroke="#2a356b"
                    strokeWidth="1.5"
                  />
                ))}
              </React.Fragment>
            ))}

            {/* Dropping Yellow Disc Animation */}
            <g className="animate-bounce" style={{ animationDuration: '2.1s' }}>
              <circle cx="98" cy="104" r="10" fill="#ffd43b" filter="url(#c4Glow)" />
            </g>

            {/* Dropping Red Disc Animation */}
            <g className="animate-bounce" style={{ animationDuration: '2.7s', animationDelay: '0.4s' }}>
              <circle cx="126" cy="104" r="10" fill="#ff6b6b" filter="url(#c4Glow)" />
            </g>

            {/* Winning 4 Connected Discs (Pulsing Line) */}
            <g className="animate-pulse" style={{ animationDuration: '1.4s' }}>
              <circle cx="70" cy="76" r="10" fill="#ffd43b" filter="url(#c4Glow)" />
              <circle cx="98" cy="76" r="10" fill="#ffd43b" filter="url(#c4Glow)" />
              <circle cx="126" cy="76" r="10" fill="#ffd43b" filter="url(#c4Glow)" />
              <circle cx="154" cy="76" r="10" fill="#ffd43b" filter="url(#c4Glow)" />
              {/* Highlight connecting laser beam */}
              <line x1="68" y1="76" x2="156" y2="76" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Static opponent discs */}
            <circle cx="154" cy="104" r="10" fill="#ff6b6b" opacity="0.9" />
            <circle cx="182" cy="104" r="10" fill="#ffd43b" opacity="0.9" />
            <circle cx="182" cy="76" r="10" fill="#ff6b6b" opacity="0.9" />
          </svg>
        </div>
      )}

      {/* 3. NEON TIC-TAC-TOE ANIMATION */}
      {gameEngineId === 'tic-tac-toe' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="tttGlowCyan" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="tttGlowPink" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 3x3 Glowing Grid Lines */}
            <g stroke="#7b4ae2" strokeWidth="3" strokeLinecap="round" opacity="0.8">
              <line x1="110" y1="25" x2="110" y2="135" />
              <line x1="170" y1="25" x2="170" y2="135" />
              <line x1="60" y1="62" x2="220" y2="62" />
              <line x1="60" y1="98" x2="220" y2="98" />
            </g>

            {/* Animated Glowing 'X' Symbols */}
            {/* Top-Left X */}
            <g stroke="#5be9ed" strokeWidth="4.5" strokeLinecap="round" filter="url(#tttGlowCyan)">
              <line x1="75" y1="36" x2="95" y2="52" />
              <line x1="95" y1="36" x2="75" y2="52" />
            </g>

            {/* Center X */}
            <g stroke="#5be9ed" strokeWidth="4.5" strokeLinecap="round" filter="url(#tttGlowCyan)">
              <line x1="130" y1="72" x2="150" y2="88" />
              <line x1="150" y1="72" x2="130" y2="88" />
            </g>

            {/* Bottom-Right X (Winning Diagonal Line) */}
            <g stroke="#5be9ed" strokeWidth="4.5" strokeLinecap="round" filter="url(#tttGlowCyan)">
              <line x1="185" y1="108" x2="205" y2="124" />
              <line x1="205" y1="108" x2="185" y2="124" />
            </g>

            {/* Glowing 'O' Symbols */}
            <circle cx="140" cy="44" r="11" stroke="#f472b6" strokeWidth="4" fill="none" filter="url(#tttGlowPink)" />
            <circle cx="85" cy="80" r="11" stroke="#f472b6" strokeWidth="4" fill="none" filter="url(#tttGlowPink)" />

            {/* Electric Strike Winning Laser Beam */}
            <line
              x1="65"
              y1="30"
              x2="215"
              y2="130"
              stroke="#fff"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#tttGlowCyan)"
              className="animate-pulse"
              style={{ animationDuration: '1.2s' }}
            />
          </svg>
        </div>
      )}

      {/* 4. CLASSIC CHECKERS ANIMATION */}
      {gameEngineId === 'checkers' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="checkGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Perspective Checkerboard Squares */}
            <g opacity="0.6">
              <rect x="50" y="30" width="35" height="30" fill="#2d132c" stroke="#800f2f" strokeWidth="1" />
              <rect x="85" y="30" width="35" height="30" fill="#19091f" />
              <rect x="120" y="30" width="35" height="30" fill="#2d132c" stroke="#800f2f" strokeWidth="1" />
              <rect x="155" y="30" width="35" height="30" fill="#19091f" />
              <rect x="190" y="30" width="35" height="30" fill="#2d132c" stroke="#800f2f" strokeWidth="1" />

              <rect x="50" y="60" width="35" height="30" fill="#19091f" />
              <rect x="85" y="60" width="35" height="30" fill="#2d132c" stroke="#800f2f" strokeWidth="1" />
              <rect x="120" y="60" width="35" height="30" fill="#19091f" />
              <rect x="155" y="60" width="35" height="30" fill="#2d132c" stroke="#800f2f" strokeWidth="1" />
              <rect x="190" y="60" width="35" height="30" fill="#19091f" />

              <rect x="50" y="90" width="35" height="30" fill="#2d132c" stroke="#800f2f" strokeWidth="1" />
              <rect x="85" y="90" width="35" height="30" fill="#19091f" />
              <rect x="120" y="90" width="35" height="30" fill="#2d132c" stroke="#800f2f" strokeWidth="1" />
              <rect x="155" y="90" width="35" height="30" fill="#19091f" />
              <rect x="190" y="90" width="35" height="30" fill="#2d132c" stroke="#800f2f" strokeWidth="1" />
            </g>

            {/* Opponent Black Checker Piece being jumped */}
            <circle cx="102" cy="75" r="12" fill="#2b2d42" stroke="#8d99ae" strokeWidth="2" opacity="0.8" />

            {/* Jump Arc Trajectory Dotted Line */}
            <path d="M 68 105 Q 102 45 137 45" stroke="#f58977" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.7" />

            {/* Animated Jumping Red Piece */}
            <g className="animate-bounce" style={{ animationDuration: '2.5s' }}>
              <circle cx="137" cy="45" r="13" fill="#e63946" stroke="#ffb703" strokeWidth="2.5" filter="url(#checkGlow)" />
              {/* Crown Emblem on King Piece */}
              <text x="137" y="50" fontSize="14" textAnchor="middle" fill="#ffe066" style={{ userSelect: 'none' }}>
                👑
              </text>
            </g>

            {/* Other checkers on the board */}
            <circle cx="68" cy="105" r="12" fill="#e63946" stroke="#ff758f" strokeWidth="2" opacity="0.6" />
            <circle cx="172" cy="75" r="12" fill="#2b2d42" stroke="#8d99ae" strokeWidth="2" opacity="0.8" />
            <circle cx="207" cy="105" r="12" fill="#e63946" stroke="#ff758f" strokeWidth="2" opacity="0.6" />
          </svg>
        </div>
      )}

      {/* 5. NAVAL BATTLESHIP ANIMATION */}
      {gameEngineId === 'battleship' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Circular Radar Background */}
            <circle cx="140" cy="80" r="65" fill="#082026" stroke="#2dd4bf" strokeWidth="1.5" opacity="0.8" />
            <circle cx="140" cy="80" r="45" stroke="#14b8a6" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
            <circle cx="140" cy="80" r="25" stroke="#0d9488" strokeWidth="1" opacity="0.5" />

            {/* Crosshair Axes */}
            <line x1="75" y1="80" x2="205" y2="80" stroke="#14b8a6" strokeWidth="1" opacity="0.5" />
            <line x1="140" y1="15" x2="140" y2="145" stroke="#14b8a6" strokeWidth="1" opacity="0.5" />

            {/* Rotating Sonar Radar Beam */}
            <defs>
              <linearGradient id="radarSweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <g className="animate-spin" style={{ animationDuration: '4s', transformOrigin: '140px 80px' }}>
              <path
                d="M 140 80 L 195 45 A 65 65 0 0 0 140 15 Z"
                fill="url(#radarSweepGrad)"
                opacity="0.35"
              />
              <line x1="140" y1="80" x2="195" y2="45" stroke="#5eead4" strokeWidth="2" filter="url(#radarGlow)" />
            </g>

            {/* Enemy Warship Silhouette Blip (Pulsing Target Lock) */}
            <g className="animate-pulse" style={{ animationDuration: '1.2s' }}>
              {/* Hit Explosion Icon */}
              <circle cx="165" cy="58" r="8" fill="#f43f5e" opacity="0.4" />
              <circle cx="165" cy="58" r="4" fill="#f43f5e" filter="url(#radarGlow)" />
              <text x="165" y="62" fontSize="12" textAnchor="middle" fill="#fff" style={{ userSelect: 'none' }}>
                💥
              </text>
            </g>

            {/* Pinging Submarine Blip */}
            <g className="animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.6s' }}>
              <circle cx="115" cy="100" r="5" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
            </g>
            <circle cx="115" cy="100" r="3.5" fill="#38bdf8" />

            {/* Target Crosshairs */}
            <g stroke="#f43f5e" strokeWidth="1.5" opacity="0.8">
              <circle cx="165" cy="58" r="14" stroke="#f43f5e" strokeDasharray="3 3" fill="none" />
            </g>
          </svg>
        </div>
      )}

      {/* 6. REVERSI / OTHELLO ANIMATION */}
      {gameEngineId === 'othello' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="othelloGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Green Board Grid */}
            <rect x="70" y="25" width="140" height="110" rx="12" fill="#0f291e" stroke="#1f5947" strokeWidth="2" />
            <line x1="105" y1="25" x2="105" y2="135" stroke="#1f5947" strokeWidth="1" />
            <line x1="140" y1="25" x2="140" y2="135" stroke="#1f5947" strokeWidth="1" />
            <line x1="175" y1="25" x2="175" y2="135" stroke="#1f5947" strokeWidth="1" />
            <line x1="70" y1="62" x2="210" y2="62" stroke="#1f5947" strokeWidth="1" />
            <line x1="70" y1="98" x2="210" y2="98" stroke="#1f5947" strokeWidth="1" />

            {/* Flipping Black / White Discs with animation */}
            <g className="animate-pulse" style={{ animationDuration: '2s' }}>
              <circle cx="122" cy="80" r="12" fill="#111827" stroke="#2dd4bf" strokeWidth="2" filter="url(#othelloGlow)" />
              <circle cx="158" cy="80" r="12" fill="#f3f4f6" stroke="#c084fc" strokeWidth="2" filter="url(#othelloGlow)" />
            </g>
            <g className="animate-bounce" style={{ animationDuration: '3s' }}>
              <circle cx="122" cy="44" r="11" fill="#f3f4f6" stroke="#c084fc" strokeWidth="1.5" />
              <circle cx="158" cy="116" r="11" fill="#111827" stroke="#2dd4bf" strokeWidth="1.5" />
            </g>
          </svg>
        </div>
      )}

      {/* 7. DOTS & BOXES ANIMATION */}
      {gameEngineId === 'dots-and-boxes' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="dotsGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Captured Boxes */}
            <rect x="100" y="45" width="40" height="40" rx="6" fill="#22d3ee" fillOpacity="0.25" stroke="#22d3ee" strokeWidth="1" />
            <text x="120" y="70" fontSize="14" fill="#22d3ee" fontWeight="bold" textAnchor="middle">⚄</text>

            <rect x="140" y="45" width="40" height="40" rx="6" fill="#ec4899" fillOpacity="0.25" stroke="#ec4899" strokeWidth="1" />
            <text x="160" y="70" fontSize="14" fill="#ec4899" fontWeight="bold" textAnchor="middle">★</text>

            {/* Glowing Laser Lines */}
            <line x1="100" y1="45" x2="180" y2="45" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" filter="url(#dotsGlow)" />
            <line x1="100" y1="85" x2="180" y2="85" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" filter="url(#dotsGlow)" />
            <line x1="100" y1="45" x2="100" y2="125" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
            <line x1="140" y1="45" x2="140" y2="85" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
            <line x1="180" y1="45" x2="180" y2="125" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />

            {/* Animated In-progress Line */}
            <line x1="100" y1="125" x2="180" y2="125" stroke="#a855f7" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />

            {/* Glowing White Dots */}
            {[[100,45],[140,45],[180,45],[100,85],[140,85],[180,85],[100,125],[140,125],[180,125]].map(([x,y], i) => (
              <circle key={i} cx={x} cy={y} r="4" fill="#ffffff" filter="url(#dotsGlow)" />
            ))}
          </svg>
        </div>
      )}

      {/* 8. GOMOKU ZEN ANIMATION */}
      {gameEngineId === 'gomoku' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="zenGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Zen Grid */}
            <rect x="75" y="25" width="130" height="110" rx="10" fill="#1e1833" stroke="#4338ca" strokeWidth="1.5" />
            {[45, 65, 85, 105].map(y => (
              <line key={y} x1="75" y1={y} x2="205" y2={y} stroke="#6366f1" strokeOpacity="0.3" strokeWidth="1" />
            ))}
            {[95, 115, 135, 155, 175, 195].map(x => (
              <line key={x} x1={x} y1="25" x2={x} y2="135" stroke="#6366f1" strokeOpacity="0.3" strokeWidth="1" />
            ))}

            {/* Diagonal 5-in-a-row Winning Stones */}
            <g className="animate-bounce" style={{ animationDuration: '3s' }}>
              <circle cx="95" cy="45" r="7" fill="#111827" stroke="#6366f1" strokeWidth="1.5" />
              <circle cx="115" cy="65" r="7" fill="#111827" stroke="#6366f1" strokeWidth="1.5" />
              <circle cx="135" cy="85" r="7" fill="#111827" stroke="#6366f1" strokeWidth="1.5" />
              <circle cx="155" cy="105" r="7" fill="#111827" stroke="#6366f1" strokeWidth="1.5" />
              <circle cx="175" cy="125" r="7" fill="#111827" stroke="#22d3ee" strokeWidth="2" filter="url(#zenGlow)" />
            </g>

            {/* Glowing White Opponent Stones */}
            <circle cx="115" cy="45" r="7" fill="#f3f4f6" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="135" cy="65" r="7" fill="#f3f4f6" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="155" cy="85" r="7" fill="#f3f4f6" stroke="#cbd5e1" strokeWidth="1.5" />
          </svg>
        </div>
      )}

      {/* 9. CYBER PAIRS MEMORY ANIMATION */}
      {gameEngineId === 'memory-match' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="memoryGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 3D Hologram Cards */}
            {/* Card 1 (Flipped Pair: Fox) */}
            <g className="animate-pulse" style={{ animationDuration: '2.5s' }}>
              <rect x="75" y="45" width="55" height="70" rx="10" fill="#4a044e" stroke="#f472b6" strokeWidth="2" filter="url(#memoryGlow)" />
              <text x="102" y="90" fontSize="26" textAnchor="middle">🦊</text>
            </g>

            {/* Card 2 (Matching Pair: Fox) */}
            <g className="animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.4s' }}>
              <rect x="145" y="45" width="55" height="70" rx="10" fill="#4a044e" stroke="#f472b6" strokeWidth="2" filter="url(#memoryGlow)" />
              <text x="172" y="90" fontSize="26" textAnchor="middle">🦊</text>
            </g>

            {/* Floating Sparkles */}
            <text x="135" y="40" fontSize="16" className="animate-bounce" style={{ animationDuration: '2s' }}>✨</text>
            <text x="65" y="130" fontSize="14" className="animate-bounce" style={{ animationDuration: '3s' }}>⚡</text>
            <text x="210" y="125" fontSize="14" className="animate-bounce" style={{ animationDuration: '2.8s' }}>💎</text>
          </svg>
        </div>
      )}

      {/* 10. MANCALA QUEST ANIMATION */}
      {gameEngineId === 'mancala' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="mancalaGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Wooden Board Body */}
            <rect x="40" y="35" width="200" height="90" rx="20" fill="#291408" stroke="#78350f" strokeWidth="3" />

            {/* Left & Right Stores */}
            <rect x="52" y="45" width="22" height="70" rx="10" fill="#170a04" stroke="#b45309" strokeWidth="1.5" />
            <text x="63" y="85" fontSize="12" textAnchor="middle" fill="#fbbf24">💎</text>

            <rect x="206" y="45" width="22" height="70" rx="10" fill="#170a04" stroke="#b45309" strokeWidth="1.5" />
            <text x="217" y="85" fontSize="12" textAnchor="middle" fill="#fbbf24">💎</text>

            {/* Pits Rows */}
            {[88, 118, 148, 178].map(x => (
              <React.Fragment key={x}>
                {/* Top Pit */}
                <circle cx={x} cy="58" r="11" fill="#170a04" stroke="#d97706" strokeWidth="1.5" />
                <circle cx={x} cy="58" r="4" fill="#fbbf24" filter="url(#mancalaGlow)" />
                {/* Bottom Pit */}
                <circle cx={x} cy="102" r="11" fill="#170a04" stroke="#d97706" strokeWidth="1.5" />
                <circle cx={x} cy="102" r="4" fill="#fbbf24" filter="url(#mancalaGlow)" />
              </React.Fragment>
            ))}

            {/* Sowing Gemstone Trail */}
            <g className="animate-ping" style={{ animationDuration: '2s', transformOrigin: '148px 102px' }}>
              <circle cx="148" cy="102" r="8" stroke="#f59e0b" strokeWidth="1" fill="none" />
            </g>
          </svg>
        </div>
      )}

      {/* 11. CYBER TRIVIA CLASH ANIMATION */}
      {gameEngineId === 'cyber-trivia' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00f2fe_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="triviaGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Holographic Quiz Screen Frame */}
            <rect x="45" y="25" width="190" height="110" rx="16" fill="#0c1229" stroke="#00f2fe" strokeWidth="2" opacity="0.9" />

            {/* Glowing Question Mark Core */}
            <g className="animate-bounce" style={{ animationDuration: '2.5s' }}>
              <circle cx="140" cy="55" r="18" fill="#00f2fe" opacity="0.15" filter="url(#triviaGlow)" />
              <text x="140" y="63" fontSize="26" textAnchor="middle" fill="#00f2fe" fontWeight="bold" filter="url(#triviaGlow)">
                ?
              </text>
            </g>

            {/* Floating Lightning Bolt */}
            <text x="65" y="48" fontSize="16" className="animate-pulse">⚡</text>
            <text x="215" y="48" fontSize="16" className="animate-pulse">⚡</text>

            {/* 4 Neon Holographic Answer Pills */}
            <rect x="60" y="85" width="75" height="18" rx="6" fill="#082f49" stroke="#38bdf8" strokeWidth="1" />
            <text x="70" y="98" fontSize="9" fill="#7dd3fc" fontWeight="bold">A · 1969</text>

            <rect x="145" y="85" width="75" height="18" rx="6" fill="#022c22" stroke="#34d399" strokeWidth="1.5" filter="url(#triviaGlow)" />
            <text x="155" y="98" fontSize="9" fill="#6ee7b7" fontWeight="bold">B · 256 ✓</text>

            <rect x="60" y="110" width="75" height="18" rx="6" fill="#082f49" stroke="#38bdf8" strokeWidth="1" />
            <text x="70" y="123" fontSize="9" fill="#7dd3fc" fontWeight="bold">C · LLM</text>

            <rect x="145" y="110" width="75" height="18" rx="6" fill="#082f49" stroke="#38bdf8" strokeWidth="1" />
            <text x="155" y="123" fontSize="9" fill="#7dd3fc" fontWeight="bold">D · NEON</text>
          </svg>
        </div>
      )}

      {/* 12. WORD CLASH ANIMATION */}
      {gameEngineId === 'word-clash' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00f59b_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="wordGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Row 1: C Y B E R */}
            <g transform="translate(45, 30)">
              {['C', 'Y', 'B', 'E', 'R'].map((letter, i) => (
                <g key={i} transform={`translate(${i * 38}, 0)`}>
                  <rect x="0" y="0" width="32" height="32" rx="8" fill="#15803d" stroke="#4ade80" strokeWidth="1.5" filter="url(#wordGlow)" />
                  <text x="16" y="22" fontSize="16" textAnchor="middle" fill="#ffffff" fontWeight="bold">
                    {letter}
                  </text>
                </g>
              ))}
            </g>

            {/* Row 2: P I X E L */}
            <g transform="translate(45, 68)">
              {['P', 'I', 'X', 'E', 'L'].map((letter, i) => {
                const isYellow = i === 1 || i === 3;
                const isGreen = i === 4;
                return (
                  <g key={i} transform={`translate(${i * 38}, 0)`}>
                    <rect
                      x="0"
                      y="0"
                      width="32"
                      height="32"
                      rx="8"
                      fill={isGreen ? '#15803d' : isYellow ? '#b45309' : '#1f2937'}
                      stroke={isGreen ? '#4ade80' : isYellow ? '#fde047' : '#374151'}
                      strokeWidth="1.5"
                    />
                    <text x="16" y="22" fontSize="16" textAnchor="middle" fill="#ffffff" fontWeight="bold">
                      {letter}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Row 3: Blank Row with glowing cursor */}
            <g transform="translate(45, 106)">
              {[0, 1, 2, 3, 4].map((i) => (
                <rect key={i} x={i * 38} y="0" width="32" height="32" rx="8" fill="#111827" stroke={i === 0 ? '#38bdf8' : '#1f2937'} strokeWidth="1.5" className={i === 0 ? 'animate-pulse' : ''} />
              ))}
            </g>
          </svg>
        </div>
      )}

      {/* 13. RPS CYBER STRIKE ANIMATION */}
      {gameEngineId === 'rps-strike' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#9d4edd_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="rpsGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Left Hologram Card (Rock) */}
            <g className="animate-bounce" style={{ animationDuration: '2.8s' }}>
              <rect x="45" y="42" width="55" height="75" rx="12" fill="#1e1333" stroke="#eab308" strokeWidth="2" filter="url(#rpsGlow)" />
              <text x="72" y="88" fontSize="28" textAnchor="middle">🪨</text>
              <text x="72" y="107" fontSize="8" textAnchor="middle" fill="#fde047" fontWeight="bold">ROCK</text>
            </g>

            {/* Center Energy Clash */}
            <circle cx="140" cy="80" r="16" fill="#9d4edd" opacity="0.3" filter="url(#rpsGlow)" className="animate-ping" style={{ animationDuration: '2s' }} />
            <text x="140" y="86" fontSize="18" textAnchor="middle" fill="#e9d5ff">⚔️</text>

            {/* Right Hologram Card (Scissors) */}
            <g className="animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.6s' }}>
              <rect x="180" y="42" width="55" height="75" rx="12" fill="#1e1333" stroke="#a855f7" strokeWidth="2" filter="url(#rpsGlow)" />
              <text x="207" y="88" fontSize="28" textAnchor="middle">✂️</text>
              <text x="207" y="107" fontSize="8" textAnchor="middle" fill="#d8b4fe" fontWeight="bold">BLADE</text>
            </g>
          </svg>
        </div>
      )}

      {/* 14. HAND CRICKET ANIMATION */}
      {gameEngineId === 'hand-cricket' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="cricketGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Pitch Oval */}
            <ellipse cx="140" cy="115" rx="110" ry="28" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" opacity="0.6" />
            <rect x="100" y="100" width="80" height="30" rx="4" fill="#047857" opacity="0.8" />

            {/* Wickets */}
            <line x1="130" y1="85" x2="130" y2="115" stroke="#fcd34d" strokeWidth="3" />
            <line x1="140" y1="85" x2="140" y2="115" stroke="#fcd34d" strokeWidth="3" />
            <line x1="150" y1="85" x2="150" y2="115" stroke="#fcd34d" strokeWidth="3" />
            <line x1="126" y1="84" x2="154" y2="84" stroke="#f59e0b" strokeWidth="3" />

            {/* Floating Cricket Bat */}
            <g className="animate-bounce" style={{ animationDuration: '2.5s' }} transform="translate(60, 40) rotate(-25)">
              <rect x="0" y="0" width="16" height="55" rx="4" fill="#d97706" stroke="#fbbf24" strokeWidth="1.5" />
              <rect x="5" y="55" width="6" height="25" rx="2" fill="#78350f" />
            </g>

            {/* Glowing Cricket Ball */}
            <g className="animate-ping" style={{ animationDuration: '2s', transformOrigin: '190px 70px' }}>
              <circle cx="190" cy="70" r="12" fill="#ef4444" opacity="0.3" filter="url(#cricketGlow)" />
            </g>
            <circle cx="190" cy="70" r="10" fill="#dc2626" stroke="#fca5a5" strokeWidth="1.5" />

            {/* Boundary Six text */}
            <text x="220" y="45" fontSize="22" fontWeight="black" fill="#10b981" filter="url(#cricketGlow)" className="animate-pulse">
              6!
            </text>
          </svg>
        </div>
      )}

      {/* 15. RPSLS ANIMATION */}
      {gameEngineId === 'rpsls' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="rpslsGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Center Pentagon Star */}
            <circle cx="140" cy="80" r="45" fill="#3b0764" stroke="#a855f7" strokeWidth="1.5" opacity="0.4" />
            <polygon points="140,40 180,68 165,115 115,115 100,68" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />

            {/* 5 Icons positioned at pentagon vertices */}
            <text x="140" y="38" fontSize="20" textAnchor="middle" className="animate-bounce" style={{ animationDuration: '3s' }}>🪨</text>
            <text x="188" y="72" fontSize="20" textAnchor="middle" className="animate-bounce" style={{ animationDuration: '2.7s' }}>📄</text>
            <text x="170" y="128" fontSize="20" textAnchor="middle" className="animate-bounce" style={{ animationDuration: '3.2s' }}>✂️</text>
            <text x="110" y="128" fontSize="20" textAnchor="middle" className="animate-bounce" style={{ animationDuration: '2.5s' }}>🦎</text>
            <text x="92" y="72" fontSize="20" textAnchor="middle" className="animate-bounce" style={{ animationDuration: '2.9s' }}>🖖</text>

            <circle cx="140" cy="80" r="10" fill="#a855f7" opacity="0.5" filter="url(#rpslsGlow)" className="animate-ping" style={{ animationDuration: '2s' }} />
          </svg>
        </div>
      )}

      {/* 16. NIM STICKS ANIMATION */}
      {gameEngineId === 'nim' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="nimGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Row 1 (3 Sticks) */}
            {[115, 140, 165].map((x, i) => (
              <rect key={i} x={x} y="25" width="8" height="28" rx="4" fill="#06b6d4" filter="url(#nimGlow)" className="animate-pulse" />
            ))}

            {/* Row 2 (5 Sticks) */}
            {[90, 115, 140, 165, 190].map((x, i) => (
              <rect key={i} x={x} y="65" width="8" height="32" rx="4" fill="#a855f7" filter="url(#nimGlow)" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
            ))}

            {/* Row 3 (7 Sticks) */}
            {[65, 90, 115, 140, 165, 190, 215].map((x, i) => (
              <rect key={i} x={x} y="110" width="8" height="32" rx="4" fill="#f59e0b" filter="url(#nimGlow)" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
            ))}

            {/* Laser Grab Beam */}
            <line x1="165" y1="15" x2="165" y2="55" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 3" className="animate-ping" style={{ animationDuration: '2s' }} />
          </svg>
        </div>
      )}

      {/* 17. MATCHSTICK PUZZLE ANIMATION */}
      {gameEngineId === 'matchstick-puzzle' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="matchGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Wooden Frame */}
            <rect x="40" y="35" width="200" height="90" rx="16" fill="#1c0d02" stroke="#d97706" strokeWidth="2" />

            {/* Matchstick Equation "6 + 4 = 4" */}
            <text x="140" y="90" fontSize="34" font-family="monospace" fontWeight="black" textAnchor="middle" fill="#fbbf24" filter="url(#matchGlow)">
              6 + 4 = 4
            </text>

            {/* Animated Floating Matchstick with Red Sulfur Tip */}
            <g className="animate-bounce" style={{ animationDuration: '2s' }}>
              <rect x="180" y="25" width="30" height="5" rx="2" fill="#d97706" />
              <circle cx="212" cy="27" r="4" fill="#ef4444" filter="url(#matchGlow)" />
            </g>

            {/* Match Flame Sparkles */}
            <text x="65" y="55" fontSize="14" className="animate-pulse">🔥</text>
            <text x="215" y="55" fontSize="14" className="animate-pulse">🔥</text>
          </svg>
        </div>
      )}

      {/* 18. COIN TOSS CHALLENGE ANIMATION */}
      {gameEngineId === 'coin-toss' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="coinGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Orbit rings */}
            <ellipse cx="140" cy="80" rx="75" ry="30" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="4 4" fill="none" transform="rotate(-15 140 80)" />

            {/* Glowing 3D Coin in center */}
            <g className="animate-bounce" style={{ animationDuration: '2.5s' }}>
              <circle cx="140" cy="80" r="32" fill="#eab308" stroke="#fef08a" strokeWidth="3" filter="url(#coinGlow)" />
              <circle cx="140" cy="80" r="26" fill="#ca8a04" stroke="#fde047" strokeWidth="1.5" />
              <text x="140" y="89" fontSize="26" textAnchor="middle">👑</text>
            </g>

            {/* Floating Sparkle Coins */}
            <text x="70" y="55" fontSize="16" className="animate-pulse">🪙</text>
            <text x="210" y="115" fontSize="16" className="animate-pulse" style={{ animationDelay: '0.8s' }}>🪙</text>
          </svg>
        </div>
      )}

      {/* 19. ODD OR EVEN ANIMATION */}
      {gameEngineId === 'odd-even' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="oddGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Left Hand Card (3 Fingers) */}
            <g className="animate-bounce" style={{ animationDuration: '2.8s' }}>
              <rect x="55" y="40" width="55" height="75" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" filter="url(#oddGlow)" />
              <text x="82" y="85" fontSize="28" textAnchor="middle">🤟</text>
              <text x="82" y="105" fontSize="9" textAnchor="middle" fill="#7dd3fc" fontWeight="bold">3 (ODD)</text>
            </g>

            {/* Plus Operator */}
            <circle cx="140" cy="78" r="14" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="140" y="84" fontSize="18" textAnchor="middle" fill="#38bdf8" fontWeight="black">+</text>

            {/* Right Hand Card (2 Fingers) */}
            <g className="animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.6s' }}>
              <rect x="170" y="40" width="55" height="75" rx="12" fill="#0f172a" stroke="#a855f7" strokeWidth="2" filter="url(#oddGlow)" />
              <text x="197" y="85" fontSize="28" textAnchor="middle">✌️</text>
              <text x="197" y="105" fontSize="9" textAnchor="middle" fill="#d8b4fe" fontWeight="bold">2 (EVEN)</text>
            </g>
          </svg>
        </div>
      )}

      {/* 20. HIGHER OR LOWER ANIMATION */}
      {gameEngineId === 'higher-lower' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="hlGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Playing Card 1 (7 of Spades) */}
            <rect x="60" y="38" width="55" height="80" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" filter="url(#hlGlow)" />
            <text x="70" y="55" fontSize="13" fontWeight="bold" fill="#0f172a">7</text>
            <text x="87" y="85" fontSize="26" textAnchor="middle" fill="#0f172a">♠</text>

            {/* Arrow indicators in center */}
            <g className="animate-bounce" style={{ animationDuration: '2s' }}>
              <polygon points="140,55 150,70 130,70" fill="#10b981" filter="url(#hlGlow)" />
              <polygon points="140,105 150,90 130,90" fill="#ef4444" filter="url(#hlGlow)" />
            </g>

            {/* Playing Card 2 (King of Hearts) */}
            <rect x="165" y="38" width="55" height="80" rx="10" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" filter="url(#hlGlow)" />
            <text x="175" y="55" fontSize="13" fontWeight="bold" fill="#dc2626">K</text>
            <text x="192" y="85" fontSize="26" textAnchor="middle" fill="#dc2626">♥</text>
          </svg>
        </div>
      )}

      {/* 21. GUESS THE NUMBER ANIMATION */}
      {gameEngineId === 'guess-number' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Radar Scope Rings */}
            <circle cx="140" cy="80" r="55" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 3" fill="none" opacity="0.6" />
            <circle cx="140" cy="80" r="35" stroke="#8b5cf6" strokeWidth="1.5" fill="none" opacity="0.8" />
            <circle cx="140" cy="80" r="15" stroke="#c4b5fd" strokeWidth="1.5" fill="none" />

            {/* Crosshairs */}
            <line x1="80" y1="80" x2="200" y2="80" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="140" y1="20" x2="140" y2="140" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 2" />

            {/* Center Target Hologram Number */}
            <circle cx="140" cy="80" r="22" fill="#4c1d95" stroke="#a78bfa" strokeWidth="2" filter="url(#radarGlow)" />
            <text x="140" y="88" fontSize="20" font-family="monospace" fontWeight="black" textAnchor="middle" fill="#f5f3ff" className="animate-pulse">
              ??
            </text>

            {/* Range Badges */}
            <text x="50" y="85" fontSize="12" fontWeight="black" fill="#38bdf8">1</text>
            <text x="215" y="85" fontSize="12" fontWeight="black" fill="#f43f5e">100</text>
          </svg>
        </div>
      )}

      {/* 22. PALLANGUZHI ANIMATION */}
      {gameEngineId === 'pallanguzhi' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="pallaGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Wooden Board Curved Outline */}
            <rect x="25" y="35" width="230" height="90" rx="28" fill="#29140b" stroke="#b45309" strokeWidth="3" filter="url(#pallaGlow)" />
            {/* Top row pits */}
            {[50, 80, 110, 140, 170, 200, 230].map((cx, i) => (
              <g key={`top-${i}`}>
                <circle cx={cx} cy="60" r="11" fill="#140a05" stroke="#78350f" strokeWidth="1.5" />
                <circle cx={cx - 2} cy="59" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
                <circle cx={cx + 3} cy="61" r="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
              </g>
            ))}
            {/* Bottom row pits */}
            {[50, 80, 110, 140, 170, 200, 230].map((cx, i) => (
              <g key={`bot-${i}`}>
                <circle cx={cx} cy="100" r="11" fill="#140a05" stroke="#78350f" strokeWidth="1.5" />
                <circle cx={cx + 1} cy="99" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
                <circle cx={cx - 3} cy="101" r="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
              </g>
            ))}
            {/* Orbiting Golden Cowrie */}
            <circle cx="140" cy="80" r="7" fill="#fef08a" stroke="#eab308" strokeWidth="1.5" className="animate-ping opacity-75" />
          </svg>
        </div>
      )}

      {/* 23. CHOWKA BARA ANIMATION */}
      {gameEngineId === 'chowka-bara' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="chowkaGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* 5x5 Grid Board */}
            <rect x="70" y="15" width="140" height="130" rx="12" fill="#261005" stroke="#f59e0b" strokeWidth="2.5" filter="url(#chowkaGlow)" />
            {/* Safe zone X marks */}
            <text x="140" y="85" fontSize="20" fontWeight="black" textAnchor="middle" fill="#f59e0b">✕</text>
            <text x="140" y="42" fontSize="16" fontWeight="black" textAnchor="middle" fill="#d97706">✕</text>
            <text x="140" y="125" fontSize="16" fontWeight="black" textAnchor="middle" fill="#d97706">✕</text>
            <text x="96" y="85" fontSize="16" fontWeight="black" textAnchor="middle" fill="#d97706">✕</text>
            <text x="184" y="85" fontSize="16" fontWeight="black" textAnchor="middle" fill="#d97706">✕</text>
            {/* 4 Cowrie Shells on corners */}
            <ellipse cx="40" cy="50" rx="9" ry="14" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" className="animate-bounce" />
            <ellipse cx="40" cy="110" rx="9" ry="14" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" className="animate-bounce" />
            <ellipse cx="240" cy="50" rx="9" ry="14" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" className="animate-bounce" />
            <ellipse cx="240" cy="110" rx="9" ry="14" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" className="animate-bounce" />
          </svg>
        </div>
      )}

      {/* 24. PACHISI ANIMATION */}
      {gameEngineId === 'pachisi' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="pachisiGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Cross arms */}
            <rect x="120" y="15" width="40" height="130" rx="6" fill="#30070c" stroke="#f43f5e" strokeWidth="2" filter="url(#pachisiGlow)" />
            <rect x="75" y="60" width="130" height="40" rx="6" fill="#30070c" stroke="#f43f5e" strokeWidth="2" filter="url(#pachisiGlow)" />
            {/* Central Char-Koni */}
            <rect x="120" y="60" width="40" height="40" fill="#7f1d1d" stroke="#fbbf24" strokeWidth="2" />
            <text x="140" y="86" fontSize="18" textAnchor="middle" fill="#fbbf24" className="animate-pulse">👑</text>
            {/* Conical Royal Gotti */}
            <circle cx="100" cy="80" r="9" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="180" cy="80" r="9" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        </div>
      )}

      {/* 25. SNAKES AND LADDERS ANIMATION */}
      {gameEngineId === 'snakes-and-ladders' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="snakesGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Golden Ladder Rails */}
            <line x1="90" y1="135" x2="150" y2="25" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" filter="url(#snakesGlow)" />
            <line x1="108" y1="140" x2="168" y2="30" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" filter="url(#snakesGlow)" />
            {/* Ladder Rungs */}
            {[0.2, 0.4, 0.6, 0.8].map((t, idx) => (
              <line
                key={idx}
                x1={90 + (150 - 90) * t}
                y1={135 + (25 - 135) * t}
                x2={108 + (168 - 108) * t}
                y2={140 + (30 - 140) * t}
                stroke="#fef08a"
                strokeWidth="2.5"
              />
            ))}
            {/* Coiling Emerald Snake */}
            <path
              d="M 210,35 Q 230,70 190,90 T 170,135"
              fill="none"
              stroke="#10b981"
              strokeWidth="5"
              strokeLinecap="round"
              filter="url(#snakesGlow)"
            />
            {/* Snake Head */}
            <circle cx="210" cy="35" r="7" fill="#059669" />
            <circle cx="212" cy="33" r="1.5" fill="#ffffff" />
            {/* 3D Rolling D6 Die */}
            <rect x="35" y="65" width="35" height="35" rx="7" fill="#10b981" stroke="#a7f3d0" strokeWidth="2" className="animate-spin" />
            <text x="52" y="89" fontSize="20" fontWeight="black" textAnchor="middle" fill="#042f2e">6</text>
          </svg>
        </div>
      )}

      {/* 26. LUDO ANIMATION */}
      {gameEngineId === 'ludo' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="ludoGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* 4 Quadrants Board */}
            <g transform="translate(75, 15)">
              {/* Red (Top-Left) */}
              <rect x="0" y="0" width="60" height="60" rx="8" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" filter="url(#ludoGlow)" />
              <circle cx="30" cy="30" r="10" fill="#ef4444" />
              {/* Green (Top-Right) */}
              <rect x="70" y="0" width="60" height="60" rx="8" fill="#14532d" stroke="#22c55e" strokeWidth="2" filter="url(#ludoGlow)" />
              <circle cx="100" cy="30" r="10" fill="#22c55e" />
              {/* Blue (Bottom-Left) */}
              <rect x="0" y="70" width="60" height="60" rx="8" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" filter="url(#ludoGlow)" />
              <circle cx="30" cy="100" r="10" fill="#3b82f6" />
              {/* Yellow (Bottom-Right) */}
              <rect x="70" y="70" width="60" height="60" rx="8" fill="#713f12" stroke="#eab308" strokeWidth="2" filter="url(#ludoGlow)" />
              <circle cx="100" cy="100" r="10" fill="#eab308" />
              {/* Center Star Victory */}
              <polygon points="65,58 68,63 74,64 69,68 71,74 65,70 59,74 61,68 56,64 62,63" fill="#fbbf24" className="animate-spin" />
            </g>
          </svg>
        </div>
      )}

      {/* 27. CARROM ANIMATION */}
      {gameEngineId === 'carrom' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <filter id="carromGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Plywood Square Board */}
            <rect x="75" y="15" width="130" height="130" rx="14" fill="#451a03" stroke="#ca8a04" strokeWidth="4" filter="url(#carromGlow)" />
            <rect x="85" y="25" width="110" height="110" rx="8" fill="#fef3c7" />
            {/* Corner Pockets */}
            <circle cx="95" cy="35" r="7" fill="#0f172a" />
            <circle cx="185" cy="35" r="7" fill="#0f172a" />
            <circle cx="95" cy="125" r="7" fill="#0f172a" />
            <circle cx="185" cy="125" r="7" fill="#0f172a" />
            {/* Center Circle & Queen */}
            <circle cx="140" cy="80" r="18" fill="none" stroke="#dc2626" strokeWidth="1.5" />
            <circle cx="140" cy="80" r="5" fill="#ef4444" />
            {/* White and Black Coins */}
            <circle cx="132" cy="74" r="4.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
            <circle cx="148" cy="86" r="4.5" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
            {/* Striker Aiming Line */}
            <circle cx="120" cy="115" r="7" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="120" y1="115" x2="135" y2="90" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 3" />
          </svg>
        </div>
      )}

      {/* 28. KABADDI ANIMATION */}
      {gameEngineId === 'kabaddi' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="kabaddiMatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="raiderAura" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <filter id="kabaddiGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Pro Kabaddi Synthetic Court */}
            <rect x="35" y="20" width="210" height="120" rx="8" fill="url(#kabaddiMatGrad)" stroke="#f59e0b" strokeWidth="2" />
            {/* Lobbies on sides */}
            <rect x="35" y="20" width="16" height="120" fill="#f97316" opacity="0.25" />
            <rect x="229" y="20" width="16" height="120" fill="#f97316" opacity="0.25" />
            {/* Midline */}
            <line x1="140" y1="20" x2="140" y2="140" stroke="#ffffff" strokeWidth="2.5" />
            {/* Baulk Lines */}
            <line x1="95" y1="20" x2="95" y2="140" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="185" y1="20" x2="185" y2="140" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Bonus Lines */}
            <line x1="72" y1="20" x2="72" y2="140" stroke="#facc15" strokeWidth="1.5" />
            <line x1="208" y1="20" x2="208" y2="140" stroke="#facc15" strokeWidth="1.5" />

            {/* Defenders Formation on Right */}
            <circle cx="195" cy="40" r="5" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1" />
            <circle cx="215" cy="55" r="5" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1" />
            <circle cx="205" cy="80" r="5.5" fill="#2563eb" stroke="#60a5fa" strokeWidth="1.5" />
            <circle cx="215" cy="105" r="5" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1" />
            <circle cx="195" cy="120" r="5" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1" />

            {/* Raider Leaping Forward Across Midline */}
            <g transform="translate(130, 75)" className="animate-pulse">
              <circle cx="0" cy="0" r="7" fill="url(#raiderAura)" stroke="#fef08a" strokeWidth="2" filter="url(#kabaddiGlow)" />
              {/* Leaping Motion Trail */}
              <line x1="-15" y1="5" x2="-2" y2="2" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
              <line x1="-12" y1="-5" x2="0" y2="-2" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
            </g>
          </svg>
        </div>
      )}

      {/* 29. INDIAN CRICKET QUIZ ANIMATION */}
      {gameEngineId === 'cricket-quiz' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="cricketSky" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
              <linearGradient id="ballFlame" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
              <filter id="cricketGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Stadium Pitch Canvas */}
            <rect x="35" y="20" width="210" height="120" rx="12" fill="url(#cricketSky)" stroke="#10b981" strokeWidth="2" />
            
            {/* Floodlight Beams */}
            <polygon points="40,20 85,90 95,90" fill="#34d399" opacity="0.1" />
            <polygon points="240,20 195,90 185,90" fill="#34d399" opacity="0.1" />

            {/* Stadium Stumps with Glowing LED Bails */}
            <line x1="80" y1="95" x2="80" y2="125" stroke="#fcd34d" strokeWidth="3" />
            <line x1="86" y1="95" x2="86" y2="125" stroke="#fcd34d" strokeWidth="3" />
            <line x1="92" y1="95" x2="92" y2="125" stroke="#fcd34d" strokeWidth="3" />
            <line x1="77" y1="94" x2="95" y2="94" stroke="#ef4444" strokeWidth="3" filter="url(#cricketGlow)" />

            {/* Cricket Bat in Follow-through Swing */}
            <line x1="110" y1="110" x2="145" y2="70" stroke="#ca8a04" strokeWidth="6" strokeLinecap="round" />
            <line x1="145" y1="70" x2="155" y2="58" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" />

            {/* Blazing Red Six Ball with Comet Trail */}
            <path d="M 125 100 Q 170 50 215 35" stroke="url(#ballFlame)" strokeWidth="3.5" strokeDasharray="4 2" fill="none" opacity="0.8" />
            <circle cx="215" cy="35" r="7" fill="url(#ballFlame)" stroke="#ffffff" strokeWidth="1.5" filter="url(#cricketGlow)" className="animate-ping" />
            <circle cx="215" cy="35" r="7" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        </div>
      )}

      {/* 30. ANTAKSHARI ANIMATION */}
      {gameEngineId === 'antakshari' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="antakshariGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#831843" />
                <stop offset="100%" stopColor="#4c0519" />
              </linearGradient>
              <filter id="micGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Stage Backdrop */}
            <rect x="35" y="20" width="210" height="120" rx="12" fill="url(#antakshariGrad)" stroke="#ec4899" strokeWidth="2" />

            {/* Spinning Vinyl Record on Left */}
            <g transform="translate(90, 80)">
              <circle cx="0" cy="0" r="32" fill="#0f172a" stroke="#334155" strokeWidth="2" />
              <circle cx="0" cy="0" r="24" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="16" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="10" fill="#ec4899" />
              <circle cx="0" cy="0" r="3" fill="#ffffff" />
            </g>

            {/* Golden Vintage Microphone on Right */}
            <g transform="translate(175, 75)">
              <rect x="-8" y="-22" width="16" height="26" rx="8" fill="#facc15" stroke="#eab308" strokeWidth="1.5" filter="url(#micGlow)" />
              <line x1="-8" y1="-10" x2="8" y2="-10" stroke="#713f12" strokeWidth="1" />
              <line x1="-8" y1="-16" x2="8" y2="-16" stroke="#713f12" strokeWidth="1" />
              {/* Mic U-bracket */}
              <path d="M -12 -10 A 12 12 0 0 0 12 -10" stroke="#facc15" strokeWidth="2" fill="none" />
              <line x1="0" y1="2" x2="0" y2="18" stroke="#facc15" strokeWidth="3" />
              <circle cx="0" cy="22" r="10" fill="#334155" stroke="#facc15" strokeWidth="1.5" />
            </g>

            {/* Floating Musical Notes */}
            <text x="125" y="50" fill="#f43f5e" fontSize="18" fontWeight="bold" className="animate-bounce">♪</text>
            <text x="145" y="38" fill="#fbbf24" fontSize="22" fontWeight="bold" className="animate-pulse">♫</text>
            <text x="195" y="45" fill="#f472b6" fontSize="16" fontWeight="bold">♬</text>
          </svg>
        </div>
      )}

      {/* 31. NAME, PLACE, ANIMAL, THING ANIMATION */}
      {gameEngineId === 'name-place-animal-thing' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="npatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#312e81" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <filter id="npatGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Notebook Sheet Canvas */}
            <rect x="35" y="20" width="210" height="120" rx="12" fill="url(#npatGrad)" stroke="#6366f1" strokeWidth="2" />

            {/* 4 Column Paper Grid */}
            <rect x="45" y="30" width="40" height="50" rx="6" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
            <text x="52" y="46" fill="#a5b4fc" fontSize="9" fontWeight="bold">NAME</text>
            <text x="52" y="66" fill="#4ade80" fontSize="12" fontWeight="bold">✓ 10</text>

            <rect x="90" y="30" width="40" height="50" rx="6" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
            <text x="96" y="46" fill="#a5b4fc" fontSize="9" fontWeight="bold">PLACE</text>
            <text x="96" y="66" fill="#4ade80" fontSize="12" fontWeight="bold">✓ 10</text>

            <rect x="135" y="30" width="45" height="50" rx="6" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
            <text x="139" y="46" fill="#a5b4fc" fontSize="8" fontWeight="bold">ANIMAL</text>
            <text x="144" y="66" fill="#4ade80" fontSize="12" fontWeight="bold">✓ 10</text>

            <rect x="185" y="30" width="40" height="50" rx="6" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
            <text x="191" y="46" fill="#a5b4fc" fontSize="9" fontWeight="bold">THING</text>
            <text x="193" y="66" fill="#4ade80" fontSize="12" fontWeight="bold">✓ 10</text>

            {/* Emergency STOP Button Slam */}
            <g transform="translate(140, 108)">
              <rect x="-45" y="-14" width="90" height="28" rx="8" fill="#dc2626" stroke="#fca5a5" strokeWidth="1.5" filter="url(#npatGlow)" className="animate-pulse" />
              <text x="0" y="5" fill="#ffffff" fontSize="12" fontWeight="900" textAnchor="middle" letterSpacing="2">STOP!</text>
            </g>
          </svg>
        </div>
      )}

      {/* 32. TRUTH OR DARE ANIMATION */}
      {gameEngineId === 'truth-or-dare' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="todGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#831843" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <filter id="todGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect x="35" y="20" width="210" height="120" rx="12" fill="url(#todGrad)" stroke="#ec4899" strokeWidth="2" />
            
            {/* Spinning Bottle in Center */}
            <g transform="translate(140, 80) rotate(42)">
              <rect x="-8" y="-32" width="16" height="64" rx="7" fill="#38bdf8" stroke="#7dd3fc" strokeWidth="1.5" opacity="0.9" />
              <rect x="-4" y="-40" width="8" height="10" rx="2" fill="#0284c7" />
              <circle cx="0" cy="0" r="4" fill="#ffffff" />
            </g>
            <circle cx="140" cy="80" r="38" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin" style={{ animationDuration: '8s' }} />

            {/* Badges: TRUTH vs DARE */}
            <g transform="translate(75, 55)">
              <rect x="-30" y="-14" width="60" height="28" rx="8" fill="#06b6d4" stroke="#67e8f9" strokeWidth="1.5" filter="url(#todGlow)" />
              <text x="0" y="4" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle">TRUTH</text>
            </g>
            <g transform="translate(205, 105)">
              <rect x="-28" y="-14" width="56" height="28" rx="8" fill="#e11d48" stroke="#fda4af" strokeWidth="1.5" filter="url(#todGlow)" className="animate-pulse" />
              <text x="0" y="4" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle">DARE</text>
            </g>
          </svg>
        </div>
      )}

      {/* 33. NEVER HAVE I EVER ANIMATION */}
      {gameEngineId === 'never-have-i-ever' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="nhieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4c1d95" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            <rect x="35" y="20" width="210" height="120" rx="12" fill="url(#nhieGrad)" stroke="#8b5cf6" strokeWidth="2" />
            
            {/* 5 Finger Life Tokens */}
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={`translate(${65 + i * 38}, 60)`}>
                <rect x="-14" y="-22" width="28" height="44" rx="8" fill={i < 3 ? '#ec4899' : '#334155'} stroke={i < 3 ? '#f472b6' : '#64748b'} strokeWidth="1.5" />
                <text x="0" y="6" fill="#ffffff" fontSize="16" fontWeight="bold" textAnchor="middle">
                  {i < 3 ? '☝' : '✖'}
                </text>
              </g>
            ))}

            {/* Bottom "PUT A FINGER DOWN" Banner */}
            <rect x="60" y="98" width="160" height="24" rx="6" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1" />
            <text x="140" y="114" fill="#c4b5fd" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="1">
              PUT A FINGER DOWN
            </text>
          </svg>
        </div>
      )}

      {/* 34. WHO KNOWS ME BEST? ANIMATION */}
      {gameEngineId === 'who-knows-me-best' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="wkmbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#701a75" />
                <stop offset="100%" stopColor="#18181b" />
              </linearGradient>
            </defs>
            <rect x="35" y="20" width="210" height="120" rx="12" fill="url(#wkmbGrad)" stroke="#d946ef" strokeWidth="2" />

            {/* Twin BFF Avatars + Golden Crown */}
            <circle cx="105" cy="72" r="22" fill="#ec4899" stroke="#f472b6" strokeWidth="2" />
            <text x="105" y="78" fill="#ffffff" fontSize="18" textAnchor="middle">🧑</text>
            <circle cx="175" cy="72" r="22" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" />
            <text x="175" y="78" fill="#ffffff" fontSize="18" textAnchor="middle">🧑‍🦱</text>

            {/* Floating Crown over Winner */}
            <text x="175" y="42" fill="#facc15" fontSize="20" textAnchor="middle" className="animate-bounce">👑</text>

            {/* Heart Connection Meter */}
            <path d="M 130 65 Q 140 50 150 65 Q 140 85 130 65 Z" fill="#ef4444" className="animate-pulse" />
            
            <rect x="75" y="106" width="130" height="20" rx="10" fill="#27272a" stroke="#d946ef" strokeWidth="1" />
            <text x="140" y="120" fill="#f5d0fe" fontSize="9" fontWeight="bold" textAnchor="middle">
              MATCH RATE: 95%
            </text>
          </svg>
        </div>
      )}

      {/* 35. MOST LIKELY TO ANIMATION */}
      {gameEngineId === 'most-likely-to' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="mltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            <rect x="35" y="20" width="210" height="120" rx="12" fill="url(#mltGrad)" stroke="#f59e0b" strokeWidth="2" />

            {/* 3 Candidate Cards Pointing */}
            <g transform="translate(80, 70)">
              <rect x="-24" y="-30" width="48" height="60" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
              <circle cx="0" cy="-8" r="14" fill="#3b82f6" />
              <text x="0" y="-3" fill="#ffffff" fontSize="11" textAnchor="middle">P1</text>
              <text x="0" y="18" fill="#94a3b8" fontSize="9" textAnchor="middle">1 Vote</text>
            </g>
            <g transform="translate(140, 65)">
              <rect x="-28" y="-35" width="56" height="70" rx="8" fill="#3b0764" stroke="#f59e0b" strokeWidth="2" className="animate-pulse" />
              <circle cx="0" cy="-10" r="16" fill="#ec4899" />
              <text x="0" y="-5" fill="#ffffff" fontSize="13" textAnchor="middle">P2</text>
              <text x="0" y="20" fill="#fde047" fontSize="10" fontWeight="bold" textAnchor="middle">4 Votes! 🏆</text>
            </g>
            <g transform="translate(200, 70)">
              <rect x="-24" y="-30" width="48" height="60" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
              <circle cx="0" cy="-8" r="14" fill="#10b981" />
              <text x="0" y="-3" fill="#ffffff" fontSize="11" textAnchor="middle">P3</text>
              <text x="0" y="18" fill="#94a3b8" fontSize="9" textAnchor="middle">0 Votes</text>
            </g>

            <text x="140" y="125" fill="#fde68a" fontSize="9" fontWeight="bold" textAnchor="middle">👉 VOTES IN SYNC</text>
          </svg>
        </div>
      )}

      {/* 36. TWO TRUTHS AND A LIE ANIMATION */}
      {gameEngineId === 'two-truths-and-a-lie' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="ttalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <rect x="35" y="20" width="210" height="120" rx="12" fill="url(#ttalGrad)" stroke="#10b981" strokeWidth="2" />

            {/* 3 Cards: Truth, Truth, Lie */}
            <g transform="translate(75, 75)">
              <rect x="-24" y="-35" width="48" height="70" rx="8" fill="#065f46" stroke="#34d399" strokeWidth="1.5" />
              <circle cx="0" cy="-10" r="12" fill="#10b981" />
              <text x="0" y="-4" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">✓</text>
              <text x="0" y="16" fill="#a7f3d0" fontSize="9" fontWeight="bold" textAnchor="middle">TRUTH</text>
            </g>
            <g transform="translate(140, 75)">
              <rect x="-24" y="-35" width="48" height="70" rx="8" fill="#881337" stroke="#f43f5e" strokeWidth="2" className="animate-pulse" />
              <circle cx="0" cy="-10" r="12" fill="#e11d48" />
              <text x="0" y="-4" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">✗</text>
              <text x="0" y="16" fill="#fecdd3" fontSize="9" fontWeight="bold" textAnchor="middle">LIE! 🚨</text>
            </g>
            <g transform="translate(205, 75)">
              <rect x="-24" y="-35" width="48" height="70" rx="8" fill="#065f46" stroke="#34d399" strokeWidth="1.5" />
              <circle cx="0" cy="-10" r="12" fill="#10b981" />
              <text x="0" y="-4" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">✓</text>
              <text x="0" y="16" fill="#a7f3d0" fontSize="9" fontWeight="bold" textAnchor="middle">TRUTH</text>
            </g>
          </svg>
        </div>
      )}

      {/* 37. WOULD YOU RATHER? ANIMATION */}
      {gameEngineId === 'would-you-rather' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <rect x="35" y="20" width="210" height="120" rx="12" fill="#0f172a" stroke="#6366f1" strokeWidth="2" />

            {/* Split Screen Red vs Blue */}
            <rect x="42" y="28" width="95" height="104" rx="8" fill="#4c0519" stroke="#f43f5e" strokeWidth="1.5" />
            <text x="90" y="65" fill="#fca5a5" fontSize="12" fontWeight="bold" textAnchor="middle">THIS 🅰️</text>
            <text x="90" y="90" fill="#f87171" fontSize="16" fontWeight="900" textAnchor="middle">62%</text>

            <rect x="143" y="28" width="95" height="104" rx="8" fill="#082f49" stroke="#0ea5e9" strokeWidth="1.5" />
            <text x="190" y="65" fill="#bae6fd" fontSize="12" fontWeight="bold" textAnchor="middle">THAT 🅱️</text>
            <text x="190" y="90" fill="#38bdf8" fontSize="16" fontWeight="900" textAnchor="middle">38%</text>

            {/* Center VS Lightning Badge */}
            <circle cx="140" cy="80" r="15" fill="#facc15" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
            <text x="140" y="85" fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle">VS</text>
          </svg>
        </div>
      )}

      {/* 38. RAPID FIRE QUESTIONS ANIMATION */}
      {gameEngineId === 'rapid-fire' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="rfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c2d12" />
                <stop offset="100%" stopColor="#18181b" />
              </linearGradient>
            </defs>
            <rect x="35" y="20" width="210" height="120" rx="12" fill="url(#rfGrad)" stroke="#f97316" strokeWidth="2" />

            {/* Blazing Stopwatch */}
            <g transform="translate(140, 75)">
              <circle cx="0" cy="0" r="34" fill="#1c1917" stroke="#f97316" strokeWidth="3" />
              <circle cx="0" cy="0" r="28" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 3" className="animate-spin" style={{ animationDuration: '3s' }} />
              {/* Ticking Hand */}
              <line x1="0" y1="0" x2="16" y2="-12" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
              <text x="0" y="7" fill="#ffffff" fontSize="16" fontWeight="900" textAnchor="middle">5s</text>
            </g>

            {/* Fire Flames Left & Right */}
            <text x="75" y="85" fill="#f97316" fontSize="28" className="animate-bounce">🔥</text>
            <text x="205" y="85" fill="#f97316" fontSize="28" className="animate-bounce" style={{ animationDelay: '0.3s' }}>🔥</text>
          </svg>
        </div>
      )}

      {/* 39. DUMB CHARADES ANIMATION */}
      {gameEngineId === 'dumb-charades' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="dcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#831843" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <rect x="35" y="20" width="210" height="120" rx="12" fill="url(#dcGrad)" stroke="#f43f5e" strokeWidth="2" />

            {/* Tollywood Clapperboard */}
            <g transform="translate(100, 75) rotate(-8)">
              <rect x="-35" y="-22" width="70" height="44" rx="4" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
              {/* Clap Stick with Stripes */}
              <rect x="-35" y="-30" width="70" height="10" fill="#ffffff" />
              <polygon points="-30,-30 -22,-30 -28,-20 -35,-20" fill="#000000" />
              <polygon points="-12,-30 -4,-30 -10,-20 -18,-20" fill="#000000" />
              <polygon points="6,-30 14,-30 8,-20 0,-20" fill="#000000" />
              <polygon points="24,-30 32,-30 26,-20 18,-20" fill="#000000" />
              <text x="0" y="0" fill="#facc15" fontSize="8" fontWeight="bold" textAnchor="middle">SCENE: BAAHUBALI</text>
              <text x="0" y="14" fill="#38bdf8" fontSize="7" textAnchor="middle">NO TALKING! 🤫</text>
            </g>

            {/* Acting Expressions: Comedy / Action */}
            <g transform="translate(185, 75)">
              <circle cx="0" cy="0" r="22" fill="#4c0519" stroke="#fb7185" strokeWidth="2" className="animate-pulse" />
              <text x="0" y="6" fontSize="20" textAnchor="middle">🎭</text>
            </g>
          </svg>
        </div>
      )}

      {/* 40. GUESS THE MOVIE ANIMATION */}
      {gameEngineId === 'guess-the-movie' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="gtmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#713f12" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            <rect x="35" y="20" width="210" height="120" rx="12" fill="url(#gtmGrad)" stroke="#eab308" strokeWidth="2" />

            {/* Golden 35mm Film Reel */}
            <g transform="translate(90, 80)">
              <circle cx="0" cy="0" r="30" fill="#0f172a" stroke="#eab308" strokeWidth="3" />
              <circle cx="0" cy="0" r="10" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <circle
                  key={deg}
                  cx={18 * Math.cos((deg * Math.PI) / 180)}
                  cy={18 * Math.sin((deg * Math.PI) / 180)}
                  r="4"
                  fill="#ca8a04"
                />
              ))}
            </g>

            {/* Tollywood Dialogue Bubble */}
            <g transform="translate(180, 65)">
              <rect x="-42" y="-22" width="84" height="44" rx="8" fill="#18181b" stroke="#facc15" strokeWidth="1.5" />
              <text x="0" y="-4" fill="#fde047" fontSize="8" fontWeight="bold" textAnchor="middle">“THAGGEDE LE”</text>
              <text x="0" y="10" fill="#93c5fd" fontSize="7" textAnchor="middle">🪓 🌲 🚛 ❓</text>
            </g>
            <text x="180" y="115" fill="#4ade80" fontSize="9" fontWeight="bold" textAnchor="middle">PUSHPA! ⭐</text>
          </svg>
        </div>
      )}

      {/* 41. GUESS THE SONG ANIMATION */}
      {gameEngineId === 'guess-the-song' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="gtsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#164e63" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <rect x="35" y="20" width="210" height="120" rx="12" fill="url(#gtsGrad)" stroke="#06b6d4" strokeWidth="2" />

            {/* Retro Cassette Tape */}
            <g transform="translate(100, 75)">
              <rect x="-42" y="-25" width="84" height="50" rx="6" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" />
              <circle cx="-16" cy="2" r="9" fill="#083344" stroke="#67e8f9" strokeWidth="1" />
              <circle cx="16" cy="2" r="9" fill="#083344" stroke="#67e8f9" strokeWidth="1" />
              <rect x="-10" y="-6" width="20" height="16" fill="#155e75" />
            </g>

            {/* Glowing Equalizer Bars jumping */}
            <g transform="translate(180, 80)">
              <rect x="-18" y="-12" width="5" height="24" rx="2" fill="#22d3ee" className="animate-pulse" />
              <rect x="-10" y="-22" width="5" height="34" rx="2" fill="#38bdf8" className="animate-bounce" />
              <rect x="-2" y="-8" width="5" height="20" rx="2" fill="#a855f7" />
              <rect x="6" y="-26" width="5" height="38" rx="2" fill="#ec4899" className="animate-pulse" />
              <rect x="14" y="-14" width="5" height="26" rx="2" fill="#f43f5e" />
            </g>
            <text x="180" y="118" fill="#a5f3fc" fontSize="8" fontWeight="bold" textAnchor="middle">NAATU NAATU 🎶</text>
          </svg>
        </div>
      )}

      {/* 42. GUESS THE WORD ANIMATION */}
      {gameEngineId === 'guess-the-word' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="gtwGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            <rect x="35" y="20" width="210" height="120" rx="12" fill="url(#gtwGrad)" stroke="#10b981" strokeWidth="2" />

            {/* Wordle / Hangman Style Letter Bricks */}
            {['P', 'A', 'N', 'D', 'U'].map((ch, idx) => (
              <g key={idx} transform={`translate(${65 + idx * 30}, 65)`}>
                <rect x="-12" y="-14" width="24" height="28" rx="4" fill="#047857" stroke="#34d399" strokeWidth="1.5" />
                <text x="0" y="5" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle">{ch}</text>
              </g>
            ))}

            {/* Hint Lightbulb */}
            <circle cx="140" cy="110" r="12" fill="#ca8a04" stroke="#facc15" strokeWidth="1.5" className="animate-pulse" />
            <text x="140" y="115" fontSize="12" textAnchor="middle">💡</text>
          </svg>
        </div>
      )}

      {/* 43. IMPOSTER AMONG US (WORD-BASED) ANIMATION */}
      {gameEngineId === 'imposter-word' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#dc2626_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="impGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#450a0a" />
                <stop offset="100%" stopColor="#09090b" />
              </linearGradient>
            </defs>
            <rect x="35" y="20" width="210" height="120" rx="12" fill="url(#impGrad)" stroke="#ef4444" strokeWidth="2" />

            {/* 3 Innocent Crewmates + 1 Red Imposter */}
            <g transform="translate(75, 75)">
              <rect x="-12" y="-18" width="24" height="32" rx="10" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              <rect x="-6" y="-12" width="16" height="8" rx="4" fill="#bae6fd" />
            </g>
            <g transform="translate(115, 75)">
              <rect x="-12" y="-18" width="24" height="32" rx="10" fill="#16a34a" stroke="#4ade80" strokeWidth="1.5" />
              <rect x="-6" y="-12" width="16" height="8" rx="4" fill="#bbf7d0" />
            </g>
            <g transform="translate(155, 75)">
              <rect x="-12" y="-18" width="24" height="32" rx="10" fill="#eab308" stroke="#fde047" strokeWidth="1.5" />
              <rect x="-6" y="-12" width="16" height="8" rx="4" fill="#fef08a" />
            </g>
            {/* The Red Imposter */}
            <g transform="translate(200, 70)">
              <rect x="-14" y="-20" width="28" height="36" rx="10" fill="#dc2626" stroke="#f87171" strokeWidth="2" className="animate-pulse" />
              <rect x="-7" y="-14" width="18" height="9" rx="4" fill="#18181b" stroke="#fca5a5" strokeWidth="1" />
              <text x="0" y="-24" fill="#ef4444" fontSize="12" fontWeight="900" textAnchor="middle">🔪</text>
            </g>

            <text x="140" y="125" fill="#fca5a5" fontSize="8" fontWeight="bold" textAnchor="middle">WHO HAS THE FAKE CLUE? 🤫</text>
          </svg>
        </div>
      )}

      {/* 44. MAFIA / WEREWOLF ANIMATION */}
      {gameEngineId === 'mafia' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="mafiaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#18181b" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
            </defs>
            <rect x="35" y="20" width="210" height="120" rx="12" fill="url(#mafiaGrad)" stroke="#475569" strokeWidth="2" />

            {/* Night Moon & Star Cityscape */}
            <circle cx="65" cy="50" r="16" fill="#fef08a" opacity="0.9" />
            <circle cx="70" cy="48" r="14" fill="#18181b" />
            <polygon points="50,120 70,85 90,120" fill="#0f172a" />
            <polygon points="80,120 100,75 120,120" fill="#1e293b" />

            {/* Mystery Mafia Fedora & Glowing Red Eyes */}
            <g transform="translate(180, 75)">
              {/* Hat brim */}
              <ellipse cx="0" cy="-10" rx="30" ry="7" fill="#09090b" stroke="#dc2626" strokeWidth="1.5" />
              <rect x="-18" y="-28" width="36" height="20" rx="4" fill="#18181b" stroke="#71717a" strokeWidth="1" />
              <rect x="-18" y="-14" width="36" height="4" fill="#dc2626" />
              {/* Glowing Eyes in Darkness */}
              <circle cx="-8" cy="4" r="2.5" fill="#ef4444" className="animate-pulse" />
              <circle cx="8" cy="4" r="2.5" fill="#ef4444" className="animate-pulse" />
            </g>

            <text x="140" y="125" fill="#cbd5e1" fontSize="8" fontWeight="bold" textAnchor="middle">NIGHT FALLS: CLOSE YOUR EYES</text>
          </svg>
        </div>
      )}

      {/* 45. SPYFALL ANIMATION */}
      {gameEngineId === 'spyfall' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <defs>
              <linearGradient id="spyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="100%" stopColor="#030712" />
              </linearGradient>
            </defs>
            <rect x="35" y="20" width="210" height="120" rx="12" fill="url(#spyGrad)" stroke="#10b981" strokeWidth="2" />

            {/* Radar Sweep Circle */}
            <g transform="translate(95, 75)">
              <circle cx="0" cy="0" r="30" fill="#022c22" stroke="#059669" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="20" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="0" x2="22" y2="-18" stroke="#34d399" strokeWidth="2" className="animate-spin" style={{ animationDuration: '4s' }} />
              <circle cx="12" cy="10" r="3" fill="#ef4444" className="animate-pulse" />
            </g>

            {/* Top Secret Dossier & Sunglasses */}
            <g transform="translate(180, 75)">
              <rect x="-30" y="-22" width="60" height="44" rx="4" fill="#78350f" stroke="#d97706" strokeWidth="1.5" />
              <rect x="-24" y="-16" width="48" height="32" rx="2" fill="#fef3c7" />
              {/* Red Stamp */}
              <rect x="-18" y="-6" width="36" height="14" rx="2" fill="#ef4444" opacity="0.9" />
              <text x="0" y="4" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">TOP SECRET</text>
            </g>

            <text x="140" y="128" fill="#6ee7b7" fontSize="8" fontWeight="bold" textAnchor="middle">LOCATION: RAMOJI FILM CITY 🎬</text>
          </svg>
        </div>
      )}

      {/* 39. WORD CHAIN */}
      {gameEngineId === 'word-chain' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <rect x="20" y="55" width="60" height="50" rx="10" fill="#312e81" stroke="#818cf8" strokeWidth="2" />
            <text x="50" y="86" fill="#ffffff" fontSize="16" fontWeight="900" textAnchor="middle">BAT</text>
            <path d="M 80 80 L 110 80" stroke="#f59e0b" strokeWidth="4" strokeDasharray="4 2" />
            <rect x="110" y="55" width="60" height="50" rx="10" fill="#065f46" stroke="#34d399" strokeWidth="2" />
            <text x="140" y="86" fill="#ffffff" fontSize="16" fontWeight="900" textAnchor="middle">TIGER</text>
            <path d="M 170 80 L 200 80" stroke="#f59e0b" strokeWidth="4" strokeDasharray="4 2" />
            <rect x="200" y="55" width="60" height="50" rx="10" fill="#831843" stroke="#f472b6" strokeWidth="2" />
            <text x="230" y="86" fill="#ffffff" fontSize="16" fontWeight="900" textAnchor="middle">RRR</text>
          </svg>
        </div>
      )}

      {/* 40. WORDLE */}
      {gameEngineId === 'wordle' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <g transform="translate(45, 45)">
              <rect x="0" y="0" width="34" height="34" rx="6" fill="#15803d" stroke="#22c55e" strokeWidth="1.5" />
              <text x="17" y="24" fill="#ffffff" fontSize="18" fontWeight="bold" textAnchor="middle">M</text>

              <rect x="38" y="0" width="34" height="34" rx="6" fill="#ca8a04" stroke="#eab308" strokeWidth="1.5" />
              <text x="55" y="24" fill="#ffffff" fontSize="18" fontWeight="bold" textAnchor="middle">O</text>

              <rect x="76" y="0" width="34" height="34" rx="6" fill="#334155" stroke="#475569" strokeWidth="1.5" />
              <text x="93" y="24" fill="#ffffff" fontSize="18" fontWeight="bold" textAnchor="middle">V</text>

              <rect x="114" y="0" width="34" height="34" rx="6" fill="#15803d" stroke="#22c55e" strokeWidth="1.5" />
              <text x="131" y="24" fill="#ffffff" fontSize="18" fontWeight="bold" textAnchor="middle">I</text>

              <rect x="152" y="0" width="34" height="34" rx="6" fill="#15803d" stroke="#22c55e" strokeWidth="1.5" />
              <text x="169" y="24" fill="#ffffff" fontSize="18" fontWeight="bold" textAnchor="middle">E</text>
            </g>
          </svg>
        </div>
      )}

      {/* 41. HANGMAN */}
      {gameEngineId === 'hangman' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <line x1="70" y1="130" x2="130" y2="130" stroke="#f43f5e" strokeWidth="4" />
            <line x1="100" y1="130" x2="100" y2="30" stroke="#f43f5e" strokeWidth="4" />
            <line x1="100" y1="30" x2="160" y2="30" stroke="#f43f5e" strokeWidth="4" />
            <line x1="160" y1="30" x2="160" y2="50" stroke="#fbbf24" strokeWidth="3" />
            <circle cx="160" cy="62" r="12" fill="#1e293b" stroke="#f43f5e" strokeWidth="2" />
            <text x="195" y="90" fill="#f87171" fontSize="13" fontWeight="bold">BATMAN</text>
          </svg>
        </div>
      )}

      {/* 42. WORD BUILDER */}
      {gameEngineId === 'word-builder' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <rect x="40" y="55" width="200" height="50" rx="8" fill="#78350f" stroke="#d97706" strokeWidth="2" />
            <g transform="translate(50, 60)">
              {['S','C','O','R','E'].map((letter, i) => (
                <g key={i} transform={`translate(${i * 38}, 0)`}>
                  <rect width="32" height="38" rx="4" fill="#fef3c7" stroke="#b45309" strokeWidth="1" />
                  <text x="16" y="25" fill="#451a03" fontSize="16" fontWeight="bold" textAnchor="middle">{letter}</text>
                  <text x="26" y="34" fill="#92400e" fontSize="8" fontWeight="bold">1</text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      )}

      {/* 51. SUDOKU */}
      {gameEngineId === 'sudoku' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <rect x="90" y="30" width="100" height="100" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <line x1="123" y1="30" x2="123" y2="130" stroke="#38bdf8" strokeWidth="1" />
            <line x1="156" y1="30" x2="156" y2="130" stroke="#38bdf8" strokeWidth="1" />
            <line x1="90" y1="63" x2="190" y2="63" stroke="#38bdf8" strokeWidth="1" />
            <line x1="90" y1="96" x2="190" y2="96" stroke="#38bdf8" strokeWidth="1" />
            <text x="107" y="54" fill="#38bdf8" fontSize="16" fontWeight="bold" textAnchor="middle">5</text>
            <text x="140" y="87" fill="#fbbf24" fontSize="16" fontWeight="bold" textAnchor="middle">3</text>
            <text x="173" y="120" fill="#34d399" fontSize="16" fontWeight="bold" textAnchor="middle">9</text>
          </svg>
        </div>
      )}

      {/* 52. MINESWEEPER */}
      {gameEngineId === 'minesweeper' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <g transform="translate(60, 45)">
              <rect x="0" y="0" width="45" height="45" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <text x="22" y="30" fill="#38bdf8" fontSize="20" fontWeight="bold" textAnchor="middle">1</text>
              <rect x="55" y="0" width="45" height="45" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <text x="77" y="30" fill="#f43f5e" fontSize="20" fontWeight="bold" textAnchor="middle">🚩</text>
              <rect x="110" y="0" width="45" height="45" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <text x="132" y="30" fill="#fbbf24" fontSize="20" fontWeight="bold" textAnchor="middle">💣</text>
            </g>
          </svg>
        </div>
      )}

      {/* 58. LIGHTS OUT */}
      {gameEngineId === 'lights-out' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <g transform="translate(85, 35)">
              <circle cx="20" cy="20" r="14" fill="#fbbf24" className="animate-pulse" />
              <circle cx="55" cy="20" r="14" fill="#0f172a" stroke="#475569" />
              <circle cx="90" cy="20" r="14" fill="#fbbf24" className="animate-pulse" />
              <circle cx="20" cy="55" r="14" fill="#0f172a" stroke="#475569" />
              <circle cx="55" cy="55" r="14" fill="#fbbf24" className="animate-pulse" />
              <circle cx="90" cy="55" r="14" fill="#0f172a" stroke="#475569" />
            </g>
          </svg>
        </div>
      )}

      {/* 59. MATH BATTLE */}
      {gameEngineId === 'math-battle' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <rect x="40" y="35" width="200" height="90" rx="16" fill="#1e1b4b" stroke="#ec4899" strokeWidth="2" />
            <text x="140" y="75" fill="#ffffff" fontSize="22" fontWeight="900" textAnchor="middle">17 × 8 = ?</text>
            <text x="140" y="105" fill="#34d399" fontSize="14" fontWeight="bold" textAnchor="middle">COMBO 3X ⚡</text>
          </svg>
        </div>
      )}

      {/* 62. DAILY RIDDLE */}
      {gameEngineId === 'daily-riddle' && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-h-[160px]" viewBox="0 0 280 160" fill="none">
            <rect x="40" y="35" width="200" height="90" rx="16" fill="#1c1917" stroke="#f59e0b" strokeWidth="2" />
            <text x="140" y="70" fill="#fde68a" fontSize="18" fontWeight="bold" textAnchor="middle">❓ Daily Enigma</text>
            <text x="140" y="98" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle">🔥 7-DAY STREAK</text>
          </svg>
        </div>
      )}

      {/* Fallback for other new games */}
      {!['chess','connect-four','tic-tac-toe','checkers','battleship','othello','dots-and-boxes','gomoku','memory-match','mancala','cyber-trivia','word-clash','rps-strike','hand-cricket','rpsls','nim','matchstick-puzzle','coin-toss','odd-even','higher-lower','guess-number','pallanguzhi','chowka-bara','pachisi','snakes-and-ladders','ludo','carrom','kabaddi','cricket-quiz','antakshari','name-place-animal-thing','truth-or-dare','never-have-i-ever','who-knows-me-best','most-likely-to','two-truths-and-a-lie','would-you-rather','rapid-fire','dumb-charades','guess-the-movie','guess-the-song','guess-the-word','imposter-word','mafia','spyfall','word-chain','wordle','hangman','word-builder','sudoku','minesweeper','lights-out','math-battle','daily-riddle'].includes(gameEngineId) && (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-purple-900/30 to-cyan-900/40" />
          <div className="relative text-center p-4">
            <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-xl animate-bounce">
              🎮
            </div>
            <span className="text-xs uppercase font-black tracking-widest text-white/80">Gamzyard Arena</span>
          </div>
        </div>
      )}
    </div>
  );
};
