export interface NostalgiaItem {
  title: string;
  description: string;
  emoji: string;
  category: string;
}

export interface DecadeData {
  decade: string;
  years: string;
  tagline: string;
  color: string;
  bgGradient: string;
  quotes: string[];
  cartoons: NostalgiaItem[];
  toys: NostalgiaItem[];
  music: NostalgiaItem[];
  movies: NostalgiaItem[];
  snacks: NostalgiaItem[];
  games: NostalgiaItem[];
  trends: NostalgiaItem[];
  schoolLife: NostalgiaItem[];
  tech: NostalgiaItem[];
}

export const nostalgiaData: Record<string, DecadeData> = {
  "1970s": {
    decade: "The 70s",
    years: "1970–1979",
    tagline: "When life was simple and the music was groovy",
    color: "#D2691E",
    bgGradient: "from-amber-900/20 via-orange-800/10 to-yellow-900/20",
    quotes: [
      "We didn't need the internet — we had the outdoors and each other.",
      "Saturday morning cartoons were the highlight of the entire week.",
      "Playing until the streetlights came on was our only curfew.",
      "A quarter could buy you a candy bar AND a phone call.",
    ],
    cartoons: [
      { title: "Scooby-Doo", description: "Mystery-solving teens and their Great Dane in the psychedelic Mystery Machine", emoji: "🐕", category: "Cartoons" },
      { title: "Tom and Jerry", description: "The eternal cat-and-mouse chase that never got old", emoji: "🐱", category: "Cartoons" },
      { title: "Looney Tunes", description: "Bugs Bunny, Daffy Duck, and the whole gang on Saturday mornings", emoji: "🐰", category: "Cartoons" },
      { title: "The Flintstones", description: "Yabba Dabba Doo! The modern stone-age family", emoji: "🪨", category: "Cartoons" },
      { title: "Speed Racer", description: "Go Speed Racer, Go! The original anime racing sensation", emoji: "🏎️", category: "Cartoons" },
    ],
    toys: [
      { title: "Etch A Sketch", description: "Shake to erase — the original drawing tablet", emoji: "🖼️", category: "Toys" },
      { title: "Weebles", description: "Weebles wobble but they don't fall down!", emoji: "🥚", category: "Toys" },
      { title: "Rock 'Em Sock 'Em Robots", description: "Red Rocker vs Blue Bomber — the boxing match of the century", emoji: "🤖", category: "Toys" },
      { title: "Lite-Brite", description: "Create glowing art with colored pegs on a light board", emoji: "💡", category: "Toys" },
      { title: "Stretch Armstrong", description: "The stretchable, pullable, unbreakable action figure", emoji: "💪", category: "Toys" },
    ],
    music: [
      { title: "Disco Fever", description: "Saturday Night Fever, Donna Summer, and the Bee Gees ruled the dance floor", emoji: "🕺", category: "Music" },
      { title: "Rock Legends", description: "Led Zeppelin, Pink Floyd, and The Eagles defined a generation", emoji: "🎸", category: "Music" },
      { title: "Vinyl Records", description: "Carefully placing the needle on the spinning vinyl — a ritual of love", emoji: "🎵", category: "Music" },
      { title: "8-Track Tapes", description: "The clunky but beloved music format in every car", emoji: "📼", category: "Music" },
      { title: "ABBA", description: "Dancing Queen and Waterloo — the Swedish sensation conquered the world", emoji: "👑", category: "Music" },
    ],
    movies: [
      { title: "Star Wars (1977)", description: "A long time ago in a galaxy far, far away — everything changed", emoji: "⚔️", category: "Movies" },
      { title: "Jaws", description: "You'll never go in the water again", emoji: "🦈", category: "Movies" },
      { title: "Grease", description: "Summer nights and greased lightning — the movie that defined cool", emoji: "🎶", category: "Movies" },
      { title: "The Godfather", description: "An offer you can't refuse — cinema's greatest masterpiece", emoji: "🎩", category: "Movies" },
      { title: "Close Encounters", description: "The five-tone melody that made us all look up at the sky", emoji: "👽", category: "Movies" },
    ],
    snacks: [
      { title: "Pop Rocks", description: "The candy that exploded in your mouth — literally!", emoji: "💥", category: "Snacks" },
      { title: "Cool Whip", description: "Whipped cream from a tub — the 70s dessert hack", emoji: "🍦", category: "Snacks" },
      { title: "Tang", description: "The astronaut drink that made breakfast feel cosmic", emoji: "🧃", category: "Snacks" },
      { title: "Jiffy Pop", description: "Watch it expand on the stove — popcorn was an event", emoji: "🍿", category: "Snacks" },
      { title: "Pez Dispensers", description: "Candy plus a collectible character head — genius!", emoji: "🍬", category: "Snacks" },
    ],
    games: [
      { title: "Pong", description: "The simple ping-pong game that started the video game revolution", emoji: "🕹️", category: "Games" },
      { title: "Twister", description: "Left foot red, right hand green — the game that tied you in knots", emoji: "🌀", category: "Games" },
      { title: "Hungry Hungry Hippos", description: "SMASH! MARBLE! CHOMP! The loudest game in the closet", emoji: "🦛", category: "Games" },
      { title: "Connect Four", description: "Go for the diagonal — the strategy game of the decade", emoji: "🔴", category: "Games" },
      { title: "Dungeons & Dragons", description: "Imagination was the only graphics card you needed", emoji: "🐉", category: "Games" },
    ],
    trends: [
      { title: "Bell Bottoms", description: "The wider the flare, the cooler you were", emoji: "👖", category: "Trends" },
      { title: "Platform Shoes", description: "Everyone was literally standing taller", emoji: "👟", category: "Trends" },
      { title: "Mood Rings", description: "Your ring told everyone exactly how you were feeling", emoji: "💍", category: "Trends" },
      { title: "Pet Rocks", description: "Yes, people actually bought rocks as pets", emoji: "🪨", category: "Trends" },
      { title: "Lava Lamps", description: "The mesmerizing glow that defined every bedroom", emoji: "🪔", category: "Trends" },
    ],
    schoolLife: [
      { title: "Metal Lunchboxes", description: "Your lunchbox showed off your favorite cartoon character", emoji: "🎒", category: "School Life" },
      { title: "Ditto Machines", description: "That purple ink smell of freshly printed worksheets", emoji: "📄", category: "School Life" },
      { title: "Overhead Projectors", description: "Teachers writing on transparencies — high-tech at the time", emoji: "📽️", category: "School Life" },
      { title: "Bookmobile", description: "The library came to you in a converted bus", emoji: "📚", category: "School Life" },
      { title: "Show and Tell", description: "Bringing your prized possession to share with the class", emoji: "📢", category: "School Life" },
    ],
    tech: [
      { title: "Rotary Phones", description: "Spinning the dial and waiting — patience was a skill", emoji: "📞", category: "Tech" },
      { title: "8mm Film", description: "Home movies required a projector and a dark room", emoji: "🎬", category: "Tech" },
      { title: "CB Radios", description: "10-4 good buddy — everyone was a trucker at heart", emoji: "📻", category: "Tech" },
      { title: "Typewriters", description: "The satisfying clack-clack-ding of a real typewriter", emoji: "⌨️", category: "Tech" },
      { title: "Polaroid Cameras", description: "Shake it like a Polaroid picture — instant memories", emoji: "📸", category: "Tech" },
    ],
  },
  "1980s": {
    decade: "The 80s",
    years: "1980–1989",
    tagline: "Radical times, neon dreams, and the birth of everything cool",
    color: "#FF1493",
    bgGradient: "from-pink-900/20 via-purple-800/10 to-fuchsia-900/20",
    quotes: [
      "Gag me with a spoon — but we wouldn't trade it for anything!",
      "We recorded songs off the radio and tried to cut the DJ's voice out.",
      "The arcade was our social media — and Pac-Man was our timeline.",
      "Back when 'be kind, rewind' was the most important rule in life.",
    ],
    cartoons: [
      { title: "Transformers", description: "More than meets the eye — robots in disguise!", emoji: "🤖", category: "Cartoons" },
      { title: "He-Man", description: "By the power of Grayskull! The most powerful man in the universe", emoji: "💪", category: "Cartoons" },
      { title: "ThunderCats", description: "ThunderCats are loose! Hooo!", emoji: "⚡", category: "Cartoons" },
      { title: "GI Joe", description: "A real American hero — knowing is half the battle", emoji: "🎖️", category: "Cartoons" },
      { title: "Voltron", description: "Form blazing sword! Five lions, one legendary robot", emoji: "🦁", category: "Cartoons" },
      { title: "DuckTales", description: "Woo-ooo! Life is like a hurricane", emoji: "🦆", category: "Cartoons" },
    ],
    toys: [
      { title: "Rubik's Cube", description: "Everyone had one, nobody could solve it — but we kept trying", emoji: "🧊", category: "Toys" },
      { title: "Cabbage Patch Kids", description: "The doll craze that had parents fighting in store aisles", emoji: "👶", category: "Toys" },
      { title: "My Little Pony", description: "Colorful ponies with brushable manes and magical tails", emoji: "🦄", category: "Toys" },
      { title: "Care Bears", description: "Staring at their tummies to see the belly badge glow", emoji: "🐻", category: "Toys" },
      { title: "He-Man Action Figures", description: "Castle Grayskull was the fortress every kid wanted", emoji: "🏰", category: "Toys" },
      { title: "Nintendo Entertainment System", description: "The console that saved video gaming and changed everything", emoji: "🎮", category: "Toys" },
    ],
    music: [
      { title: "Michael Jackson's Thriller", description: "The greatest music video ever made — we all learned the zombie dance", emoji: "🌙", category: "Music" },
      { title: "Madonna", description: "Like a Virgin, Material Girl — the Queen of Pop was born", emoji: "👑", category: "Music" },
      { title: "Walkman", description: "The portable cassette player that made music personal", emoji: "🎧", category: "Music" },
      { title: "Mixtapes", description: "Recording the perfect mixtape for your crush took hours of love", emoji: "📼", category: "Music" },
      { title: "MTV Launch", description: "Video killed the radio star — and we watched it happen live", emoji: "📺", category: "Music" },
      { title: "Synth Pop", description: "Depeche Mode, The Cure, New Order — the sound of the future", emoji: "🎹", category: "Music" },
    ],
    movies: [
      { title: "E.T.", description: "E.T. phone home — the movie that made every kid believe in aliens", emoji: "👽", category: "Movies" },
      { title: "Back to the Future", description: "Where we're going, we don't need roads", emoji: "⚡", category: "Movies" },
      { title: "The Goonies", description: "Goonies never say die! The ultimate adventure", emoji: "🗺️", category: "Movies" },
      { title: "Ghostbusters", description: "Who you gonna call? The answer was always obvious", emoji: "👻", category: "Movies" },
      { title: "The Breakfast Club", description: "Don't you forget about me — the teen movie that understood us", emoji: "🥪", category: "Movies" },
      { title: "Star Wars Sequels", description: "The Empire Strikes Back — I am your father changed everything", emoji: "⚔️", category: "Movies" },
    ],
    snacks: [
      { title: "Pop-Tarts", description: "Toasted or straight from the bag — breakfast of champions", emoji: "🥐", category: "Snacks" },
      { title: "Capri Sun", description: "Poking that straw through the pouch was a satisfying ritual", emoji: "🧃", category: "Snacks" },
      { title: "Ring Pop", description: "The jewelry you could eat — bling you could lick", emoji: "💍", category: "Snacks" },
      { title: "Push Pops", description: "Push up from the bottom — candy that lasted all day", emoji: "🍭", category: "Snacks" },
      { title: "Dunkaroos", description: "Dip the cookie in the frosting — the perfect snack combo", emoji: "🍪", category: "Snacks" },
    ],
    games: [
      { title: "Pac-Man", description: "Wocka wocka wocka — the yellow dot-eater that conquered arcades", emoji: "🟡", category: "Games" },
      { title: "Super Mario Bros", description: "Jumping on Goombas and saving Princess Peach — repeatedly", emoji: "🍄", category: "Games" },
      { title: "Tetris", description: "The Russian puzzle game that was impossibly addictive", emoji: "🧱", category: "Games" },
      { title: "The Legend of Zelda", description: "It's dangerous to go alone — take this!", emoji: "🗡️", category: "Games" },
      { title: "Trivial Pursuit", description: "The board game that made everyone feel smart (or not)", emoji: "🧠", category: "Games" },
      { title: "Simon Says", description: "Red, blue, green, yellow — the memory game that drove you crazy", emoji: "🔴", category: "Games" },
    ],
    trends: [
      { title: "Neon Clothing", description: "The brighter, the better — visibility was a fashion statement", emoji: "🌈", category: "Trends" },
      { title: "Shoulder Pads", description: "Power dressing meant looking like a human triangle", emoji: "👔", category: "Trends" },
      { title: "Leg Warmers", description: "Because legs needed to be warm AND fashionable", emoji: "🧦", category: "Trends" },
      { title: "Scrunchies", description: "The fabric hair tie that doubled as a wrist accessory", emoji: "🎀", category: "Trends" },
      { title: "Boomboxes", description: "Carrying your music on your shoulder — portable and loud", emoji: "📻", category: "Trends" },
    ],
    schoolLife: [
      { title: "Trapper Keepers", description: "The ultimate binder with velcro closure — organization goals", emoji: "📓", category: "School Life" },
      { title: "Pencil Toppers", description: "Decorative erasers and characters on top of every pencil", emoji: "✏️", category: "School Life" },
      { title: "Oregon Trail", description: "You have died of dysentery — the educational game we loved", emoji: "🚗", category: "School Life" },
      { title: "Book Fairs", description: "Scholastic book fairs were the best days of the school year", emoji: "📖", category: "School Life" },
      { title: "Pogs", description: "Slamming your stack — the playground currency of the era", emoji: "🪙", category: "School Life" },
    ],
    tech: [
      { title: "VHS Tapes", description: "Be kind, rewind — the golden rule of movie rentals", emoji: "📼", category: "Tech" },
      { title: "Apple IIe", description: "The computer that introduced a generation to technology", emoji: "💻", category: "Tech" },
      { title: "Cassette Tapes", description: "Untangling cassette tape with a pencil was a life skill", emoji: "🎵", category: "Tech" },
      { title: "Atari 2600", description: "The console that started the home gaming revolution", emoji: "🕹️", category: "Tech" },
      { title: "Sony Walkman", description: "Your entire music library in your pocket — well, one tape at a time", emoji: "🎧", category: "Tech" },
    ],
  },
  "1990s": {
    decade: "The 90s",
    years: "1990–1999",
    tagline: "The decade that gave us everything — and we didn't even know it",
    color: "#00CED1",
    bgGradient: "from-teal-900/20 via-cyan-800/10 to-sky-900/20",
    quotes: [
      "We survived dial-up internet and we're stronger for it.",
      "The 90s didn't need hashtags — the culture spoke for itself.",
      "Every Friday night was Blockbuster night — no streaming required.",
      "We were the last generation to play outside until the streetlights came on.",
    ],
    cartoons: [
      { title: "Rugrats", description: "A baby's gotta do what a baby's gotta do!", emoji: "👶", category: "Cartoons" },
      { title: "Hey Arnold!", description: "Football head! The kid with the heart of gold in the city", emoji: "🏈", category: "Cartoons" },
      { title: "Pokémon", description: "Gotta catch 'em all! The phenomenon that captured every heart", emoji: "⚡", category: "Cartoons" },
      { title: "Dexter's Laboratory", description: "Dee Dee, get out of my laboratory!", emoji: "🔬", category: "Cartoons" },
      { title: "Powerpuff Girls", description: "Sugar, spice, and everything nice — plus Chemical X", emoji: " 💪", category: "Cartoons" },
      { title: "Dragon Ball Z", description: "Kamehameha! The anime that got everyone hooked", emoji: "🐉", category: "Cartoons" },
    ],
    toys: [
      { title: "Tamagotchi", description: "The virtual pet that demanded your attention 24/7", emoji: "🐣", category: "Toys" },
      { title: "Beanie Babies", description: "Everyone thought they'd be worth millions someday", emoji: "🧸", category: "Toys" },
      { title: "Furbies", description: "The creepy-cute owl-like pet that learned to talk", emoji: "🦉", category: "Toys" },
      { title: "Game Boy", description: "Tetris in the back of the car — portable gaming perfection", emoji: "🎮", category: "Toys" },
      { title: "Bop It!", description: "Bop it, twist it, pull it! The game that tested your reflexes", emoji: "🎯", category: "Toys" },
      { title: "Pokémon Cards", description: "Trading, battling, and protecting your holographic Charizard", emoji: "🃏", category: "Toys" },
    ],
    music: [
      { title: "Nirvana", description: "Smells Like Teen Spirit — the anthem of a generation", emoji: "🎸", category: "Music" },
      { title: "Spice Girls", description: "Girl Power! Wannabe and Zigazig-Ah", emoji: "💃", category: "Music" },
      { title: "Backstreet Boys", description: "I want it that way — the boy band that ruled the world", emoji: "🎤", category: "Music" },
      { title: "CD Players", description: "The glorious skip-free portable music experience", emoji: "💿", category: "Music" },
      { title: "Boy Bands Era", description: "NSYNC, 98 Degrees, Boyz II Men — the golden age of boy bands", emoji: "🎵", category: "Music" },
      { title: "Tupac & Biggie", description: "West Coast vs East Coast — the rivalry that defined hip-hop", emoji: "🎤", category: "Music" },
    ],
    movies: [
      { title: "Toy Story", description: "To infinity and beyond! The first CGI film changed animation forever", emoji: "🤠", category: "Movies" },
      { title: "The Lion King", description: "Hakuna Matata — the circle of life made everyone cry", emoji: "🦁", category: "Movies" },
      { title: "Jurassic Park", description: "Life found a way — and it was terrifying and wonderful", emoji: "🦕", category: "Movies" },
      { title: "Home Alone", description: "The booby traps we all wished we could set up at home", emoji: "🏠", category: "Movies" },
      { title: "Matrix", description: "Red pill or blue pill? The movie that blew every mind", emoji: "🕶️", category: "Movies" },
      { title: "Titanic", description: "I'm the king of the world! — and we all cried at the end", emoji: "🚢", category: "Movies" },
    ],
    snacks: [
      { title: "Dunkaroos", description: "Dunk the kangaroo cookie into the frosting — pure joy", emoji: "🍪", category: "Snacks" },
      { title: "Gushers", description: "The fruit snack that exploded with juice when you bit it", emoji: "🍇", category: "Snacks" },
      { title: "Fruit Roll-Ups", description: "Unrolling and eating them strip by strip", emoji: "🍒", category: "Snacks" },
      { title: "Handi-Snacks", description: "Cheese and crackers with the little red spreader", emoji: "🧀", category: "Snacks" },
      { title: "Squeeze Its", description: "The bottle-shaped juice with the twist-off top", emoji: "🧃", category: "Snacks" },
    ],
    games: [
      { title: "Pokémon Red/Blue", description: "The journey through Kanto that started a global phenomenon", emoji: "🔴", category: "Games" },
      { title: "Super Mario 64", description: "The 3D platformer that redefined what games could be", emoji: "⭐", category: "Games" },
      { title: "Crash Bandicoot", description: "Woah! The PlayStation mascot that challenged Mario", emoji: "🦊", category: "Games" },
      { title: "Sonic the Hedgehog", description: "Gotta go fast! SEGA's blue blur", emoji: "🔵", category: "Games" },
      { title: "Mortal Kombat", description: "Finish Him! The fighting game that shocked parents everywhere", emoji: "🥊", category: "Games" },
      { title: "Twister", description: "Right hand blue! The party game classic", emoji: "🌀", category: "Games" },
    ],
    trends: [
      { title: "Choker Necklaces", description: "The tattoo-style choker that every girl wore", emoji: "📿", category: "Trends" },
      { title: "Platform Shoes", description: "Spice Girls style — the thicker the sole, the cooler", emoji: "👞", category: "Trends" },
      { title: "Frosted Tips", description: "The boy band hairstyle that was everywhere", emoji: "💇", category: "Trends" },
      { title: "Butterfly Clips", description: "Hair clips with wings that came in every color", emoji: "🦋", category: "Trends" },
      { title: "Bucket Hats", description: "The fishing hat that became a fashion must-have", emoji: "🎩", category: "Trends" },
    ],
    schoolLife: [
      { title: "Blockbuster Fridays", description: "Picking the perfect movie and microwave popcorn was the plan", emoji: "🎬", category: "School Life" },
      { title: "MSN Messenger", description: "BRB, LOL, ASL — the chat era that started it all", emoji: "💬", category: "School Life" },
      { title: "Gel Pens", description: "Writing in metallic colors and scented inks", emoji: "✍️", category: "School Life" },
      { title: "Lisa Frank", description: "Rainbow unicorns and neon dolphins on every folder", emoji: "🦄", category: "School Life" },
      { title: "Reading Rainbow", description: "But you don't have to take MY word for it!", emoji: "📚", category: "School Life" },
    ],
    tech: [
      { title: "Dial-Up Internet", description: "The screeching connection sound that tested our patience", emoji: "📡", category: "Tech" },
      { title: "Windows 95", description: "The start button that changed computing forever", emoji: "🪟", category: "Tech" },
      { title: "Tamagotchi", description: "The digital pet that taught responsibility (or neglect)", emoji: "🥚", category: "Tech" },
      { title: "PlayStation", description: "The console that brought 3D gaming to the masses", emoji: "🎮", category: "Tech" },
      { title: "Pagers / Beepers", description: "Getting a page with numbers you had to decode", emoji: "📟", category: "Tech" },
    ],
  },
  "2000s": {
    decade: "The 2000s",
    years: "2000–2009",
    tagline: "The Y2K era — flip phones, emo, and the dawn of social media",
    color: "#7B68EE",
    bgGradient: "from-indigo-900/20 via-violet-800/10 to-purple-900/20",
    quotes: [
      "We survived Y2K — the world was supposed to end and we just kept going.",
      "Burning CDs for your friends was the ultimate act of love.",
      "We learned to type with one thumb on a phone keypad — T9 was a superpower.",
      "Before TikTok dances, we had Soulja Boy's Crank That.",
    ],
    cartoons: [
      { title: "SpongeBob SquarePants", description: "I'm ready! I'm ready! The absorbent legend of Bikini Bottom", emoji: "🧽", category: "Cartoons" },
      { title: "Avatar: The Last Airbender", description: "The greatest animated series of all time — there, we said it", emoji: "🌀", category: "Cartoons" },
      { title: "The Fairly OddParents", description: "Fairly OddParents! The show about wishing for everything", emoji: "✨", category: "Cartoons" },
      { title: "Teen Titans", description: "Titans, GO! The superhero team that felt like ours", emoji: "🦸", category: "Cartoons" },
      { title: "Samurai Jack", description: "The silent warrior lost in time — animation as art", emoji: "⚔️", category: "Cartoons" },
    ],
    toys: [
      { title: "Bratz Dolls", description: "The dolls with a passion for fashion and attitude", emoji: "👗", category: "Toys" },
      { title: "Yu-Gi-Oh! Cards", description: "The trading card game that rivaled Pokémon", emoji: "🃏", category: "Toys" },
      { title: "Beyblades", description: "Let it rip! The spinning top battles were intense", emoji: "🔄", category: "Toys" },
      { title: "Nintendo DS", description: "Dual screens, touch gaming, Nintendogs — innovation", emoji: "🎮", category: "Toys" },
      { title: "Webkinz", description: "The plush toy with a virtual world — the original digital pet", emoji: "🐾", category: "Toys" },
      { title: "Giga Pets", description: "The Tamagotchi's competitor that kept the digital pet craze alive", emoji: "🐶", category: "Toys" },
    ],
    music: [
      { title: "iPod & iTunes", description: "1,000 songs in your pocket — music would never be the same", emoji: "🎧", category: "Music" },
      { title: "Burning CDs", description: "The mix CD with custom artwork was the ultimate gift", emoji: "💿", category: "Music" },
      { title: "Eminem", description: "The real Slim Shady — the rapper who broke every barrier", emoji: "🎤", category: "Music" },
      { title: "Rihanna", description: "Umbrella, ella, ella — the pop queen emerged", emoji: "☂️", category: "Music" },
      { title: "iTunes Store", description: "Buying songs for 99 cents each — freedom from albums", emoji: "💰", category: "Music" },
      { title: "Lil Wayne", description: "The best rapper alive — mixtape era dominance", emoji: "🎵", category: "Music" },
    ],
    movies: [
      { title: "Harry Potter Series", description: "The boy who lived — our generation's defining story", emoji: "⚡", category: "Movies" },
      { title: "Shrek", description: "What are you doing in my swamp? The ogre that stole hearts", emoji: "🧅", category: "Movies" },
      { title: "The Dark Knight", description: "Why so serious? Heath Ledger's legendary performance", emoji: "🦇", category: "Movies" },
      { title: "Finding Nemo", description: "Just keep swimming — the Pixar masterpiece", emoji: "🐠", category: "Movies" },
      { title: "Mean Girls", description: "On Wednesdays we wear pink — the most quotable movie ever", emoji: "💄", category: "Movies" },
      { title: "Lord of the Rings", description: "One ring to rule them all — the epic trilogy", emoji: "💍", category: "Movies" },
    ],
    snacks: [
      { title: "Toaster Strudels", description: "Better than Pop-Tarts and you got to ice them yourself", emoji: "🥐", category: "Snacks" },
      { title: "Oreos with Milk", description: "Dunking Oreos until they were perfectly soft", emoji: "🍪", category: "Snacks" },
      { title: "Bagel Bites", description: "Pizza in the morning, pizza in the evening, pizza at suppertime", emoji: "🍕", category: "Snacks" },
      { title: "Kool-Aid Bursts", description: "The squeeze bottle fruit drink in every lunchbox", emoji: "🧃", category: "Snacks" },
      { title: "Hot Cheetos", description: "The snack that turned your fingers red and your soul on fire", emoji: "🌶️", category: "Snacks" },
    ],
    games: [
      { title: "Halo", description: "The FPS that defined Xbox and online console gaming", emoji: "🎯", category: "Games" },
      { title: "World of Warcraft", description: "An MMORPG that consumed entire social lives", emoji: "⚔️", category: "Games" },
      { title: "Guitar Hero", description: "Pretending to be a rockstar in your living room", emoji: "🎸", category: "Games" },
      { title: "Runescape", description: "The free browser MMO that everyone played at school", emoji: "🗡️", category: "Games" },
      { title: "Neopets", description: "The virtual pet website that was our first internet home", emoji: "🐾", category: "Games" },
      { title: "Club Penguin", description: "Waddle around and meet new friends — the social network for kids", emoji: "🐧", category: "Games" },
    ],
    trends: [
      { title: "Flip Phones", description: "Snapping your phone shut to end a call — peak satisfaction", emoji: "📱", category: "Trends" },
      { title: "Emo Fashion", description: "Side-swept bangs, black eyeliner, and Converse sneakers", emoji: "🖤", category: "Trends" },
      { title: "Low-Rise Jeans", description: "The fashion trend we all regret but secretly loved", emoji: "👖", category: "Trends" },
      { title: "Silly Bandz", description: "Rubber band bracelets in every shape — traded like currency", emoji: "🌈", category: "Trends" },
      { title: "Heelys", description: "Shoes with wheels — rolling through hallways like a boss", emoji: "👟", category: "Trends" },
    ],
    schoolLife: [
      { title: "MySpace", description: "Tom was everyone's first friend — top 8 drama was real", emoji: "🌐", category: "School Life" },
      { title: "Limewire", description: "Downloading music and hoping it wasn't a virus", emoji: "📥", category: "School Life" },
      { title: "Gel Pens & Note Passing", description: "Folding notes into triangles and passing them in class", emoji: "📝", category: "School Life" },
      { title: "AIM / AOL Instant Messenger", description: "Away messages were a personality test", emoji: "💬", category: "School Life" },
      { title: "Flash Games", description: "Newgrounds and Miniclip — the golden age of browser games", emoji: "🕹️", category: "School Life" },
    ],
    tech: [
      { title: "USB Flash Drives", description: "Saving homework on a 256MB drive — cutting edge!", emoji: "💾", category: "Tech" },
      { title: "Digital Cameras", description: "Checking the tiny LCD screen after every photo", emoji: "📷", category: "Tech" },
      { title: "Windows XP", description: "The rolling green hills and blue sky — the best desktop wallpaper", emoji: "🪟", category: "Tech" },
      { title: "MP3 Players", description: "Before iPods, there were MP3 players with actual buttons", emoji: "🎵", category: "Tech" },
      { title: "YouTube Launch", description: "The first viral videos and the birth of content creation", emoji: "▶️", category: "Tech" },
    ],
  },
  "2010s": {
    decade: "The 2010s",
    years: "2010–2019",
    tagline: "The smartphone decade — we went from flip phones to facial recognition",
    color: "#FF6347",
    bgGradient: "from-orange-900/20 via-red-800/10 to-rose-900/20",
    quotes: [
      "We were the generation that grew up with the internet AND without it.",
      "Before endless scrolling, there was a limit to how much we could consume.",
      "We remember when 'there's an app for that' was actually exciting.",
      "Fidget spinners united the entire world for about three months.",
    ],
    cartoons: [
      { title: "Adventure Time", description: "Mathematical! Finn and Jake in the Land of Ooo", emoji: "🗡️", category: "Cartoons" },
      { title: "Gravity Falls", description: "The mystery-obsessed town with the best plot twists", emoji: "🌲", category: "Cartoons" },
      { title: "Steven Universe", description: "A boy with a gem for a belly button and a heart of gold", emoji: "💎", category: "Cartoons" },
      { title: "Regular Show", description: "A blue jay and a raccoon working at a park — absurd perfection", emoji: "🌳", category: "Cartoons" },
      { title: "Rick and Morty", description: "Wubba lubba dub dub — science fiction meets existential crisis", emoji: "🧪", category: "Cartoons" },
    ],
    toys: [
      { title: "Minecraft", description: "Building entire worlds one block at a time — digital LEGO for the soul", emoji: "⛏️", category: "Toys" },
      { title: "Fidget Spinners", description: "The 2017 obsession that had every hand spinning", emoji: "🌀", category: "Toys" },
      { title: "Rainbow Loom", description: "Weaving rubber band bracelets — the craft craze of the decade", emoji: "🌈", category: "Toys" },
      { title: "Hoverboards", description: "Not actually hovering, but they were the coolest thing ever", emoji: "🛹", category: "Toys" },
      { title: "Shopkins", description: "Tiny grocery-themed collectibles that kids couldn't get enough of", emoji: "🛒", category: "Toys" },
      { title: "Nerf Blasters", description: "The foam dart wars that turned every backyard into a battlefield", emoji: "🔫", category: "Toys" },
    ],
    music: [
      { title: "Spotify", description: "Music streaming killed piracy but gave us everything instantly", emoji: "🎧", category: "Music" },
      { title: "Taylor Swift", description: "From country sweetheart to global pop superstar", emoji: "🎤", category: "Music" },
      { title: "Drake", description: "Started from the bottom — Hotline Bling to God's Plan", emoji: "🎵", category: "Music" },
      { title: "Ed Sheeran", description: "The ginger singer-songwriter who dominated every playlist", emoji: "🎸", category: "Music" },
      { title: "K-Pop Explosion", description: "BTS and Blackpink — Korean pop took over the world", emoji: "🇰🇷", category: "Music" },
      { title: "SoundCloud Rappers", description: "Lil Uzi, XXXTentacion, Post Malone — the internet birthed new stars", emoji: "☁️", category: "Music" },
    ],
    movies: [
      { title: "Marvel Cinematic Universe", description: "The Infinity Saga — 22 films that changed cinema forever", emoji: "🦸", category: "Movies" },
      { title: "Frozen", description: "Let It Go — the song the whole world couldn't stop singing", emoji: "❄️", category: "Movies" },
      { title: "Inception", description: "The dream within a dream that made everyone question reality", emoji: "🔄", category: "Movies" },
      { title: "Inside Out", description: "The Pixar masterpiece that taught us it's okay to be sad", emoji: "😢", category: "Movies" },
      { title: "Star Wars Revival", description: "The Force Awakens brought the galaxy back to life", emoji: "⚔️", category: "Movies" },
      { title: "Avengers: Endgame", description: "I love you 3000 — the culmination of a decade of storytelling", emoji: "🛡️", category: "Movies" },
    ],
    snacks: [
      { title: "Takis", description: "The rolled corn snack with the intensity of a thousand suns", emoji: "🌶️", category: "Snacks" },
      { title: "Bubble Tea", description: "The tapioca pearl drink that became a cultural phenomenon", emoji: "🧋", category: "Snacks" },
      { title: "Kale Chips", description: "The health food trend that confused and delighted us", emoji: "🥬", category: "Snacks" },
      { title: "Gourmet Mac & Cheese", description: "Truffle oil and artisan cheeses on a childhood classic", emoji: "🧀", category: "Snacks" },
      { title: "Acai Bowls", description: "The Instagram-worthy superfood bowl", emoji: "🫐", category: "Snacks" },
    ],
    games: [
      { title: "Fortnite", description: "Battle Royale mania — floss dances and Victory Royales", emoji: "🏗️", category: "Games" },
      { title: "Minecraft", description: "The sandbox phenomenon that sold over 200 million copies", emoji: "🟩", category: "Games" },
      { title: "Among Us", description: "Sus! The social deduction game that dominated 2020", emoji: "🚀", category: "Games" },
      { title: "Pokémon GO", description: "The AR game that got everyone walking outside again", emoji: "📍", category: "Games" },
      { title: "Overwatch", description: "The hero shooter that made everyone pick a main", emoji: "🎯", category: "Games" },
      { title: "Roblox", description: "The platform where kids became game creators", emoji: "🧱", category: "Games" },
    ],
    trends: [
      { title: "Selfies", description: "Duck face or peace sign — the selfie era defined a generation", emoji: "🤳", category: "Trends" },
      { title: "Vine", description: "Six seconds of comedy genius — rest in peace, Vine", emoji: "📹", category: "Trends" },
      { title: "ASMR", description: "Whispering and crinkling sounds became strangely relaxing", emoji: "🤫", category: "Trends" },
      { title: "TikTok Rise", description: "From Musical.ly to global phenomenon in record time", emoji: "📱", category: "Trends" },
      { title: "Athleisure", description: "Yoga pants everywhere — comfort became the new fashion", emoji: "🧘", category: "Trends" },
    ],
    schoolLife: [
      { title: "Instagram", description: "The photo-sharing app that became a way of life", emoji: "📸", category: "School Life" },
      { title: "Chromebooks", description: "The school laptop that made everyone a Googler", emoji: "💻", category: "School Life" },
      { title: "Kahoot!", description: "The quiz game that turned every classroom into a game show", emoji: "🏆", category: "School Life" },
      { title: "Group Me / Group Chats", description: "The group chat drama that never ended", emoji: "💬", category: "School Life" },
      { title: "Memeculture", description: "Doge, Pepe, Harambe — the internet spoke in memes", emoji: "🐶", category: "School Life" },
    ],
    tech: [
      { title: "iPhone Era", description: "From iPhone 4 to iPhone X — smartphones became extensions of us", emoji: "📱", category: "Tech" },
      { title: "Netflix Binge-Watching", description: "Next episode playing in 5... 4... 3... 2... 1...", emoji: "📺", category: "Tech" },
      { title: "Smart Speakers", description: "Alexa, play Spotify — voice assistants entered every home", emoji: "🔊", category: "Tech" },
      { title: "Drones", description: "Flying cameras that captured the world from above", emoji: "🚁", category: "Tech" },
      { title: "4G LTE", description: "Mobile internet finally got fast enough to stream anything", emoji: "📶", category: "Tech" },
    ],
  },
};

