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
      { title: "Scooby-Doo, Where Are You!", description: "Hanna-Barbera's 1969 CBS Saturday morning hit — four teens and a Great Dane drove the Mystery Machine solving \"haunted\" crimes that always turned out to be greedy landowners in masks", emoji: "🐕", category: "Cartoons" },
      { title: "Tom and Jerry", description: "Created by William Hanna and Joseph Barbera at MGM in 1940, these 161 theatrical shorts ran daily on afternoon TV — the slapstick violence was so intense it got banned in some countries", emoji: "🐱", category: "Cartoons" },
      { title: "Looney Tunes / Merrie Melodies", description: "Warner Bros.' classic theatrical shorts from the 1930s–1960s featuring Bugs Bunny, Daffy Duck, and Elmer Fudd — aired every weekday at 4pm on local ABC affiliates", emoji: "🐰", category: "Cartoons" },
      { title: "The Flintstones", description: "Hanna-Barbera's 1960–1966 primetime ABC cartoon about the Stone Age family in Bedrock — the first animated series to air in primetime, sponsored by Winston cigarettes in its first two seasons", emoji: "🪨", category: "Cartoons" },
      { title: "Speed Racer", description: "Japanese anime \"Mach GoGoGo\" (1967) dubbed into English and syndicated across US TV stations in the late 60s and 70s — kids rushed home from school to watch Speed race the Mach 5", emoji: "🏎️", category: "Cartoons" },
    ],
    toys: [
      { title: "Etch A Sketch", description: "Invented by Andre Cassagnes in 1959 and manufactured by Ohio Art Company — the red plastic frame with aluminum powder coating inside sold over 100 million units by the 1970s", emoji: "🖼️", category: "Toys" },
      { title: "Weebles", description: "Hasbro's 1971 egg-shaped weighted-bottom figures — the TV jingle \"Weebles wobble but they don't fall down\" played during Saturday morning cartoons and became one of the decade's most recognizable toy ads", emoji: "🥚", category: "Toys" },
      { title: "Rock 'Em Sock 'Em Robots", description: "Marx Toys' 1966 two-player boxing game with a red plastic ring, Red Rocker and Blue Bomber robots whose heads popped off when hit — sold over 40 million units through the 70s", emoji: "🤖", category: "Toys" },
      { title: "Lite-Brite", description: "Hasbro's 1967 backlit pegboard where kids created glowing pictures with colored plastic pegs — used 150+ pegs on a 25×35 grid with a 25-watt incandescent bulb inside", emoji: "💡", category: "Toys" },
      { title: "Stretch Armstrong", description: "Kenner Products' 1976 15-inch latex-filled action figure filled with corn syrup — could stretch to over 4 feet long and slowly retract, sold over 50 million units worldwide", emoji: "💪", category: "Toys" },
    ],
    music: [
      { title: "Saturday Night Fever OST (1977)", description: "Bee Gees soundtrack that sold 40 million copies worldwide — \"Stayin' Alive\" at 104 BPM was later used by medical professionals to train CPR chest compression timing", emoji: "🕺", category: "Music" },
      { title: "Led Zeppelin IV (1971)", description: "The untitled fourth album featuring \"Stairway to Heaven\" — Atlantic Records pressed it without a band name or title on the cover, yet it sold 37 million copies and stayed on the Billboard chart for 327 weeks", emoji: "🎸", category: "Music" },
      { title: "Pink Floyd – The Dark Side of the Moon (1973)", description: "Recorded at Abbey Road Studios using 16-track tape — stayed on the Billboard 200 chart for a record 741 consecutive weeks (over 14 years) and sold 45 million copies worldwide", emoji: "🌙", category: "Music" },
      { title: "ABBA – Arrival (1976)", description: "Swedish quartet's third studio album featuring \"Dancing Queen\" — reached #1 on charts in 14 countries, ABBA sold 385 million records total making them one of the best-selling music acts in history", emoji: "👑", category: "Music" },
      { title: "Donna Summer – \"I Feel Love\" (1977)", description: "Produced by Giorgio Moroder entirely on a Moog synthesizer — the first major pop hit created without any traditional instruments, directly influenced the development of house, techno, and EDM for the next 40 years", emoji: "🎤", category: "Music" },
    ],
    movies: [
      { title: "Star Wars: Episode IV – A New Hope (1977)", description: "George Lucas's space opera filmed on a $11 million budget — 20th Century Fox expected it to flop. It grossed $775 million worldwide, won 6 Academy Awards, and launched the highest-grossing franchise in cinema history", emoji: "⚔️", category: "Movies" },
      { title: "Jaws (1975)", description: "Steven Spielberg's $12 million thriller about a great white shark terrorizing Amity Island — became the first summer blockbuster ever, grossing $470 million and establishing the June-July release model studios still use today", emoji: "🦈", category: "Movies" },
      { title: "Grease (1978)", description: "Paramount's musical starring John Travolta and Olivia Newton-John — shot on a $6 million budget, grossed $396 million, and its soundtrack sold 28 million copies with \"Summer Nights\" and \"You're the One That I Want\"", emoji: "🎶", category: "Movies" },
      { title: "The Godfather (1972)", description: "Francis Ford Coppola's adaptation of Mario Puzo's novel — Paramount wanted Robert Redford or Ryan O'Neal for Michael Corleone, but Coppola fought for Al Pacino. Won 3 Oscars, grossed $250M on a $6M budget", emoji: "🎩", category: "Movies" },
      { title: "Close Encounters of the Third Kind (1977)", description: "Steven Spielberg's UFO film shot simultaneously in Alabama and India — composer John Williams wrote the iconic five-note motif (D-E-C-lowC-G) after trying 250 different combinations", emoji: "👽", category: "Movies" },
    ],
    snacks: [
      { title: "Pop Rocks", description: "General Foods' 1975 carbonated candy invented by food chemist William Mitchell — the urban legend that eating Pop Rocks with soda would explode your stomach was so widespread the FDA set up a hotline to reassure parents", emoji: "💥", category: "Snacks" },
      { title: "Jiffy Pop", description: "Frederick Mennen's 1959 stovetop popcorn with an expanding aluminum foil dome — sold 3 million units annually by the 1970s, the TV commercial jingle \"Jiffy Pop, Jiffy Pop, magic treat as much as you can eat\" was everywhere", emoji: "🍿", category: "Snacks" },
      { title: "Tang Orange Drink", description: "General Foods' orange-flavored powdered drink mix developed in 1957 for NASA — John Glenn drank it on the 1962 Mercury flight, and by the 70s it was a staple in 35 million American households despite tasting nothing like real orange juice", emoji: "🧃", category: "Snacks" },
      { title: "Pez Dispensers", description: "Austrian candy company PEZ introduced character-head dispensers to the US in 1955 — by the 1970s there were over 150 character heads, and collectors traded them at school, the rarest being the 1955 Santa Claus head worth $3,000+", emoji: "🍬", category: "Snacks" },
      { title: "Quaker Oats' Chewy Granola Bars", description: "Launched in 1975 as the first mass-market granola bar — the original chocolate chip flavor became a lunchbox staple in 15 million American homes and spawned an entire product category worth billions today", emoji: "🥜", category: "Snacks" },
    ],
    games: [
      { title: "Pong (Atari, 1972)", description: "Allan Alcorn's table tennis game built on a $75 budget as a training project — became the first commercially successful arcade game, selling 8,000+ units by 1973 and spawning the entire video game industry", emoji: "🕹️", category: "Games" },
      { title: "Twister (Milton Bradley, 1966)", description: "Invented by Charles Foley and Neil Rabens as \"Pretzel\" — promoted on Johnny Carson's Tonight Show in 1966 when Eva Gabor played it with him on live TV, causing Milton Bradley to sell 3 million copies that year", emoji: "🌀", category: "Games" },
      { title: "Hungry Hungry Hippos (Milton Bradley, 1978)", description: "Designed by toy inventor Fred Kroll — four plastic hippos on a green board each controlled by a single lever, players frantically marbled-chomped to the loud CLACK-CLACK-CLACK that drove every parent insane", emoji: "🦛", category: "Games" },
      { title: "Connect Four (Milton Bradley, 1974)", description: "Howard Wexler and Ned Strongin's vertical checkers game — the first player can always force a win with perfect play (solved by computer scientists Victor Allis and James Allen in 1988), but kids didn't know that", emoji: "🔴", category: "Games" },
      { title: "Dungeons & Dragons (TSR, 1974)", description: "Gary Gygax and Dave Arneson's tabletop RPG published in a 3-book boxed set for $10 — by 1977 it had 250,000 players, despite the 1982 \"Satanic Panic\" moral panic led by Patricia Pulling after her son's suicide", emoji: "🐉", category: "Games" },
    ],
    trends: [
      { title: "Bell Bottoms / Flares", description: "Originated from US Navy uniforms in the early 1800s, adopted by hippies in the late 60s and mainstream by 1973 — the average flare measured 18 inches at the knee opening, and denim brands like Levi's and Wrangler sold 200 million pairs", emoji: "👖", category: "Trends" },
      { title: "Platform Shoes", description: "Men's platform shoes reached 4-inch heights by 1973 — John Travolta wore 3-inch Cuban-heeled boots in Saturday Night Fever, making the Chelsea Boot the best-selling men's shoe of 1977 with 12 million pairs sold", emoji: "👟", category: "Trends" },
      { title: "Mood Rings (1975)", description: "Invented by New York jeweler Joshua Reynolds using thermochromic liquid crystals — contained in a quartz shell set in silver, retailed for $2.49 at stores like Woolworth's, sold over 10 million units in the first 6 months", emoji: "💍", category: "Trends" },
      { title: "Pet Rock (1975)", description: "Gary Dahl's gag gift — a smooth stone from Rosarito Beach, Mexico, packaged in a cardboard box with breathing holes and a 32-page training manual. Priced at $3.95, it sold 1.5 million units in 6 months making Dahl a millionaire", emoji: "🪨", category: "Trends" },
      { title: "Lava Lamps (1963 design, 70s peak)", description: "Edward Craven-Walker's Astro Lamp from 1963 hit peak popularity in the early 70s — Haggerty Manufacturing sold 7 million units by 1973. The \"lava\" is actually water and colored wax heated by a 40-watt bulb", emoji: "🪔", category: "Trends" },
    ],
    schoolLife: [
      { title: "Metal Lunchboxes (Aladdin/Thermos)", description: "Aladdin Industries and Thermos Company produced licensed lunchboxes featuring The Partridge Family, Six Million Dollar Man, and Planet of the Apes — sold for $2.98 at Sears and were the ultimate playground status symbol", emoji: "🎒", category: "School Life" },
      { title: "Ditto Machines (spirit duplicators)", description: "Buell's 1923 mimeograph alternative used a wax-coated master sheet and a solvent (methanol) to transfer purple ink — the distinctive smell of fresh dittos was so memorable it became a generational sensory trigger", emoji: "📄", category: "School Life" },
      { title: "Overhead Projectors", description: "3M's 1960s transparency projector became standard in 85% of US classrooms by 1975 — teachers wrote on clear acetate sheets with Vis-à-Vis wet-erase markers, and kids loved watching the projected image", emoji: "📽️", category: "School Life" },
      { title: "Scholastic Book Clubs", description: "The monthly flyer with 4 pages of books priced $0.25–$1.95 — distributed to 30 million schoolchildren by 1974. Kids circled their picks with a red crayon and handed crumpled dollar bills to the teacher", emoji: "📚", category: "School Life" },
      { title: "Show and Tell", description: "Friday morning ritual in elementary school — kids brought in everything from their dad's Vietnam medals to live frogs caught in the creek. The anticipation of your turn was more exciting than Christmas morning", emoji: "📢", category: "School Life" },
    ],
    tech: [
      { title: "Western Electric Model 500 Rotary Phone", description: "Bell System's bakelite rotary dial phone found in 80% of American homes — a local call cost 10 cents from a payphone, and you had to wait 2–3 seconds for the dial to spin back between each digit", emoji: "📞", category: "Tech" },
      { title: "Kodak Instamatic / 110 Film", description: "Kodak's 1972 pocket camera using easy-load 110 film cartridges — sold 60 million units worldwide by 1976. Developing a 12-exposure roll cost $1.89 at the local pharmacy and took 3–5 days", emoji: "📸", category: "Tech" },
      { title: "CB Radio Craze (1975–1977)", description: "Citizens Band radio exploded after the 1973 oil crisis when truckers used Channel 19 for speed trap warnings — by 1976 there were 15 million CB radios in the US, and the movie \"Smokey and the Bandit\" (1977) made \"10-4 good buddy\" a national catchphrase", emoji: "📻", category: "Tech" },
      { title: "IBM Selectric Typewriter (1961)", description: "IBM's electric typewriter with a spinning golf-ball type element instead of individual keys — used a 88-character ball that could be swapped for different fonts, became the standard in offices and schools through the 1970s", emoji: "⌨️", category: "Tech" },
      { title: "Polaroid SX-70 (1972)", description: "Edwin Land's folding SLR instant camera — the first to eject the finished print automatically. The film developed in 3 minutes with chemicals contained in the border of each photo, priced at $6.95 per 10-pack", emoji: "📷", category: "Tech" },
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
      { title: "Transformers (Hasbro/Sunbow, 1984)", description: "Based on Hasbro's 1984 toy line repurposed from Japan's Diaclone and Microman — the 98-episode animated series ran in syndication and the 1986 animated film featured Orson Welles' final performance as Unicron", emoji: "🤖", category: "Cartoons" },
      { title: "He-Man and the Masters of the Universe (Filmation, 1983)", description: "Filmation's 130-episode series created to sell Mattel's action figures — Prince Adam's transformation was achieved by recoloring the same cel, and each episode cost $30,000 to produce vs. $100,000 for a typical cartoon", emoji: "💪", category: "Cartoons" },
      { title: "ThunderCats (Rankin/Bass, 1985)", description: "130 episodes animated by Japanese studio Pacific Animation Corporation — the theme song by Bernard Hoffer became so iconic it was later covered by rock bands and used in a 2020 ThunderCats Roar series", emoji: "⚡", category: "Cartoons" },
      { title: "G.I. Joe: A Real American Hero (Sunbow, 1983)", description: "Based on Hasbro's relaunched 3.75-inch action figure line — the 95-episode series famously included the PSA ending \"Now I know! And knowing is half the battle\" in 40+ unique public service announcements", emoji: "🎖️", category: "Cartoons" },
      { title: "Voltron: Defender of the Universe (World Events, 1984)", description: "Adapted from two different Japanese anime series (Beast King GoLion and Armored Fleet Dairugger XV) — 124 episodes about five lions combining into a giant robot, \"Form Blazing Sword\" became the most-quoted line on 80s playgrounds", emoji: "🦁", category: "Cartoons" },
      { title: "DuckTales (Disney, 1987)", description: "Disney's first syndicated animated series — 100 episodes produced by Walt Disney Television Animation. The theme song by Mark Mueller (\"Woo-ooo!\") hit #18 on the Billboard Hot 100 in 1990 and was remixed for the 2017 reboot", emoji: "🦆", category: "Cartoons" },
    ],
    toys: [
      { title: "Rubik's Cube (Ideal Toy Corp, 1980)", description: "Hungarian professor Ernő Rubik's 1974 invention licensed to Ideal Toy Corp — by 1982 it sold 10 million units worldwide. The 1981 World Championship in Budapest was won by Minh Thai with a solve time of 22.95 seconds", emoji: "🧊", category: "Toys" },
      { title: "Cabbage Patch Kids (Coleco, 1983)", description: "Xavier Roberts' hand-stitched dolls mass-produced by Coleco — the 1983 Christmas shortage caused riots in stores. A woman was reportedly injured in a Cabbage Patch fistfight at a Zayre department store in Wilkes-Barre, PA", emoji: "👶", category: "Toys" },
      { title: "Nintendo Entertainment System (NES, 1985)", description: "Nintendo's 8-bit console relaunched the US gaming industry after the 1983 crash — launched in New York City on October 18, 1985 with 18 titles including Super Mario Bros., sold 61.9 million units worldwide by 1994", emoji: "🎮", category: "Toys" },
      { title: "My Little Pony (Hasbro, 1983)", description: "Hasbro's line of colorful plastic ponies with brushable manes and tails — the first year's set of 6 ponies (Cotton Candy, Butterscotch, Blue Belle, Snuzzle, Blossom, Minty) sold 150 million dollars worth by 1986", emoji: "🦄", category: "Toys" },
      { title: "Care Bears (American Greetings/Kenner, 1983)", description: "Spawned from American Greetings' 1981 greeting card characters — each bear had a belly badge (tummy symbol) representing a feeling. The 1985 film \"The Care Bears Movie\" grossed $34 million on a $2 million budget", emoji: "🐻", category: "Toys" },
      { title: "He-Man Action Figures (Mattel, 1982)", description: "The original 8-figure lineup (He-Man, Skeletor, Man-At-Arms, Teela, Beast Man, Stratos, Zodac, Faker) — the Castle Grayskull playset retailed for $21.99 and required 3 AA batteries for the drawbridge sound effect", emoji: "🏰", category: "Toys" },
    ],
    music: [
      { title: "Michael Jackson – Thriller (1982)", description: "Produced by Quincy Jones at Westlake Recording Studios — 9 tracks, 7 became singles. The \"Thriller\" music video directed by John Landis cost $500,000 (the most expensive ever at that time), premiered on MTV on December 2, 1983, and sold 70 million copies worldwide", emoji: "🌙", category: "Music" },
      { title: "Madonna – Like a Virgin (1984)", description: "Produced by Nile Rodgers at Power Station studio in NYC — the title track reached #1 in 6 countries. Madonna wore the white wedding dress from the video to the 1984 MTV VMAs, rolling on the floor in a performance that defined her career", emoji: "👑", category: "Music" },
      { title: "Sony Walkman TPS-L2 (1979/80s staple)", description: "Sony's portable cassette player launched July 1, 1979 at $150 ($660 adjusted) — by 1986 the Walkman brand had sold 50 million units worldwide. The anti-roll technology kept the tape stable during jogging", emoji: "🎧", category: "Music" },
      { title: "MTV Launch (August 1, 1981)", description: "The first music video aired was The Buggles' \"Video Killed the Radio Star\" — by 1983 MTV reached 25 million US households. VJs (video jockeys) like Martha Quinn, Mark Goodman, and Nina Blackwood became as famous as the artists", emoji: "📺", category: "Music" },
      { title: "Depeche Mode / The Cure / New Order", description: "The holy trinity of 80s synth-pop and post-punk — Depeche Mode's \"Just Can't Get Enough\" (1981), The Cure's \"Just Like Heaven\" (1987), and New Order's \"Blue Monday\" (1983) which became the best-selling 12-inch single of all time at 1.2 million copies", emoji: "🎹", category: "Music" },
      { title: "Home Mixtapes (cassette culture)", description: "Recording songs off the radio using a boombox with a built-in cassette deck — pressing REC at the exact moment the song started to avoid the DJ's voice-over. A 90-minute TDK D-90 cassette cost $2.99 and held about 15 songs per side", emoji: "📼", category: "Music" },
    ],
    movies: [
      { title: "E.T. the Extra-Terrestrial (1982)", description: "Steven Spielberg's $10.5 million film shot in 61 days — Drew Barrymore was 6 years old during filming. It grossed $792 million worldwide, held the box office record for 11 years, and Reese's Pieces sales jumped 65% after E.T. ate them on screen", emoji: "👽", category: "Movies" },
      { title: "Back to the Future (1985)", description: "Robert Zemeckis's time-travel comedy filmed at Universal Studios for $19 million — the DeLorean DMC-12 car used in the film was a real 1981 model (only 8,583 were ever built). Grossed $381 million and spawned two sequels", emoji: "⚡", category: "Movies" },
      { title: "The Goonies (1985)", description: "Richard Donner's adventure film from a Steven Spielberg story — shot entirely in Astoria, Oregon over 5 months. The pirate ship set was so large it couldn't fit on any soundstage. Grossed $125 million on a $19 million budget and became a cult classic", emoji: "🗺️", category: "Movies" },
      { title: "Ghostbusters (1984)", description: "Ivan Reitman's $30 million supernatural comedy written by Dan Aykroyd and Harold Ramis — the Stay Puft Marshmallow Man stood 112 feet tall in the finale. Grossed $295 million and the theme song by Ray Parker Jr. reached #1 for 3 weeks", emoji: "👻", category: "Movies" },
      { title: "The Breakfast Club (1985)", description: "John Hughes's $1 million teen drama shot in 28 days at Maine North High School in Des Plaines, Illinois — five teenagers in Saturday detention. Simple Minds' \"Don't You (Forget About Me)\" became the defining anthem of the decade", emoji: "🥪", category: "Movies" },
      { title: "Star Wars: Episode V – The Empire Strikes Back (1980)", description: "Irvin Kershner's sequel filmed at Elstree Studios, England for $18 million — the \"I am your father\" scene was kept so secret that only Mark Hamill, James Earl Jones, and George Lucas knew the real line during filming", emoji: "⚔️", category: "Movies" },
    ],
    snacks: [
      { title: "Kellogg's Pop-Tarts (1964/80s peak)", description: "Originally sold unfrosted in 4 flavors — by the 80s there were 25+ varieties. The frosted Brown Sugar Cinnamon flavor became the #1 seller, and kids discovered that microwaving them for 8 seconds made the filling lava-hot", emoji: "🥐", category: "Snacks" },
      { title: "Capri Sun (Wild Flavors, 1981 US launch)", description: "Rudolf Wild's foil-pouch juice drink launched in Germany in 1969, hit US shelves in 1981 — the straw-poking ritual was so satisfying that kids would trade unpoked pouches just to puncture them themselves", emoji: "🧃", category: "Snacks" },
      { title: "Topps Ring Pop (1979)", description: "Topps Company's wearable candy ring with a hard candy gem on a plastic band — 6 flavors (Strawberry, Watermelon, Blue Raspberry, Grape, Apple, Cherry) sold for 25 cents each at corner stores and became a playground status symbol", emoji: "💍", category: "Snacks" },
      { title: "Betty Crocker Dunkaroos (1988)", description: "General Mills' kangaroo-themed snack with crunchy cookies and vanilla frosting dip — launched with a $12 million ad campaign featuring the Dunkaroo kangaroo mascot, and by 1990 was the #1 selling snack in the cookie aisle", emoji: "🍪", category: "Snacks" },
      { title: "Push Pops (Topps, 1986)", description: "Topps' cylindrical lollipop in a plastic tube — kids pushed up from the bottom to expose more candy. The TV commercial jingle \"Push it up, push it up, push it real good\" played during Saturday morning cartoons", emoji: "🍭", category: "Snacks" },
    ],
    games: [
      { title: "Pac-Man (Namco, 1980)", description: "Toru Iwatani's maze game inspired by a pizza with a missing slice — 296 dots per level, 4 ghosts with distinct AI patterns (Blinky chases, Pinky ambushes, Inky flanks, Clyde wanders). The perfect game (3,333,360 points) wasn't achieved until 1999 by Billy Mitchell", emoji: "🟡", category: "Games" },
      { title: "Super Mario Bros. (Nintendo, 1985)", description: "Shigeru Miyamoto and Takashi Tezuka's 32-level platformer — Mario was originally a carpenter named \"Jumpman\" in Donkey Kong (1981). The game sold 40.2 million copies and established the platformer genre as we know it", emoji: "🍄", category: "Games" },
      { title: "Tetris (Alexey Pajitnov, 1984)", description: "Created by Soviet programmer Alexey Pajitnov on an Electronika 60 computer — the name combines the Greek prefix \"tetra-\" (four) and \"tennis\" (his favorite sport). Nintendo's 1989 Game Boy bundle sold 35 million copies", emoji: "🧱", category: "Games" },
      { title: "The Legend of Zelda (Nintendo, 1986)", description: "Shigeru Miyamoto's open-world adventure on a 128KB Famicom Disk System cartridge — the battery-backed save feature was revolutionary, letting players save progress for the first time. Sold 6.5 million copies on NES", emoji: "🗡️", category: "Games" },
      { title: "Oregon Trail (MECC, 1974/80s Apple II version)", description: "Don Rawitsch, Bill Heinemann, and Paul Dillenberger's educational game developed on a teletype machine — the Apple II version (1985) was installed on 70% of US school computers. \"You have died of dysentery\" became the most-quoted video game line of the 80s", emoji: "🚗", category: "Games" },
      { title: "Simon (Milton Bradley, 1978/80s peak)", description: "Ralph Baer and Howard Morrison's electronic memory game with 4 colored panels — the original 1978 version cost $24.95 ($110 adjusted). The game speed increased by eliminating the pause between tones, reaching up to 20+ sequences at the highest level", emoji: "🔴", category: "Games" },
    ],
    trends: [
      { title: "Neon / Hypercolor Clothing", description: "Hypercolor T-shirts by Generra Sport changed color with body heat — a $30 shirt used thermochromic leuco dye that turned purple from pink. The fad peaked in 1991 at $100 million in sales before kids discovered the armpit-color problem", emoji: "🌈", category: "Trends" },
      { title: "Shoulder Pads / Power Suits", description: "Women's business suits with padded shoulders 3–4 inches wide — popularized by Joan Collins in Dynasty (1981–1989) and the 1988 film Working Girl. Giorgio Armani and Claude Montana designed the most iconic versions", emoji: "👔", category: "Trends" },
      { title: "Leg Warmers (Flashdance, 1983)", description: "The 1983 film Flashdance starring Jennifer Beals made leg warmers a $100 million fashion trend — originally worn by dancers to keep muscles warm, they became everyday accessories in every color from neon pink to pastel yellow", emoji: "🧦", category: "Trends" },
      { title: "Scrunchies (Revson, 1987)", description: "Rommy Revson's fabric-covered hair elastic patented in 1987 — named after her pet toy poodle Scunci. By 1989, 200 million scrunchies were sold annually. They didn't crease or break hair like metal bobby pins", emoji: "🎀", category: "Trends" },
      { title: "Boombox / Ghetto Blaster", description: "Portable stereo systems weighing 15–26 pounds with dual cassette decks and 10-inch woofers — Sharp, JVC, and Panasonic dominated the market. Carrying one on your shoulder (\"blasting\") became a cultural symbol in hip-hop, costing $150–$400", emoji: "📻", category: "Trends" },
    ],
    schoolLife: [
      { title: "Trapper Keeper (Mead, 1978)", description: "E. Bryant Crutchfield's three-ring binder with a velcro flap closure — by 1989 Mead had sold 75 million units. The 1980s versions featured plastic sliders, pencil pouches, and licensed art from Transformers and Star Wars", emoji: "📓", category: "School Life" },
      { title: "Pogs / Milk Caps (1993 peak but 80s origins)", description: "Hawaiian juice company Haleakala Dairy's cardboard bottle seals became playground currency in the early 90s — the 8-bottle POG juice blend (Passion, Orange, Guava) gave them their name. Kids slammed stacks with heavy metal \"slammers\"", emoji: "🪙", category: "School Life" },
      { title: "Scholastic Book Fairs", description: "The traveling book sale that transformed school gyms and libraries for one week — kids brought $2–$5 in crumpled bills and left carrying Goosebumps books, Garfield posters, and scented erasers. Generated $350 million annually for Scholastic by the late 80s", emoji: "📖", category: "School Life" },
      { title: "Pencil Toppers and Erasers", description: "Sanrio Hello Kitty pencil toppers, scented erasers shaped like food, and rubbery character heads that sat on #2 Ticonderoga pencils — sold 3 for $1 at school bookstores and were the ultimate desk decoration", emoji: "✏️", category: "School Life" },
      { title: "Lisa Frank (1981/80s-90s peak)", description: "Lisa Frank's rainbow-colored school supplies featuring unicorns, dolphins, and pandas — founded in 1979, her company reached $60 million in annual sales by 1996. The fluorescent pink and purple aesthetic was instantly recognizable on any binder or folder", emoji: "🦄", category: "School Life" },
    ],
    tech: [
      { title: "VHS VCR (JVC HR-3300, 1976/80s household staple)", description: "JVC's Video Home System won the format war against Sony's Betamax — by 1987 VHS had 90% of the home video market. A blank T-120 tape cost $3.99 and recorded 6 hours in SLP mode. Blockbuster had 9,000+ stores by 1990", emoji: "📼", category: "Tech" },
      { title: "Apple IIe (Apple, 1983)", description: "Apple's most successful 8-bit computer — $1,395 with 64KB RAM and a 1MHz 6502 processor. Used in 80% of US schools by 1986. Oregon Trail, Oregon Trail, and more Oregon Trail were the main reasons kids fought over computer lab time", emoji: "💻", category: "Tech" },
      { title: "Cassette Tapes (TDK/Maxell/Scotch)", description: "A 90-minute cassette tape (TDK D-90) cost $2.99 and required the pencil-untangling technique when the player ate the tape — holding the pencil in the reel hole and slowly rotating to wind the tape back flat", emoji: "🎵", category: "Tech" },
      { title: "Atari 2600 (1977/80s yard sale staple)", description: "Atari's 1.19 MHz MOS 6507-based console with 128 bytes of RAM — launched the home gaming industry in 1977 but was relegated to yard sale bins by 1984 after E.T.'s commercial failure and the industry crash", emoji: "🕹️", category: "Tech" },
      { title: "Commodore 64 (1982)", description: "The best-selling single computer model of all time at 12.5–17 million units — $595 at launch with 64KB RAM, a MOS 6510 CPU, and a SID sound chip that could produce 3 simultaneous voices. Its BASIC programming language taught a generation to code", emoji: "🖥️", category: "Tech" },
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
      { title: "Rugrats (Nickelodeon, 1991)", description: "Arlene Klasky and Gábor Csupó's animated series about toddlers exploring the world — the pilot aired as a short on Doug in 1991. Ran for 13 years and 172 episodes, spawned 3 movies, and made Angelica Pickles the most iconic cartoon bully of the decade", emoji: "👶", category: "Cartoons" },
      { title: "Hey Arnold! (Nickelodeon, 1996)", description: "Craig Bartlett's cartoon about a football-headed boy living in a boarding house in a fictional NYC — Arnold's room had the most coveted detail: a secret room accessible through a trap door, revealed in the 2002 movie", emoji: "🏈", category: "Cartoons" },
      { title: "Pokémon (TV Tokyo, 1997 / US 1998)", description: "Based on Satoshi Tajiri's 1996 Game Boy games — the anime's first episode \"Pokémon, I Choose You!\" aired September 8, 1997 in Japan and caused 685 children to suffer seizures from the Porygon strobe effect", emoji: "⚡", category: "Cartoons" },
      { title: "Dexter's Laboratory (Cartoon Network, 1996)", description: "Genndy Tartakovsky's first creation for Cartoon Network's What a Cartoon! showcase — the pilot \"Changes\" aired February 26, 1995. Dexter's secret lab was accessed through a bookshelf, and his sister Dee Dee's destruction was always inevitable", emoji: "🔬", category: "Cartoons" },
      { title: "The Powerpuff Girls (Cartoon Network, 1998)", description: "Craig McCracken's series created as \"The Whoopass Girls\" in his 1992 CalArts thesis film — Sugar, Spice, and Everything Nice plus Chemical X. The movie villain Mojo Jojo was voiced by Roger L. Jackson in a parody of Orson Welles", emoji: "💪", category: "Cartoons" },
      { title: "Dragon Ball Z (Toei Animation, 1989 / US 1996)", description: "Akira Toriyama's anime adaptation of his manga — Funimation's 1996 English dub on syndicated TV and later Cartoon Network's Toonami block (1998) introduced American kids to anime. The Frieza Saga (81 episodes) remains the longest fight in anime history", emoji: "🐉", category: "Cartoons" },
    ],
    toys: [
      { title: "Tamagotchi (Bandai, 1996)", description: "Aki Maita's virtual pet on a 32×16 pixel LCD screen — launched in Japan November 23, 1996 and in the US May 1, 1997 for $14.99. Over 76 million units sold worldwide by 2010. The pet died if neglected for more than a few hours", emoji: "🐣", category: "Toys" },
      { title: "Beanie Babies (Ty Inc., 1993)", description: "H. Ty Warner's stuffed animals filled with PVC pellets and kidney-shaped \"bean\" pods — the original 9 launched in 1993 at $5 each. By 1996 secondary market prices hit $5,000+ for rare editions like Peanut the Royal Blue Elephant", emoji: "🧸", category: "Toys" },
      { title: "Furby (Tiger Electronics, 1998)", description: "Dave Hampton and Caleb Chung's robotic owl-like pet with an IR sensor, microphone, and motor — spoke 200+ words in \"Furbish\" and gradually learned English. Sold 1.8 million units in the 1998 holiday season at $35 each", emoji: "🦉", category: "Toys" },
      { title: "Nintendo Game Boy (1989/90s peak)", description: "Gunpei Yokoi's 8-bit handheld with a 160×144 pixel green-tinted LCD — 118.7 million units sold worldwide (including Pocket and Color variants). Tetris was the pack-in game that made it a must-have for every kid aged 6–14", emoji: "🎮", category: "Toys" },
      { title: "Pokémon Trading Card Game (Nintendo/TPC, 1996)", description: "Based on the Game Boy game mechanics — the 1999 US Base Set included 102 cards. The 1st Edition holographic Charizard (#4/102) with a shadowless print run became the most valuable card, selling for $420,000 at auction in 2022", emoji: "🃏", category: "Toys" },
      { title: "Bop It Extreme (Hasbro, 1998)", description: "Hasbro's audio game with voice commands — \"Bop it! Twist it! Pull it!\" at increasing speed. The original 1996 version sold 3 million units; the 1998 Bop It Extreme added Flick It and Spin It commands", emoji: "🎯", category: "Toys" },
    ],
    music: [
      { title: "Nirvana – Nevermind (1991)", description: "Recorded at Sound City Studios in Van Nuys, CA for $606.17 — \"Smells Like Teen Spirit\" reached #6 on the Billboard Hot 100. Nevermind sold 30 million copies worldwide and replaced Michael Jackson's Dangerous at #1 on the Billboard 200 in January 1992", emoji: "🎸", category: "Music" },
      { title: "Spice Girls – Spice (1996)", description: "Virgin Records' girl group debut produced by Richard Stannard and Matt Rowe — \"Wannabe\" hit #1 in 37 countries. The album sold 31 million copies worldwide, and the term \"Girl Power\" became a global cultural phenomenon", emoji: "💃", category: "Music" },
      { title: "Backstreet Boys – Millennium (1999)", description: "Jive Records' boy band album that sold 1.13 million copies in its first week — \"I Want It That Way\" was written by Max Martin and Andreas Carlsson. The album sold 30 million copies and was the best-selling album of 1999", emoji: "🎤", category: "Music" },
      { title: "Portable CD Players (Sony Discman D-50, 1984/90s staple)", description: "Sony's Discman and competitors like Panasonic's ShockWave featured 10-second anti-skip buffers by the mid-90s — a CD cost $14.99 at Sam Goody, and the player ran on 2 AA batteries that lasted about 8 hours", emoji: "💿", category: "Music" },
      { title: "Tupac Shakur / The Notorious B.I.G.", description: "The East Coast–West Coast hip-hop rivalry defined the mid-90s — Tupac's All Eyez on Me (1996, Death Row Records) was the first double-CD hip-hop studio album. Biggie's Ready to Die (1994, Bad Boy Records) went platinum 4x. Both artists were murdered within 6 months of each other in 1996–1997", emoji: "🎤", category: "Music" },
      { title: "NSYNC – No Strings Attached (2000)", description: "Jive Records released the follow-up to their 1998 debut — first-week sales of 2.42 million copies set a record that stood for 15 years. The album's title referenced their split from manager Lou Pearlman, who was later convicted of a $300 million Ponzi scheme", emoji: "🎵", category: "Music" },
    ],
    movies: [
      { title: "Toy Story (Pixar/Disney, 1995)", description: "Pixar's first feature film directed by John Lasseter — the first entirely CGI-animated film. Rendered on a farm of 117 Sun Microsystems SPARCstation 20s, each frame took 4–13 hours to render. Grossed $373 million worldwide", emoji: "🤠", category: "Movies" },
      { title: "The Lion King (Disney, 1994)", description: "Disney's 32nd animated feature directed by Roger Allers and Rob Minkoff — composed by Hans Zimmer with songs by Elton John and Tim Rice. Grossed $968 million worldwide. The wildebeest stampede scene used 3 million individual animated animals", emoji: "🦁", category: "Movies" },
      { title: "Jurassic Park (Universal, 1993)", description: "Steven Spielberg's $63 million adaptation of Michael Crichton's 1990 novel — the T-Rex and velociraptors were built as full-size animatronics by Stan Winston's studio, supplemented with ILM's CGI (only 6 minutes of screen time). Grossed $914 million", emoji: "🦕", category: "Movies" },
      { title: "Home Alone (20th Century Fox, 1990)", description: "John Hughes's $18 million comedy shot in Winnetka, Illinois — Macaulay Culkin was paid $4.5 million for the sequel. The film grossed $476 million, becoming the highest-grossing comedy of all time until 2001", emoji: "🏠", category: "Movies" },
      { title: "The Matrix (Warner Bros., 1999)", description: "The Wachowskis' $63 million sci-fi film — the 360-degree bullet-time effect was created using 120 Canon still cameras on a green-screen rig. Keanu Reeves trained for 4 months in wire-fu martial arts with Yuen Woo-ping. Grossed $467 million", emoji: "🕶️", category: "Movies" },
      { title: "Titanic (Paramount/20th Century Fox, 1997)", description: "James Cameron's $200 million epic — filmed on a 90% scale replica of the ship built in a custom tank in Rosarito, Mexico. Grossed $2.2 billion worldwide (first film to cross $1 billion and $2 billion), won 11 Academy Awards", emoji: "🚢", category: "Movies" },
    ],
    snacks: [
      { title: "Fruit Gushers (General Mills, 1991)", description: "Betty Crocker's fruit snacks with a liquid juice center — the original 3 flavors (Strawberry Splash, Tropical Punch, Watermelon Burst) came in a 6-pack box for $1.99. The 1999 TV ad campaign featured kids' heads turning into fruit after eating them", emoji: "🍇", category: "Snacks" },
      { title: "Fruit Roll-Ups (General Mills, 1983/90s peak)", description: "The flat fruit leather snack in a paper-backed cellophane sleeve — kids unrolled them slowly, licked the fruit leather, and used the transparent wrapper as a temporary tattoo press. The tie-dye swirl flavors launched in 1994", emoji: "🍒", category: "Snacks" },
      { title: "Handi-Snacks (Nabisco, 1980s/90s)", description: "Nabisco's cracker and cheese spread combo — a red plastic tray with 6 round crackers, a foil-wrapped cheese spread, and a tiny orange plastic spreader. The cheese was actually made with real cheddar and cost $1.29 per pack", emoji: "🧀", category: "Snacks" },
      { title: "Squeeze Its (Sunkist, 1990)", description: "Sunkist's bottle-shaped juice concentrate in 6 flavors — you added water to the plastic bottle and shook it. The TV ad showed kids squeezing the bottle and the juice splashing everywhere. Discontinued by 1995 but remained in school vending machines until 2000", emoji: "🧃", category: "Snacks" },
      { title: "Dunkaroos (General Mills, 1988/90s peak)", description: "The kangaroo-themed cookie-and-frosting snack — the original frosted chocolate cookie with vanilla icing dip was the most popular flavor. Sold in Canada until 2021 and was reintroduced to the US in 2022 after a 20-year absence and viral social media campaigns", emoji: "🍪", category: "Snacks" },
    ],
    games: [
      { title: "Pokémon Red and Blue (Game Freak/Nintendo, 1996/1998)", description: "Satoshi Tajiri's RPG inspired by his childhood bug-collecting hobby — 151 Pokémon programmed into the game, each with unique base stats. The US Red/Blue versions sold 10.23 million and 10.98 million copies respectively", emoji: "🔴", category: "Games" },
      { title: "Super Mario 64 (Nintendo EAD, 1996)", description: "Shigeru Miyamoto's 3D platformer for the Nintendo 64 — developed with a team of 15 people over 2 years. Mario's moveset (triple jump, wall kick, long jump) set the standard for 3D character controls. Sold 11.9 million copies", emoji: "⭐", category: "Games" },
      { title: "Crash Bandicoot (Naughty Dog, 1996)", description: "Andy Gavin and Jason Rubin's PlayStation platformer — the first 3D platformer on a disc-based console. Each level was designed as a single visual corridor because the PS1 had only 2MB of RAM. Sold 6.82 million copies", emoji: "🦊", category: "Games" },
      { title: "Sonic the Hedgehog 2 (Sega, 1992)", description: "Sonic Team's sequel introduced Tails and the Spin Dash mechanic — developed simultaneously in Japan and the US by a 20-person team. The \"Sega Scream\" TV commercial (\"SEGA!\") was one of the most recognized ads of the 90s", emoji: "🔵", category: "Games" },
      { title: "Mortal Kombat (Midway, 1992)", description: "Ed Boon and John Tobias's fighting game digitized real actors — the \"Fatalities\" (finishing moves) like Sub-Zero's spine rip led to the 1993 Congressional hearings and the creation of the ESRB rating system. Arcade cabinets cost $3,500 each", emoji: "🥊", category: "Games" },
      { title: "GoldenEye 007 (Rare, 1997)", description: "Rare's first-person shooter for Nintendo 64 — developed by a 12-person team led by Martin Hollis. The split-screen 4-player multiplayer mode invented the console FPS genre and directly inspired Halo and Call of Duty. Sold 8.09 million copies", emoji: "🔫", category: "Games" },
    ],
    trends: [
      { title: "Choker Necklaces / Tattoo Chokers", description: "Stretchy plastic lace chokers worn tight around the neck — 3-pack for $1.99 at Claire's and Afterthoughts. The black \"tattoo\" style with a small plastic pendant was the most popular, worn by every girl aged 10–18 from 1995–1998", emoji: "📿", category: "Trends" },
      { title: "Platform Sneakers (Spice Girls influence)", description: "The Spice Girls wore 4-inch platform sneakers in their 1997 \"Say You'll Be There\" video — Buffalo Boots and Skechers sold 15 million pairs of platform sneakers in 1997 alone, retailing at $59.99–$89.99", emoji: "👞", category: "Trends" },
      { title: "Frosted Tips (NSYNC/Backstreet Boys)", description: "The \"heartthrob\" hairstyle achieved by bleaching the tips of spiky hair — popularized by *NSYNC's Justin Timberlake and Backstreet's Nick Carter in 1998. Cost about $45–$75 at a salon and required monthly touch-ups", emoji: "💇", category: "Trends" },
      { title: "Butterfly Hair Clips", description: "Small plastic clips with wings that came in 20+ colors — sold 10 for $2 at drugstores. Girls wore 5–15 clips at a time, creating a crown of butterflies across the top of their head. The trend peaked in 1997–1998", emoji: "🦋", category: "Trends" },
      { title: "Bucket Hats (Kangol)", description: "Kangol's Ventair bucket hat popularized by LL Cool J in the late 80s became mainstream in the 90s — the 504 model retailed for $35 and came in 40+ colors. Also worn by Samuel L. Jackson in every movie he made from 1994–2004", emoji: "🎩", category: "Trends" },
    ],
    schoolLife: [
      { title: "Blockbuster Video Friday Nights", description: "The Friday night ritual: drive to Blockbuster, browse the new releases wall for 20 minutes, rent 2 VHS tapes for $3.99 each plus a box of microwave popcorn. Late fees were $1.00 per day and every parent had a story about a $20 late fee", emoji: "🎬", category: "School Life" },
      { title: "AOL Instant Messenger (AIM, 1997)", description: "AOL's instant messaging service launched in May 1997 — by 1999 it had 100 million registered users. The door-slam sound (wav file) became Pavlovian. Away messages were carefully crafted personality statements, and the Buddy List was your social hierarchy", emoji: "💬", category: "School Life" },
      { title: "Gel Pens (Pentel/Sakura, 1990s)", description: "Sakura Gelly Roll pens launched in the US in 1989 and became a 90s school obsession — metallic silver, glitter, and scented (strawberry, grape, chocolate) varieties. Kids traded them and collected all 24 colors at $1.49 each", emoji: "✍️", category: "School Life" },
      { title: "Dial-Up Internet (28.8k/56k modem)", description: "The screeching handshake sound of a 56k modem connecting at 44,000 bps — downloading a single MP3 took 15–20 minutes on Napster. Parents yelling \"get off the internet, I need to use the phone!\" was a daily occurrence", emoji: "📡", category: "School Life" },
      { title: "Windows 95 (Microsoft, August 24, 1995)", description: "Microsoft's $100 operating system that introduced the Start button, Taskbar, and 32-bit multitasking — the Rolling Stones' \"Start Me Up\" was licensed for $3 million for the ad campaign. Sold 7 million copies in 5 weeks", emoji: "🪟", category: "School Life" },
    ],
    tech: [
      { title: "Sony PlayStation (1994)", description: "Ken Kutaragi's 32-bit CD-ROM console using a MIPS R3000A CPU at 33.8 MHz — launched in Japan December 3, 1994 for ¥39,800 and in the US September 9, 1995 for $299. Sold 102.5 million units worldwide, dethroning Nintendo's console dominance", emoji: "🎮", category: "Tech" },
      { title: "Motorola Pager / Beeper (1990s)", description: "Motorola's numeric pager received text messages via radio frequency — a call from a number ending in 143 meant \"I love you\" (1-4-3 letters). Monthly service cost $8.99–$14.99. By 1994 there were 61 million pagers in the US", emoji: "📟", category: "Tech" },
      { title: "Tamagotchi Digital Pet (Bandai, 1996)", description: "Same as the toy entry but from tech perspective: the egg-shaped device had a 4-bit CPU, 1KB of RAM, a 32×16 dot-matrix LCD, and ran on a single CR2032 button-cell battery lasting about 6 months of active use", emoji: "🥚", category: "Tech" },
      { title: "Apple iMac G3 (1998)", description: "Jonathan Ive's translucent Bondi Blue all-in-one computer — 233 MHz PowerPC G3, 32MB RAM, 4GB hard drive, priced at $1,299. Sold 800,000 units in 139 days and saved Apple from near-bankruptcy", emoji: "💻", category: "Tech" },
      { title: "Nokia 5110 / 3210 (1998/1999)", description: "Nokia's candy-bar phones with the built-in Snake game — the 5110 had interchangeable Xpress-On covers (over 70 designs available) and the 3210 had an internal antenna. Combined sales exceeded 160 million units by 2000", emoji: "📱", category: "Tech" },
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
      { title: "SpongeBob SquarePants (Nickelodeon, 1999)", description: "Stephen Hillenburg's underwater cartoon — the pilot \"Help Wanted\" aired May 1, 1999 after the 1999 Kids' Choice Awards. By 2004 it was Nickelodeon's highest-rated show. The \"Sweet Victory\" scene from the 2001 episode \"Band Geeks\" was played at the 2019 Super Bowl", emoji: "🧽", category: "Cartoons" },
      { title: "Avatar: The Last Airbender (Nickelodeon, 2005)", description: "Michael Dante DiMartino and Bryan Konietzko's anime-inspired series — 61 episodes across 3 seasons (Books: Water, Earth, Fire). The two-part series finale \"Sozin's Comet\" (July 19, 2008) drew 5.6 million viewers, the highest-rated episode in Nicktoons history", emoji: "🌀", category: "Cartoons" },
      { title: "The Fairly OddParents (Nickelodeon, 2001)", description: "Butch Hartman's series about Timmy Turner and his fairy godparents Cosmo and Wanda — originated from Oh Yeah! Cartoons shorts in 1998. Ran for 10 seasons and 172 episodes, making it Nickelodeon's second-longest running cartoon behind SpongeBob", emoji: "✨", category: "Cartoons" },
      { title: "Teen Titans (Warner Bros./Cartoon Network, 2003)", description: "Glen Murakami's anime-influenced superhero series based on the DC Comics team — the theme song by Puffy AmiYumi became a top-40 hit in Japan. Each episode cost $500,000 to produce, 3x the average for a Cartoon Network original", emoji: "🦸", category: "Cartoons" },
      { title: "Samurai Jack (Cartoon Network, 2001)", description: "Genndy Tartakovsky's action series with minimal dialogue — the pilot \"The Beginning\" won an Emmy Award for Outstanding Animated Program. The series ran for 4 seasons, with a belated Season 5 conclusion in 2017 on Adult Swim", emoji: "⚔️", category: "Cartoons" },
    ],
    toys: [
      { title: "Bratz Dolls (MGA Entertainment, 2001)", description: "Carter Bryant's fashion dolls with almond-shaped eyes, full lips, and crop tops — launched June 2001 as an edgy alternative to Barbie. By 2005 Bratz had $2 billion in annual sales, stealing 40% market share from Mattel's Barbie line", emoji: "👗", category: "Toys" },
      { title: "Yu-Gi-Oh! Trading Cards (Konami, 2002 US launch)", description: "Based on Kazuki Takahashi's 1996 manga — the US release by Upper Deck Entertainment featured the Blue-Eyes White Dragon as the chase card. By 2009, 25 billion cards had been sold worldwide, making it the second-best-selling TCG after Pokémon", emoji: "🃏", category: "Toys" },
      { title: "Beyblades (Takara/Hasbro, 2002)", description: "Takara's spinning top battle game launched in Japan in 1999 and hit the US in 2002 — the Beyblade Tournament Series traveled to 30 US cities in 2003. Hasbro sold 100 million units worldwide by 2005", emoji: "🔄", category: "Toys" },
      { title: "Nintendo DS (2004)", description: "Nintendo's dual-screen handheld with a resistive touchscreen — launched November 21, 2004 in the US at $149.99. Nintendogs (2005) sold 23.96 million copies and became the system's killer app. Total DS family sales: 154 million units", emoji: "🎮", category: "Toys" },
      { title: "Webkinz (Ganz, 2005)", description: "Ganz's plush toys that unlocked a virtual world at Webkinz.com — each $12.99 plush came with a secret code for 12 months of online access. By 2007, 2 million unique users visited Webkinz.com monthly, mostly children aged 6–12", emoji: "🐾", category: "Toys" },
      { title: "Nintendo Wii (2006)", description: "Nintendo's motion-control console launched November 19, 2006 for $249.99 — the Wii Remote contained a 3-axis accelerometer and optical sensor. Wii Sports (pack-in) sold 82.9 million copies. Total sales: 101.6 million units worldwide", emoji: "🎮", category: "Toys" },
    ],
    music: [
      { title: "Apple iPod (October 23, 2001)", description: "Tony Fadell's team at Apple created the portable MP3 player with a 5GB hard drive holding \"1,000 songs in your pocket\" — launched at $399 with a FireWire connector. By 2007, 100 million iPods had been sold, and the iTunes Store had sold 2 billion songs at $0.99 each", emoji: "🎧", category: "Music" },
      { title: "Burning CDs (Nero/Roxio, 2000s)", description: "Nero Burning ROM and Roxio Easy CD Creator were the go-to software — a blank CD-R cost $0.25 by 2003. The ritual of creating a mix CD with custom Sharpie-art cover for your crush took 2–3 hours and was the ultimate expression of affection", emoji: "💿", category: "Music" },
      { title: "Eminem – The Marshall Mathers LP (2000)", description: "Interscope/Aftermath release produced by Dr. Dre and Eminem — sold 1.76 million copies in its first week, the fastest-selling rap album at the time. \"Stan\" was so influential it was added to the Oxford English Dictionary as a noun meaning \"overzealous fan\"", emoji: "🎤", category: "Music" },
      { title: "Rihanna – Good Girl Gone Bad (2007)", description: "Def Jam's third Rihanna album produced by Timbaland, Stargate, and Ne-Yo — \"Umbrella\" featuring Jay-Z stayed at #1 in the UK for 10 consecutive weeks. The album sold 9 million copies worldwide and defined the pop-R&B sound of the late 2000s", emoji: "☂️", category: "Music" },
      { title: "iTunes Music Store (April 28, 2003)", description: "Apple's digital music store launched with 200,000 songs at $0.99 each — sold 1 million songs in the first week. By 2006 it had sold 1 billion songs and overtook Walmart as the #1 music retailer in the US", emoji: "💰", category: "Music" },
      { title: "Lil Wayne – Tha Carter III (2008)", description: "Cash Money/Universal Motown release — sold 1.005 million copies in its first week. \"Lollipop\" featuring Static Major was Wayne's first #1 on the Billboard Hot 100. The album won a Grammy for Best Rap Album and is considered the peak of the mixtape-to-mainstream era", emoji: "🎵", category: "Music" },
    ],
    movies: [
      { title: "Harry Potter Film Series (2001–2011)", description: "Warner Bros.' 8-film adaptation of J.K. Rowling's books — the first film directed by Chris Columbus grossed $1.02 billion worldwide. Daniel Radcliffe, Emma Watson, and Rupert Grint were cast at ages 11, 10, and 12 respectively. Total franchise gross: $7.7 billion", emoji: "⚡", category: "Movies" },
      { title: "Shrek (DreamWorks, 2001)", description: "Mike Myers, Eddie Murphy, and Cameron Diaz voiced the characters — the film's $60 million budget included $40 million for the CGI rendering farm. Shrek's swamp was modeled after a real location in Scotland. Grossed $484 million and won the first Oscar for Best Animated Feature", emoji: "🧅", category: "Movies" },
      { title: "The Dark Knight (Warner Bros., 2008)", description: "Christopher Nolan's $185 million sequel filmed in IMAX in Chicago — Heath Ledger's Joker required 3 hours of makeup daily. The film grossed $1.005 billion, becoming the first superhero film to cross $1 billion. Ledger won a posthumous Oscar for Best Supporting Actor", emoji: "🦇", category: "Movies" },
      { title: "Finding Nemo (Pixar, 2003)", description: "Andrew Stanton's ocean adventure required rendering 2.5 million fish, coral, and underwater particles — the Great Barrier Reef scenes alone used 200 billion particles. Grossed $940 million worldwide and held the record for best-selling DVD of all time", emoji: "🐠", category: "Movies" },
      { title: "Mean Girls (Paramount, 2004)", description: "Tina Fey's screenplay adapted from Rosalind Wiseman's book \"Queen Bees and Wannabees\" — filmed in Toronto for $17 million. Lindsay Lohan was originally cast as Regina George but was recast as Cady. The film grossed $130 million and generated 3+ million memes per year for the next decade", emoji: "💄", category: "Movies" },
      { title: "The Lord of the Rings Trilogy (2001–2003)", description: "Peter Jackson's three-film epic shot simultaneously in New Zealand over 438 days for a combined $281 million — 48,000 swords, 1,600 pairs of prosthetic feet, and 2,400 hobbit-scale props were created. Total worldwide gross: $2.991 billion, 17 Academy Awards", emoji: "💍", category: "Movies" },
    ],
    snacks: [
      { title: "Toaster Strudels (Pillsbury, 1985/2000s peak)", description: "Pillsbury's frozen pastry with icing packet — the TV commercials featuring the German-accented \"Toaster Strudel\" boy became a running gag. Kids preferred them over Pop-Tarts because you got to squeeze the icing yourself. A box of 6 cost $2.79 at grocery stores", emoji: "🥐", category: "Snacks" },
      { title: "Bagel Bites (Ore-Ida, 1992/2000s staple)", description: "Ore-Ida's mini bagel pizzas — the \"Pizza in the Morning, Pizza in the Evening, Pizza at Suppertime\" jingle played during every Nickelodeon commercial break. A 9-count box cost $3.49 and could be microwaved in 1 minute 30 seconds", emoji: "🍕", category: "Snacks" },
      { title: "Hot Cheetos (Frito-Lay, 1992)", description: "Frito-Lay's Flamin' Hot Cheetos created by Richard Montañez, a janitor at Frito-Lay's Rancho Cucamonga plant — the origin story (now disputed) says he pitched the idea to the CEO. By 2005, Flamin' Hot was a $4 billion brand across multiple products", emoji: "🌶️", category: "Snacks" },
      { title: "Kool-Aid Bursts (Kraft, 1990s/2000s)", description: "Kraft's bottle-shaped gel drink in 8 flavors — sold in 10-pouch boxes for $2.99. The squeeze bottle design was so popular that kids collected empty bottles as water guns. Discontinued in the US by 2010 but remained in Canada", emoji: "🧃", category: "Snacks" },
      { title: "Oreos with Milk (Nabisco, 1912/2000s ritual)", description: "The ritual of twisting, licking, and dipping an Oreo into cold milk — Nabisco's Double Stuf (1974) and later Mega Stuf (2013) were invented specifically because kids preferred more filling. An Oreo has 160 calories; the average kid ate 3–5 per sitting", emoji: "🍪", category: "Snacks" },
    ],
    games: [
      { title: "Halo: Combat Evolved (Bungie/Microsoft, 2001)", description: "Bungie's FPS launched alongside the Xbox on November 15, 2001 — the Warthog jeep's physics were an accident (the suspension was set too bouncy). Sold 5 million copies and proved that FPS games could work on consoles with a gamepad", emoji: "🎯", category: "Games" },
      { title: "World of Warcraft (Blizzard, 2004)", description: "Blizzard's MMORPG launched November 23, 2004 after 4+ years of development at a cost of $63 million — reached 12 million subscribers at peak in 2010. The game world of Azeroth was 80 square miles, roughly the size of Greater London", emoji: "⚔️", category: "Games" },
      { title: "Guitar Hero (Harmonix, 2005)", description: "Harmonix's rhythm game bundled with a plastic Gibson SG controller — used a 5-fret button layout and a strum bar. \"I Love Rock 'n' Roll\" (Joan Jett) was the final song. RedOctane shipped 1.5 million copies in 2006", emoji: "🎸", category: "Games" },
      { title: "RuneScape (Jagex, 2001)", description: "Andrew and Paul Gower's browser-based MMORPG written in Java — launched January 4, 2001 as a free-to-play game. By 2007 it had 6 million active players and 1 million paid subscribers at $5/month. The game was playable on any school computer", emoji: "🗡️", category: "Games" },
      { title: "Club Penguin (New Horizon Interactive, 2005)", description: "Lance Priebe's Flash-based virtual world for kids — acquired by Disney in August 2007 for $350 million. At peak (2007) it had 12 million registered accounts and 30 million monthly visitors. Membership cost $5.95/month", emoji: "🐧", category: "Games" },
      { title: "Neopets (NeoPets, 1999/2000s peak)", description: "Adam Powell and Donna Williams's virtual pet website launched November 15, 1999 — by 2005 it had 35 million accounts and 5 billion page views per month. The in-game economy (Neopoints) was so complex it had its own stock market (Neodaq)", emoji: "🐾", category: "Games" },
    ],
    trends: [
      { title: "Motorola RAZR V3 (2004)", description: "Motorola's ultra-thin flip phone at 13.9mm — launched September 2004 at $499 with a 2.2-inch display and a VGA camera. Sold 130 million units, making it the best-selling clamshell phone in history. The aluminum body came in Silver, Pink, and Black", emoji: "📱", category: "Trends" },
      { title: "Emo Fashion (2004–2008)", description: "Characterized by side-swept bangs (covering one eye), black eyeliner, studded belts, Converse Chuck Taylors, and band T-shirts — My Chemical Romance's \"Three Cheers for Sweet Revenge\" (2004) was the unofficial emo uniform catalog", emoji: "🖤", category: "Trends" },
      { title: "Low-Rise Jeans (early 2000s)", description: "Jeans with a 6–7-inch rise that sat below the navel — popularized by Britney Spears in her 2001 \"I'm a Slave 4 U\" performance. Brands like Levi's Superlow and Abercrombie & Fitch sold 200+ million pairs between 2000–2006", emoji: "👖", category: "Trends" },
      { title: "Heelys (2000)", description: "Roger Adams' sneakers with a removable wheel in the heel — launched in 2000 and sold 4.5 million pairs in 2001. Schools banned them after multiple wrist injuries. The original model had a single polyurethane wheel rated for 200 lbs", emoji: "👟", category: "Trends" },
      { title: "Silly Bandz (2009)", description: "Robert Croak's silicone rubber band bracelets shaped like animals, letters, and objects — launched in 2009 and by 2010 were banned in 30% of US elementary schools for being a distraction. Croak's company BCP Imports sold $80 million worth in 2010 alone", emoji: "🌈", category: "Trends" },
    ],
    schoolLife: [
      { title: "MySpace (2003–2009)", description: "Tom Anderson and Chris DeWolfe's social network — by 2006 it had 106 million accounts. The \"Top 8\" friends list was the source of more middle-school drama than anything in human history. Custom HTML profiles with autoplay music were a art form", emoji: "🌐", category: "School Life" },
      { title: "LimeWire (2000–2010)", description: "Mark Gorton's Gnutella-based P2P file-sharing client — at its 2006 peak, 1.5 million users were simultaneously sharing 3.2 million files. The RIAA sued LimeWire for $105 million in damages, and a federal judge shut it down in October 2010", emoji: "📥", category: "School Life" },
      { title: "Note Passing (folded triangles)", description: "The art of folding a piece of loose-leaf paper into a tight triangle or square — notes contained secrets, doodles, and \"check yes or no\" lists. Getting caught by the teacher meant public reading, which was social death", emoji: "📝", category: "School Life" },
      { title: "AIM / AOL Instant Messenger (1997/2000s peak)", description: "The desktop chat app that defined a generation — by 2005 AIM had 53 million active users. Away messages like \"away doing homework...NOT\" and buddy icons from BuddyIconForum.com were essential self-expression tools", emoji: "💬", category: "School Life" },
      { title: "Flash Games (Newgrounds/Miniclip, 2000s)", description: "Newgrounds.com (launched 1995) and Miniclip.com (launched 2000) hosted thousands of free browser games — Alien Hominid (2002), Club a Seal, and Line Rider (2006) were played during computer lab when the teacher wasn't looking. Newgrounds had 2 million daily visitors by 2007", emoji: "🕹️", category: "School Life" },
    ],
    tech: [
      { title: "USB Flash Drives (2000s)", description: "Trek Technology's ThumbDrive (2000) and M-Systems' DiskOnKey (2000) were the first — by 2005 a 256MB drive cost $19.99 at Best Buy. Replaced floppy disks and CD-Rs for sharing homework, and the \"safely remove hardware\" ritual became muscle memory", emoji: "💾", category: "Tech" },
      { title: "Canon PowerShot Digital Cameras (2000s)", description: "Canon's A-series point-and-shoot cameras (A60, A70, A75) — 3.2 megapixels, 4x optical zoom, powered by 4 AA batteries. The 1.5-inch LCD screen was a marvel. A 128MB CompactFlash card held about 100 photos at medium quality", emoji: "📷", category: "Tech" },
      { title: "Windows XP (August 25, 2001)", description: "Microsoft's OS featuring the \"Bliss\" wallpaper (a real photo by Charles O'Rear of a Sonoma County hillside) — licensed for $99 (Home) or $199 (Pro). The default startup sound was composed by Bill Brown. XP reached 76.1% market share in January 2007", emoji: "🪟", category: "Tech" },
      { title: "YouTube (February 14, 2005)", description: "Steve Chen, Chad Hurley, and Jawed Karim's video platform — the first video, \"Me at the zoo\" (19 seconds), was uploaded by Karim on April 23, 2005. By 2006 YouTube was serving 100 million video views per day and was acquired by Google for $1.65 billion in October 2006", emoji: "▶️", category: "Tech" },
      { title: "iPod nano (September 7, 2005)", description: "Apple's flash-based iPod replacing the iPod mini — 2GB model for $199, 4GB for $249. The aluminum body was just 6.9mm thick (thinner than a #2 pencil). The click wheel used capacitive touch sensing, not physical buttons. Sold 1 million units in 17 days", emoji: "🎵", category: "Tech" },
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
      { title: "Adventure Time (Cartoon Network, 2010)", description: "Pendleton Ward's series about Finn the Human and Jake the Dog in the post-apocalyptic Land of Ooo — the pilot aired as a short on Random! Cartoons in 2008. The series ran for 283 episodes across 10 seasons, winning 8 Primetime Emmys", emoji: "🗡️", category: "Cartoons" },
      { title: "Gravity Falls (Disney XD, 2012)", description: "Alex Hirsch's mystery-comedy set in the fictional town of Gravity Falls, Oregon — only 40 episodes across 2 seasons but became Disney XD's highest-rated show. The cipher codes hidden in the credits were cracked by fans on Reddit within hours", emoji: "🌲", category: "Cartoons" },
      { title: "Steven Universe (Cartoon Network, 2013)", description: "Rebecca Sugar's series — the first Cartoon Network show created by a woman. The show explored themes of identity, grief, and love through the Crystal Gems. The musical episode \"Mr. Greg\" (2016) won a GLAAD Media Award", emoji: "💎", category: "Cartoons" },
      { title: "Regular Show (Cartoon Network, 2010)", description: "J.G. Quintel's series about a 23-year-old blue jay (Mordecai) and a raccoon (Rigby) working as park groundskeepers — the pilot was Quintel's 2005 CalArts thesis film. The show's surreal humor and 80s/90s references resonated with millennials", emoji: "🌳", category: "Cartoons" },
      { title: "Rick and Morty (Adult Swim, 2013)", description: "Justin Roiland and Dan Harmon's sci-fi animated series — the pilot was a parody of Back to the Future called \"Doc and Mharti\" on Channel 101. The Season 3 premiere \"The Rickshank Rickdemption\" (2017) was watched by 11.1 million viewers across all platforms", emoji: "🧪", category: "Cartoons" },
    ],
    toys: [
      { title: "Minecraft (Mojang, 2011)", description: "Markus \"Notch\" Persson's sandbox game released on May 17, 2011 — written in Java, originally a one-man project. By 2019 it had sold 176 million copies across all platforms, making it the best-selling video game of all time. The world is 60 million blocks × 60 million blocks", emoji: "⛏️", category: "Toys" },
      { title: "Fidget Spinners (2017)", description: "Catherine Hettinger's 1993 patent (expired 2005) was resurrected in 2017 by Chinese manufacturers — the three-weighted bearing design cost $0.50 to produce and retailed for $5–$15. At peak (May 2017), 200 million units were sold worldwide in a single month", emoji: "🌀", category: "Toys" },
      { title: "Rainbow Loom (Choon's Design, 2013)", description: "Cheong-Choon Ng's rubber band bracelet loom invented in his Detroit basement — a $14.99 kit came with 600 rubber bands and a plastic loom. By 2014, Ng's company had sold 3 million units and Rainbow Loom was the #1 toy on Amazon", emoji: "🌈", category: "Toys" },
      { title: "Hoverboards (Swagway/IO Hawk, 2015)", description: "Two-wheeled self-balancing scooters with 250W motors and lithium-ion batteries — retailed for $300–$600. The \"hoverboard\" name was pure marketing; they had 1-inch wheels. Amazon pulled listings in December 2015 after multiple battery fire reports", emoji: "🛹", category: "Toys" },
      { title: "Shopkins (Moose Toys, 2014)", description: "Moose Toys' tiny grocery-themed collectible figurines — over 1,000 individual characters across 12 seasons. A 12-pack blind bag cost $9.99. By 2016, Moose Toys had sold $2 billion worth of Shopkins worldwide", emoji: "🛒", category: "Toys" },
      { title: "Nerf N-Strike Elite Blasters (Hasbro, 2012)", description: "Hasbro's updated Nerf line with 75-foot firing range — the N-Strike Elite Retaliator ($39.99) and Rampage ($49.99) were the most popular. Hasbro sold $400 million worth of Nerf products in 2015 alone", emoji: "🔫", category: "Toys" },
    ],
    music: [
      { title: "Spotify (October 7, 2008 / 2010s dominance)", description: "Daniel Ek and Martin Lorentzon's streaming service launched in the US on July 14, 2011 — by 2019 it had 248 million monthly active users and 100 million paid subscribers at $9.99/month. The Discover Weekly algorithm analyzed 30 billion user-generated playlists", emoji: "🎧", category: "Music" },
      { title: "Taylor Swift – 1989 (2014)", description: "Big Machine Records' pop crossover album — produced by Max Martin, Shellback, Jack Antonoff, and Ryan Tedder. Sold 1.287 million copies in its first week (the highest since 2002), and \"Shake It Off\" reached #1 on the Billboard Hot 100 for 4 weeks", emoji: "🎤", category: "Music" },
      { title: "Drake – Take Care (2011) / Views (2016)", description: "OVO Sound/Young Money/Republic releases — \"Hotline Bling\" (2015) reached #2 on the Billboard Hot 100 and spawned the #InMyFeelings Challenge. Views (2016) sold 1.04 million first week and stayed at #1 on the Billboard 200 for 13 non-consecutive weeks", emoji: "🎵", category: "Music" },
      { title: "K-Pop – BTS & BLACKPINK (2010s)", description: "BTS's \"DNA\" (2017) was the first K-pop song to enter the Billboard Hot 100 Top 10. BLACKPINK's \"Ddu-Du Ddu-Du\" (2018) YouTube video reached 1 billion views in 5 months. The K-pop industry was valued at $5.3 billion in 2019", emoji: "🇰🇷", category: "Music" },
      { title: "Ed Sheeran – ÷ (Divide, 2017)", description: "Asylum/Atlantic's third album — \"Shape of You\" spent 14 weeks at #1 on the UK Singles Chart (a record for a male artist). The album sold 6.1 million copies worldwide in 2017, making it the year's best-selling album globally", emoji: "🎸", category: "Music" },
      { title: "SoundCloud Rap Era (2015–2018)", description: "Lil Uzi Vert, XXXTentacion, Post Malone, and Juice WRLD built careers on SoundCloud's free upload platform — X's \"Sad!\" (2018) debuted at #1 on the Billboard Hot 100 after his death. SoundCloud had 175 million monthly listeners by 2017", emoji: "☁️", category: "Music" },
    ],
    movies: [
      { title: "Marvel Cinematic Universe (2008–2019, 23 films)", description: "Kevin Feige's interconnected film universe spanning 23 films — Avengers: Endgame (2019) grossed $2.799 billion worldwide in 11 days, surpassing Avatar as the highest-grossing film of all time (before Avatar's 2021 re-release). Total MCU gross: $22.5 billion", emoji: "🦸", category: "Movies" },
      { title: "Frozen (Disney, 2013)", description: "Chris Buck and Jennifer Lee's 53rd animated feature — \"Let It Go\" (Idina Menzel) was translated into 41 languages and spent 33 weeks on the Billboard Hot 100. The film grossed $1.28 billion worldwide and became the 5th highest-grossing animated film ever", emoji: "❄️", category: "Movies" },
      { title: "Inception (Warner Bros., 2010)", description: "Christopher Nolan's $160 million sci-fi thriller — the rotating hallway fight scene was built as a practical rotating set (a 100-foot corridor that spun 360 degrees). Grossed $836 million worldwide and won 4 Academy Awards", emoji: "🔄", category: "Movies" },
      { title: "Inside Out (Pixar, 2015)", description: "Pete Docter's film personifying 5 emotions inside a girl's mind — the team consulted with psychologists Paul Ekman and Dacher Keltner. The film used 12 billion render hours on a 55,000-core supercomputer. Grossed $857 million worldwide", emoji: "😢", category: "Movies" },
      { title: "Avengers: Endgame (Marvel, 2019)", description: "The Russo Brothers' 3-hour 1-minute finale filmed on an IMAX/ARRI camera setup — the film's $356 million opening weekend was the largest in history. Tony Stark's \"I love you 3000\" line was improvised by Robert Downey Jr. based on his real-life conversations with his children", emoji: "🛡️", category: "Movies" },
      { title: "Star Wars: The Force Awakens (Disney, 2015)", description: "J.J. Abrams's sequel filmed at Pinewood Studios for $306 million — Daisy Ridley was a complete unknown when cast as Rey. The film grossed $2.07 billion worldwide and sold 110 million tickets in its first 20 days", emoji: "⚔️", category: "Movies" },
    ],
    snacks: [
      { title: "Takis (Barcel, 1999/2010s peak)", description: "Barcel's rolled corn tortilla chips in Fuego flavor — the intense chili-lime coating rated at 2,400–3,000 Scoville units. Originally a Mexican snack, Takis exploded in US popularity during the 2010s, with sales reaching $400 million annually by 2019", emoji: "🌶️", category: "Snacks" },
      { title: "Bubble Tea / Boba (2010s US mainstream)", description: "Taiwanese milk tea with tapioca pearls migrated from Asian enclaves to mainstream US in the 2010s — Kung Fu Tea (2008) and Vivi Bubble Tea (2012) franchised nationally. A 16-oz cup cost $4.50–$5.50 and the global bubble tea market reached $2.1 billion in 2019", emoji: "🧋", category: "Snacks" },
      { title: "Acai Bowls (2010s Instagram trend)", description: "Brazilian açaí berries blended into a thick smoothie bowl topped with granola, banana, and honey — popularized by Surfing industry and Instagram aesthetics. A bowl at Jamba Juice or acai-specific cafés cost $10–$14. The trend drove a 40% increase in acai imports to the US from 2014–2018", emoji: "🫐", category: "Snacks" },
      { title: "Kale Chips (Whole Foods era, 2013 peak)", description: "Baked kale leaves with olive oil and sea salt became the ultimate \"clean eating\" snack — a 2-oz bag at Whole Foods cost $5.99. The trend was so pervasive that kale production in the US increased 60% from 2007 to 2012", emoji: "🥬", category: "Snacks" },
      { title: "Truffle Oil Mac & Cheese (foodie era, 2012–2016)", description: "Artisanal mac and cheese with truffle oil and aged cheddar popularized by food trucks and upscale comfort food restaurants — a serving at a food truck cost $8–$12. The \"foodie\" movement drove the US specialty food market to $120 billion by 2018", emoji: "🧀", category: "Snacks" },
    ],
    games: [
      { title: "Fortnite (Epic Games, 2017)", description: "Epic's free-to-play Battle Royale launched September 26, 2017 — built on Unreal Engine 4. The 2018 Marshmello concert had 10.7 million concurrent players. In 2018–2019, Fortnite generated $9 billion in revenue across all platforms", emoji: "🏗️", category: "Games" },
      { title: "Among Us (InnerSloth, 2018/2020 explosion)", description: "InnerSloth's social deduction game — only 3 developers created it. The game had fewer than 500 daily players in January 2020, but after Twitch streamers discovered it, it peaked at 500,000 concurrent players on Steam in September 2020", emoji: "🚀", category: "Games" },
      { title: "Pokémon GO (Niantic, 2016)", description: "Niantic's AR game launched July 6, 2016 — used the phone's GPS and camera to place Pokémon in the real world. On launch day, the app was installed 10 million times. By the end of 2016, players had walked 8.7 billion kilometers (more than to Pluto and back)", emoji: "📍", category: "Games" },
      { title: "Roblox (2006/2010s explosion)", description: "David Baszucki and Erik Cassel's user-generated game platform — by 2019 it had 100 million monthly active users, 70% of whom were under 16. Developers earned $110 million in 2019 through the Developer Exchange program. IPO valued the company at $41 billion in 2021", emoji: "🧱", category: "Games" },
      { title: "Overwatch (Blizzard, 2016)", description: "Blizzard's 6v6 hero shooter launched May 24, 2016 for $39.99 — featured 21 heroes at launch, each with unique abilities and an ultimate charged over time. Won over 200 Game of the Year awards. By 2018 it had 40 million registered players", emoji: "🎯", category: "Games" },
      { title: "Minecraft (continued dominance, 2010s)", description: "Microsoft acquired Mojang for $2.5 billion in September 2014 — by 2019 the game had sold 176 million copies and had 112 million monthly active players. The Education Edition launched in 2016 and was used in 115 countries by 35 million students", emoji: "🟩", category: "Games" },
    ],
    trends: [
      { title: "The Selfie Era (2010–2015)", description: "The front-facing camera (iPhone 4, 2010) and Instagram (October 2010) created the selfie culture — the term \"selfie\" was added to the Oxford English Dictionary as Word of the Year 2013. The Ellen DeGeneres Oscar selfie (March 2014) was retweeted 3.4 million times in hours", emoji: "🤳", category: "Trends" },
      { title: "Vine (January 2012–January 2017)", description: "Dom Hofmann, Rus Yusupov, and Colin Kroll's 6-second video app — acquired by Twitter for $100 million in October 2012. At peak (2015) it had 200 million monthly active viewers. Viral creators like King Bach (16M followers) and Nash Grier built careers on it", emoji: "📹", category: "Trends" },
      { title: "ASMR (2010s internet phenomenon)", description: "Autonomous Sensory Meridian Response videos featuring whispering, tapping, and scratching sounds — the term was coined in 2010 by Jennifer Allen. By 2019, the most popular ASMRist, Gentle Whispering ASMR (Maria), had 8 million YouTube subscribers", emoji: "🤫", category: "Trends" },
      { title: "TikTok (Musical.ly → TikTok, 2016/2018)", description: "Zhang Yiming's Beijing-based ByteDance launched TikTok internationally in September 2017 (merged with Musical.ly in August 2018) — by 2019 it had 800 million monthly active users. The average user spent 52 minutes per day on the app", emoji: "📱", category: "Trends" },
      { title: "Athleisure / Lululemon Era (2010s)", description: "Lululemon's $98 yoga pants became acceptable everyday wear in the 2010s — the company's revenue grew from $457 million (2010) to $3.3 billion (2019). The global athleisure market reached $167 billion by 2019, up from $97 billion in 2015", emoji: "🧘", category: "Trends" },
    ],
    schoolLife: [
      { title: "Instagram (October 6, 2010)", description: "Kevin Systrom and Mike Krieger's photo-sharing app — acquired by Facebook in April 2012 for $1 billion (then with only 13 employees and 30 million users). By 2019 it had 1 billion monthly active users. The square photo format (1:1) was inspired by Polaroid prints", emoji: "📸", category: "School Life" },
      { title: "Kahoot! (2013)", description: "Johan Brand, Jamie Brooker, and Morten Versvik's game-based quiz platform launched in private beta in March 2013 — by 2017 it had 50 million monthly active users. The catchy theme music and countdown timer turned every classroom quiz into a competitive event", emoji: "🏆", category: "School Life" },
      { title: "Chromebooks in Schools (2012+)", description: "Google's $199 Samsung Series 3 Chromebook launched in June 2011 — by 2016 Chromebooks had 58% of the US K-12 education market, surpassing iPads and Windows PCs. Google Classroom launched in August 2014 and reached 40 million users by 2017", emoji: "💻", category: "School Life" },
      { title: "Group Me / iMessage Group Chats (2010s)", description: "GroupMe launched in August 2010 (acquired by Skype/Microsoft in 2011) and iMessage group chats became the default social structure — the \"leave the chat\" button was the nuclear option. Average teens sent 100+ texts per day by 2018", emoji: "💬", category: "School Life" },
      { title: "Meme Culture (2010s)", description: "Doge (2013), Pepe the Frog (2005/2016 controversy), Harambe (2016), Distracted Boyfriend (2017) — Know Your Meme documented 15,000+ meme entries by 2019. The average lifespan of a viral meme dropped from 6 months (2010) to 2 weeks (2019)", emoji: "🐶", category: "School Life" },
    ],
    tech: [
      { title: "iPhone Era (iPhone 4 – iPhone X, 2010–2017)", description: "Apple's annual iPhone releases transformed mobile computing — the iPhone 4 (2010) introduced the Retina display (326 PPI), iPhone 5S (2013) introduced Touch ID, and iPhone X (2017) introduced Face ID and removed the home button. Total iPhones sold: 1.5 billion by 2019", emoji: "📱", category: "Tech" },
      { title: "Netflix Binge-Watching (2013+)", description: "Netflix released all 13 episodes of House of Cards Season 1 on February 1, 2013 — this \"all-at-once\" release model created binge-watching culture. By 2019, Netflix had 167 million subscribers in 190 countries and $15.8 billion in annual revenue", emoji: "📺", category: "Tech" },
      { title: "Amazon Echo / Alexa (November 2014)", description: "Amazon's cylindrical smart speaker with a 7-microphone array and far-field voice recognition — priced at $99 for Prime members at launch. By 2019, 100 million Alexa devices had been sold, and users had set 100 million timers using just their voice", emoji: "🔊", category: "Tech" },
      { title: "4G LTE (2010–2014 rollout)", description: "Verizon launched the first US 4G LTE network on December 5, 2010 in 38 cities — 4G's 10–50 Mbps speeds made streaming video and video calling viable on mobile for the first time. By 2014, 95% of the US population had 4G coverage", emoji: "📶", category: "Tech" },
      { title: "DJI Phantom Drones (2013)", description: "DJI's Phantom 1 launched January 2013 at $679 with a built-in GPS and GoPro mount — by the Phantom 4 (2016) it had obstacle avoidance, 4K camera, and a 5km range. The consumer drone market grew from $0.4 billion (2013) to $4.5 billion (2019)", emoji: "🚁", category: "Tech" },
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
  if (birthYear > start + 9) return null;
  return (start + 9) - birthYear;
}

