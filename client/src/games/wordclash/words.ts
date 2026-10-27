// client/src/games/wordclash/words.ts

export type TileState = 'correct' | 'present' | 'absent' | 'empty';

export const TARGET_WORDS = [
  'CYBER', 'PIXEL', 'GHOST', 'LASER', 'ROBOT', 'BLITZ', 'QUEST', 'MAGIC',
  'SHARK', 'STORM', 'SWORD', 'VIPER', 'TITAN', 'CROWN', 'FLAME', 'NIGHT',
  'CHESS', 'SPACE', 'DREAM', 'POWER', 'RADAR', 'BLADE', 'FLASH', 'ORBIT',
  'SOLAR', 'NEXUS', 'PRISM', 'SONIC', 'TURBO', 'VALOR', 'FORGE', 'GLYPH',
  'PULSE', 'SPARK', 'TOXIN', 'VAULT', 'ARMOR', 'BEAST', 'CLASH', 'DRIVE',
  'FROST', 'GIANT', 'HAVOC', 'LOGIC', 'MATCH', 'NEON', 'OMEGA', 'PHASE',
  'QUICK', 'REIGN', 'STEEL', 'TRACK', 'VENOM', 'WRATH', 'YIELD', 'ZENITH'
];

export const VALID_GUESS_WORDS = new Set([
  ...TARGET_WORDS,
  'ABOUT', 'ABOVE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER',
  'AGAIN', 'AGENT', 'AGILE', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT',
  'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE', 'ALLOW', 'ALONE', 'ALONG', 'ALTER',
  'AMONG', 'ANGEL', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE', 'APPLY',
  'ARENA', 'ARGUE', 'ARISE', 'ARRAY', 'ARROW', 'ASIDE', 'ASSET', 'AUDIO',
  'AUDIT', 'AVOID', 'AWAIT', 'AWAKE', 'AWARD', 'AWARE', 'BADGE', 'BAKER',
  'BASIC', 'BASIS', 'BEACH', 'BEGIN', 'BEING', 'BELOW', 'BENCH', 'BLACK',
  'BLAME', 'BLANK', 'BLAST', 'BLEED', 'BLEND', 'BLOCK', 'BLOOD', 'BOARD',
  'BOOST', 'BRAIN', 'BRAVE', 'BREAD', 'BREAK', 'BRICK', 'BRIEF', 'BRING',
  'BROAD', 'BROWN', 'BUILD', 'BURST', 'BUYER', 'CABIN', 'CABLE', 'CANAL',
  'CANDY', 'CARGO', 'CARRY', 'CAUSE', 'CHAIN', 'CHAIR', 'CHAMP', 'CHART',
  'CHASE', 'CHEAP', 'CHECK', 'CHIEF', 'CHILD', 'CIVIL', 'CLAIM', 'CLASS',
  'CLEAN', 'CLEAR', 'CLICK', 'CLOCK', 'CLOSE', 'CLOUD', 'COACH', 'COAST',
  'COUNT', 'COURT', 'COVER', 'CRAFT', 'CRANE', 'CRASH', 'CRAZY', 'CREAM',
  'CRIME', 'CROSS', 'CROWD', 'CRUSH', 'CURVE', 'CYCLE', 'DAILY', 'DANCE',
  'DEATH', 'DEBUG', 'DELAY', 'DELTA', 'DENSE', 'DEPTH', 'DEVIL', 'DIGIT',
  'DIRTY', 'DISCO', 'DODGE', 'DOUBT', 'DRAFT', 'DRAIN', 'DRAWN', 'DRESS',
  'DRINK', 'DYING', 'EAGER', 'EARLY', 'EARTH', 'ELITE', 'EMPTY', 'ENEMY',
  'ENJOY', 'ENTER', 'ENTRY', 'EQUAL', 'ERROR', 'EVENT', 'EVERY', 'EXACT',
  'EXIST', 'EXTRA', 'FAINT', 'FAITH', 'FALSE', 'FAULT', 'FIBER', 'FIELD',
  'FIFTH', 'FIGHT', 'FINAL', 'FIRST', 'FIXED', 'FLEET', 'FLOAT', 'FLOOD',
  'FLOOR', 'FLUID', 'FOCUS', 'FORCE', 'FORTH', 'FRAME', 'FRESH', 'FRONT',
  'FRUIT', 'GLORY', 'GRAIN', 'GRAND', 'GRANT', 'GRAPE', 'GRASS', 'GREAT',
  'GREEN', 'GREET', 'GRIEF', 'GROUP', 'GUARD', 'GUESS', 'GUIDE', 'HABIT',
  'HAPPY', 'HEART', 'HEAVY', 'HONOR', 'HORSE', 'HOTEL', 'HOUSE', 'HUMAN',
  'IDEAL', 'IMAGE', 'INDEX', 'INNER', 'INPUT', 'ISSUE', 'JEWEL', 'JUDGE',
  'JUICE', 'KNIFE', 'KNOCK', 'LABEL', 'LABOR', 'LAYER', 'LEADY', 'LEARN',
  'LEASE', 'LEAST', 'LEMON', 'LEVEL', 'LIGHT', 'LIMIT', 'LIVER', 'LOCAL',
  'LODGE', 'LUCKY', 'LUNCH', 'MAJOR', 'MAKER', 'MARCH', 'MEDAL', 'MEDIA',
  'METAL', 'MIGHT', 'MINER', 'MODEL', 'MONEY', 'MONTH', 'MOTOR', 'MOUNT',
  'MOUSE', 'MOUTH', 'MOVIE', 'MUSIC', 'NERVE', 'NOBLE', 'NOISE', 'NORTH',
  'NOVEL', 'NURSE', 'OCEAN', 'OFFER', 'ORDER', 'OTHER', 'OUTER', 'OWNER',
  'PANEL', 'PANIC', 'PAPER', 'PARTY', 'PEACE', 'PILOT', 'PITCH', 'PIVOT',
  'PLACE', 'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'POINT', 'POUND', 'PRICE',
  'PRIDE', 'PRIME', 'PRINT', 'PRIZE', 'PROOF', 'PROUD', 'PROVE', 'QUEEN',
  'RADIO', 'RAISE', 'RALLY', 'RANGE', 'RAPID', 'RATIO', 'REACH', 'READY',
  'RIVER', 'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RULER', 'SCALE', 'SCENE',
  'SCOPE', 'SCORE', 'SEIZE', 'SENSE', 'SERVE', 'SEVEN', 'SHADE', 'SHAPE',
  'SHARE', 'SHIFT', 'SHINE', 'SHOCK', 'SHOOT', 'SIGHT', 'SKILL', 'SLATE',
  'SMART', 'SMILE', 'SMOKE', 'SOLID', 'SOLVE', 'SOUND', 'SOUTH', 'SPEED',
  'SPENT', 'SPIKE', 'SPINE', 'SPLIT', 'SPOKE', 'SPORT', 'SQUAD', 'STAFF',
  'STAGE', 'STAKE', 'STAND', 'STARE', 'START', 'STATE', 'STEAM', 'STICK',
  'STILL', 'STOCK', 'STONE', 'STORE', 'STUDY', 'STUFF', 'STYLE', 'SUGAR',
  'SUITE', 'SUPER', 'SWEET', 'TABLE', 'TAKEN', 'TASTE', 'TEACH', 'TERMS',
  'THEME', 'THICK', 'THING', 'THINK', 'THIRD', 'TIGER', 'TITLE', 'TODAY',
  'TOKEN', 'TOTAL', 'TOUCH', 'TOWER', 'TOXIC', 'TRAIN', 'TREAT', 'TREND',
  'TRIAL', 'TRIBE', 'TRICK', 'TRUCK', 'TRULY', 'TRUST', 'TRUTH', 'TWICE',
  'UNCLE', 'UNDER', 'UNION', 'UNITY', 'UNTIL', 'UPPER', 'UPSET', 'URBAN',
  'USAGE', 'VALID', 'VALUE', 'VIDEO', 'VIRUS', 'VISIT', 'VITAL', 'VOICE',
  'VOTER', 'WAGON', 'WASTE', 'WATCH', 'WATER', 'WHEEL', 'WHERE', 'WHICH',
  'WHITE', 'WHOLE', 'WIDOW', 'WINDY', 'WOMAN', 'WORLD', 'WORRY', 'WORSE',
  'WORST', 'WORTH', 'WOUND', 'WRITE', 'WRONG', 'YOUTH'
]);

export function getRandomTargetWord(): string {
  return TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)];
}

export function evaluateWordGuess(guess: string, target: string): TileState[] {
  const g = guess.toUpperCase();
  const t = target.toUpperCase();
  const result: TileState[] = Array(5).fill('absent');
  const targetCounts: Record<string, number> = {};

  // First pass: identify exact matches (correct)
  for (let i = 0; i < 5; i++) {
    if (g[i] === t[i]) {
      result[i] = 'correct';
    } else {
      targetCounts[t[i]] = (targetCounts[t[i]] || 0) + 1;
    }
  }

  // Second pass: identify present matches (yellow)
  for (let i = 0; i < 5; i++) {
    if (result[i] !== 'correct') {
      const letter = g[i];
      if (targetCounts[letter] && targetCounts[letter] > 0) {
        result[i] = 'present';
        targetCounts[letter]--;
      }
    }
  }

  return result;
}
