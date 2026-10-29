// client/src/data/games.ts
import { GameMetadata, GameId } from '../types';

export interface CanvaGameItem {
  id: string;
  gameEngineId: GameId;
  title: string;
  category: 'Puzzle' | 'Arcade' | 'Strategy' | 'Trivia' | 'Party' | 'Multiplayer' | 'Word';
  categories: string[];
  artClass: string;
  artSymbol: string;
  meta: string;
  quickSubtitle?: string;
  description: string;
  rules: string[];
}

export const CANVA_GAMES: CanvaGameItem[] = [
  {
    id: 'chess',
    gameEngineId: 'chess',
    title: 'Chess Master',
    category: 'Strategy',
    categories: ['Strategy', 'Multiplayer', 'Trivia'],
    artClass: 'art-chess',
    artSymbol: '♞',
    meta: '2 Players · 30s Blitz · Ranked & Bot',
    quickSubtitle: 'The ultimate strategy checkmate',
    description: 'Grandmaster standard 8x8 chess. Command your royal army of pawns, knights, bishops, rooks, queen, and king in a 30s blitz duel.',
    rules: [
      'Standard 8x8 international chess rules apply.',
      'Strict 30-second turn timer per move.',
      'Checkmate or timeout forfeit wins the match.'
    ]
  },
  {
    id: 'connect-four',
    gameEngineId: 'connect-four',
    title: 'Connect Four',
    category: 'Puzzle',
    categories: ['Puzzle', 'Arcade', 'Party', 'Multiplayer'],
    artClass: 'art-brain',
    artSymbol: '✦',
    meta: '2 Players · 30s Move · Casual & Ranked',
    quickSubtitle: 'Drop, block, and connect 4 discs',
    description: 'Gravity-powered vertical grid duel! Drop your colored discs into 7 columns and connect four in a line before your rival.',
    rules: [
      '30 seconds per move timer.',
      'Drop discs into columns to form 4-in-a-row.',
      'If opponent leaves or times out, you automatically win by forfeit.'
    ]
  },
  {
    id: 'tic-tac-toe',
    gameEngineId: 'tic-tac-toe',
    title: 'Neon Tic-Tac-Toe',
    category: 'Arcade',
    categories: ['Arcade', 'Party', 'Multiplayer', 'Puzzle'],
    artClass: 'art-pixel',
    artSymbol: '⚡',
    meta: '2 Players · Quick Match · Arcade Blitz',
    quickSubtitle: 'Fast 3x3 neon grid clash',
    description: 'World-famous neon cyber duel! Place X or O and race to complete 3 in a line within 30 seconds.',
    rules: [
      'Strict 30-second turn limit.',
      'Take turns placing symbols in empty 3x3 cells.',
      'Line up 3 across, down, or diagonal to claim victory!'
    ]
  },
  {
    id: 'checkers',
    gameEngineId: 'checkers',
    title: 'Classic Checkers',
    category: 'Strategy',
    categories: ['Strategy', 'Party', 'Multiplayer'],
    artClass: 'art-fire',
    artSymbol: '👑',
    meta: '2 Players · 30s Clock · Jump & Crown',
    quickSubtitle: 'Diagonal jumps & king promotion',
    description: 'Command your pieces forward along dark squares. Leap over enemy checkers to capture them and get crowned King!',
    rules: [
      '30-second move clock.',
      'Jump over opponent pieces diagonally to capture them.',
      'Reaching the opposite back row crowns your piece into a King 👑.'
    ]
  },
  {
    id: 'battleship',
    gameEngineId: 'battleship',
    title: 'Naval Battleship',
    category: 'Trivia',
    categories: ['Trivia', 'Strategy', 'Puzzle', 'Multiplayer'],
    artClass: 'art-logic',
    artSymbol: '⚓',
    meta: '2 Players · Fleet Radar · Tactical Duel',
    quickSubtitle: 'Radar strikes & sink enemy armada',
    description: 'Secretly deploy your 5 naval warships. Call coordinates, detect hits, and sink the entire enemy armada on the 10x10 radar grid!',
    rules: [
      '30s per radar strike.',
      'Track red explosions (💥 Hit) and blue splashes (💧 Miss).',
      'First commander to sink all 5 warships wins!'
    ]
  },
  {
    id: 'othello',
    gameEngineId: 'othello',
    title: 'Reversi Duel',
    category: 'Strategy',
    categories: ['Strategy', 'Party', 'Multiplayer'],
    artClass: 'art-othello',
    artSymbol: '☯',
    meta: '2 Players · 30s Clock · Flip & Conquer',
    quickSubtitle: 'Trap and flip opponent discs',
    description: 'The minute-to-learn, lifetime-to-master classic! Trap your opponent discs between yours to flip them. Outflank on corners to win.',
    rules: [
      'Trap opponent discs between yours horizontally, vertically, or diagonally.',
      'Trapped discs flip to your color.',
      'Player with the highest disc count at the end wins!'
    ]
  },
  {
    id: 'dots-and-boxes',
    gameEngineId: 'dots-and-boxes',
    title: 'Dots & Boxes',
    category: 'Arcade',
    categories: ['Arcade', 'Party', 'Strategy', 'Multiplayer'],
    artClass: 'art-dots',
    artSymbol: '⚄',
    meta: '2 Players · Grid Duel · Territory Rush',
    quickSubtitle: 'Connect lines & claim boxes',
    description: 'Connect dots with glowing laser lines. Complete the 4th side of any box to claim it and win a free bonus turn!',
    rules: [
      'Players alternate turns drawing lines between dots.',
      'Completing a box claims it and awards a free extra turn.',
      'Claim the most boxes on the grid to conquer the match.'
    ]
  },
  {
    id: 'gomoku',
    gameEngineId: 'gomoku',
    title: 'Gomoku Zen',
    category: 'Strategy',
    categories: ['Strategy', 'Multiplayer', 'Trivia'],
    artClass: 'art-gomoku',
    artSymbol: '⛩',
    meta: '2 Players · 30s Blitz · Five-in-a-Row',
    quickSubtitle: 'Align 5 stones to strike victory',
    description: 'The ancient art of Five-in-a-Row. Take turns placing black and white stones on the grid. First to align 5 stones wins!',
    rules: [
      'Take turns placing stones on empty intersections.',
      'First player to create an unbroken row of 5 stones (horizontal, vertical, or diagonal) wins.',
      'Strict 30-second turn limit.'
    ]
  },
  {
    id: 'memory-match',
    gameEngineId: 'memory-match',
    title: 'Cyber Pairs',
    category: 'Puzzle',
    categories: ['Puzzle', 'Party', 'Arcade', 'Multiplayer'],
    artClass: 'art-memory',
    artSymbol: '🧩',
    meta: '2 Players · Memory Clash · Bonus Turns',
    quickSubtitle: 'Flip cards & match cyber icons',
    description: 'A high-stakes cyber card-matching duel! Flip two cards per turn. Finding matching pairs scores points and grants bonus turns.',
    rules: [
      'Flip 2 cards per turn to uncover cyber icons.',
      'Finding a match scores 1 point and awards a free turn.',
      'Player with the most matches when all cards are cleared wins!'
    ]
  },
  {
    id: 'mancala',
    gameEngineId: 'mancala',
    title: 'Mancala Quest',
    category: 'Party',
    categories: ['Party', 'Strategy', 'Multiplayer'],
    artClass: 'art-mancala',
    artSymbol: '🏺',
    meta: '2 Players · Ancient Kalah · Seed Sowing',
    quickSubtitle: 'Sow gemstones & capture pits',
    description: 'The timeless gemstone strategy game! Pick up seeds from your pits and sow them counter-clockwise. Chain bonus turns and capture opponent pits!',
    rules: [
      'Pick up seeds from any pit on your side and sow them one-by-one counter-clockwise.',
      'If your last seed lands in your store, you get a free turn!',
      'If your last seed lands in an empty pit on your side, capture the opposite pit! Most seeds wins.'
    ]
  },
  {
    id: 'cyber-trivia',
    gameEngineId: 'cyber-trivia',
    title: 'Cyber Trivia',
    category: 'Trivia',
    categories: ['Trivia', 'Party', 'Multiplayer'],
    artClass: 'art-trivia',
    artSymbol: '⚡',
    meta: '2 Players · 5 Fast Rounds · Speed Bonus',
    quickSubtitle: 'Test your brain across tech & games',
    description: 'A high-voltage 5-round trivia showdown! Race against the clock answering questions across Gaming, Tech & AI, Cosmos, Pop Culture, and History.',
    rules: [
      '5 rounds of timed questions.',
      'Faster correct answers score up to +50 speed bonus.',
      'Highest points at round 5 wins!'
    ]
  },
  {
    id: 'word-clash',
    gameEngineId: 'word-clash',
    title: 'Word Clash',
    category: 'Puzzle',
    categories: ['Puzzle', 'Trivia', 'Multiplayer'],
    artClass: 'art-wordclash',
    artSymbol: '🔤',
    meta: '2 Players · 6 Attempts · Code Cracker',
    quickSubtitle: 'Crack the 5-letter secret code',
    description: 'The ultimate 5-letter word puzzle duel! Guess the hidden code in 6 attempts with live Green, Yellow, and Gray cyber feedback.',
    rules: [
      'Guess the secret 5-letter word in 6 tries.',
      '🟩 Green = exact letter. 🟨 Yellow = wrong spot. ⬛ Gray = not in word.',
      'First to solve or fewest attempts wins!'
    ]
  },
  {
    id: 'rps-strike',
    gameEngineId: 'rps-strike',
    title: 'RPS Cyber Strike',
    category: 'Arcade',
    categories: ['Arcade', 'Party', 'Multiplayer'],
    artClass: 'art-rps',
    artSymbol: '⚔️',
    meta: '2 Players · Best of 5 · Laser Weapons',
    quickSubtitle: 'Titan Rock, Quantum Paper, Laser Blades',
    description: 'Fast-action Rock-Paper-Scissors tactical clash! Lock in your weapon secretly, trigger the simultaneous holographic reveal, and reach 3 points to claim the arena!',
    rules: [
      'First to 3 points wins the match.',
      'Titan Rock crushes Blades, Quantum Paper envelops Rock, Laser Blades slice Paper.',
      '12-second round timer for quick tactical clashes.'
    ]
  },
  {
    id: 'hand-cricket',
    gameEngineId: 'hand-cricket',
    title: 'Hand Cricket',
    category: 'Party',
    categories: ['Party', 'Arcade', 'Multiplayer'],
    artClass: 'art-cricket',
    artSymbol: '🏏',
    meta: '2 Players · 2 Overs · Bat & Bowl',
    quickSubtitle: 'Throw numbers & chase the target',
    description: 'The legendary schoolroom Hand Cricket duel! Score runs by matching your batter numbers, bowl out your rival, and chase down the target score.',
    rules: [
      'Pick 1 to 6 on each ball.',
      'Same number = Wicket OUT! Different number = Batter scores runs.',
      'Chase the target score in Innings 2 to win!'
    ]
  },
  {
    id: 'rpsls',
    gameEngineId: 'rpsls',
    title: 'RPS Lizard Spock',
    category: 'Arcade',
    categories: ['Arcade', 'Party', 'Multiplayer'],
    artClass: 'art-rpsls',
    artSymbol: '🖖',
    meta: '2 Players · Best of 5 · 5-Way Weapons',
    quickSubtitle: 'Rock, Paper, Scissors, Lizard, Spock',
    description: 'The enhanced 5-way tactical battle made famous by Sheldon Cooper! Spock vaporizes Rock, Lizard poisons Spock, and Scissors decapitates Lizard in a race to 3 wins.',
    rules: [
      'First to 3 points wins.',
      'Rock crushes Scissors & Lizard; Paper covers Rock & disproves Spock; Scissors cuts Paper & decapitates Lizard.',
      'Lizard poisons Spock & eats Paper; Spock smashes Scissors & vaporizes Rock.'
    ]
  },
  {
    id: 'nim',
    gameEngineId: 'nim',
    title: 'Nim — Cyber Sticks',
    category: 'Strategy',
    categories: ['Strategy', 'Puzzle', 'Multiplayer'],
    artClass: 'art-nim',
    artSymbol: '🥢',
    meta: '2 Players · Heaps 3-5-7 · Mathematical Duel',
    quickSubtitle: 'Take sticks & seize the last one',
    description: 'The ancient mathematical strategy duel of heap reduction! Take any number of sticks from a single row. The master who seizes the final stick wins.',
    rules: [
      'Pick any number of sticks from a single row.',
      'Normal play: whoever takes the very last stick wins!',
      '30-second move timer per turn.'
    ]
  },
  {
    id: 'matchstick-puzzle',
    gameEngineId: 'matchstick-puzzle',
    title: 'Matchstick Puzzle',
    category: 'Puzzle',
    categories: ['Puzzle', 'Trivia', 'Multiplayer'],
    artClass: 'art-matchstick',
    artSymbol: '🔥',
    meta: '2 Players · 3 Brain Rounds · 1-Move Fix',
    quickSubtitle: 'Move 1 matchstick to fix the equation',
    description: 'Ignite your brain! Analyze incorrect digital equations and find the exact single matchstick relocation that restores mathematical harmony.',
    rules: [
      'Move exactly 1 matchstick to make the equation true.',
      'Race against the 25s timer for speed bonuses.',
      'Highest points across 3 puzzles wins!'
    ]
  },
  {
    id: 'coin-toss',
    gameEngineId: 'coin-toss',
    title: 'Coin Toss Challenge',
    category: 'Arcade',
    categories: ['Arcade', 'Party', 'Multiplayer'],
    artClass: 'art-cointoss',
    artSymbol: '🪙',
    meta: '2 Players · Best of 5 · 3D Physics Flip',
    quickSubtitle: 'Heads or Tails 3D prediction duel',
    description: 'Step into the cyber golden vault! Call Heads or Tails, launch the spinning 3D coin into orbit, and be the first to land 3 successful predictions.',
    rules: [
      'Pick Heads 👑 or Tails 🐉.',
      'Watch the 3D coin tumble and land in the chamber.',
      'First player to 3 correct calls wins!'
    ]
  },
  {
    id: 'odd-even',
    gameEngineId: 'odd-even',
    title: 'Odd or Even',
    category: 'Party',
    categories: ['Party', 'Arcade', 'Multiplayer'],
    artClass: 'art-oddeven',
    artSymbol: '⚖️',
    meta: '2 Players · 1-5 Fingers · Parity Showdown',
    quickSubtitle: 'Throw fingers & claim the sum',
    description: 'The fast-action finger duel! Choose your parity, throw 1 to 5 fingers simultaneously, and score whenever the combined sum matches your call.',
    rules: [
      'Call ODD or EVEN.',
      'Both players throw 1 to 5 fingers.',
      'If the sum matches your call, you score! First to 3 wins.'
    ]
  },
  {
    id: 'higher-lower',
    gameEngineId: 'higher-lower',
    title: 'Higher or Lower',
    category: 'Trivia',
    categories: ['Trivia', 'Puzzle', 'Party', 'Multiplayer'],
    artClass: 'art-higherlower',
    artSymbol: '📈',
    meta: '2 Players · 5 Card Rounds · Streak Bonus',
    quickSubtitle: 'Predict next card value & build streaks',
    description: 'The high-stakes cyber card prediction duel! Forecast whether the next card drawn will be Higher or Lower. Chain correct guesses for combo multipliers.',
    rules: [
      'Predict if the next drawn card is Higher or Lower.',
      'Ace is 1, King is 13.',
      'Consecutive correct calls earn 2x and 3x streak multipliers!'
    ]
  },
  {
    id: 'guess-number',
    gameEngineId: 'guess-number',
    title: 'Guess the Number',
    category: 'Puzzle',
    categories: ['Puzzle', 'Strategy', 'Multiplayer'],
    artClass: 'art-guessnumber',
    artSymbol: '🎯',
    meta: '2 Players · 1-100 Radar · Shrinking Bounds',
    quickSubtitle: 'Narrow down the secret number',
    description: 'A tense code-cracking battle! Take turns guessing a secret number between 1 and 100 as the bounds shrink in real-time. Guess the exact number to win.',
    rules: [
      'Take turns guessing the secret number [1 - 100].',
      'Hints narrow the valid range on every guess.',
      'The player who strikes the exact number wins!'
    ]
  },
  {
    id: 'pallanguzhi',
    gameEngineId: 'pallanguzhi',
    title: 'Pallanguzhi',
    category: 'Strategy',
    categories: ['Strategy', 'Party', 'Multiplayer'],
    artClass: 'art-pallanguzhi',
    artSymbol: '🪵',
    meta: '2 Players · 14 Wooden Pits · Cowrie Shells',
    quickSubtitle: 'Continuous sowing & cowrie capture',
    description: 'The beloved South Indian 14-pit cowrie shell game! Sow shells continuously, empty the pits, and claim your opponent shells with the Pasu capture rule.',
    rules: [
      'Sow 1 shell per pit in a continuous loop.',
      'Continuous sowing: pick up seeds from next pit and continue.',
      'When the next pit is empty, capture all shells in the pit after it (*Pasu*)!'
    ]
  },
  {
    id: 'chowka-bara',
    gameEngineId: 'chowka-bara',
    title: 'Chowka Bara',
    category: 'Strategy',
    categories: ['Strategy', 'Party', 'Multiplayer'],
    artClass: 'art-chowkabara',
    artSymbol: '🐚',
    meta: '2-4 Players · 5x5 Grid · 4 Cowries',
    quickSubtitle: 'Race pawns to the sacred center home',
    description: 'Traditional 5x5 race game of Karnataka and Andhra! Roll 4 cowrie shells, navigate the outer and inner circuits, kill enemy pawns, and reach the central safe home.',
    rules: [
      'Roll 4 cowrie shells (Chowka 4 & Ashta 8 grant bonus rolls).',
      'Pawns circle the outer perimeter before turning inward.',
      'Landing on an enemy pawn sends it back to start!'
    ]
  },
  {
    id: 'pachisi',
    gameEngineId: 'pachisi',
    title: 'Pachisi',
    category: 'Strategy',
    categories: ['Strategy', 'Party', 'Multiplayer'],
    artClass: 'art-pachisi',
    artSymbol: '👑',
    meta: '2-4 Players · 6 Royal Cowries · Cross Board',
    quickSubtitle: 'The ancient Royal Game of India',
    description: 'The legendary national board game of Indian royalty! Throw 6 cowrie shells, race your royal gotti across the cross-shaped board, and bear off into the sacred Char-Koni.',
    rules: [
      'Throw 6 cowrie shells (Pachisi 25 & Grace 10 grant bonuses).',
      'Enter gotti from center and circulate the cross perimeter.',
      'Bear off all 3 royal gotti into Char-Koni to win.'
    ]
  },
  {
    id: 'snakes-and-ladders',
    gameEngineId: 'snakes-and-ladders',
    title: 'Snakes and Ladders',
    category: 'Party',
    categories: ['Party', 'Arcade', 'Multiplayer'],
    artClass: 'art-snakesladders',
    artSymbol: '🪜',
    meta: '2-4 Players · 100 Squares · Sacred Ascent',
    quickSubtitle: 'Climb ladders & dodge treacherous snakes',
    description: 'The world-famous classic board game originating in ancient India! Roll the sacred D6 die, climb towering ladders, evade venomous snakes, and reach tile 100.',
    rules: [
      'Roll 1-6 on the die. Rolling 6 gives an extra roll!',
      'Land on ladder bases to climb ahead.',
      'Land on snake heads to slide down. Exact 100 wins!'
    ]
  },
  {
    id: 'ludo',
    gameEngineId: 'ludo',
    title: 'Ludo',
    category: 'Party',
    categories: ['Party', 'Strategy', 'Multiplayer'],
    artClass: 'art-ludo',
    artSymbol: '🎲',
    meta: '2-4 Players · 15x15 Board · 4 Colors',
    quickSubtitle: 'Race your tokens into the home triangle',
    description: 'The universal family classic! Roll a 6 to release tokens from your yard, navigate safe star squares, cut opponent tokens, and guide all pieces home.',
    rules: [
      'Roll a 6 to bring a token out from the base.',
      'Safe star squares protect tokens from being captured.',
      'Cut enemy tokens to send them to base and gain extra turns!'
    ]
  },
  {
    id: 'carrom',
    gameEngineId: 'carrom',
    title: 'Carrom 2D',
    category: 'Arcade',
    categories: ['Arcade', 'Party', 'Multiplayer'],
    artClass: 'art-carrom',
    artSymbol: '🎯',
    meta: '2-4 Players · Rosewood Board · Strike & Pocket',
    quickSubtitle: 'Flick striker, pocket coins, and cover Queen',
    description: 'Smooth 2D tabletop carrom! Adjust your striker on the baseline, pull back to set aim and power, and pocket White, Black, and the Red Queen into 4 corner pockets.',
    rules: [
      'Slide striker along baseline and drag back to shoot.',
      'White & Black coins score +10 pts. Red Queen scores +25 pts.',
      'Avoid striker fouls (-5 pts penalty). Highest score wins!'
    ]
  },
  {
    id: 'kabaddi',
    gameEngineId: 'kabaddi',
    title: 'Kabaddi Clash',
    category: 'Strategy',
    categories: ['Strategy', 'Arcade', 'Multiplayer'],
    artClass: 'art-kabaddi',
    artSymbol: '🤼',
    meta: '2 Players · Pro Mat · Bonus & Super Raid',
    quickSubtitle: 'Raid the mat, chant Kabaddi & super tackle',
    description: 'The high-octane Pro Kabaddi battle! Select raider attacks (Hand Touch, Dubki, Frog Jump) or defender formations (Chain Tackle, Ankle Grip, Dash). Cross the bonus line and escape!',
    rules: [
      'Take turns as Raider and Defenders on the authentic mat.',
      'Raiders choose vector and move (Dubki, Toe Touch, Bonus Line).',
      'Defenders deploy Chain Hold, Ankle Grip, or Super Tackle!'
    ]
  },
  {
    id: 'cricket-quiz',
    gameEngineId: 'cricket-quiz',
    title: 'Indian Cricket Quiz',
    category: 'Trivia',
    categories: ['Trivia', 'Party', 'Multiplayer'],
    artClass: 'art-cricketquiz',
    artSymbol: '🏏',
    meta: '2 Players · 10 Overs Chase · Sixes & Wickets',
    quickSubtitle: 'Smash sixes, chase totals & test cricket lore',
    description: 'The electrifying stadium cricket quiz! Fast answers smash 6s & 4s into the Wankhede crowd, but wrong answers bring devastating wickets. Chase down the target to win!',
    rules: [
      'Answer within 5s for a 6, within 10s for a 4.',
      'Wrong answers or timeouts result in wickets lost.',
      'Highest total or successful target chase wins!'
    ]
  },
  {
    id: 'antakshari',
    gameEngineId: 'antakshari',
    title: 'Antakshari',
    category: 'Party',
    categories: ['Party', 'Trivia', 'Multiplayer'],
    artClass: 'art-antakshari',
    artSymbol: '🎤',
    meta: '2-4 Players · Bollywood Classics · Musical Duel',
    quickSubtitle: 'Baithe baithe kya karein... Shuru karo Antakshari!',
    description: 'The legendary Indian Bollywood musical parlor game! Sing iconic Bollywood songs starting with the designated Hindi letter, pass the ending letter to opponents, and survive with your 3 hearts!',
    rules: [
      'Sing or select a Bollywood song starting with the given letter within 25s.',
      'The song ending letter becomes the next player required starting letter.',
      'Survive with your hearts or score highest to become champion!'
    ]
  },
  {
    id: 'name-place-animal-thing',
    gameEngineId: 'name-place-animal-thing',
    title: 'Name, Place, Animal, Thing',
    category: 'Party',
    categories: ['Party', 'Trivia', 'Multiplayer'],
    artClass: 'art-npat',
    artSymbol: '📝',
    meta: '2-4 Players · 3 Rounds · Emergency STOP!',
    quickSubtitle: 'Race to fill all categories and call STOP!',
    description: 'The beloved Indian schoolroom classic! Spin the alphabet wheel, race to write Name, Place, Animal, and Thing, and slam the glowing STOP button to start the 10-second countdown!',
    rules: [
      'All words must begin with the round selected alphabet letter.',
      'Fill all 4 fields to activate the emergency STOP button.',
      'Unique entries score 10 pts, shared entries score 5 pts, blank scores 0.'
    ]
  },
  {
    id: 'truth-or-dare',
    gameEngineId: 'truth-or-dare',
    title: 'Truth or Dare',
    category: 'Party',
    categories: ['Party', 'Social', 'Multiplayer'],
    artClass: 'art-truthordare',
    artSymbol: '🍾',
    meta: '2-8 Players · Spinning Bottle · Tollywood Cues',
    quickSubtitle: 'Spin the bottle, reveal truths & bold dares',
    description: 'The iconic party classic with a Tollywood twist! Spin the 3D bottle in the center, pick Truth or Dare, and act out hilarious challenges from Telugu cinema and everyday life.',
    rules: [
      'Spin the bottle to randomly pick a player in the group.',
      'Chosen player selects TRUTH or DARE.',
      'Complete the challenge to score points or chicken out!'
    ]
  },
  {
    id: 'never-have-i-ever',
    gameEngineId: 'never-have-i-ever',
    title: 'Never Have I Ever',
    category: 'Party',
    categories: ['Party', 'Social', 'Multiplayer'],
    artClass: 'art-neverhaveiever',
    artSymbol: '🖐️',
    meta: '2-8 Players · 5 Fingers Mode · Spicy & Cinema',
    quickSubtitle: 'Put a finger down if you have done it!',
    description: 'The hilarious group confession party game! Statements reveal wild experiences, Telugu cinema habits, and college memories. Put a finger down if you have done it!',
    rules: [
      'Read the statement aloud to all players.',
      'Click "I Have Done It" to lower a finger, or "Never In My Life" to stay safe.',
      'The player with the most fingers standing at the end wins!'
    ]
  },
  {
    id: 'who-knows-me-best',
    gameEngineId: 'who-knows-me-best',
    title: 'Who Knows Me Best?',
    category: 'Party',
    categories: ['Party', 'Trivia', 'Multiplayer'],
    artClass: 'art-whoknowsme',
    artSymbol: '👑',
    meta: '2-8 Players · VIP Secrets · Friend Guess',
    quickSubtitle: 'VIP locks in the secret, friends guess it',
    description: 'Find out which friend truly knows you inside out! Each round, a VIP secretly answers a quirky lifestyle or Tollywood cinema preference, and friends guess their choice.',
    rules: [
      'The designated VIP secretly locks in their authentic answer.',
      'All other players guess what the VIP picked.',
      'Correct guesses earn +10 points on the leaderboard!'
    ]
  },
  {
    id: 'most-likely-to',
    gameEngineId: 'most-likely-to',
    title: 'Most Likely To',
    category: 'Party',
    categories: ['Party', 'Social', 'Multiplayer'],
    artClass: 'art-mostlikelyto',
    artSymbol: '👉',
    meta: '2-8 Players · Group Accusations · Live Votes',
    quickSubtitle: 'Vote on who is most chaotic or dramatic',
    description: 'The dramatic finger-pointing party showdown! Who in your group is most likely to act like a mass hero, start a silly argument, or get stranded at a movie theater? Vote and find out!',
    rules: [
      'A provocative or funny statement appears on screen.',
      'Everyone votes for the person in the group who best fits the description.',
      'Live vote tally reveals the group consensus!'
    ]
  },
  {
    id: 'two-truths-and-a-lie',
    gameEngineId: 'two-truths-and-a-lie',
    title: 'Two Truths & a Lie',
    category: 'Trivia',
    categories: ['Trivia', 'Party', 'Multiplayer'],
    artClass: 'art-twotruths',
    artSymbol: '🤥',
    meta: '2-8 Players · Tollywood Trivia · Detect the Lie',
    quickSubtitle: 'Spot the clever lie hidden in real cinema facts',
    description: 'The ultimate bluffing game! Three statements about Tollywood legends, Oscar glory, and blockbuster films are shown — two are 100% genuine, but one is a deceptive LIE. Spot it to score!',
    rules: [
      'Read 3 statements carefully.',
      'Detect and click the single statement that is a fabricated LIE.',
      'Reveal the truth behind the fact to earn +10 points!'
    ]
  },
  {
    id: 'would-you-rather',
    gameEngineId: 'would-you-rather',
    title: 'Would You Rather?',
    category: 'Party',
    categories: ['Party', 'Social', 'Multiplayer'],
    artClass: 'art-wouldyourather',
    artSymbol: '⚖️',
    meta: '2-8 Players · Impossible Dilemmas · Majority Vote',
    quickSubtitle: 'Choose between two wild Tollywood dilemmas',
    description: 'Tough, hilarious, and impossible dilemmas! Star in a 7-year Rajamouli epic or 10 quick commercial comedies? Eat free biryani for life or get free VIP movie tickets? Choose and match the majority!',
    rules: [
      'Pick Option A or Option B on the hot dilemma card.',
      'Live community percentages reveal where everyone stands.',
      'Match the majority choice to score bonus points!'
    ]
  },
  {
    id: 'rapid-fire',
    gameEngineId: 'rapid-fire',
    title: 'Rapid Fire Hot Seat',
    category: 'Party',
    categories: ['Party', 'Trivia', 'Multiplayer'],
    artClass: 'art-rapidfire',
    artSymbol: '⚡',
    meta: '2-8 Players · 5s Per Shot · Streak Multiplier',
    quickSubtitle: 'Don\'t think, just react under 5 seconds!',
    description: 'High-voltage talk show hot seat! 10 rapid-fire questions popping up with only 5 seconds on the clock. Choose between iconic heroes, movies, food, and directors without hesitating!',
    rules: [
      'React and pick your choice before the 5-second timer runs out.',
      'Fast answers under 2 seconds score speed bonuses.',
      'Chain consecutive fast answers to build massive streaks!'
    ]
  },
  {
    id: 'dumb-charades',
    gameEngineId: 'dumb-charades',
    title: 'Dumb Charades',
    category: 'Party',
    categories: ['Party', 'Social', 'Multiplayer'],
    artClass: 'art-dumbcharades',
    artSymbol: '🎭',
    meta: '2-8 Players · Tollywood Blockbusters · Live Acting',
    quickSubtitle: 'Act out signature hero gestures & guess movies',
    description: 'The king of all Indian party games! Act out Baahubali, Pushpa, Eega, and RRR using gestures, word counts, and signature hero cues while your friends race against the 60s clock to guess.',
    rules: [
      'Actor receives a secret Tollywood movie with acting tips.',
      'No talking allowed — only gestures and body language!',
      'Guessers submit answers; successful guesses reward both actor and guesser.'
    ]
  },
  {
    id: 'guess-the-movie',
    gameEngineId: 'guess-the-movie',
    title: 'Guess the Movie',
    category: 'Trivia',
    categories: ['Trivia', 'Party', 'Multiplayer'],
    artClass: 'art-guessthemovie',
    artSymbol: '🎬',
    meta: '2-8 Players · Emojis & Dialogues · Tollywood Classics',
    quickSubtitle: 'Crack emoji riddles & legendary Telugu mass dialogues',
    description: 'The ultimate Tollywood movie quiz! Decode emoji clues, recite immortal mass dialogues, and solve plot riddles for blockbuster hits from Pokiri and Athadu to Kalki and Pushpa.',
    rules: [
      'Inspect the emoji sequence, iconic dialogue, and plot teaser.',
      'Select the correct movie title from the 4 options.',
      'Fast correct guesses earn maximum points on the leaderboard.'
    ]
  },
  {
    id: 'guess-the-song',
    gameEngineId: 'guess-the-song',
    title: 'Guess the Song',
    category: 'Party',
    categories: ['Party', 'Trivia', 'Multiplayer'],
    artClass: 'art-guessthesong',
    artSymbol: '🎶',
    meta: '2-8 Players · 8-Bit Melody Synth · Tollywood Hits',
    quickSubtitle: 'Listen to synth tunes, fill lyrics & guess tracks',
    description: 'Tollywood music showdown! Listen to live synthesizer melody notes of chartbusters like Samajavaragamana, Naatu Naatu, and Butta Bomma, solve the missing lyrics, and guess the track!',
    rules: [
      'Press Play to hear the retro synth melody tune.',
      'Read the fill-in-the-blank lyric clue and composer hint.',
      'Identify the song to score points and crown the music master!'
    ]
  },
  {
    id: 'guess-the-word',
    gameEngineId: 'guess-the-word',
    title: 'Guess the Word',
    category: 'Puzzle',
    categories: ['Puzzle', 'Trivia', 'Multiplayer'],
    artClass: 'art-guesstheword',
    artSymbol: '🔤',
    meta: '2-8 Players · Letter Tiles · Clues & Categories',
    quickSubtitle: 'Uncover the secret Telugu & heritage words',
    description: 'Classic word deduction with an Indian twist! Uncover secret words like Biryani, Baahubali, and Charminar by guessing letters on the keyboard before your 6 attempts expire.',
    rules: [
      'Click letters to reveal matching tiles in the hidden word.',
      'Wrong guesses cost one heart (max 6 wrong guesses).',
      'Solve the entire word before running out of attempts!'
    ]
  },
  {
    id: 'imposter-word',
    gameEngineId: 'imposter-word',
    title: 'Imposter Among Us',
    category: 'Party',
    categories: ['Party', 'Social', 'Multiplayer'],
    artClass: 'art-imposter',
    artSymbol: '🕵️',
    meta: '3-8 Players · Word Clash · Catch the Imposter',
    quickSubtitle: 'Give subtle clues and expose the hidden fake!',
    description: 'High-stakes social deduction! Everyone gets a secret word (e.g. Hyderabadi Biryani), but the Imposter gets a slight variation (Veg Pulav). Share 1-word clues and vote out the imposter!',
    rules: [
      'Everyone checks their secret card; one player is the hidden Imposter.',
      'Take turns giving 1-word clues to prove you know the civilian word.',
      'Debate and vote to eliminate the Imposter before they blend in!'
    ]
  },
  {
    id: 'mafia',
    gameEngineId: 'mafia',
    title: 'Mafia / Werewolf',
    category: 'Strategy',
    categories: ['Strategy', 'Party', 'Social'],
    artClass: 'art-mafia',
    artSymbol: '🌙',
    meta: '4-8 Players · Day & Night Phases · Detective & Doctor',
    quickSubtitle: 'Mafia strikes at night, town executes by day',
    description: 'The legendary deception game! In the dark of the night, the Mafia strikes while the Doctor saves and the Detective investigates. By day, the town gathers to vote and execute suspects!',
    rules: [
      'Secret roles: Mafia, Detective, Doctor, and Citizens.',
      'Night phase: Mafia picks a victim, Doctor heals, Detective investigates.',
      'Day phase: Discussion and town hall vote to lynch the Mafia!'
    ]
  },
  {
    id: 'spyfall',
    gameEngineId: 'spyfall',
    title: 'Spyfall',
    category: 'Strategy',
    categories: ['Strategy', 'Party', 'Social'],
    artClass: 'art-spyfall',
    artSymbol: '📍',
    meta: '3-8 Players · Telugu Landmarks · Unmask the Spy',
    quickSubtitle: 'Everyone knows the location except the secret Spy!',
    description: 'Bluffing and interrogation at iconic Telugu landmarks! Everyone knows the location (Ramoji Film City, Golconda, Tirupati) except the Spy. Ask questions, blend in, and unmask the infiltrator!',
    rules: [
      'All players receive the secret location and a role, except the Spy.',
      'Players ask each other subtle questions about their surroundings.',
      'Spy tries to deduce the location while players try to unmask the Spy!'
    ]
  },
  {
    id: 'word-chain',
    gameEngineId: 'word-chain',
    title: 'Word Chain',
    category: 'Word',
    categories: ['Word', 'Party', 'Multiplayer'],
    artClass: 'art-wordchain',
    artSymbol: '🔗',
    meta: '2-8 Players · 15s Blitz · Last Letter Link',
    quickSubtitle: 'Link each word using the last letter of the previous word',
    description: 'Fast-paced vocabulary showdown! Start with a word and race against the 15-second clock to enter a new word starting with the previous word\'s final letter.',
    rules: [
      'Enter a valid dictionary word starting with the ending letter of the previous word.',
      'Beat the 15-second timer before turn passes.',
      'No repeat words allowed! Last player standing wins.'
    ]
  },
  {
    id: 'wordle',
    gameEngineId: 'wordle',
    title: 'Wordle Guess',
    category: 'Word',
    categories: ['Word', 'Puzzle', 'Multiplayer'],
    artClass: 'art-wordle',
    artSymbol: '🟩',
    meta: '1-8 Players · 6 Attempts · Color Clues',
    quickSubtitle: 'Guess the secret 5-letter cinema & pop-culture word',
    description: 'The global sensation! Guess the secret 5-letter word in 6 attempts with green, yellow, and gray feedback.',
    rules: [
      'Green indicates correct letter in the right spot.',
      'Yellow indicates correct letter in wrong position.',
      'Gray indicates letter is not present in the word.'
    ]
  },
  {
    id: 'hangman',
    gameEngineId: 'hangman',
    title: 'Hangman Strike',
    category: 'Word',
    categories: ['Word', 'Classic', 'Multiplayer'],
    artClass: 'art-hangman',
    artSymbol: '🪢',
    meta: '1-8 Players · DC & Cinema Themes · 6 Strikes',
    quickSubtitle: 'Deduce the superhero or movie title before gallows completes',
    description: 'Classic hangman with DC superheroes, Marvel epics, and Tollywood blockbusters. Guess letter by letter before your strikes run out!',
    rules: [
      'Select letters on the virtual keyboard to reveal matching tiles.',
      'Each wrong letter adds a part to the gallows (6 strikes max).',
      'Solve the full title to win!'
    ]
  },
  {
    id: 'word-builder',
    gameEngineId: 'word-builder',
    title: 'Word Builder',
    category: 'Word',
    categories: ['Word', 'Puzzle', 'Board Game'],
    artClass: 'art-wordbuilder',
    artSymbol: '🔠',
    meta: '1-8 Players · Scrabble Rack · High-Value Tiles',
    quickSubtitle: 'Form highest-scoring words from your 7-letter rack',
    description: 'Scrabble-style tile building! Construct high-scoring English words from your 7 randomized letter tiles with premium letter values.',
    rules: [
      'Click tiles from your rack to construct words on the board.',
      'High-value consonants (Q, Z, X, J) multiply your points.',
      'Score maximum total points in 60 seconds!'
    ]
  },
  {
    id: 'anagrams',
    gameEngineId: 'anagrams',
    title: 'Anagrams Frenzy',
    category: 'Word',
    categories: ['Word', 'Puzzle', 'Multiplayer'],
    artClass: 'art-anagrams',
    artSymbol: '🔀',
    meta: '1-8 Players · 60s Blitz · Sub-word Hunt',
    quickSubtitle: 'Find as many hidden words as you can from the pool',
    description: 'Frantic word scramble! Uncover as many 3, 4, 5, and 6-letter valid English words as possible before the 60-second timer runs out.',
    rules: [
      'Form words using only letters from the active scrambled pool.',
      'Longer words earn massive bonus points and combos.',
      'Rival with bot or friends for highest word tally!'
    ]
  },
  {
    id: 'unscramble',
    gameEngineId: 'unscramble',
    title: 'Unscramble the Word',
    category: 'Word',
    categories: ['Word', 'Puzzle', 'Trivia'],
    artClass: 'art-unscramble',
    artSymbol: '🧩',
    meta: '1-8 Players · Cinema & Superhero Words · Multi-Round',
    quickSubtitle: 'Reorder scrambled letters to uncover the mystery word',
    description: 'Jumbled letters puzzle! Click and swap letter tiles to solve movie names, heroes, and cultural icons across rounds.',
    rules: [
      'Click letter tiles in correct sequence to form the target word.',
      'Use hints if you get stuck on a difficult anagram.',
      'Clear all rounds with fewest mistakes to top the leaderboard!'
    ]
  },
  {
    id: 'last-letter',
    gameEngineId: 'last-letter',
    title: 'Last Letter Challenge',
    category: 'Word',
    categories: ['Word', 'Party', 'Multiplayer'],
    artClass: 'art-lastletter',
    artSymbol: '🔤',
    meta: '2-8 Players · 10s Rapid Duel · 3 Lives',
    quickSubtitle: 'Fast blitz word chain where hesitate means strike',
    description: 'High-octane duel! Every player has only 10 seconds to respond with a word starting with the previous word’s final letter. 3 strikes and you are out!',
    rules: [
      'Type word starting with the last letter within 10 seconds.',
      'Losing round costs 1 heart (3 lives total).',
      'Outlast all rivals to claim victory!'
    ]
  },
  {
    id: 'alphabet-categories',
    gameEngineId: 'alphabet-categories',
    title: 'Alphabet Categories',
    category: 'Party',
    categories: ['Party', 'Word', 'Multiplayer'],
    artClass: 'art-categories',
    artSymbol: '📋',
    meta: '2-8 Players · Scattergories · Slam STOP',
    quickSubtitle: 'Fill 5 categories starting with the lucky rolled letter',
    description: 'The beloved party game! Roll a random alphabet letter and quickly fill Name, Movie, Superhero, City, and Food. Slam STOP when done!',
    rules: [
      'All 5 answers must start with the given round letter.',
      'First player to complete all 5 slams STOP, giving others 10s.',
      'Unique valid answers earn 10 points each!'
    ]
  },
  {
    id: 'forbidden-word',
    gameEngineId: 'forbidden-word',
    title: 'Forbidden Word (Taboo)',
    category: 'Party',
    categories: ['Party', 'Word', 'Social'],
    artClass: 'art-forbidden',
    artSymbol: '🚫',
    meta: '2-8 Players · Taboo Cards · 60s Timer',
    quickSubtitle: 'Describe the secret word without uttering the 4 forbidden words',
    description: 'Ultimate communication party game! Describe Batman, Baahubali, or Biryani without saying the 4 obvious forbidden keywords on the card!',
    rules: [
      'Describer explains the secret word to their team or room.',
      'Do NOT say the target word or any of the 4 forbidden buzzwords.',
      'Score 1 point for every successful guess in 60s!'
    ]
  },
  {
    id: 'rhyme-battle',
    gameEngineId: 'rhyme-battle',
    title: 'Rhyme Battle',
    category: 'Word',
    categories: ['Word', 'Party', 'Arcade'],
    artClass: 'art-rhymebattle',
    artSymbol: '🎤',
    meta: '2-8 Players · Rap & Rhyme · 12s Countdown',
    quickSubtitle: 'Spit matching rhymes before the beat drops',
    description: 'Freestyle word rap! A root word is dropped — players take turns submitting matching rhyming words before the 12-second clock expires.',
    rules: [
      'Enter a real English word that rhymes with the prompt word.',
      'Beat the 12-second rap timer.',
      'No repeats! Bot and multiplayer rivals compete for rap king!'
    ]
  },
  {
    id: 'sentence-builder',
    gameEngineId: 'sentence-builder',
    title: 'Sentence Builder',
    category: 'Party',
    categories: ['Party', 'Word', 'Social'],
    artClass: 'art-sentence',
    artSymbol: '✍️',
    meta: '2-8 Players · One Word at a Time · Hilarious Stories',
    quickSubtitle: 'Co-op storytelling adding only one word per turn',
    description: 'Hilarious collaborative storytelling! Each player contributes exactly ONE word on their turn to weave epic, comical cinema adventures together.',
    rules: [
      'Add exactly one grammatically sensible word on your turn.',
      'Cooperate to create hilarious Tollywood and superhero plotlines.',
      'End sentences with punctuation to score bonus creativity points!'
    ]
  },
  {
    id: 'emoji-movie-guess',
    gameEngineId: 'emoji-movie-guess',
    title: 'Emoji Movie Guess',
    category: 'Party',
    categories: ['Party', 'Trivia', 'Multiplayer'],
    artClass: 'art-emojimovie',
    artSymbol: '🎬',
    meta: '2-8 Players · DC, Marvel & Tollywood · 4 Options',
    quickSubtitle: 'Decipher the movie title hidden in emoji clues',
    description: 'Pop-culture visual deduction! Guess famous films like RRR (🌊🔥🐅), The Dark Knight (🦇🃏🌃), and Pushpa (🪓🌳🔴) from emoji sequences.',
    rules: [
      'Inspect the emoji clue sequence closely.',
      'Select the correct movie title among 4 choices.',
      'Streak bonuses awarded for rapid correct answers!'
    ]
  },
  {
    id: 'sudoku',
    gameEngineId: 'sudoku',
    title: 'Sudoku Master',
    category: 'Puzzle',
    categories: ['Puzzle', 'Classic', 'Strategy'],
    artClass: 'art-sudoku',
    artSymbol: '🔢',
    meta: '1 Player · 9x9 Grid · 3 Strikes Rule',
    quickSubtitle: 'Fill 1-9 in every row, column, and 3x3 block',
    description: 'The world\'s most popular numerical logic puzzle! Fill the 9x9 grid so every row, column, and 3x3 block contains digits 1 to 9 without repetition.',
    rules: [
      'Click an empty cell and select a number from 1 to 9.',
      'No duplicate numbers in any row, column, or 3x3 box.',
      '3 mistake strikes allowed before game over!'
    ]
  },
  {
    id: 'minesweeper',
    gameEngineId: 'minesweeper',
    title: 'Minesweeper Retro',
    category: 'Puzzle',
    categories: ['Puzzle', 'Classic', 'Arcade'],
    artClass: 'art-minesweeper',
    artSymbol: '💣',
    meta: '1 Player · 9x9 Grid · 10 Hidden Mines',
    quickSubtitle: 'Uncover safe tiles and flag hidden landmines',
    description: 'Classic desktop retro puzzle! Dig up numbers revealing adjacent mine counts, place safety flags, and clear the entire grid unharmed.',
    rules: [
      'Left click to uncover cell; first click is guaranteed safe.',
      'Toggle Flag mode to mark suspected mine locations.',
      'Uncover all 71 safe tiles to win!'
    ]
  },
  {
    id: 'memory-match',
    gameEngineId: 'memory-match',
    title: 'Memory Card Match',
    category: 'Puzzle',
    categories: ['Puzzle', 'Classic', 'Party'],
    artClass: 'art-memorymatch',
    artSymbol: '🃏',
    meta: '1-4 Players · 4x4 Grid · 8 Hero Pairs',
    quickSubtitle: 'Flip cards and match twin cinema & hero symbols',
    description: 'Visual memory workout! Flip cards 2 at a time to uncover matching pairs of superheroes, Tollywood stars, and golden artifacts.',
    rules: [
      'Flip two cards per turn to inspect symbols.',
      'Matching cards remain open and award a point.',
      'Collect the most pairs to win!'
    ]
  },
  {
    id: 'simon-says',
    gameEngineId: 'simon-says',
    title: 'Simon Says Sequence',
    category: 'Puzzle',
    categories: ['Puzzle', 'Arcade', 'Classic'],
    artClass: 'art-simonsays',
    artSymbol: '🎵',
    meta: '1 Player · Audio Tones · Infinite Sequence',
    quickSubtitle: 'Watch the glowing lights, listen to tones, and repeat',
    description: 'Audiovisual sequence memory! 4 vibrant neon quadrants light up and produce synthesizer tones. Remember and repeat the ever-growing sequence!',
    rules: [
      'Observe the sequence of flashing colors and audio notes.',
      'Repeat the exact sequence in identical order.',
      'Each cleared round adds one more step to the chain!'
    ]
  },
  {
    id: 'mastermind',
    gameEngineId: 'mastermind',
    title: 'Mastermind Codebreaker',
    category: 'Puzzle',
    categories: ['Puzzle', 'Strategy', 'Classic'],
    artClass: 'art-mastermind',
    artSymbol: '🔴',
    meta: '1 Player · 4 Secret Pegs · 10 Attempts',
    quickSubtitle: 'Crack the hidden 4-color secret code with clue pegs',
    description: 'Legendary board game of codebreaking! Deduce the AI\'s secret 4-color combination using black (exact match) and white (wrong position) feedback pegs.',
    rules: [
      'Place 4 colored pegs on the active row and click Submit.',
      'Black peg = correct color in exact position.',
      'White peg = correct color in wrong position. Crack it within 10 turns!'
    ]
  },
  {
    id: 'bulls-and-cows',
    gameEngineId: 'bulls-and-cows',
    title: 'Bulls and Cows',
    category: 'Puzzle',
    categories: ['Puzzle', 'Strategy', 'Classic'],
    artClass: 'art-bullscows',
    artSymbol: '🐂',
    meta: '1 Player · 4 Unique Digits · 8 Attempts',
    quickSubtitle: 'Guess the secret 4-digit code using Bulls & Cows clues',
    description: 'The classic numerical deduction game! Guess the secret 4 unique digits. A Bull means right digit in right spot; a Cow means right digit in wrong spot.',
    rules: [
      'Enter a 4-digit guess with no repeated digits.',
      'Bull = Correct digit in correct position.',
      'Cow = Correct digit in wrong position. Get 4 Bulls to win!'
    ]
  },
  {
    id: 'nonogram',
    gameEngineId: 'nonogram',
    title: 'Nonogram Picross',
    category: 'Puzzle',
    categories: ['Puzzle', 'Classic', 'Strategy'],
    artClass: 'art-nonogram',
    artSymbol: '🖼️',
    meta: '1 Player · 5x5 Picture Grid · Numerical Clues',
    quickSubtitle: 'Paint cells according to numbers to reveal pixel art',
    description: 'Japanese picture logic puzzle! Use row and column numbers to deduce which cells to fill and which to cross out, revealing hidden pixel art.',
    rules: [
      'Numbers denote consecutive groups of filled cells in each row/column.',
      'Toggle Fill mode to color cells, Cross mode to mark empty spaces.',
      'Complete the picture to reveal the hidden sword!'
    ]
  },
  {
    id: 'lights-out',
    gameEngineId: 'lights-out',
    title: 'Lights Out',
    category: 'Puzzle',
    categories: ['Puzzle', 'Classic', 'Arcade'],
    artClass: 'art-lightsout',
    artSymbol: '💡',
    meta: '1 Player · 5x5 Circuit Grid · Minimal Moves',
    quickSubtitle: 'Toggle glowing cells to turn every light completely off',
    description: 'Addictive cyberpunk puzzle! Clicking any light toggles itself and its 4 adjacent neighbors. Solve the matrix in minimum moves.',
    rules: [
      'Clicking a cell flips it and its orthogonal neighbors (up, down, left, right).',
      'The objective is turning off every illuminated light on the grid.',
      'Multiple difficulties available from Casual to Hardcore!'
    ]
  },
  {
    id: 'math-battle',
    gameEngineId: 'math-battle',
    title: 'Math Battle Arena',
    category: 'Arcade',
    categories: ['Arcade', 'Puzzle', 'Multiplayer'],
    artClass: 'art-mathbattle',
    artSymbol: '⚡',
    meta: '1-4 Players · Rapid Arithmetic · 7s Timer',
    quickSubtitle: 'Lightning-fast mental math duel with streak combos',
    description: 'Rapid-fire mental arithmetic showdown! Solve addition, subtraction, and multiplication problems in under 7 seconds to stack massive combo multipliers.',
    rules: [
      'Pick the correct answer among 4 choices before 7s expires.',
      'Fast correct answers grant time bonuses and streak multipliers.',
      'Outscore the bot or room rivals across 10 intense rounds!'
    ]
  },
  {
    id: 'logic-grid',
    gameEngineId: 'logic-grid',
    title: 'Logic Grid Puzzle',
    category: 'Puzzle',
    categories: ['Puzzle', 'Strategy', 'Classic'],
    artClass: 'art-logicgrid',
    artSymbol: '🧠',
    meta: '1 Player · Einstein Deduction · Cinema & Superheroes',
    quickSubtitle: 'Cross-reference clues in a matrix to solve the mystery',
    description: 'Einstein-style deduction puzzle! Match heroes to weapons and home cities by reading clues and systematically eliminating impossible pairings.',
    rules: [
      'Read clues and click cells to mark X (impossible) or O (confirmed).',
      'Cross out clues as you deduce relationships.',
      'Click Verify Deduction once all pairings are discovered!'
    ]
  },
  {
    id: 'pattern-recognition',
    gameEngineId: 'pattern-recognition',
    title: 'Pattern Recognition IQ',
    category: 'Puzzle',
    categories: ['Puzzle', 'Arcade', 'Trivia'],
    artClass: 'art-pattern',
    artSymbol: '🕸️',
    meta: '1 Player · Sequence & Geometry · IQ Test',
    quickSubtitle: 'Identify the underlying rule and pick the missing piece',
    description: 'Inductive reasoning and IQ workout! Analyze numerical, geometric, and chromatic progressions to pick the missing symbol marked by ?.',
    rules: [
      'Spot the math or visual pattern in the sequence.',
      'Select the correct missing piece from 4 choices within 12s.',
      'Clear all 8 progressive puzzles to claim Master Solver rank!'
    ]
  },
  {
    id: 'daily-riddle',
    gameEngineId: 'daily-riddle',
    title: 'Daily Riddle Challenge',
    category: 'Puzzle',
    categories: ['Puzzle', 'Trivia', 'Word'],
    artClass: 'art-dailyriddle',
    artSymbol: '✨',
    meta: '1 Player · Daily Streak · Letter Reveals & Hints',
    quickSubtitle: 'Crack clever brain teasers, riddles & pop-culture enigmas',
    description: 'Mindbending daily riddles and lateral thinking enigmas! Unlock progressive clues, reveal letter tiles, and build your daily streak.',
    rules: [
      'Read the cryptic riddle carefully and type your answer.',
      'Unlock up to 2 helpful hints or reveal random letters.',
      'Solve daily to maintain your fire streak!'
    ]
  }
];