export function getPersonalTimeline(birthYear: number): { decade: string; age: string; label: string }[] {
  const timeline: { decade: string; age: string; label: string }[] = [];
  const decades = ["1970s", "1980s", "1990s", "2000s", "2010s"];

  for (const decade of decades) {
    const ageAtEnd = getAgeAtDecadeEnd(birthYear, decade);
    if (ageAtEnd === null || ageAtEnd < 0) continue;
    if (ageAtEnd > 18) continue;

    const decadeStart: Record<string, number> = {
      "1970s": 1970, "1980s": 1980, "1990s": 1990, "2000s": 2000, "2010s": 2010,
    };
    const ageAtStart = Math.max(0, birthYear - decadeStart[decade]);
    const ageRange = ageAtStart === ageAtEnd ? `${ageAtEnd}` : `${ageAtStart}–${ageAtEnd}`;

    const midAge = Math.floor((ageAtStart + ageAtEnd) / 2);
    let label = "";
    if (ageAtEnd <= 1) label = "You were born! 🍼";
    else if (midAge <= 3) label = "Your toddler years 👶";
    else if (midAge <= 6) label = "Your early childhood 🧒";
    else if (midAge <= 12) label = "Your school days 📚";
    else if (midAge <= 15) label = "Your teenage years 🎸";
    else label = "Your late teens 🎓";

    timeline.push({ decade, age: `Age ${ageRange}`, label });
  }
  return timeline;
}