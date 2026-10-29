// client/src/games/antakshari/songs.ts

export interface BollywoodSong {
  id: string;
  title: string;
  openingLyrics: string;
  movie: string;
  year: number;
  singers: string;
  startingLetter: string; // e.g. "M", "K", "D", "A", etc.
  endingLetter: string;   // the letter the song ends on
  hindiChar: string;      // e.g. "म", "क", "द", etc.
}

export const BOLLYWOOD_SONGS: BollywoodSong[] = [
  // --- M / म ---
  {
    id: 'm-1',
    title: 'Mere Sapno Ki Rani',
    openingLyrics: 'Mere sapno ki rani kab aayegi tu, aayi rut mastaani kab aayegi tu...',
    movie: 'Aradhana',
    year: 1969,
    singers: 'Kishore Kumar',
    startingLetter: 'M',
    endingLetter: 'T',
    hindiChar: 'म'
  },
  {
    id: 'm-2',
    title: 'Mehndi Laga Ke Rakhna',
    openingLyrics: 'Mehndi laga ke rakhna, doli saja ke rakhna, lene tujhe o gori aayenge tere sajna...',
    movie: 'Dilwale Dulhania Le Jayenge',
    year: 1995,
    singers: 'Lata Mangeshkar, Udit Narayan',
    startingLetter: 'M',
    endingLetter: 'N',
    hindiChar: 'म'
  },
  {
    id: 'm-3',
    title: 'Main Agar Kahoon',
    openingLyrics: 'Main agar kahoon tumsa haseen qayamat bhi ho toh bewajah...',
    movie: 'Om Shanti Om',
    year: 2007,
    singers: 'Sonu Nigam, Shreya Ghoshal',
    startingLetter: 'M',
    endingLetter: 'H',
    hindiChar: 'म'
  },
  {
    id: 'm-4',
    title: 'Maa Tujhe Salaam',
    openingLyrics: 'Yahan wahan saara jahan dekh liya, ab tak bhi tere jaisa koi nahi...',
    movie: 'Vande Mataram',
    year: 1997,
    singers: 'A.R. Rahman',
    startingLetter: 'M',
    endingLetter: 'H',
    hindiChar: 'म'
  },

  // --- K / क ---
  {
    id: 'k-1',
    title: 'Kabhi Kabhie Mere Dil Mein',
    openingLyrics: 'Kabhi kabhie mere dil mein khayal aata hai, ki jaise tujhko banaya gaya hai mere liye...',
    movie: 'Kabhi Kabhie',
    year: 1976,
    singers: 'Mukesh, Lata Mangeshkar',
    startingLetter: 'K',
    endingLetter: 'Y',
    hindiChar: 'क'
  },
  {
    id: 'k-2',
    title: 'Kal Ho Naa Ho',
    openingLyrics: 'Har ghadi badal rahi hai roop zindagi, chhaanv hai kabhi kabhi hai dhoop zindagi...',
    movie: 'Kal Ho Naa Ho',
    year: 2003,
    singers: 'Sonu Nigam',
    startingLetter: 'K',
    endingLetter: 'G',
    hindiChar: 'क'
  },
  {
    id: 'k-3',
    title: 'Kesariya',
    openingLyrics: 'Kesariya tera ishq hai piya, rang jaaun jo main haath lagaun...',
    movie: 'Brahmastra',
    year: 2022,
    singers: 'Arijit Singh',
    startingLetter: 'K',
    endingLetter: 'N',
    hindiChar: 'क'
  },
  {
    id: 'k-4',
    title: 'Kuch Kuch Hota Hai',
    openingLyrics: 'Tum paas aaye, yun muskuraaye, tumne na jaane kya sapne dikhaaye...',
    movie: 'Kuch Kuch Hota Hai',
    year: 1998,
    singers: 'Udit Narayan, Alka Yagnik',
    startingLetter: 'K',
    endingLetter: 'Y',
    hindiChar: 'क'
  },

  // --- D / द ---
  {
    id: 'd-1',
    title: 'Dil Deewana',
    openingLyrics: 'Dil deewana bin sajna ke maane na, ye pagla hai samjhaane se samjhe na...',
    movie: 'Maine Pyar Kiya',
    year: 1989,
    singers: 'S.P. Balasubrahmanyam, Lata Mangeshkar',
    startingLetter: 'D',
    endingLetter: 'N',
    hindiChar: 'द'
  },
  {
    id: 'd-2',
    title: 'Dil Se Re',
    openingLyrics: 'Dil se re... dil se re... ek sooraj nikla tha, kuch paara pighla tha...',
    movie: 'Dil Se..',
    year: 1998,
    singers: 'A.R. Rahman',
    startingLetter: 'D',
    endingLetter: 'R',
    hindiChar: 'द'
  },
  {
    id: 'd-3',
    title: 'Deewani Mastani',
    openingLyrics: 'Nazar jo teri laagi main deewani ho gayi, deewani haan deewani mastani ho gayi...',
    movie: 'Bajirao Mastani',
    year: 2015,
    singers: 'Shreya Ghoshal',
    startingLetter: 'D',
    endingLetter: 'Y',
    hindiChar: 'द'
  },
  {
    id: 'd-4',
    title: 'Dum Maro Dum',
    openingLyrics: 'Dum maro dum, mit jaaye gham, bolo subah shaam hare Krishna hare Ram...',
    movie: 'Hare Rama Hare Krishna',
    year: 1971,
    singers: 'Asha Bhosle',
    startingLetter: 'D',
    endingLetter: 'M',
    hindiChar: 'द'
  },

  // --- T / त / ट ---
  {
    id: 't-1',
    title: 'Tujhe Dekha Toh Yeh Jaana Sanam',
    openingLyrics: 'Tujhe dekha toh yeh jaana sanam, pyaar hota hai deewana sanam...',
    movie: 'Dilwale Dulhania Le Jayenge',
    year: 1995,
    singers: 'Kumar Sanu, Lata Mangeshkar',
    startingLetter: 'T',
    endingLetter: 'M',
    hindiChar: 'त'
  },
  {
    id: 't-2',
    title: 'Tum Hi Ho',
    openingLyrics: 'Hum tere bin ab reh nahi sakte, tere bina kya wajood mera...',
    movie: 'Aashiqui 2',
    year: 2013,
    singers: 'Arijit Singh',
    startingLetter: 'T',
    endingLetter: 'R',
    hindiChar: 'त'
  },
  {
    id: 't-3',
    title: 'Tera Ban Jaunga',
    openingLyrics: 'Meri raahein tere tak hain, tujhpe hi toh mera haq hai...',
    movie: 'Kabir Singh',
    year: 2019,
    singers: 'Akhil Sachdeva, Tulsi Kumar',
    startingLetter: 'T',
    endingLetter: 'H',
    hindiChar: 'त'
  },
  {
    id: 't-4',
    title: 'Tadap Tadap Ke',
    openingLyrics: 'Tadap tadap ke is dil se aah nikalti rahi, mujhko saza di pyaar ki...',
    movie: 'Hum Dil De Chuke Sanam',
    year: 1999,
    singers: 'KK',
    startingLetter: 'T',
    endingLetter: 'K',
    hindiChar: 'त'
  },

  // --- R / र ---
  {
    id: 'r-1',
    title: 'Roop Tera Mastana',
    openingLyrics: 'Roop tera mastana pyaar mera deewana, bhool koi humse na ho jaaye...',
    movie: 'Aradhana',
    year: 1969,
    singers: 'Kishore Kumar',
    startingLetter: 'R',
    endingLetter: 'Y',
    hindiChar: 'र'
  },
  {
    id: 'r-2',
    title: 'Raabta',
    openingLyrics: 'Kehte hain khuda ne iss jahan mein sabhi ke liye kisi na kisi ko hai banaya...',
    movie: 'Agent Vinod',
    year: 2012,
    singers: 'Arijit Singh, Hamsika Iyer',
    startingLetter: 'R',
    endingLetter: 'Y',
    hindiChar: 'र'
  },
  {
    id: 'r-3',
    title: 'Rang De Basanti',
    openingLyrics: 'Thodi si dhool meri dharti ki meri jaan hai, kaanpe bilkul na chhati ye shaan hai...',
    movie: 'Rang De Basanti',
    year: 2006,
    singers: 'Daler Mehndi, K.S. Chithra',
    startingLetter: 'R',
    endingLetter: 'H',
    hindiChar: 'र'
  },
  {
    id: 'r-4',
    title: 'Rimjhim Gire Saawan',
    openingLyrics: 'Rimjhim gire saawan, sulag sulag jaaye mann, bheege aaj is mausam mein...',
    movie: 'Manzil',
    year: 1979,
    singers: 'Kishore Kumar, Lata Mangeshkar',
    startingLetter: 'R',
    endingLetter: 'N',
    hindiChar: 'र'
  },

  // --- Y / य ---
  {
    id: 'y-1',
    title: 'Yeh Shaam Mastani',
    openingLyrics: 'Yeh shaam mastani madhosh kiye jaaye, mujhe dor koi kheenche teri ore liye jaaye...',
    movie: 'Kati Patang',
    year: 1971,
    singers: 'Kishore Kumar',
    startingLetter: 'Y',
    endingLetter: 'Y',
    hindiChar: 'य'
  },
  {
    id: 'y-2',
    title: 'Yeh Dosti Hum Nahi Todenge',
    openingLyrics: 'Yeh dosti hum nahi todenge, todenge dum magar tera saath na chhodenge...',
    movie: 'Sholay',
    year: 1975,
    singers: 'Kishore Kumar, Manna Dey',
    startingLetter: 'Y',
    endingLetter: 'G',
    hindiChar: 'य'
  },
  {
    id: 'y-3',
    title: 'Yaaron Dosti Badi Hi Haseen Hai',
    openingLyrics: 'Yaaron dosti badi hi haseen hai, yeh na ho toh kya phir zindagi hai...',
    movie: 'Pal (Album)',
    year: 1999,
    singers: 'KK',
    startingLetter: 'Y',
    endingLetter: 'H',
    hindiChar: 'य'
  },

  // --- G / ग ---
  {
    id: 'g-1',
    title: 'Gulabi Aankhen',
    openingLyrics: 'Gulabi aankhen jo teri dekhi, sharabi yeh dil ho gaya, sambhaalo mujhko o mere yaaron...',
    movie: 'The Train',
    year: 1970,
    singers: 'Mohammed Rafi',
    startingLetter: 'G',
    endingLetter: 'R',
    hindiChar: 'ग'
  },
  {
    id: 'g-2',
    title: 'Ghungroo',
    openingLyrics: 'Kyun lamhe kharaab karein, aa ghalti behisaab karein, do pal ki jo neend udi...',
    movie: 'War',
    year: 2019,
    singers: 'Arijit Singh, Shilpa Rao',
    startingLetter: 'G',
    endingLetter: 'D',
    hindiChar: 'ग'
  },
  {
    id: 'g-3',
    title: 'Gerua',
    openingLyrics: 'Dhoop se nikalke, chhaanv se bhatakke, hum mile jahan par lamha thum gaya...',
    movie: 'Dilwale',
    year: 2015,
    singers: 'Arijit Singh, Antara Mitra',
    startingLetter: 'G',
    endingLetter: 'Y',
    hindiChar: 'ग'
  },

  // --- A / आ / अ ---
  {
    id: 'a-1',
    title: 'Aap Jaisa Koi',
    openingLyrics: 'Aap jaisa koi meri zindagi mein aaye toh baat ban jaaye, haan haan baat ban jaaye...',
    movie: 'Qurbani',
    year: 1980,
    singers: 'Nazia Hassan',
    startingLetter: 'A',
    endingLetter: 'Y',
    hindiChar: 'आ'
  },
  {
    id: 'a-2',
    title: 'Ae Mere Humsafar',
    openingLyrics: 'Ae mere humsafar ek zara intezaar, sun sadaayein de rahi hain manzil pyaar ki...',
    movie: 'Qayamat Se Qayamat Tak',
    year: 1988,
    singers: 'Udit Narayan, Alka Yagnik',
    startingLetter: 'A',
    endingLetter: 'K',
    hindiChar: 'ऐ'
  },
  {
    id: 'a-3',
    title: 'Apna Bana Le',
    openingLyrics: 'Tu mera koi na hoke bhi kuch laage, apna bana le piya, apna bana le piya...',
    movie: 'Bhediya',
    year: 2022,
    singers: 'Arijit Singh',
    startingLetter: 'A',
    endingLetter: 'Y',
    hindiChar: 'अ'
  },
  {
    id: 'a-4',
    title: 'Aankh Marey',
    openingLyrics: 'O ladki aankh marey, aankh marey o ladki aankh marey...',
    movie: 'Simmba',
    year: 2018,
    singers: 'Neha Kakkar, Mika Singh',
    startingLetter: 'A',
    endingLetter: 'Y',
    hindiChar: 'आ'
  },

  // --- H / ह ---
  {
    id: 'h-1',
    title: 'Humein Tumse Pyaar Kitna',
    openingLyrics: 'Humein tumse pyaar kitna yeh hum nahi jaante, magar jee nahi sakte tumhare bina...',
    movie: 'Kudrat',
    year: 1981,
    singers: 'Kishore Kumar',
    startingLetter: 'H',
    endingLetter: 'N',
    hindiChar: 'ह'
  },
  {
    id: 'h-2',
    title: 'Hawayein',
    openingLyrics: 'Tujhko... main rakh loon wahan, jahan pe kahin hai mera yaqeen...',
    movie: 'Jab Harry Met Sejal',
    year: 2017,
    singers: 'Arijit Singh',
    startingLetter: 'H',
    endingLetter: 'N',
    hindiChar: 'ह'
  },
  {
    id: 'h-3',
    title: 'Humma Humma',
    openingLyrics: 'Ek ho gaye hum aur tum, humma humma, to udd gayi ninde re...',
    movie: 'Bombay',
    year: 1995,
    singers: 'Remo Fernandes, A.R. Rahman',
    startingLetter: 'H',
    endingLetter: 'R',
    hindiChar: 'ह'
  },

  // --- N / न ---
  {
    id: 'n-1',
    title: 'Neele Neele Ambar Par',
    openingLyrics: 'Neele neele ambar par chaand jab aaye, pyaar barsaaye humko tarsaaye...',
    movie: 'Kalaakaar',
    year: 1983,
    singers: 'Kishore Kumar',
    startingLetter: 'N',
    endingLetter: 'Y',
    hindiChar: 'न'
  },
  {
    id: 'n-2',
    title: 'Naina Da Kya Kasoor',
    openingLyrics: 'Dil ko thoda sambhaal kalandar, naina da kya kasoor...',
    movie: 'Andhadhun',
    year: 2018,
    singers: 'Amit Trivedi',
    startingLetter: 'N',
    endingLetter: 'R',
    hindiChar: 'न'
  },
  {
    id: 'n-3',
    title: 'Na Tum Jaano Na Hum',
    openingLyrics: 'Kyun chalti hai pawan? Kyun jhoome hai gagan? Na tum jaano na hum...',
    movie: 'Kaho Naa... Pyaar Hai',
    year: 2000,
    singers: 'Lucky Ali',
    startingLetter: 'N',
    endingLetter: 'M',
    hindiChar: 'न'
  },

  // --- P / प ---
  {
    id: 'p-1',
    title: 'Pehla Nasha',
    openingLyrics: 'Chaahe tum kuch na kaho maine sun liya, pehla nasha pehla khumaar...',
    movie: 'Jo Jeeta Wohi Sikandar',
    year: 1992,
    singers: 'Udit Narayan, Sadhana Sargam',
    startingLetter: 'P',
    endingLetter: 'R',
    hindiChar: 'प'
  },
  {
    id: 'p-2',
    title: 'Pal Pal Dil Ke Paas',
    openingLyrics: 'Pal pal dil ke paas tum rehti ho, jeevan meethi pyaas yeh kehti ho...',
    movie: 'Blackmail',
    year: 1973,
    singers: 'Kishore Kumar',
    startingLetter: 'P',
    endingLetter: 'H',
    hindiChar: 'प'
  },
  {
    id: 'p-3',
    title: 'Pee Loon',
    openingLyrics: 'Tere sang ishq pe chalte hain, pee loon tere neele neele naino se shabnam...',
    movie: 'Once Upon a Time in Mumbaai',
    year: 2010,
    singers: 'Mohit Chauhan',
    startingLetter: 'P',
    endingLetter: 'M',
    hindiChar: 'प'
  },

  // --- S / स ---
  {
    id: 's-1',
    title: 'Suraj Hua Maddham',
    openingLyrics: 'Suraj hua maddham, chaand jalne laga, aasmaan yeh haaye kyon pighalne laga...',
    movie: 'Kabhi Khushi Kabhie Gham',
    year: 2001,
    singers: 'Sonu Nigam, Alka Yagnik',
    startingLetter: 'S',
    endingLetter: 'G',
    hindiChar: 'स'
  },
  {
    id: 's-2',
    title: 'Senorita',
    openingLyrics: 'Kiske roop pe marte ho tum, kiski aashiqui mein jeete ho tum...',
    movie: 'Zindagi Na Milegi Dobara',
    year: 2011,
    singers: 'Farhan Akhtar, Hrithik Roshan, Abhay Deol',
    startingLetter: 'S',
    endingLetter: 'M',
    hindiChar: 'स'
  },
  {
    id: 's-3',
    title: 'Shayad',
    openingLyrics: 'Shayad kabhi na keh sakoon main tumko, kahe bina samajh lo tum shayad...',
    movie: 'Love Aaj Kal',
    year: 2020,
    singers: 'Arijit Singh',
    startingLetter: 'S',
    endingLetter: 'D',
    hindiChar: 'स'
  },

  // --- B / ब ---
  {
    id: 'b-1',
    title: 'Badtameez Dil',
    openingLyrics: 'Badtameez dil maane na, maane na, paan mein pudina dekha...',
    movie: 'Yeh Jawaani Hai Deewani',
    year: 2013,
    singers: 'Benny Dayal',
    startingLetter: 'B',
    endingLetter: 'K',
    hindiChar: 'ब'
  },
  {
    id: 'b-2',
    title: 'Bole Chudiyan',
    openingLyrics: 'Bole chudiyan bole kangna, haaye main ho gayi teri saajna...',
    movie: 'Kabhi Khushi Kabhie Gham',
    year: 2001,
    singers: 'Amit Kumar, Sonu Nigam, Alka Yagnik',
    startingLetter: 'B',
    endingLetter: 'N',
    hindiChar: 'ब'
  },
  {
    id: 'b-3',
    title: 'Bulleya',
    openingLyrics: 'Meri rooh ka parinda phadphadaaye, lekin sukoon ka jazeera mil na paaye...',
    movie: 'Ae Dil Hai Mushkil',
    year: 2016,
    singers: 'Amit Mishra, Shilpa Rao',
    startingLetter: 'B',
    endingLetter: 'Y',
    hindiChar: 'ब'
  },

  // --- J / ज ---
  {
    id: 'j-1',
    title: 'Jai Ho',
    openingLyrics: 'Jai ho, jai ho! Aaja aaja jind shamiyane ke tale, aaja jariwaale neele aasmaan ke tale...',
    movie: 'Slumdog Millionaire',
    year: 2008,
    singers: 'A.R. Rahman, Sukhwinder Singh',
    startingLetter: 'J',
    endingLetter: 'L',
    hindiChar: 'ज'
  },
  {
    id: 'j-2',
    title: 'Jashn-e-Bahara',
    openingLyrics: 'Kehne ko Jashn-e-bahara hai, ishq yeh dekhke hairaan hai...',
    movie: 'Jodhaa Akbar',
    year: 2008,
    singers: 'Javed Ali',
    startingLetter: 'J',
    endingLetter: 'N',
    hindiChar: 'ज'
  },
  {
    id: 'j-3',
    title: 'Jab Koi Baat Bigad Jaaye',
    openingLyrics: 'Jab koi baat bigad jaaye, jab koi mushkil pad jaaye, tum dena saath mera...',
    movie: 'Jurm',
    year: 1990,
    singers: 'Kumar Sanu, Sadhana Sargam',
    startingLetter: 'J',
    endingLetter: 'R',
    hindiChar: 'ज'
  },

  // --- CH / च ---
  {
    id: 'ch-1',
    title: 'Chaiyya Chaiyya',
    openingLyrics: 'Jinke sar ho ishq ki chhaanv, paanv ke tale jannat hogi, chal chaiyya chaiyya...',
    movie: 'Dil Se..',
    year: 1998,
    singers: 'Sukhwinder Singh, Sapna Awasthi',
    startingLetter: 'C',
    endingLetter: 'Y',
    hindiChar: 'च'
  },
  {
    id: 'ch-2',
    title: 'Channa Mereya',
    openingLyrics: 'Acha chalta hoon duaon mein yaad rakhna, mere zikr ka zubaan pe swaad rakhna...',
    movie: 'Ae Dil Hai Mushkil',
    year: 2016,
    singers: 'Arijit Singh',
    startingLetter: 'C',
    endingLetter: 'N',
    hindiChar: 'च'
  },
  {
    id: 'ch-3',
    title: 'Chura Ke Dil Mera',
    openingLyrics: 'Chura ke dil mera goriya chali, chura ke dil mera goriya chali...',
    movie: 'Main Khiladi Tu Anari',
    year: 1994,
    singers: 'Kumar Sanu, Alka Yagnik',
    startingLetter: 'C',
    endingLetter: 'L',
    hindiChar: 'च'
  }
];

export function getSongsForLetter(letter: string): BollywoodSong[] {
  const norm = letter.toUpperCase();
  return BOLLYWOOD_SONGS.filter(s => s.startingLetter.toUpperCase() === norm);
}

export function searchSongs(query: string, letter?: string): BollywoodSong[] {
  const q = query.trim().toLowerCase();
  let pool = BOLLYWOOD_SONGS;
  if (letter) {
    const l = letter.toUpperCase();
    pool = pool.filter(s => s.startingLetter.toUpperCase() === l);
  }
  if (!q) return pool;
  return pool.filter(
    s =>
      s.title.toLowerCase().includes(q) ||
      s.openingLyrics.toLowerCase().includes(q) ||
      s.movie.toLowerCase().includes(q) ||
      s.singers.toLowerCase().includes(q)
  );
}
