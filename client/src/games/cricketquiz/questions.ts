// client/src/games/cricketquiz/questions.ts

export interface CricketQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'World Cup' | 'IPL' | 'Legends' | 'Test Clashes' | 'Bowling Marvels' | 'Iconic Moments';
  difficulty: 'easy' | 'medium' | 'hard';
}

export const CRICKET_QUESTIONS: CricketQuestion[] = [
  // --- WORLD CUP HEROICS ---
  {
    id: 'wc-1',
    question: 'Who bowled the unforgettable final over of the 2007 ICC Men\'s T20 World Cup final against Pakistan?',
    options: ['Joginder Sharma', 'Sreesanth', 'Irfan Pathan', 'Harbhajan Singh'],
    correctIndex: 0,
    explanation: 'Joginder Sharma held his nerve in Johannesburg, having Misbah-ul-Haq caught by Sreesanth at fine-leg to seal India\'s maiden T20 World Cup triumph!',
    category: 'World Cup',
    difficulty: 'easy'
  },
  {
    id: 'wc-2',
    question: 'With which iconic shot did MS Dhoni seal India\'s 2011 ICC ODI World Cup win at the Wankhede Stadium?',
    options: ['Helicopter Six over Long-On', 'Straight Drive down the ground', 'Pull shot over Deep Square-Leg', 'Sweep shot over Fine-Leg'],
    correctIndex: 0,
    explanation: '"Dhoni finishes off in style! A magnificent strike into the crowd! India lift the World Cup after 28 years!" — Ravi Shastri\'s historic commentary.',
    category: 'World Cup',
    difficulty: 'easy'
  },
  {
    id: 'wc-3',
    question: 'What was Kapil Dev\'s legendary unbeaten individual score against Zimbabwe in the 1983 World Cup at Tunbridge Wells?',
    options: ['175*', '161*', '183*', '140*'],
    correctIndex: 0,
    explanation: 'India was reeling at 17/5 when captain Kapil Dev smashed 175* off 138 balls with 16 boundaries and 6 sixes, transforming India\'s World Cup campaign.',
    category: 'World Cup',
    difficulty: 'medium'
  },
  {
    id: 'wc-4',
    question: 'Who took the jaw-dropping boundary catch of David Miller in the 2024 T20 World Cup final in Barbados?',
    options: ['Suryakumar Yadav', 'Axar Patel', 'Hardik Pandya', 'Virat Kohli'],
    correctIndex: 0,
    explanation: 'Suryakumar Yadav executed a miraculous catch right on the boundary cushion in the final over, ensuring India clinched the 2024 T20 World Cup!',
    category: 'World Cup',
    difficulty: 'easy'
  },
  {
    id: 'wc-5',
    question: 'Who was named the Player of the Tournament in the 2011 ICC Cricket World Cup for his heroic all-round show?',
    options: ['Yuvraj Singh', 'Sachin Tendulkar', 'Zaheer Khan', 'MS Dhoni'],
    correctIndex: 0,
    explanation: 'Yuvraj Singh scored 362 runs and claimed 15 wickets with 4 Man-of-the-Match awards despite battling severe early illness.',
    category: 'World Cup',
    difficulty: 'easy'
  },
  {
    id: 'wc-6',
    question: 'Which Indian bowler picked up 7 wickets for 57 runs in the 2023 ICC World Cup semi-final against New Zealand?',
    options: ['Mohammed Shami', 'Jasprit Bumrah', 'Mohammed Siraj', 'Kuldeep Yadav'],
    correctIndex: 0,
    explanation: 'Mohammed Shami destroyed the Kiwi batting order with magnificent figures of 7/57 at Wankhede, finishing as the tournament\'s leading wicket-taker (24 wickets).',
    category: 'World Cup',
    difficulty: 'easy'
  },
  {
    id: 'wc-7',
    question: 'In the 2003 World Cup, Sachin Tendulkar played an immortal upper-cut six off which bowler at Centurion?',
    options: ['Shoaib Akhtar', 'Wasim Akram', 'Waqar Younis', 'Brett Lee'],
    correctIndex: 0,
    explanation: 'Sachin Tendulkar played a blistering upper cut over third man off Shoaib Akhtar\'s 150+ km/h thunderbolt, going on to score 98 off 75 balls.',
    category: 'World Cup',
    difficulty: 'medium'
  },
  {
    id: 'wc-8',
    question: 'Against which team did Chetan Sharma claim the first ever World Cup hat-trick for India in 1987?',
    options: ['New Zealand', 'Australia', 'Zimbabwe', 'England'],
    correctIndex: 0,
    explanation: 'Chetan Sharma bowled Ken Rutherford, Ian Smith, and Ewen Chatfield off consecutive deliveries at Nagpur in 1987.',
    category: 'World Cup',
    difficulty: 'hard'
  },

  // --- IPL MANIA ---
  {
    id: 'ipl-1',
    question: 'Which batsman holds the record for the highest individual score in IPL history (175* off 66 balls)?',
    options: ['Chris Gayle', 'Brendon McCullum', 'AB de Villiers', 'KL Rahul'],
    correctIndex: 0,
    explanation: 'Chris Gayle blasted 175* for Royal Challengers Bangalore against Pune Warriors India at M. Chinnaswamy Stadium in 2013, including 17 sixes!',
    category: 'IPL',
    difficulty: 'easy'
  },
  {
    id: 'ipl-2',
    question: 'Which franchise has won the joint-most 5 IPL trophies alongside Mumbai Indians?',
    options: ['Chennai Super Kings', 'Kolkata Knight Riders', 'Sunrisers Hyderabad', 'Rajasthan Royals'],
    correctIndex: 0,
    explanation: 'CSK under MS Dhoni joined Mumbai Indians at the pinnacle with 5 IPL titles by winning in 2010, 2011, 2018, 2021, and 2023.',
    category: 'IPL',
    difficulty: 'easy'
  },
  {
    id: 'ipl-3',
    question: 'Who hit 5 consecutive sixes in the final over for KKR to pull off an impossible victory against Gujarat Titans in 2023?',
    options: ['Rinku Singh', 'Andre Russell', 'Nitish Rana', 'Venkatesh Iyer'],
    correctIndex: 0,
    explanation: 'Rinku Singh smashed Yash Dayal for 5 consecutive sixes when KKR needed 28 runs from the final 5 balls, creating one of cricket\'s greatest finishes.',
    category: 'IPL',
    difficulty: 'easy'
  },
  {
    id: 'ipl-4',
    question: 'Who holds the record for scoring the most runs in a single IPL season (973 runs in 2016)?',
    options: ['Virat Kohli', 'David Warner', 'Jos Buttler', 'Shubman Gill'],
    correctIndex: 0,
    explanation: 'Virat Kohli set an astonishing record in 2016 with 973 runs in 16 innings, including 4 spectacular centuries at an average of 81.08.',
    category: 'IPL',
    difficulty: 'easy'
  },
  {
    id: 'ipl-5',
    question: 'Who won the first ever IPL title as captain of Rajasthan Royals in 2008?',
    options: ['Shane Warne', 'Graeme Smith', 'Shane Watson', 'Yusuf Pathan'],
    correctIndex: 0,
    explanation: 'The late legendary leg-spinner Shane Warne captained the underdog Rajasthan Royals to the inaugural IPL championship in 2008.',
    category: 'IPL',
    difficulty: 'medium'
  },
  {
    id: 'ipl-6',
    question: 'Who holds the record for the fastest 50 in IPL history (off just 13 balls)?',
    options: ['Yashasvi Jaiswal', 'KL Rahul', 'Pat Cummins', 'Nicholas Pooran'],
    correctIndex: 0,
    explanation: 'Yashasvi Jaiswal smashed a 13-ball half-century for Rajasthan Royals against Kolkata Knight Riders at Eden Gardens in 2023.',
    category: 'IPL',
    difficulty: 'medium'
  },
  {
    id: 'ipl-7',
    question: 'Which Indian bowler was the first to claim a hat-trick in the Indian Premier League in 2008?',
    options: ['Lakshmipathy Balaji', 'Amit Mishra', 'Yuvraj Singh', 'Pravin Tambe'],
    correctIndex: 0,
    explanation: 'L. Balaji of Chennai Super Kings took the first-ever IPL hat-trick against Kings XI Punjab on May 10, 2008.',
    category: 'IPL',
    difficulty: 'hard'
  },

  // --- LEGENDS & MILESTONES ---
  {
    id: 'leg-1',
    question: 'Against which country did Sachin Tendulkar score his 100th international century in 2012?',
    options: ['Bangladesh', 'Australia', 'England', 'Sri Lanka'],
    correctIndex: 0,
    explanation: 'Sachin Tendulkar etched his name forever in history by scoring his 100th international ton (114) against Bangladesh at Mirpur on March 16, 2012.',
    category: 'Legends',
    difficulty: 'easy'
  },
  {
    id: 'leg-2',
    question: 'What is Rohit Sharma\'s world record highest individual score in Men\'s ODI cricket?',
    options: ['264 runs', '209 runs', '208* runs', '237* runs'],
    correctIndex: 0,
    explanation: 'The Hitman smashed 264 runs off 173 balls against Sri Lanka at Eden Gardens in 2014, including 33 boundaries and 9 sixes!',
    category: 'Legends',
    difficulty: 'easy'
  },
  {
    id: 'leg-3',
    question: 'Who became the second bowler in Test history to take all 10 wickets in a single innings, doing so against Pakistan at Kotla?',
    options: ['Anil Kumble', 'Harbhajan Singh', 'Kapil Dev', 'Bishan Singh Bedi'],
    correctIndex: 0,
    explanation: 'Anil "Jumbo" Kumble took 10 wickets for 74 runs at Feroz Shah Kotla, Delhi, in February 1999 to bowl India to an emphatic 212-run victory.',
    category: 'Legends',
    difficulty: 'easy'
  },
  {
    id: 'leg-4',
    question: 'Against which bowler did Yuvraj Singh smash 6 sixes in an over during the 2007 T20 World Cup in Durban?',
    options: ['Stuart Broad', 'James Anderson', 'Andrew Flintoff', 'Paul Collingwood'],
    correctIndex: 0,
    explanation: 'After a heated war of words with Andrew Flintoff, Yuvraj Singh launched Stuart Broad for 6 consecutive sixes into the Durban night sky!',
    category: 'Legends',
    difficulty: 'easy'
  },
  {
    id: 'leg-5',
    question: 'Who scored India\'s first ever triple century (309) in Test cricket at Multan in 2004?',
    options: ['Virender Sehwag', 'Rahul Dravid', 'VVS Laxman', 'Sachin Tendulkar'],
    correctIndex: 0,
    explanation: 'Virender Sehwag famously reached his 300 with a six off Saqlain Mushtaq, earning the moniker "Sultan of Multan" with his 309.',
    category: 'Legends',
    difficulty: 'easy'
  },
  {
    id: 'leg-6',
    question: 'Which Indian batsman batted for 16 hours and scored 281 in the historic Eden Gardens Test of 2001 after following on?',
    options: ['VVS Laxman', 'Rahul Dravid', 'Sourav Ganguly', 'Sachin Tendulkar'],
    correctIndex: 0,
    explanation: 'VVS Laxman\'s sublime 281 and his 376-run stand with Rahul Dravid (180) staged cricket\'s greatest comeback against Steve Waugh\'s invincibles.',
    category: 'Test Clashes',
    difficulty: 'easy'
  },
  {
    id: 'leg-7',
    question: 'Who was the first Indian batsman to score a century in Test cricket in 1933?',
    options: ['Lala Amarnath', 'C.K. Nayudu', 'Vijay Merchant', 'Polly Umrigar'],
    correctIndex: 0,
    explanation: 'Lala Amarnath scored 118 against Douglas Jardine\'s England at Bombay Gymkhana in December 1933, India\'s inaugural Test hundred.',
    category: 'Legends',
    difficulty: 'hard'
  },

  // --- TEST CLASHES & GABBA HEROICS ---
  {
    id: 'test-1',
    question: 'Who hit the winning boundary through mid-off to breach Australia\'s 32-year fortress at the Gabba in Brisbane in 2021?',
    options: ['Rishabh Pant', 'Washington Sundar', 'Ajinkya Rahane', 'Shubman Gill'],
    correctIndex: 0,
    explanation: 'Rishabh Pant stroked Josh Hazlewood to the long-off boundary to score 89* as India chased down 328 on Day 5 to win the Border-Gavaskar Trophy!',
    category: 'Test Clashes',
    difficulty: 'easy'
  },
  {
    id: 'test-2',
    question: 'Who took India\'s first ever hat-trick in Test cricket during the 2001 Kolkata Test against Australia?',
    options: ['Harbhajan Singh', 'Anil Kumble', 'Zaheer Khan', 'Javagal Srinath'],
    correctIndex: 0,
    explanation: 'The "Turbanator" Harbhajan Singh dismissed Ricky Ponting, Adam Gilchrist, and Shane Warne in three consecutive balls at Eden Gardens.',
    category: 'Test Clashes',
    difficulty: 'medium'
  },
  {
    id: 'test-3',
    question: 'Which duo heroically batted out 259 deliveries on Day 5 with torn hamstrings to save the Sydney Test in 2021?',
    options: ['R. Ashwin & Hanuma Vihari', 'Cheteshwar Pujara & Ajinkya Rahane', 'Rishabh Pant & Wriddhiman Saha', 'Ravindra Jadeja & Washington Sundar'],
    correctIndex: 0,
    explanation: 'Hanuma Vihari (with a torn hamstring) and Ravichandran Ashwin (with severe back spasms) withstood fierce body blows to salvage an epic draw.',
    category: 'Test Clashes',
    difficulty: 'medium'
  },
  {
    id: 'test-4',
    question: 'Who was India\'s stand-in captain during the historic 2-1 Test series win in Australia in 2020-21 after the 36 all-out in Adelaide?',
    options: ['Ajinkya Rahane', 'Rohit Sharma', 'Cheteshwar Pujara', 'R. Ashwin'],
    correctIndex: 0,
    explanation: 'Ajinkya Rahane led the depleted Indian team with calm resolve, scoring a masterclass 112 at Melbourne and marshaling a legendary series comeback.',
    category: 'Test Clashes',
    difficulty: 'easy'
  },
  {
    id: 'test-5',
    question: 'Karun Nair scored an unbeaten 303* in Test cricket against which visiting team in Chennai in 2016?',
    options: ['England', 'Australia', 'South Africa', 'New Zealand'],
    correctIndex: 0,
    explanation: 'Karun Nair became only the second Indian after Virender Sehwag to score a Test triple ton, hitting 303* against Alastair Cook\'s England.',
    category: 'Test Clashes',
    difficulty: 'medium'
  },

  // --- BOWLING & FIELDING MARVELS ---
  {
    id: 'bowl-1',
    question: 'What is Jasprit Bumrah\'s signature deadly bowling weapon used in death overs and high-pressure situations?',
    options: ['Toe-crushing Yorkers', 'Doosra', 'Carrom Ball', 'Leg-cutter'],
    correctIndex: 0,
    explanation: 'Bumrah\'s pinpoint yorkers, lethal bouncers, and dipping slower balls make him one of the most feared pacers in world cricket history.',
    category: 'Bowling Marvels',
    difficulty: 'easy'
  },
  {
    id: 'bowl-2',
    question: 'Which Indian spinner invented the "Carrom Ball" flicked with the middle and ring fingers in modern cricket?',
    options: ['Ravichandran Ashwin', 'Harbhajan Singh', 'Kuldeep Yadav', 'Yuzvendra Chahal'],
    correctIndex: 0,
    explanation: 'R. Ashwin mastered the carrom ball variation early in his career, using it extensively in IPL and international cricket.',
    category: 'Bowling Marvels',
    difficulty: 'medium'
  },
  {
    id: 'bowl-3',
    question: 'Who is the highest wicket-taker for India in Test cricket history with 619 dismissals?',
    options: ['Anil Kumble', 'Ravichandran Ashwin', 'Kapil Dev', 'Harbhajan Singh'],
    correctIndex: 0,
    explanation: 'Anil Kumble stands atop India\'s all-time charts with 619 Test wickets in 132 matches, fourth highest in world cricket.',
    category: 'Bowling Marvels',
    difficulty: 'easy'
  },
  {
    id: 'bowl-4',
    question: 'Which Indian fielder holds the reputation for the fastest direct hits from deep point and cover, nicknamed "Sir"?',
    options: ['Ravindra Jadeja', 'Suresh Raina', 'Mohammad Kaif', 'Yuvraj Singh'],
    correctIndex: 0,
    explanation: 'Ravindra Jadeja\'s bullet arm and unerring direct hits have effected dozens of game-changing runouts at the highest level.',
    category: 'Bowling Marvels',
    difficulty: 'easy'
  },
  {
    id: 'bowl-5',
    question: 'Against which team did Stuart Binny record the best bowling figures by an Indian in ODI history (6 wickets for 4 runs)?',
    options: ['Bangladesh', 'Zimbabwe', 'Sri Lanka', 'Kenya'],
    correctIndex: 0,
    explanation: 'Stuart Binny ripped through Bangladesh in Dhaka in 2014, defending a low total of 105 with spellbinding figures of 6/4 in 4.4 overs!',
    category: 'Bowling Marvels',
    difficulty: 'hard'
  },

  // --- ICONIC MOMENTS & MEMORIES ---
  {
    id: 'icon-1',
    question: 'Where did Sourav Ganguly wave his jersey from the balcony after India won the NatWest Series final in 2002?',
    options: ['Lord\'s, London', 'The Oval, London', 'Edgbaston, Birmingham', 'Trent Bridge, Nottingham'],
    correctIndex: 0,
    explanation: 'Dada famously twirled his India shirt on the Lord\'s balcony celebrating Kaif & Yuvraj chasing down 326 against England.',
    category: 'Iconic Moments',
    difficulty: 'easy'
  },
  {
    id: 'icon-2',
    question: 'In the 2022 T20 World Cup at Melbourne, Virat Kohli hit an astonishing back-foot straight six off which Pakistani pacer?',
    options: ['Haris Rauf', 'Shaheen Shah Afridi', 'Naseem Shah', 'Shadab Khan'],
    correctIndex: 0,
    explanation: 'Needing 28 off 8 balls, Kohli stood tall and punched Haris Rauf back over his head for an impossible six straight down the ground, followed by a flick for six!',
    category: 'Iconic Moments',
    difficulty: 'easy'
  },
  {
    id: 'icon-3',
    question: 'Which Indian wicketkeeper pulled off an iconic 1-shoe sprint and run-out off the last ball against Bangladesh in the 2016 World T20?',
    options: ['MS Dhoni', 'Dinesh Karthik', 'Rishabh Pant', 'Parthiv Patel'],
    correctIndex: 0,
    explanation: 'With 2 runs needed off 1 ball, Dhoni took off his right glove, collected the ball, and sprinted down the pitch to break the stumps by inches!',
    category: 'Iconic Moments',
    difficulty: 'easy'
  },
  {
    id: 'icon-4',
    question: 'Who scored 87* and teamed up with Yuvraj Singh (69) to pull off the NatWest 2002 final chase from 146/5?',
    options: ['Mohammad Kaif', 'Dinesh Mongia', 'Rahul Dravid', 'Ajit Agarkar'],
    correctIndex: 0,
    explanation: 'Mohammad Kaif was awarded Man of the Match for his heroic unbeaten 87 under immense pressure at Lord\'s.',
    category: 'Iconic Moments',
    difficulty: 'medium'
  },
  {
    id: 'icon-5',
    question: 'Who was the first Indian cricketer to hit a double century in an ODI match (Gwalior, 2010)?',
    options: ['Sachin Tendulkar', 'Virender Sehwag', 'Rohit Sharma', 'Virat Kohli'],
    correctIndex: 0,
    explanation: '"The first man on the planet to reach 200, and it\'s the superman from India — Sachin Tendulkar!" — Ravi Shastri as Sachin made 200* vs South Africa.',
    category: 'Legends',
    difficulty: 'easy'
  },
  {
    id: 'icon-6',
    question: 'Who took a stunning running catch backwards to dismiss Viv Richards in the 1983 World Cup Final at Lord\'s?',
    options: ['Kapil Dev', 'Mohinder Amarnath', 'Roger Binny', 'Madan Lal'],
    correctIndex: 0,
    explanation: 'Kapil Dev ran back 20 yards towards the boundary over his shoulder, holding on to a skied hook from Viv Richards to turn the match on its head.',
    category: 'World Cup',
    difficulty: 'easy'
  },
  {
    id: 'icon-7',
    question: 'Who scored 183 against Sri Lanka in Jaipur (2005), which remains the highest score by a wicket-keeper in ODI history?',
    options: ['MS Dhoni', 'Adam Gilchrist', 'Kumar Sangakkara', 'Quinton de Kock'],
    correctIndex: 0,
    explanation: 'Batting at number 3 with his long hair, MS Dhoni plundered 15 boundaries and 10 towering sixes to steer India to an easy chase of 299.',
    category: 'Legends',
    difficulty: 'easy'
  },
  {
    id: 'icon-8',
    question: 'Which Indian bowler holds the record for taking the most wickets in a single edition of an ICC Men\'s T20 World Cup (15 wickets in 2024)?',
    options: ['Arshdeep Singh', 'Jasprit Bumrah', 'Axar Patel', 'Kuldeep Yadav'],
    correctIndex: 0,
    explanation: 'Arshdeep Singh took 17 wickets (joint top with Fazalhaq Farooqi) in the 2024 ICC T20 World Cup, playing a pivotal role in India\'s championship.',
    category: 'Bowling Marvels',
    difficulty: 'medium'
  }
];

export function getRandomQuestions(count: number = 10): CricketQuestion[] {
  const shuffled = [...CRICKET_QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
