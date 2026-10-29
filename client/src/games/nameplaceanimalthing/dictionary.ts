// client/src/games/nameplaceanimalthing/dictionary.ts

export interface NPATEntry {
  names: string[];
  places: string[];
  animals: string[];
  things: string[];
}

export const NPAT_DICTIONARY: Record<string, NPATEntry> = {
  A: {
    names: ['Aarav', 'Ananya', 'Amit', 'Aditi', 'Akash', 'Amrita', 'Arjun', 'Ashwin', 'Ayesha', 'Alok'],
    places: ['Agra', 'Ahmedabad', 'Amritsar', 'Amsterdam', 'Athens', 'Austin', 'Assam', 'Australia'],
    animals: ['Alligator', 'Ant', 'Anteater', 'Antelope', 'Ape', 'Armadillo', 'Albatross', 'Asiatic Lion'],
    things: ['Apple', 'Aeroplane', 'Almirah', 'Anchor', 'Anklet', 'Arrow', 'Axe', 'Abacus']
  },
  B: {
    names: ['Bharat', 'Bhavna', 'Bhuvan', 'Balram', 'Bikram', 'Babita', 'Brijesh', 'Bindu', 'Bobby', 'Bimal'],
    places: ['Bengaluru', 'Bhopal', 'Bhubaneswar', 'Berlin', 'Boston', 'Bangkok', 'Bihar', 'Brussels'],
    animals: ['Bengal Tiger', 'Bear', 'Baboon', 'Bat', 'Beaver', 'Bee', 'Bison', 'Buffalo', 'Bull'],
    things: ['Bat', 'Ball', 'Book', 'Bottle', 'Bicycle', 'Bell', 'Bag', 'Bucket', 'Bangle', 'Blanket']
  },
  C: {
    names: ['Chetan', 'Charu', 'Chirag', 'Chandani', 'Chaya', 'Chanchal', 'Cyrus', 'Chaitanya', 'Catherine'],
    places: ['Chennai', 'Chandigarh', 'Coimbatore', 'Cairo', 'Chicago', 'Colombo', 'Canada', 'Chile'],
    animals: ['Cat', 'Camel', 'Chameleon', 'Cheetah', 'Chimpanzee', 'Cobra', 'Crocodile', 'Crab', 'Cow'],
    things: ['Car', 'Chair', 'Clock', 'Camera', 'Computer', 'Cup', 'Comb', 'Candle', 'Coin', 'Cap']
  },
  D: {
    names: ['Diya', 'Deepak', 'Dhruv', 'Devika', 'Dinesh', 'Divya', 'Dharmendra', 'Damini', 'Darshan'],
    places: ['Delhi', 'Dehradun', 'Dhanbad', 'Dubai', 'Dublin', 'Dallas', 'Denmark', 'Doha', 'Darjeeling'],
    animals: ['Dog', 'Deer', 'Dolphin', 'Donkey', 'Duck', 'Dragonfly', 'Dingo', 'Dove'],
    things: ['Door', 'Drum', 'Dice', 'Desk', 'Dress', 'Doll', 'Diary', 'Dumbbell', 'Diya', 'Duster']
  },
  E: {
    names: ['Esha', 'Ekta', 'Eshan', 'Elina', 'Eswar', 'Evelyn', 'Ethan', 'Emran', 'Eklavya'],
    places: ['Ernakulam', 'Edinburgh', 'Egypt', 'Ecuador', 'Ethiopia', 'England', 'Eluru', 'Erode'],
    animals: ['Elephant', 'Eagle', 'Eel', 'Emu', 'Elk', 'Earthworm', 'Falcon', 'Echidna'],
    things: ['Eraser', 'Envelope', 'Engine', 'Earring', 'Egg', 'Easel', 'Extinguisher', 'Echo']
  },
  F: {
    names: ['Farhan', 'Fatima', 'Faisal', 'Falguni', 'Farida', 'Felix', 'Feroz', 'Flora', 'Frank'],
    places: ['Faridabad', 'Frankfurt', 'Fiji', 'France', 'Finland', 'Florida', 'Florence', 'Fatehpur'],
    animals: ['Fox', 'Frog', 'Flamingo', 'Falcon', 'Ferret', 'Fly', 'Firefly', 'Fish'],
    things: ['Fan', 'Fork', 'Flute', 'Frame', 'Flag', 'Fountain', 'Football', 'Frying Pan', 'File']
  },
  G: {
    names: ['Gaurav', 'Geeta', 'Gopal', 'Gayatri', 'Gautam', 'Girish', 'Gulshan', 'Garima', 'Govind'],
    places: ['Goa', 'Gandhinagar', 'Guwahati', 'Gwalior', 'Geneva', 'Greece', 'Germany', 'Guntur'],
    animals: ['Giraffe', 'Goat', 'Gorilla', 'Gharial', 'Gecko', 'Goose', 'Goldfish', 'Gull'],
    things: ['Glass', 'Guitar', 'Gloves', 'Gun', 'Gate', 'Garland', 'Globe', 'Goggles', 'Glue']
  },
  H: {
    names: ['Harsh', 'Hema', 'Hitesh', 'Harini', 'Hrithik', 'Hardik', 'Heena', 'Hemant', 'Hafiz'],
    places: ['Hyderabad', 'Haridwar', 'Helsinki', 'Houston', 'Havana', 'Hong Kong', 'Hungary', 'Hubli'],
    animals: ['Horse', 'Hyena', 'Hippopotamus', 'Hawk', 'Hare', 'Hamster', 'Hedgehog', 'Hornet'],
    things: ['Hat', 'Hammer', 'Helmet', 'Hook', 'Harp', 'Handkerchief', 'Heater', 'Horn', 'Hourglass']
  },
  I: {
    names: ['Ishaan', 'Isha', 'Indira', 'Imran', 'Irfan', 'Ira', 'Ishita', 'Inaya', 'Ibrahim'],
    places: ['Indore', 'Imphal', 'Itanagar', 'Istanbul', 'Islamabad', 'India', 'Indonesia', 'Ireland', 'Italy'],
    animals: ['Iguana', 'Impala', 'Ibex', 'Ibis', 'Indian Cobra', 'Inchworm', 'Indri'],
    things: ['Iron', 'Inkpot', 'Ice', 'Incense', 'Idol', 'Instrument', 'Injection', 'Ice Cream']
  },
  J: {
    names: ['Jay', 'Jaya', 'Jatin', 'Jitendra', 'Jyoti', 'Jaspreet', 'Juhi', 'Javed', 'Janvi'],
    places: ['Jaipur', 'Jodhpur', 'Jamshedpur', 'Jabalpur', 'Jakarta', 'Jerusalem', 'Japan', 'Jordan'],
    animals: ['Jaguar', 'Jackal', 'Jellyfish', 'Jaybird', 'Jerboa', 'Jackrabbit'],
    things: ['Jug', 'Jacket', 'Jar', 'Jeep', 'Jewellery', 'Jigsaw', 'Journal', 'Jumping Rope']
  },
  K: {
    names: ['Karan', 'Kavita', 'Kiran', 'Kunal', 'Kamal', 'Kareena', 'Kartik', 'Kriti', 'Kalyan'],
    places: ['Kolkata', 'Kochi', 'Kanpur', 'Kashmir', 'Kyoto', 'Kenya', 'Kuwait', 'Kathmandu'],
    animals: ['Kangaroo', 'Koala', 'Kingfisher', 'Komodo Dragon', 'Kiwi', 'Kitten', 'Kestrel'],
    things: ['Kite', 'Key', 'Knife', 'Kettle', 'Keyboard', 'Kurta', 'Kiteboard', 'Kiln']
  },
  L: {
    names: ['Lata', 'Lokesh', 'Lakshman', 'Lavanya', 'Lalita', 'Lalit', 'Leela', 'Laxmi', 'Leo'],
    places: ['Lucknow', 'Ludhiana', 'London', 'Lisbon', 'Lima', 'Los Angeles', 'Lebanon', 'Ladakh'],
    animals: ['Lion', 'Leopard', 'Llama', 'Lemur', 'Lizard', 'Lobster', 'Lynx', 'Locust'],
    things: ['Lamp', 'Lock', 'Ladder', 'Laptop', 'Locket', 'Letter', 'Ladle', 'Leaf', 'Lantern']
  },
  M: {
    names: ['Manish', 'Meera', 'Mohit', 'Madhuri', 'Mayank', 'Manoj', 'Malini', 'Mukesh', 'Mamta'],
    places: ['Mumbai', 'Madurai', 'Mysuru', 'Madrid', 'Melbourne', 'Moscow', 'Mexico', 'Manila'],
    animals: ['Monkey', 'Mongoose', 'Moose', 'Moth', 'Mouse', 'Mule', 'Macaw', 'Meerkat'],
    things: ['Mirror', 'Mobile', 'Mat', 'Mug', 'Map', 'Magnet', 'Mask', 'Microphone', 'Matchbox']
  },
  N: {
    names: ['Nikhil', 'Neha', 'Nitin', 'Nandini', 'Naveen', 'Nirmala', 'Naresh', 'Natasha', 'Naman'],
    places: ['Nagpur', 'Noida', 'Nashik', 'Nairobi', 'New York', 'Nepal', 'Norway', 'Nigeria'],
    animals: ['Nightingale', 'Newt', 'Narwhal', 'Nilgai', 'Numbat', 'Nutria', 'Nandu'],
    things: ['Needle', 'Notebook', 'Net', 'Necklace', 'Nut', 'Nail', 'Newspaper', 'Napkin']
  },
  O: {
    names: ['Omkar', 'Ojas', 'Om', 'Oindrila', 'Oliver', 'Olivia', 'Oscar', 'Omar', 'Ojasvi'],
    places: ['Ooty', 'Oslo', 'Orlando', 'Ottawa', 'Oman', 'Oxford', 'Osaka', 'Odisha'],
    animals: ['Owl', 'Ostrich', 'Otter', 'Octopus', 'Ox', 'Ocelot', 'Oryx', 'Orangutan'],
    things: ['Oven', 'Oil', 'Ornament', 'Oar', 'Onion', 'Organ', 'Outfit', 'Overcoat']
  },
  P: {
    names: ['Pranav', 'Pooja', 'Prakash', 'Priya', 'Pankaj', 'Payal', 'Prateek', 'Pallavi', 'Prem'],
    places: ['Pune', 'Patna', 'Puducherry', 'Paris', 'Prague', 'Perth', 'Poland', 'Portugal'],
    animals: ['Peacock', 'Panther', 'Panda', 'Parrot', 'Penguin', 'Pig', 'Pigeon', 'Polar Bear'],
    things: ['Pen', 'Pencil', 'Paper', 'Plate', 'Pillow', 'Phone', 'Plant', 'Pot', 'Picture']
  },
  R: {
    names: ['Rahul', 'Riya', 'Rohit', 'Rani', 'Ramesh', 'Rashmi', 'Rajesh', 'Reena', 'Rakesh'],
    places: ['Ranchi', 'Raipur', 'Rajkot', 'Rome', 'Rio de Janeiro', 'Riyadh', 'Russia', 'Rishikesh'],
    animals: ['Rabbit', 'Rat', 'Rhino', 'Raccoon', 'Reindeer', 'Robin', 'Rooster', 'Raven'],
    things: ['Ring', 'Rope', 'Radio', 'Ruler', 'Ribbon', 'Rocket', 'Rack', 'Razor', 'Rug']
  },
  S: {
    names: ['Suresh', 'Sneha', 'Sameer', 'Shweta', 'Sanjay', 'Sunita', 'Sachin', 'Sonal', 'Shivam'],
    places: ['Surat', 'Shimla', 'Srinagar', 'Sydney', 'Singapore', 'Seoul', 'Spain', 'Sweden'],
    animals: ['Snake', 'Shark', 'Sheep', 'Squirrel', 'Swan', 'Spider', 'Seal', 'Scorpion'],
    things: ['Spoon', 'Scissors', 'Shoe', 'Soap', 'Shirt', 'Spectacles', 'Stool', 'Scale', 'Sword']
  },
  T: {
    names: ['Tarun', 'Tanvi', 'Tushar', 'Tejas', 'Trisha', 'Tulsi', 'Tanmay', 'Tanya', 'Tara'],
    places: ['Thiruvananthapuram', 'Tirupati', 'Tokyo', 'Toronto', 'Tehran', 'Thailand', 'Turkey'],
    animals: ['Tiger', 'Turtle', 'Tortoise', 'Toucan', 'Tapir', 'Termite', 'Tadpole', 'Trout'],
    things: ['Table', 'Telephone', 'Torch', 'Towel', 'Teapot', 'Ticket', 'Toothbrush', 'Tyre']
  },
  V: {
    names: ['Varun', 'Vandana', 'Vikas', 'Vidya', 'Vivek', 'Vaishali', 'Vijay', 'Vinita', 'Vishal'],
    places: ['Varanasi', 'Vadodara', 'Visakhapatnam', 'Vienna', 'Venice', 'Vancouver', 'Vietnam'],
    animals: ['Vulture', 'Viper', 'Vicuna', 'Vole', 'Vervet Monkey', 'Vahe'],
    things: ['Vase', 'Violin', 'Van', 'Vest', 'Video', 'Vault', 'Valve', 'Vessel']
  }
};

export const AVAILABLE_LETTERS = Object.keys(NPAT_DICTIONARY);

export function getRandomNPATLetter(): string {
  return AVAILABLE_LETTERS[Math.floor(Math.random() * AVAILABLE_LETTERS.length)];
}

export function validateNPATWord(category: 'names' | 'places' | 'animals' | 'things', word: string, letter: string): boolean {
  if (!word || !word.trim()) return false;
  const trimmed = word.trim().toLowerCase();
  const targetLetter = letter.trim().toLowerCase();

  // Basic check: must start with target letter
  if (!trimmed.startsWith(targetLetter)) return false;
  if (trimmed.length < 2) return false;

  const entry = NPAT_DICTIONARY[letter.toUpperCase()];
  if (!entry) return true; // If letter not strictly constrained, accept valid word starting with letter

  const list = entry[category];
  return list.some(item => item.toLowerCase() === trimmed) || trimmed.length >= 3;
}