export function getDecadeForYear(birthYear: number): string {
  if (birthYear >= 1970 && birthYear <= 1979) return "1970s";
  if (birthYear >= 1980 && birthYear <= 1989) return "1980s";
  if (birthYear >= 1990 && birthYear <= 1999) return "1990s";
  if (birthYear >= 2000 && birthYear <= 2009) return "2000s";
  if (birthYear >= 2010 && birthYear <= 2019) return "2010s";
  return "1990s"; // default
}

export function getAgeAtDecadeEnd(birthYear: number, targetDecade: string): number | null {
  const decadeStart: Record<string, number> = {
    "1970s": 1970, "1980s": 1980, "1990s": 1990, "2000s": 2000, "2010s": 2010,
  };
  const start = decadeStart[targetDecade];
  if (start === undefined) return null;
  // Was the person born before or during this decade?
  if (birthYear > start + 9) return null; // born after decade ended
  // Age at the END of the decade
  return (start + 9) - birthYear;
}

export function getPersonalTimeline(birthYear: number): { decade: string; age: string; label: string }[] {
  const timeline: { decade: string; age: string; label: string }[] = [];
  const decades = ["1970s", "1980s", "1990s", "2000s", "2010s"];

  for (const decade of decades) {
    const ageAtEnd = getAgeAtDecadeEnd(birthYear, decade);
    if (ageAtEnd === null || ageAtEnd < 0) continue;

    // Only show decades where the person was a kid/teen (age 0-18 at decade end)
    if (ageAtEnd > 18) continue;

    // Calculate age at the start of the decade for the label
    const decadeStart: Record<string, number> = {
      "1970s": 1970, "1980s": 1980, "1990s": 1990, "2000s": 2000, "2010s": 2010,
    };
    const ageAtStart = Math.max(0, birthYear - decadeStart[decade]);
    const ageRange = ageAtStart === ageAtEnd ? `${ageAtEnd}` : `${ageAtStart}–${ageAtEnd}`;

    // Use the midpoint age for labeling the life stage
    const midAge = Math.floor((ageAtStart + ageAtEnd) / 2);
    let label = "";
    if (ageAtEnd <= 1) label = "You were born! 🍼";
    else if (midAge <= 3) label = "Your toddler years 👶";
    else if (midAge <= 6) label = "Your early childhood 🧒";
    else if (midAge <= 12) label = "Your school days 📚";
    else if (midAge <= 15) label = "Your teenage years 🎸";
    else label = "Your late teens 🎓";

    timeline.push({
      decade,
      age: `Age ${ageRange}`,
      label,
    });
  }
  return timeline;
}