// Compatibility with existing game engine definitions
export const GAMES: GameMetadata[] = [
  {
    id: 'chess',
    title: 'Chess Master',
    tagline: 'The Ultimate Strategy Battlefield',
    category: 'Strategy',
    difficulty: 'Hardcore',
    players: '1 - 2 Players',
    avgTime: '10-25 min',
    iconName: 'Crown',
    gradient: 'from-amber-500/20 to-transparent',
    accentColor: '#b58aff',
    featured: true,
    description: 'Command your royal army of pawns, knights, rooks, bishops, queen, and king. Outwit your rival with tactical checkmate!',
    rules: [
      'Standard 8x8 international chess rules apply.',
      'Strict 30-second turn timer per move.',
      'Checkmate or timeout forfeit wins the match.'
    ]
  },
  {
    id: 'connect-four',
    title: 'Connect Four',
    tagline: 'Drop, Block, and Connect 4 Discs',
    category: 'Tactical',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '3-8 min',
    iconName: 'CircleDot',
    gradient: 'from-cyan-500/20 to-transparent',
    accentColor: '#5be9ed',
    featured: true,
    description: 'Gravity-powered grid duel! Drop your colored discs into the 7 vertical columns and connect four in a row.',
    rules: [
      'Players alternate turns dropping discs with 30s move timers.',
      'Form a line of four horizontally, vertically, or diagonally to win.',
      'If opponent leaves, you automatically win by forfeit.'
    ]
  },
  {
    id: 'tic-tac-toe',
    title: 'Neon Tic-Tac-Toe',
    tagline: 'Fast-Paced 3x3 Grid Clash',
    category: 'Quick',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '1-3 min',
    iconName: 'Hash',
    gradient: 'from-purple-500/20 to-transparent',
    accentColor: '#a77bff',
    featured: false,
    description: 'World-famous neon cyber duel! Place X or O and race to complete 3 in a line within 30 seconds.',
    rules: [
      'Strict 30-second turn limit.',
      'Take turns placing symbols in empty 3x3 cells.',
      'Line up 3 across, down, or diagonal to trigger the win!'
    ]
  },
  {
    id: 'checkers',
    title: 'Classic Checkers',
    tagline: 'Diagonal Jumps & King Promotion',
    category: 'Board Game',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '5-15 min',
    iconName: 'Shield',
    gradient: 'from-red-500/20 to-transparent',
    accentColor: '#f58977',
    featured: false,
    description: 'Command your pieces forward along dark squares. Leap over enemy checkers to capture them and get crowned King!',
    rules: [
      '30-second move clock.',
      'Jump over opponent pieces diagonally to capture them.',
      'Reaching the opposite back row crowns your piece into a King!'
    ]
  },
  {
    id: 'battleship',
    title: 'Naval Battleship',
    tagline: 'Deploy Fleet & Sink Enemy Armada',
    category: 'Tactical',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '8-18 min',
    iconName: 'Anchor',
    gradient: 'from-emerald-500/20 to-transparent',
    accentColor: '#5be9ed',
    featured: true,
    description: 'Secretly deploy your 5 naval warships. Call coordinates, detect hits, and sink the entire enemy armada!',
    rules: [
      '30s per radar strike.',
      'Track red explosions (Hit) and white splashes (Miss).',
      'First commander to sink all 5 ships wins!'
    ]
  },
  {
    id: 'othello',
    title: 'Reversi Duel',
    tagline: 'Trap & Flip Discs',
    category: 'Strategy',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '5-12 min',
    iconName: 'Disc',
    gradient: 'from-teal-500/20 to-transparent',
    accentColor: '#2dd4bf',
    featured: true,
    description: 'Classic 8x8 disc-flipping duel! Trap enemy discs between yours along horizontal, vertical, or diagonal lines to flip them.',
    rules: [
      'Trap opponent pieces between yours to flip them to your color.',
      'Corner tiles are immune to flipping and grant supreme advantage.',
      'Most discs at the end wins the match!'
    ]
  },
  {
    id: 'dots-and-boxes',
    title: 'Dots & Boxes',
    tagline: 'Laser Lines & Territory Capture',
    category: 'Quick',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '3-8 min',
    iconName: 'Grid',
    gradient: 'from-fuchsia-500/20 to-transparent',
    accentColor: '#d946ef',
    featured: false,
    description: 'Connect dots with laser lines. Completing any box claims it for points and gives an extra turn.',
    rules: [
      'Take turns drawing lines between adjacent dots.',
      'Completing the 4th side of a box captures it and grants a free turn.',
      'Player with the highest box count wins.'
    ]
  },
  {
    id: 'gomoku',
    title: 'Gomoku Zen',
    tagline: 'The Zen of Five-in-a-Row',
    category: 'Strategy',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '5-15 min',
    iconName: 'Target',
    gradient: 'from-indigo-500/20 to-transparent',
    accentColor: '#6366f1',
    featured: false,
    description: 'Race to form an unbroken chain of 5 stones horizontally, vertically, or diagonally on the Go board.',
    rules: [
      'Place stones on empty grid intersections.',
      'First player to create an unbroken line of 5 stones wins.',
      '30-second turn limit.'
    ]
  },
  {
    id: 'memory-match',
    title: 'Cyber Pairs',
    tagline: 'High-Tech Holographic Card Duel',
    category: 'Classic',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '3-7 min',
    iconName: 'Sparkles',
    gradient: 'from-pink-500/20 to-transparent',
    accentColor: '#ec4899',
    featured: false,
    description: 'Flip holographic cyber tiles to find matching pairs. Matching grants bonus turns!',
    rules: [
      'Flip two cards per turn.',
      'Matching cards gives 1 point and a free turn.',
      'Most pairs when all cards are cleared wins.'
    ]
  },
  {
    id: 'mancala',
    title: 'Mancala Quest',
    tagline: 'Ancient Pit & Seed Capture',
    category: 'Board Game',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '5-12 min',
    iconName: 'CircleDot',
    gradient: 'from-amber-500/20 to-transparent',
    accentColor: '#f59e0b',
    featured: true,
    description: 'Sow gemstones counter-clockwise. Chain bonus turns from your store and capture opponent pits to dominate.',
    rules: [
      'Sow stones into consecutive pits and your store.',
      'Ending in your store gives a free extra turn.',
      'Ending in an empty pit captures the opposite pit.'
    ]
  },
  {
    id: 'cyber-trivia',
    title: 'Cyber Trivia',
    tagline: '5-Round High-Voltage Quiz Duel',
    category: 'Quick',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '3-6 min',
    iconName: 'Zap',
    gradient: 'from-cyan-500/20 to-transparent',
    accentColor: '#00f2fe',
    featured: true,
    description: 'Battle across 5 timed trivia rounds in Gaming, Tech, AI, and Science. Fast answers earn speed bonuses!',
    rules: [
      '5 rounds of timed questions.',
      'Faster correct answers score up to +50 speed bonus.',
      'Highest points at round 5 wins!'
    ]
  },
  {
    id: 'word-clash',
    title: 'Word Clash',
    tagline: '5-Letter Cyber Wordle Duel',
    category: 'Tactical',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '4-8 min',
    iconName: 'Sparkles',
    gradient: 'from-emerald-500/20 to-transparent',
    accentColor: '#00f59b',
    featured: true,
    description: 'Crack the hidden 5-letter cyber code in 6 attempts with live color-coded tile hints.',
    rules: [
      'Guess the secret 5-letter word in 6 tries.',
      '🟩 Green = exact letter. 🟨 Yellow = wrong spot. ⬛ Gray = not in word.',
      'First to solve or fewest attempts wins!'
    ]
  },
  {
    id: 'rps-strike',
    title: 'RPS Cyber Strike',
    tagline: 'Holographic Rock Paper Scissors',
    category: 'Quick',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '2-5 min',
    iconName: 'Swords',
    gradient: 'from-purple-500/20 to-transparent',
    accentColor: '#9d4edd',
    featured: true,
    description: 'High-stakes tactical RPS! Secret weapon lock-in and simultaneous holographic reveals in a race to 3 wins.',
    rules: [
      'First to 3 points wins the match.',
      'Titan Rock crushes Blades, Quantum Paper envelops Rock, Laser Blades slice Paper.',
      '12-second round timer for quick tactical clashes.'
    ]
  },
  {
    id: 'hand-cricket',
    title: 'Hand Cricket',
    tagline: 'Classic 2-Innings Bat & Bowl Clash',
    category: 'Quick',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '3-6 min',
    iconName: 'Trophy',
    gradient: 'from-emerald-500/20 to-transparent',
    accentColor: '#10b981',
    featured: true,
    description: 'Score runs by matching your batter numbers, bowl out your rival, and chase down the target score.',
    rules: [
      'Pick 1 to 6 on each ball.',
      'Same number = Wicket OUT! Different number = Batter scores runs.',
      'Chase the target score in Innings 2 to win!'
    ]
  },
  {
    id: 'rpsls',
    title: 'RPS Lizard Spock',
    tagline: 'The Ultimate 5-Way Tactical Arena',
    category: 'Quick',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '2-5 min',
    iconName: 'Swords',
    gradient: 'from-purple-500/20 to-transparent',
    accentColor: '#a855f7',
    featured: true,
    description: 'Rock, Paper, Scissors, Lizard, Spock! 5 weapons, 10 interactions, and simultaneous holographic reveals.',
    rules: [
      'First to 3 points wins the match.',
      'Rock crushes Scissors & Lizard; Paper covers Rock & disproves Spock; Scissors cuts Paper & decapitates Lizard.',
      'Lizard poisons Spock & eats Paper; Spock smashes Scissors & vaporizes Rock.'
    ]
  },
  {
    id: 'nim',
    title: 'Nim — Cyber Sticks',
    tagline: 'Mathematical Stick Reduction Duel',
    category: 'Strategy',
    difficulty: 'Hardcore',
    players: '1 - 2 Players',
    avgTime: '3-7 min',
    iconName: 'Sparkles',
    gradient: 'from-cyan-500/20 to-transparent',
    accentColor: '#06b6d4',
    featured: true,
    description: 'The ancient mathematical game of heap reduction. Choose any row and take sticks. The player who takes the last stick wins!',
    rules: [
      'Pick any number of sticks from a single row.',
      'Normal play: whoever takes the very last stick wins!',
      '30-second move timer per turn.'
    ]
  },
  {
    id: 'matchstick-puzzle',
    title: 'Matchstick Puzzle',
    tagline: '1-Move Digital Equation Brain Teaser',
    category: 'Tactical',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '3-6 min',
    iconName: 'Flame',
    gradient: 'from-amber-500/20 to-transparent',
    accentColor: '#f59e0b',
    featured: true,
    description: 'Move exactly 1 matchstick to restore mathematical balance to broken digital equations.',
    rules: [
      'Move exactly 1 matchstick to make the equation true.',
      'Race against the 25s timer for speed bonuses.',
      'Highest points across 3 puzzles wins!'
    ]
  },
  {
    id: 'coin-toss',
    title: 'Coin Toss Challenge',
    tagline: '3D Physics Coin Prediction Arena',
    category: 'Quick',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '2-4 min',
    iconName: 'Coins',
    gradient: 'from-yellow-500/20 to-transparent',
    accentColor: '#eab308',
    featured: true,
    description: 'Launch the spinning 3D coin into orbit! Call Heads or Tails and be the first to reach 3 correct predictions.',
    rules: [
      'Pick Heads 👑 or Tails 🐉.',
      'Watch the 3D coin tumble and land in the chamber.',
      'First player to 3 correct calls wins!'
    ]
  },
  {
    id: 'odd-even',
    title: 'Odd or Even',
    tagline: 'Finger Throw Parity Showdown',
    category: 'Quick',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '2-5 min',
    iconName: 'Zap',
    gradient: 'from-blue-500/20 to-transparent',
    accentColor: '#3b82f6',
    featured: true,
    description: 'Call your parity, throw 1 to 5 fingers simultaneously, and score points whenever the combined sum matches your call.',
    rules: [
      'Call ODD or EVEN.',
      'Both players throw 1 to 5 fingers.',
      'If the sum matches your call, you score! First to 3 wins.'
    ]
  },
  {
    id: 'higher-lower',
    title: 'Higher or Lower',
    tagline: 'High-Stakes Card Probability Clash',
    category: 'Quick',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '3-6 min',
    iconName: 'ArrowUp',
    gradient: 'from-sky-500/20 to-transparent',
    accentColor: '#0284c7',
    featured: true,
    description: 'Forecast whether the next drawn card will be Higher or Lower. Chain correct calls for 2x and 3x streak combo bonuses.',
    rules: [
      'Predict if the next drawn card is Higher or Lower.',
      'Ace is 1, King is 13.',
      'Consecutive correct calls earn 2x and 3x streak multipliers!'
    ]
  },
  {
    id: 'guess-number',
    title: 'Guess the Number',
    tagline: '1-100 Codebreaker Radar Duel',
    category: 'Tactical',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '3-7 min',
    iconName: 'Target',
    gradient: 'from-purple-500/20 to-transparent',
    accentColor: '#8b5cf6',
    featured: true,
    description: 'Take turns guessing a secret number between 1 and 100 with real-time shrinking radar bounds.',
    rules: [
      'Take turns guessing the secret number [1 - 100].',
      'Hints narrow the valid range on every guess.',
      'The player who strikes the exact number wins!'
    ]
  },
  {
    id: 'pallanguzhi',
    title: 'Pallanguzhi',
    tagline: '14-Pit Sowing & Cowrie Capture',
    category: 'Board Game',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '5-12 min',
    iconName: 'Box',
    gradient: 'from-amber-600/20 to-transparent',
    accentColor: '#d97706',
    featured: true,
    description: 'The ancient South Indian 14-pit cowrie game! Sow shells continuously, empty pits, and trigger the Pasu capture rule.',
    rules: [
      'Sow 1 shell per pit in a continuous loop.',
      'Continuous sowing: pick up seeds from next pit and continue.',
      'When the next pit is empty, capture all shells in the pit after it (*Pasu*)!'
    ]
  },
  {
    id: 'chowka-bara',
    title: 'Chowka Bara',
    tagline: 'Traditional 5x5 Indian Race Duel',
    category: 'Board Game',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '6-15 min',
    iconName: 'Sparkles',
    gradient: 'from-amber-500/20 to-transparent',
    accentColor: '#f59e0b',
    featured: true,
    description: 'Roll 4 cowrie shells, race pawns across outer & inner circuits, kill enemy pawns, and reach the center safe home.',
    rules: [
      'Roll 4 cowrie shells (Chowka 4 & Ashta 8 grant bonus rolls).',
      'Pawns circle the outer perimeter before turning inward.',
      'Landing on an enemy pawn sends it back to start!'
    ]
  },
  {
    id: 'pachisi',
    title: 'Pachisi',
    tagline: 'The Ancient Royal Game of India',
    category: 'Board Game',
    difficulty: 'Hardcore',
    players: '1 - 2 Players',
    avgTime: '8-18 min',
    iconName: 'Crown',
    gradient: 'from-rose-500/20 to-transparent',
    accentColor: '#f43f5e',
    featured: true,
    description: 'Throw 6 cowrie shells, navigate the royal cross-shaped board, capture opponent gotti, and bear off into the sacred Char-Koni.',
    rules: [
      'Throw 6 cowrie shells (Pachisi 25 & Grace 10 grant bonuses).',
      'Enter gotti from center and circulate the cross perimeter.',
      'Bear off all 3 royal gotti into Char-Koni to win.'
    ]
  },
  {
    id: 'snakes-and-ladders',
    title: 'Snakes and Ladders',
    tagline: 'Sacred 100-Tile Summit Ascent',
    category: 'Classic',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '4-10 min',
    iconName: 'Dices',
    gradient: 'from-emerald-500/20 to-transparent',
    accentColor: '#10b981',
    featured: true,
    description: 'Roll the sacred D6 die, scale soaring ladders, avoid venomous snakes, and be the first to reach tile 100.',
    rules: [
      'Roll 1-6 on the die. Rolling 6 gives an extra roll!',
      'Land on ladder bases to climb ahead.',
      'Land on snake heads to slide down. Exact 100 wins!'
    ]
  },
  {
    id: 'ludo',
    title: 'Ludo',
    tagline: 'The Classic 4-Quadrant Home Race',
    category: 'Board Game',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '5-12 min',
    iconName: 'Trophy',
    gradient: 'from-red-500/20 to-transparent',
    accentColor: '#ef4444',
    featured: true,
    description: 'Roll 6 to launch tokens from your yard, navigate safe stars, cut opponent tokens, and guide all pieces into the home triangle.',
    rules: [
      'Roll a 6 to bring a token out from the base.',
      'Safe star squares protect tokens from being captured.',
      'Cut enemy tokens to send them to base and gain extra turns!'
    ]
  },
  {
    id: 'carrom',
    title: 'Carrom 2D',
    tagline: 'Smooth 2D Tabletop Striker Duel',
    category: 'Classic',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '5-12 min',
    iconName: 'Target',
    gradient: 'from-cyan-500/20 to-transparent',
    accentColor: '#06b6d4',
    featured: true,
    description: 'Position striker on the baseline, pull back aim and power, and pocket White, Black, and the Red Queen into 4 corner pockets.',
    rules: [
      'Slide striker along baseline and drag back to shoot.',
      'White & Black coins score +10 pts. Red Queen scores +25 pts.',
      'Avoid striker fouls (-5 pts penalty). Highest score wins!'
    ]
  },
  {
    id: 'kabaddi',
    title: 'Kabaddi Clash',
    tagline: 'Strategic Pro Mat Raids & Super Tackles',
    category: 'Strategy',
    difficulty: 'Intermediate',
    players: '1 - 2 Players',
    avgTime: '4-8 min',
    iconName: 'Flame',
    gradient: 'from-amber-600/20 to-transparent',
    accentColor: '#f59e0b',
    featured: true,
    description: 'Take turns raiding the mat with Hand Touch, Dubki, and Frog Jump while defenders execute Chain Holds and Super Tackles.',
    rules: [
      'Cross the baulk line to make a raid legal; cross bonus line for +1 pt.',
      'Touch defenders and return safely to score raid points.',
      'Super Tackle awards +2 points when 3 or fewer defenders are on mat!'
    ]
  },
  {
    id: 'cricket-quiz',
    title: 'Indian Cricket Quiz',
    tagline: 'Stadium Target Chase & Trivia Showdown',
    category: 'Quick',
    difficulty: 'Casual',
    players: '1 - 2 Players',
    avgTime: '3-6 min',
    iconName: 'Zap',
    gradient: 'from-emerald-500/20 to-transparent',
    accentColor: '#10b981',
    featured: true,
    description: 'Test your cricket knowledge on IPL, World Cups, and legends. Fast answers score Sixes and Fours, while errors cost wickets.',
    rules: [
      'Under 5s answer = 6 Runs! Under 10s = 4 Runs.',
      'Wrong answers result in a lost wicket (OUT!).',
      'Chase down the target score before running out of overs.'
    ]
  },
  {
    id: 'antakshari',
    title: 'Antakshari',
    tagline: 'The Legendary Bollywood Musical Duel',
    category: 'Classic',
    difficulty: 'Casual',
    players: '2 - 4 Players',
    avgTime: '5-12 min',
    iconName: 'Radio',
    gradient: 'from-pink-500/20 to-transparent',
    accentColor: '#ec4899',
    featured: true,
    description: 'Sing Bollywood songs matching the starting letter. Songs pass ending letters to the next player in the circle.',
    rules: [
      'Sing a song with the required letter within 25 seconds.',
      'Ending letter passes to the next player.',
      '3 hearts per player — lose all 3 and you are eliminated!'
    ]
  },
  {
    id: 'name-place-animal-thing',
    title: 'Name, Place, Animal, Thing',
    tagline: 'Classic Schoolroom Speed & Vocabulary Duel',
    category: 'Classic',
    difficulty: 'Casual',
    players: '2 - 4 Players',
    avgTime: '4-8 min',
    iconName: 'Sparkles',
    gradient: 'from-indigo-500/20 to-transparent',
    accentColor: '#6366f1',
    featured: true,
    description: 'Fill Name, Place, Animal, and Thing starting with the round letter. First to finish slams STOP to trigger a 10s panic timer.',
    rules: [
      'Enter valid words starting with the active alphabet letter.',
      'Hit STOP once all 4 fields are filled.',
      'Unique word = 10 pts, Shared word = 5 pts, Invalid = 0 pts.'
    ]
  },
  {
    id: 'truth-or-dare',
    title: 'Truth or Dare',
    tagline: 'Spin the Bottle & Tollywood Cues',
    category: 'Party',
    difficulty: 'Casual',
    players: '2 - 8 Players',
    avgTime: '5-15 min',
    iconName: 'Flame',
    gradient: 'from-pink-500/20 to-transparent',
    accentColor: '#ec4899',
    featured: true,
    description: 'Spin the 3D bottle in the center, pick Truth or Dare, and act out hilarious challenges from Telugu cinema and everyday life.',
    rules: [
      'Spin the bottle to randomly pick a player in the group.',
      'Chosen player selects TRUTH or DARE.',
      'Complete the challenge to score points or chicken out!'
    ]
  },
  {
    id: 'never-have-i-ever',
    title: 'Never Have I Ever',
    tagline: '5 Fingers Group Confessions',
    category: 'Party',
    difficulty: 'Casual',
    players: '2 - 8 Players',
    avgTime: '4-10 min',
    iconName: 'Sparkles',
    gradient: 'from-purple-500/20 to-transparent',
    accentColor: '#a855f7',
    featured: true,
    description: 'Statements reveal wild experiences, Telugu cinema habits, and college memories. Put a finger down if you have done it!',
    rules: [
      'Read the statement aloud to all players.',
      'Click "I Have Done It" to lower a finger, or "Never In My Life" to stay safe.',
      'The player with the most fingers standing at the end wins!'
    ]
  },
  {
    id: 'who-knows-me-best',
    title: 'Who Knows Me Best?',
    tagline: 'VIP Secrets & Friend Deductions',
    category: 'Party',
    difficulty: 'Casual',
    players: '2 - 8 Players',
    avgTime: '5-12 min',
    iconName: 'Crown',
    gradient: 'from-amber-500/20 to-transparent',
    accentColor: '#f59e0b',
    featured: true,
    description: 'Each round, a VIP secretly answers a quirky lifestyle or Tollywood cinema preference, and friends guess their choice.',
    rules: [
      'The designated VIP secretly locks in their authentic answer.',
      'All other players guess what the VIP picked.',
      'Correct guesses earn +10 points on the leaderboard!'
    ]
  },
  {
    id: 'most-likely-to',
    title: 'Most Likely To',
    tagline: 'Group Finger-Pointing & Consensus',
    category: 'Party',
    difficulty: 'Casual',
    players: '2 - 8 Players',
    avgTime: '4-10 min',
    iconName: 'Users',
    gradient: 'from-rose-500/20 to-transparent',
    accentColor: '#f43f5e',
    featured: true,
    description: 'Who in your group is most likely to act like a mass hero, start a silly argument, or get stranded at a movie theater? Vote and find out!',
    rules: [
      'A provocative or funny statement appears on screen.',
      'Everyone votes for the person in the group who best fits the description.',
      'Live vote tally reveals the group consensus!'
    ]
  },
  {
    id: 'two-truths-and-a-lie',
    title: 'Two Truths & a Lie',
    tagline: 'Spot the Lie in Tollywood Trivia',
    category: 'Trivia',
    difficulty: 'Casual',
    players: '2 - 8 Players',
    avgTime: '5-10 min',
    iconName: 'Search',
    gradient: 'from-emerald-500/20 to-transparent',
    accentColor: '#10b981',
    featured: true,
    description: 'Three statements about Tollywood legends, Oscar glory, and blockbuster films are shown — two are 100% genuine, but one is a deceptive LIE.',
    rules: [
      'Read 3 statements carefully.',
      'Detect and click the single statement that is a fabricated LIE.',
      'Reveal the truth behind the fact to earn +10 points!'
    ]
  },
  {
    id: 'would-you-rather',
    title: 'Would You Rather?',
    tagline: 'Impossible Tollywood Dilemmas',
    category: 'Party',
    difficulty: 'Casual',
    players: '2 - 8 Players',
    avgTime: '4-8 min',
    iconName: 'Scale',
    gradient: 'from-indigo-500/20 to-transparent',
    accentColor: '#6366f1',
    featured: true,
    description: 'Star in a 7-year Rajamouli epic or 10 quick commercial comedies? Eat free biryani for life or get free VIP movie tickets?',
    rules: [
      'Pick Option A or Option B on the hot dilemma card.',
      'Live community percentages reveal where everyone stands.',
      'Match the majority choice to score bonus points!'
    ]
  },
  {
    id: 'rapid-fire',
    title: 'Rapid Fire Hot Seat',
    tagline: '5-Second Reaction Showdown',
    category: 'Quick',
    difficulty: 'Casual',
    players: '2 - 8 Players',
    avgTime: '3-6 min',
    iconName: 'Zap',
    gradient: 'from-amber-500/20 to-transparent',
    accentColor: '#f59e0b',
    featured: true,
    description: '10 rapid-fire questions popping up with only 5 seconds on the clock. Choose between iconic heroes, movies, and food without hesitating!',
    rules: [
      'React and pick your choice before the 5-second timer runs out.',
      'Fast answers under 2 seconds score speed bonuses.',
      'Chain consecutive fast answers to build massive streaks!'
    ]
  },
  {
    id: 'dumb-charades',
    title: 'Dumb Charades',
    tagline: 'Tollywood Cinema Acting Showdown',
    category: 'Party',
    difficulty: 'Intermediate',
    players: '2 - 8 Players',
    avgTime: '6-15 min',
    iconName: 'Film',
    gradient: 'from-emerald-500/20 to-transparent',
    accentColor: '#10b981',
    featured: true,
    description: 'Act out Baahubali, Pushpa, Eega, and RRR using gestures, word counts, and signature hero cues while your friends race against the 60s clock.',
    rules: [
      'Actor receives a secret Tollywood movie with acting tips.',
      'No talking allowed — only gestures and body language!',
      'Guessers submit answers; successful guesses reward both actor and guesser.'
    ]
  },
  {
    id: 'guess-the-movie',
    title: 'Guess the Movie',
    tagline: 'Telugu Emojis, Dialogues & Plot Riddles',
    category: 'Trivia',
    difficulty: 'Casual',
    players: '2 - 8 Players',
    avgTime: '4-8 min',
    iconName: 'Clapperboard',
    gradient: 'from-amber-500/20 to-transparent',
    accentColor: '#f59e0b',
    featured: true,
    description: 'Decode emoji clues, recite immortal mass dialogues, and solve plot riddles for blockbuster hits from Pokiri and Athadu to Kalki and Pushpa.',
    rules: [
      'Inspect the emoji sequence, iconic dialogue, and plot teaser.',
      'Select the correct movie title from the 4 options.',
      'Fast correct guesses earn maximum points on the leaderboard.'
    ]
  },
  {
    id: 'guess-the-song',
    title: 'Guess the Song',
    tagline: 'Tollywood Melody Synth & Lyrics',
    category: 'Party',
    difficulty: 'Casual',
    players: '2 - 8 Players',
    avgTime: '4-8 min',
    iconName: 'Music',
    gradient: 'from-pink-500/20 to-transparent',
    accentColor: '#ec4899',
    featured: true,
    description: 'Listen to live synthesizer melody notes of chartbusters like Samajavaragamana, Naatu Naatu, and Butta Bomma, solve the missing lyrics, and guess the track!',
    rules: [
      'Press Play to hear the retro synth melody tune.',
      'Read the fill-in-the-blank lyric clue and composer hint.',
      'Identify the song to score points and crown the music master!'
    ]
  },
  {
    id: 'guess-the-word',
    title: 'Guess the Word',
    tagline: 'Letter Deduction & Telugu Heritage Words',
    category: 'Classic',
    difficulty: 'Casual',
    players: '2 - 8 Players',
    avgTime: '4-8 min',
    iconName: 'Type',
    gradient: 'from-cyan-500/20 to-transparent',
    accentColor: '#06b6d4',
    featured: true,
    description: 'Uncover secret words like Biryani, Baahubali, and Charminar by guessing letters on the keyboard before your 6 attempts expire.',
    rules: [
      'Click letters to reveal matching tiles in the hidden word.',
      'Wrong guesses cost one heart (max 6 wrong guesses).',
      'Solve the entire word before running out of attempts!'
    ]
  },
  {
    id: 'imposter-word',
    title: 'Imposter Among Us',
    tagline: 'Word-Based Deception & Secret Blends',
    category: 'Party',
    difficulty: 'Intermediate',
    players: '3 - 8 Players',
    avgTime: '5-12 min',
    iconName: 'Skull',
    gradient: 'from-rose-500/20 to-transparent',
    accentColor: '#f43f5e',
    featured: true,
    description: 'Everyone gets a secret word (e.g. Hyderabadi Biryani), but the Imposter gets a slight variation (Veg Pulav). Share 1-word clues and vote out the imposter!',
    rules: [
      'Everyone checks their secret card; one player is the hidden Imposter.',
      'Take turns giving 1-word clues to prove you know the civilian word.',
      'Debate and vote to eliminate the Imposter before they blend in!'
    ]
  },
  {
    id: 'mafia',
    title: 'Mafia / Werewolf',
    tagline: 'Day & Night Social Deduction Epic',
    category: 'Strategy',
    difficulty: 'Hardcore',
    players: '4 - 8 Players',
    avgTime: '8-18 min',
    iconName: 'Moon',
    gradient: 'from-indigo-500/20 to-transparent',
    accentColor: '#6366f1',
    featured: true,
    description: 'In the dark of the night, the Mafia strikes while the Doctor saves and the Detective investigates. By day, the town gathers to vote and execute suspects!',
    rules: [
      'Secret roles: Mafia, Detective, Doctor, and Citizens.',
      'Night phase: Mafia picks a victim, Doctor heals, Detective investigates.',
      'Day phase: Discussion and town hall vote to lynch the Mafia!'
    ]
  },
  {
    id: 'spyfall',
    title: 'Spyfall',
    tagline: 'Telugu Landmarks Secret Infiltration',
    category: 'Strategy',
    difficulty: 'Intermediate',
    players: '3 - 8 Players',
    avgTime: '5-12 min',
    iconName: 'Compass',
    gradient: 'from-teal-500/20 to-transparent',
    accentColor: '#14b8a6',
    featured: true,
    description: 'Everyone knows the location (Ramoji Film City, Golconda, Tirupati) except the Spy. Ask questions, blend in, and unmask the infiltrator!',
    rules: [
      'All players receive the secret location and a role, except the Spy.',
      'Players ask each other subtle questions about their surroundings.',
      'Spy tries to deduce the location while players try to unmask the Spy!'
    ]
  },
  {
    id: 'word-chain',
    title: 'Word Chain',
    tagline: 'Connect vocabulary before the clock runs out',
    category: 'Word',
    difficulty: 'Casual',
    players: '2 - 8 Players',
    avgTime: '3-8 min',
    iconName: 'Link2',
    gradient: 'from-amber-500/20 to-transparent',
    accentColor: '#f59e0b',
    featured: true,
    description: 'Fast-paced vocabulary showdown! Start with a word and race against the 15-second clock to enter a new word starting with the previous word\'s final letter.',
    rules: [
      'Enter a valid dictionary word starting with the ending letter of the previous word.',
      'Beat the 15-second timer before turn passes.',
      'No repeat words allowed! Last player standing wins.'
    ]
  },
  {
    id: 'wordle',
    title: 'Wordle Guess',
    tagline: 'Guess the hidden 5-letter word in 6 attempts',
    category: 'Word',
    difficulty: 'Intermediate',
    players: '1 - 8 Players',
    avgTime: '3-5 min',
    iconName: 'Grid',
    gradient: 'from-emerald-500/20 to-transparent',
    accentColor: '#10b981',
    featured: true,
    description: 'The global sensation! Guess the secret 5-letter word in 6 attempts with green, yellow, and gray feedback.',
    rules: [
      'Green indicates correct letter in the right spot.',
      'Yellow indicates correct letter in wrong position.',
      'Gray indicates letter is not present in the word.'
    ]
  },
  {
    id: 'hangman',
    title: 'Hangman Strike',
    tagline: 'DC superheroes, Marvel & Cinema hangman',
    category: 'Word',
    difficulty: 'Casual',
    players: '1 - 8 Players',
    avgTime: '2-5 min',
    iconName: 'HelpCircle',
    gradient: 'from-rose-500/20 to-transparent',
    accentColor: '#f43f5e',
    featured: true,
    description: 'Classic hangman with DC superheroes, Marvel epics, and Tollywood blockbusters. Guess letter by letter before your strikes run out!',
    rules: [
      'Select letters on the virtual keyboard to reveal matching tiles.',
      'Each wrong letter adds a part to the gallows (6 strikes max).',
      'Solve the full title to win!'
    ]
  },
  {
    id: 'word-builder',
    title: 'Word Builder',
    tagline: 'Scrabble rack tile crafting challenge',
    category: 'Word',
    difficulty: 'Intermediate',
    players: '1 - 8 Players',
    avgTime: '2-5 min',
    iconName: 'FileText',
    gradient: 'from-blue-500/20 to-transparent',
    accentColor: '#3b82f6',
    featured: true,
    description: 'Scrabble-style tile building! Construct high-scoring English words from your 7 randomized letter tiles with premium letter values.',
    rules: [
      'Click tiles from your rack to construct words on the board.',
      'High-value consonants (Q, Z, X, J) multiply your points.',
      'Score maximum total points in 60 seconds!'
    ]
  },
  {
    id: 'anagrams',
    title: 'Anagrams Frenzy',
    tagline: 'Scramble through 60s of word discovery',
    category: 'Word',
    difficulty: 'Casual',
    players: '1 - 8 Players',
    avgTime: '2-4 min',
    iconName: 'Shuffle',
    gradient: 'from-purple-500/20 to-transparent',
    accentColor: '#a855f7',
    featured: true,
    description: 'Frantic word scramble! Uncover as many 3, 4, 5, and 6-letter valid English words as possible before the 60-second timer runs out.',
    rules: [
      'Form words using only letters from the active scrambled pool.',
      'Longer words earn massive bonus points and combos.',
      'Rival with bot or friends for highest word tally!'
    ]
  },
  {
    id: 'unscramble',
    title: 'Unscramble the Word',
    category: 'Word',
    tagline: 'Reorder scrambled cinema and hero titles',
    difficulty: 'Casual',
    players: '1 - 8 Players',
    avgTime: '2-5 min',
    iconName: 'Sparkles',
    gradient: 'from-teal-500/20 to-transparent',
    accentColor: '#14b8a6',
    featured: true,
    description: 'Jumbled letters puzzle! Click and swap letter tiles to solve movie names, heroes, and cultural icons across rounds.',
    rules: [
      'Click letter tiles in correct sequence to form the target word.',
      'Use hints if you get stuck on a difficult anagram.',
      'Clear all rounds with fewest mistakes to top the leaderboard!'
    ]
  },
  {
    id: 'last-letter',
    title: 'Last Letter Challenge',
    category: 'Word',
    tagline: '10-second rapid word duel with 3 hearts',
    difficulty: 'Intermediate',
    players: '2 - 8 Players',
    avgTime: '3-6 min',
    iconName: 'Zap',
    gradient: 'from-amber-500/20 to-transparent',
    accentColor: '#f59e0b',
    featured: true,
    description: 'High-octane duel! Every player has only 10 seconds to respond with a word starting with the previous word\'s final letter. 3 strikes and you are out!',
    rules: [
      'Type word starting with the last letter within 10 seconds.',
      'Losing round costs 1 heart (3 lives total).',
      'Outlast all rivals to claim victory!'
    ]
  },
  {
    id: 'alphabet-categories',
    title: 'Alphabet Categories',
    category: 'Party',
    tagline: 'Fill 5 categories and slam STOP first',
    difficulty: 'Casual',
    players: '2 - 8 Players',
    avgTime: '4-8 min',
    iconName: 'ListCheck',
    gradient: 'from-pink-500/20 to-transparent',
    accentColor: '#ec4899',
    featured: true,
    description: 'The beloved party game! Roll a random alphabet letter and quickly fill Name, Movie, Superhero, City, and Food. Slam STOP when done!',
    rules: [
      'All 5 answers must start with the given round letter.',
      'First player to complete all 5 slams STOP, giving others 10s.',
      'Unique valid answers earn 10 points each!'
    ]
  },
  {
    id: 'forbidden-word',
    title: 'Forbidden Word (Taboo)',
    category: 'Party',
    tagline: 'Describe secrets without uttering forbidden clues',
    difficulty: 'Intermediate',
    players: '2 - 8 Players',
    avgTime: '5-10 min',
    iconName: 'ShieldAlert',
    gradient: 'from-rose-500/20 to-transparent',
    accentColor: '#f43f5e',
    featured: true,
    description: 'Ultimate communication party game! Describe Batman, Baahubali, or Biryani without saying the 4 obvious forbidden keywords on the card!',
    rules: [
      'Describer explains the secret word to their team or room.',
      'Do NOT say the target word or any of the 4 forbidden buzzwords.',
      'Score 1 point for every successful guess in 60s!'
    ]
  },
  {
    id: 'rhyme-battle',
    title: 'Rhyme Battle',
    category: 'Word',
    tagline: 'Freestyle word rap under a 12s timer',
    difficulty: 'Intermediate',
    players: '2 - 8 Players',
    avgTime: '3-6 min',
    iconName: 'Mic',
    gradient: 'from-indigo-500/20 to-transparent',
    accentColor: '#6366f1',
    featured: true,
    description: 'Freestyle word rap! A root word is dropped — players take turns submitting matching rhyming words before the 12-second clock expires.',
    rules: [
      'Enter a real English word that rhymes with the prompt word.',
      'Beat the 12-second rap timer.',
      'No repeats! Bot and multiplayer rivals compete for rap king!'
    ]
  },
  {
    id: 'sentence-builder',
    title: 'Sentence Builder',
    category: 'Party',
    tagline: 'Cooperative one-word cinema storytelling',
    difficulty: 'Casual',
    players: '2 - 8 Players',
    avgTime: '4-8 min',
    iconName: 'Edit3',
    gradient: 'from-cyan-500/20 to-transparent',
    accentColor: '#06b6d4',
    featured: true,
    description: 'Hilarious collaborative storytelling! Each player contributes exactly ONE word on their turn to weave epic, comical cinema adventures together.',
    rules: [
      'Add exactly one grammatically sensible word on your turn.',
      'Cooperate to create hilarious Tollywood and superhero plotlines.',
      'End sentences with punctuation to score bonus creativity points!'
    ]
  },
  {
    id: 'emoji-movie-guess',
    title: 'Emoji Movie Guess',
    category: 'Party',
    tagline: 'Decipher movie titles hidden in emoji sequences',
    difficulty: 'Casual',
    players: '2 - 8 Players',
    avgTime: '3-6 min',
    iconName: 'Film',
    gradient: 'from-amber-500/20 to-transparent',
    accentColor: '#f59e0b',
    featured: true,
    description: 'Pop-culture visual deduction! Guess famous films like RRR (🌊🔥🐅), The Dark Knight (🦇🃏🌃), and Pushpa (🪓🌳🔴) from emoji sequences.',
    rules: [
      'Inspect the emoji clue sequence closely.',
      'Select the correct movie title among 4 choices.',
      'Streak bonuses awarded for rapid correct answers!'
    ]
  },
  {
    id: 'sudoku',
    title: 'Sudoku Master',
    tagline: 'Classic 9x9 Japanese numerical logic',
    category: 'Puzzle',
    difficulty: 'Intermediate',
    players: '1 Player',
    avgTime: '5-15 min',
    iconName: 'Grid',
    gradient: 'from-blue-500/20 to-transparent',
    accentColor: '#3b82f6',
    featured: true,
    description: 'The world\'s most popular numerical logic puzzle! Fill the 9x9 grid so every row, column, and 3x3 block contains digits 1 to 9 without repetition.',
    rules: [
      'Click an empty cell and select a number from 1 to 9.',
      'No duplicate numbers in any row, column, or 3x3 box.',
      '3 mistake strikes allowed before game over!'
    ]
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper Retro',
    tagline: 'Uncover safe cells and flag hidden mines',
    category: 'Puzzle',
    difficulty: 'Intermediate',
    players: '1 Player',
    avgTime: '3-8 min',
    iconName: 'Bomb',
    gradient: 'from-red-500/20 to-transparent',
    accentColor: '#ef4444',
    featured: true,
    description: 'Classic desktop retro puzzle! Dig up numbers revealing adjacent mine counts, place safety flags, and clear the entire grid unharmed.',
    rules: [
      'Left click to uncover cell; first click is guaranteed safe.',
      'Toggle Flag mode to mark suspected mine locations.',
      'Uncover all 71 safe tiles to win!'
    ]
  },
  {
    id: 'memory-match',
    title: 'Memory Card Match',
    tagline: 'Match superhero and cinema pairs',
    category: 'Puzzle',
    difficulty: 'Casual',
    players: '1 - 4 Players',
    avgTime: '2-5 min',
    iconName: 'Layers',
    gradient: 'from-purple-500/20 to-transparent',
    accentColor: '#a855f7',
    featured: true,
    description: 'Visual memory workout! Flip cards 2 at a time to uncover matching pairs of superheroes, Tollywood stars, and golden artifacts.',
    rules: [
      'Flip two cards per turn to inspect symbols.',
      'Matching cards remain open and award a point.',
      'Collect the most pairs to win!'
    ]
  },
  {
    id: 'simon-says',
    title: 'Simon Says Sequence',
    tagline: 'Audiovisual sequence memory challenge',
    category: 'Puzzle',
    difficulty: 'Casual',
    players: '1 Player',
    avgTime: '2-5 min',
    iconName: 'Radio',
    gradient: 'from-emerald-500/20 to-transparent',
    accentColor: '#10b981',
    featured: true,
    description: 'Audiovisual sequence memory! 4 vibrant neon quadrants light up and produce synthesizer tones. Remember and repeat the ever-growing sequence!',
    rules: [
      'Observe the sequence of flashing colors and audio notes.',
      'Repeat the exact sequence in identical order.',
      'Each cleared round adds one more step to the chain!'
    ]
  },
  {
    id: 'mastermind',
    title: 'Mastermind Codebreaker',
    tagline: 'Crack the secret 4-color combination',
    category: 'Puzzle',
    difficulty: 'Intermediate',
    players: '1 Player',
    avgTime: '4-8 min',
    iconName: 'Key',
    gradient: 'from-amber-500/20 to-transparent',
    accentColor: '#f59e0b',
    featured: true,
    description: 'Legendary board game of codebreaking! Deduce the AI\'s secret 4-color combination using black (exact match) and white (wrong position) feedback pegs.',
    rules: [
      'Place 4 colored pegs on the active row and click Submit.',
      'Black peg = correct color in exact position.',
      'White peg = correct color in wrong position. Crack it within 10 turns!'
    ]
  },
  {
    id: 'bulls-and-cows',
    title: 'Bulls and Cows',
    tagline: '4-digit numerical codebreaking logic',
    category: 'Puzzle',
    difficulty: 'Intermediate',
    players: '1 Player',
    avgTime: '3-7 min',
    iconName: 'Hash',
    gradient: 'from-indigo-500/20 to-transparent',
    accentColor: '#6366f1',
    featured: true,
    description: 'The classic numerical deduction game! Guess the secret 4 unique digits. A Bull means right digit in right spot; a Cow means right digit in wrong spot.',
    rules: [
      'Enter a 4-digit guess with no repeated digits.',
      'Bull = Correct digit in correct position.',
      'Cow = Correct digit in wrong position. Get 4 Bulls to win!'
    ]
  },
  {
    id: 'nonogram',
    title: 'Nonogram Picross',
    tagline: 'Japanese picture logic puzzle grid',
    category: 'Puzzle',
    difficulty: 'Intermediate',
    players: '1 Player',
    avgTime: '3-8 min',
    iconName: 'Grid',
    gradient: 'from-cyan-500/20 to-transparent',
    accentColor: '#06b6d4',
    featured: true,
    description: 'Japanese picture logic puzzle! Use row and column numbers to deduce which cells to fill and which to cross out, revealing hidden pixel art.',
    rules: [
      'Numbers denote consecutive groups of filled cells in each row/column.',
      'Toggle Fill mode to color cells, Cross mode to mark empty spaces.',
      'Complete the picture to reveal the hidden sword!'
    ]
  },
  {
    id: 'lights-out',
    title: 'Lights Out',
    tagline: 'Toggle glowing cells until all are off',
    category: 'Puzzle',
    difficulty: 'Intermediate',
    players: '1 Player',
    avgTime: '2-5 min',
    iconName: 'Lightbulb',
    gradient: 'from-yellow-500/20 to-transparent',
    accentColor: '#eab308',
    featured: true,
    description: 'Addictive cyberpunk puzzle! Clicking any light toggles itself and its 4 adjacent neighbors. Solve the matrix in minimum moves.',
    rules: [
      'Clicking a cell flips it and its orthogonal neighbors (up, down, left, right).',
      'The objective is turning off every illuminated light on the grid.',
      'Multiple difficulties available from Casual to Hardcore!'
    ]
  },
  {
    id: 'math-battle',
    title: 'Math Battle Arena',
    tagline: 'Rapid mental arithmetic duel with combo streaks',
    category: 'Arcade',
    difficulty: 'Intermediate',
    players: '1 - 4 Players',
    avgTime: '2-4 min',
    iconName: 'Calculator',
    gradient: 'from-rose-500/20 to-transparent',
    accentColor: '#f43f5e',
    featured: true,
    description: 'Rapid-fire mental arithmetic showdown! Solve addition, subtraction, and multiplication problems in under 7 seconds to stack massive combo multipliers.',
    rules: [
      'Pick the correct answer among 4 choices before 7s expires.',
      'Fast correct answers grant time bonuses and streak multipliers.',
      'Outscore the bot or room rivals across 10 intense rounds!'
    ]
  },
  {
    id: 'logic-grid',
    title: 'Logic Grid Puzzle',
    tagline: 'Einstein deduction matrix for superheroes and cinema',
    category: 'Puzzle',
    difficulty: 'Hardcore',
    players: '1 Player',
    avgTime: '5-12 min',
    iconName: 'Brain',
    gradient: 'from-purple-500/20 to-transparent',
    accentColor: '#a855f7',
    featured: true,
    description: 'Einstein-style deduction puzzle! Match heroes to weapons and home cities by reading clues and systematically eliminating impossible pairings.',
    rules: [
      'Read clues and click cells to mark X (impossible) or O (confirmed).',
      'Cross out clues as you deduce relationships.',
      'Click Verify Deduction once all pairings are discovered!'
    ]
  },
  {
    id: 'pattern-recognition',
    title: 'Pattern Recognition IQ',
    tagline: 'Analyze visual & numerical sequences to find missing parts',
    category: 'Puzzle',
    difficulty: 'Intermediate',
    players: '1 Player',
    avgTime: '3-6 min',
    iconName: 'Network',
    gradient: 'from-teal-500/20 to-transparent',
    accentColor: '#14b8a6',
    featured: true,
    description: 'Inductive reasoning and IQ workout! Analyze numerical, geometric, and chromatic progressions to pick the missing symbol marked by ?.',
    rules: [
      'Spot the math or visual pattern in the sequence.',
      'Select the correct missing piece from 4 choices within 12s.',
      'Clear all 8 progressive puzzles to claim Master Solver rank!'
    ]
  },
  {
    id: 'daily-riddle',
    title: 'Daily Riddle Challenge',
    tagline: 'Brain teasers, enigmas and daily streak tracking',
    category: 'Puzzle',
    difficulty: 'Casual',
    players: '1 Player',
    avgTime: '2-5 min',
    iconName: 'Sparkles',
    gradient: 'from-amber-500/20 to-transparent',
    accentColor: '#f59e0b',
    featured: true,
    description: 'Mindbending daily riddles and lateral thinking enigmas! Unlock progressive clues, reveal letter tiles, and build your daily streak.',
    rules: [
      'Read the cryptic riddle carefully and type your answer.',
      'Unlock up to 2 helpful hints or reveal random letters.',
      'Solve daily to maintain your fire streak!'
    ]
  }
];
