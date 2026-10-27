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
    </div>
  );
};
