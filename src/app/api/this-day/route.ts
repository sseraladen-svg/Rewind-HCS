import { NextRequest, NextResponse } from 'next/server';

interface HistoryEntry {
  year: number;
  month: number;
  day: number;
  type: string;
  title: string;
  description: string;
  emoji: string;
}

const data1970s: HistoryEntry[] = [
  { year: 1971, month: 1, day: 2,  type: 'culture',   title: 'Cigarette Ads Banned on TV',         description: 'The Public Health Cigarette Smoking Act took effect, ending all cigarette advertising on American television and radio.', emoji: '📺' },
  { year: 1977, month: 1, day: 18, type: 'culture',   title: 'Gary Gilmore Executed by Firing Squad', description: 'The first execution in the US in a decade inspired the famous last words "Let\'s do it" and Norman Mailer\'s book.', emoji: '📰' },
  { year: 1973, month: 1, day: 14, type: 'music',     title: 'Elvis Presley\'s Aloha from Hawaii',   description: 'Elvis broadcast his concert live via satellite to over 1 billion viewers worldwide, a groundbreaking TV event.', emoji: '🎤' },
  { year: 1976, month: 1, day: 21, type: 'tech',      title: 'Concorde Begins Commercial Flights',  description: 'The supersonic Concorde entered regular passenger service between London and Bahrain, then Paris and Rio.', emoji: '✈️' },
  { year: 1970, month: 1, day: 0,  type: 'movies',    title: 'The 1970s New Hollywood Era Begins',   description: 'Films like MASH and Patton dominated cinemas, kicking off cinema\'s most creative decade.', emoji: '🎬' },
  { year: 1972, month: 2, day: 0,  type: 'music',     title: 'Carole King\'s "Tapestry" Rules Charts', description: 'Tapestry became one of the best-selling albums ever, staying on the charts for over 6 years.', emoji: '📀' },
  { year: 1971, month: 2, day: 8,  type: 'tv',        title: 'The NASDAQ Stock Exchange Opens',     description: 'The world\'s first electronic stock market began trading, revolutionizing how stocks are bought and sold.', emoji: '📊' },
  { year: 1979, month: 2, day: 0,  type: 'music',     title: 'The Disco Era Peaks',                 description: 'The Bee Gees dominated with the Saturday Night Fever soundtrack, the best-selling soundtrack of all time.', emoji: '🪩' },
  { year: 1973, month: 3, day: 0,  type: 'tech',      title: 'The First Mobile Phone Call',         description: 'Martin Cooper of Motorola made the first handheld mobile phone call, a prototype that weighed 1.1 kg.', emoji: '📱' },
  { year: 1977, month: 3, day: 11, type: 'movies',    title: 'SATURDAY NIGHT FEVER Hits Theaters',  description: 'John Travolta\'s disco epic became a cultural phenomenon, making white suits and the Hustle iconic.', emoji: '🕺' },
  { year: 1975, month: 3, day: 0,  type: 'toys',      title: 'Pet Rock Craze Begins',               description: 'Gary Dahl\'s joke invention—selling a rock in a box—sold over 1.5 million units at $3.95 each.', emoji: '🪨' },
  { year: 1970, month: 3, day: 21, type: 'culture',   title: 'The First Earth Day',                 description: '20 million Americans participated in the first Earth Day, launching the modern environmental movement.', emoji: '🌍' },
  { year: 1975, month: 4, day: 30, type: 'culture',   title: 'Fall of Saigon',                      description: 'The Vietnam War ended as North Vietnamese forces captured Saigon, marking a defining moment in American history.', emoji: '🕊️' },
  { year: 1976, month: 4, day: 1,  type: 'tech',      title: 'Apple I Computer Created',             description: 'Steve Wozniak completed the Apple I personal computer, launching Apple from a garage in Los Altos.', emoji: '🍎' },
  { year: 1977, month: 4, day: 7,  type: 'tech',      title: 'First Home Computer — Apple II',       description: 'The Apple II went on sale, becoming one of the first mass-produced personal computers with color graphics.', emoji: '🖥️' },
  { year: 1970, month: 4, day: 0,  type: 'music',     title: 'Simon & Garfunkel\'s "Bridge Over Troubled Water"', description: 'The title track became one of the most beloved songs of the decade, winning 5 Grammy Awards.', emoji: '🎵' },
  { year: 1977, month: 5, day: 25, type: 'movies',    title: 'STAR WARS Premieres',                  description: 'George Lucas changed cinema forever with Star Wars, introducing a galaxy far, far away to audiences worldwide.', emoji: '⚔️' },
  { year: 1979, month: 5, day: 25, type: 'culture',   title: 'Alien Premieres in Theaters',          description: 'Ridley Scott\'s sci-fi horror masterpiece terrified audiences and made Sigourney Weaver a star.', emoji: '👽' },
  { year: 1974, month: 5, day: 0,  type: 'toys',      title: 'Rubik\'s Cube Invented',               description: 'Hungarian sculptor Ernő Rubik created the 3D combination puzzle that would become the world\'s best-selling toy.', emoji: '🧊' },
  { year: 1970, month: 5, day: 0,  type: 'tv',        title: 'Monday Night Football Debuts',         description: 'ABC launched Monday Night Football, transforming sports broadcasting and American Monday nights forever.', emoji: '🏈' },
  { year: 1972, month: 6, day: 17, type: 'culture',   title: 'Watergate Break-In',                   description: 'Five men were arrested for breaking into the DNC headquarters at the Watergate complex, sparking the scandal that would end Nixon\'s presidency.', emoji: '🏛️' },
  { year: 1973, month: 6, day: 0,  type: 'tv',        title: 'The Waltons Premieres',                description: 'The family drama about rural Virginia during the Great Depression became a beloved TV staple of the decade.', emoji: '🏠' },
  { year: 1978, month: 6, day: 0,  type: 'movies',    title: 'Grease Takes Over Box Office',         description: 'John Travolta and Olivia Newton-John\'s musical became the highest-grossing movie of 1978.', emoji: '🎬' },
  { year: 1971, month: 6, day: 0,  type: 'music',     title: 'Carole King & James Taylor at Carnegie Hall', description: 'The legendary concert became one of the highest-grossing shows in the venue\'s history.', emoji: '🎹' },
  { year: 1976, month: 7, day: 4,  type: 'culture',   title: 'United States Bicentennial',            description: 'America celebrated 200 years of independence with celebrations, tall ships in NY harbor, and patriotic fervor.', emoji: '🗽' },
  { year: 1979, month: 7, day: 12, type: 'tech',      title: 'Walkman Introduced by Sony',            description: 'Sony released the TPS-L2 Walkman, the world\'s first portable cassette player, changing how people listen to music.', emoji: '🎧' },
  { year: 1975, month: 7, day: 0,  type: 'movies',    title: 'Jaws Becomes First Summer Blockbuster', description: 'Steven Spielberg\'s shark thriller invented the summer blockbuster, terrifying beachgoers for generations.', emoji: '🦈' },
  { year: 1971, month: 7, day: 0,  type: 'music',     title: '"Imagine" by John Lennon Released',     description: 'Lennon\'s utopian anthem became one of the most iconic songs of the 20th century.', emoji: '🎵' },
  { year: 1974, month: 8, day: 9,  type: 'culture',   title: 'Nixon Resigns the Presidency',          description: 'Richard Nixon became the first US president to resign, facing impeachment over the Watergate scandal.', emoji: '📰' },
  { year: 1977, month: 8, day: 16, type: 'culture',   title: 'Elvis Presley Passes Away',             description: 'The King of Rock and Roll died at Graceland at age 42, leaving millions of fans worldwide in mourning.', emoji: '👑' },
  { year: 1973, month: 8, day: 0,  type: 'movies',    title: 'American Graffiti Hits Theaters',       description: 'George Lucas\'s nostalgic coming-of-age film set in 1962 became a surprise hit and launched many careers.', emoji: '🚗' },
  { year: 1970, month: 8, day: 0,  type: 'toys',      title: 'Big Wheel Tricycles Were Everywhere',    description: 'The low-riding plastic tricycle became the must-have outdoor toy for kids across America.', emoji: '🚲' },
  { year: 1972, month: 9, day: 5,  type: 'culture',   title: 'Munich Olympics Massacre',              description: 'The Black September terrorist group attacked Israeli athletes at the Munich Olympics, shocking the world.', emoji: '🏅' },
  { year: 1975, month: 9, day: 0,  type: 'tv',        title: 'Saturday Night Live Debuts',            description: 'NBC launched SNL, forever changing comedy and launching the careers of Belushi, Chase, Radner, and more.', emoji: '🎭' },
  { year: 1978, month: 9, day: 0,  type: 'music',     title: 'Grease Soundtrack Tops Charts',         description: 'The Grease soundtrack spent 12 non-consecutive weeks at #1, producing multiple hit singles.', emoji: '💿' },
  { year: 1976, month: 9, day: 0,  type: 'tech',      title: 'NASA Viking 1 Lands on Mars',           description: 'The Viking 1 spacecraft successfully landed on Mars and sent back the first photos from the planet\'s surface.', emoji: '🔴' },
  { year: 1973, month: 10, day: 0, type: 'culture',   title: 'OPEC Oil Embargo Begins',               description: 'Arab oil-producing nations embargoed exports to the US, causing gas shortages and long lines at the pump.', emoji: '⛽' },
  { year: 1978, month: 10, day: 0, type: 'movies',    title: 'Halloween Invents Slasher Genre',        description: 'John Carpenter\'s Halloween defined the slasher film genre and launched Jamie Lee Curtis\'s career.', emoji: '🎃' },
  { year: 1971, month: 10, day: 0, type: 'tv',        title: 'Soul Train Premieres Nationally',       description: 'Don Cornelius\'s music and dance show brought Black music and culture to national television audiences.', emoji: '🚂' },
  { year: 1975, month: 10, day: 0,  type: 'toys',      title: 'The Wobble Board Dance Craze',           description: 'The Wobble Board by Wobble Works became a huge fad, filling living rooms across the country.', emoji: '🎲' },
  { year: 1977, month: 11, day: 0, type: 'movies',    title: 'Close Encounters of the Third Kind',    description: 'Steven Spielberg\'s UFO masterpiece captivated audiences with its story of alien contact in Wyoming.', emoji: '🛸' },
  { year: 1976, month: 11, day: 0, type: 'tv',        title: 'Charlie\'s Angels Premieres',           description: 'The ABC action series made Farrah Fawcett a cultural icon and her poster the best-selling of all time.', emoji: '👼' },
  { year: 1970, month: 11, day: 0, type: 'music',     title: 'Jimi Hendrix & Janis Joplin Tributes',    description: 'The music world continued mourning the losses of Hendrix and Joplin, both gone in 1970 at age 27.', emoji: '🎸' },
  { year: 1972, month: 12, day: 0, type: 'tech',      title: 'Pong Arcade Machine Released',           description: 'Atari\'s Pong became the first commercially successful arcade video game, launching the gaming industry.', emoji: '🏓' },
  { year: 1979, month: 12, day: 0, type: 'culture',   title: 'The Iran Hostage Crisis Begins',         description: 'Iranian students seized the US Embassy in Tehran, holding 52 American hostages for 444 days.', emoji: '📰' },
  { year: 1977, month: 12, day: 0, type: 'movies',    title: 'Saturday Night Fever Sweeps Awards',     description: 'The disco film and its Bee Gees soundtrack dominated year-end awards and holiday box office.', emoji: '🪩' },
  { year: 1973, month: 12, day: 0, type: 'toys',      title: 'Evel Knievel Stunt Cycle Toy',           description: 'The Ideal Toy Corporation\'s stunt cycle let kids recreate Evel Knievel\'s legendary motorcycle jumps.', emoji: '🏍️' },
];

const data1980s: HistoryEntry[] = [
  { year: 1981, month: 1, day: 20, type: 'culture',   title: 'Ronald Reagan Inaugurated President',    description: 'The former actor became the 40th US President, ushering in the Reagan era of conservative politics.', emoji: '🏛️' },
  { year: 1985, month: 1, day: 0,  type: 'music',     title: '"We Are the World" Recorded',            description: 'USA for Africa recorded the charity single featuring Michael Jackson, Stevie Wonder, and 40+ artists.', emoji: '🌍' },
  { year: 1983, month: 1, day: 0,  type: 'tech',      title: 'Compaq Portable Computer Launched',      description: 'The first portable IBM-compatible PC proved the clone market could innovate, starting the laptop revolution.', emoji: '💻' },
  { year: 1980, month: 1, day: 0,  type: 'tv',        title: 'Dallas "Who Shot J.R.?" Season Finale', description: 'The season-ending cliffhanger became the most-watched TV episode in history at that time.', emoji: '🔫' },
  { year: 1980, month: 2, day: 22, type: 'culture',   title: '"Miracle on Ice" at Lake Placid',        description: 'The US hockey team defeated the Soviet Union 4-3 in the Winter Olympics, one of the greatest upsets in sports history.', emoji: '🏒' },
  { year: 1983, month: 2, day: 0,  type: 'music',     title: 'Michael Jackson\'s "Thriller" Dominates', description: 'Thriller became the best-selling album of all time, with 7 top-ten hits including "Billie Jean" and "Beat It".', emoji: '🧟' },
  { year: 1986, month: 2, day: 0,  type: 'tech',      title: 'First PC Virus Spread',                 description: 'The Brain boot sector virus, one of the first computer viruses, spread via floppy disks.', emoji: '🦠' },
  { year: 1981, month: 2, day: 0,  type: 'movies',    title: 'Raiders of the Lost Ark Opens',         description: 'Harrison Ford debuted as Indiana Jones in Spielberg\'s adventure classic, creating a beloved franchise.', emoji: '🗿' },
  { year: 1985, month: 3, day: 0,  type: 'culture',   title: 'The First .com Domain Registered',      description: 'Symbolics.com became the first registered .com domain, beginning the internet domain name era.', emoji: '🌐' },
  { year: 1982, month: 3, day: 0,  type: 'movies',    title: 'E.T. the Extra-Terrestrial Opens',       description: 'Spielberg\'s heartwarming alien story became the highest-grossing film of all time, a record it held for 11 years.', emoji: '🚲' },
  { year: 1980, month: 3, day: 0,  type: 'toys',      title: 'Rubik\'s Cube Takes America by Storm',   description: 'The colorful puzzle cube became the best-selling toy of 1980, sparking worldwide competitions.', emoji: '🧊' },
  { year: 1988, month: 3, day: 0,  type: 'tv',        title: 'Roseanne Premieres on ABC',              description: 'Roseanne Barr\'s blue-collar family sitcom broke TV conventions and became a #1 hit.', emoji: '📺' },
  { year: 1986, month: 4, day: 26, type: 'culture',   title: 'Chernobyl Nuclear Disaster',             description: 'The worst nuclear accident in history occurred at the Chernobyl power plant in Ukraine, affecting millions.', emoji: '☢️' },
  { year: 1984, month: 4, day: 0,  type: 'tech',      title: 'Apple Macintosh Ad Airs',                description: 'Apple\'s iconic "1984" Super Bowl commercial introduced the Macintosh to the world.', emoji: '🍎' },
  { year: 1981, month: 4, day: 12, type: 'culture',   title: 'First Space Shuttle Launch (Columbia)',  description: 'NASA launched the Space Shuttle Columbia, beginning the reusable spacecraft era of space exploration.', emoji: '🚀' },
  { year: 1985, month: 4, day: 0,  type: 'movies',    title: 'The Breakfast Club Released',            description: 'John Hughes\' teen drama defined a generation, giving voice to every high school stereotype.', emoji: '📚' },
  { year: 1980, month: 5, day: 22, type: 'culture',   title: 'Pac-Man Released in Arcades',            description: 'Namco\'s maze-chasing game became an instant classic and the most successful arcade game of all time.', emoji: '👾' },
  { year: 1983, month: 5, day: 0,  type: 'movies',    title: 'Return of the Jedi Opens',              description: 'The final chapter of the original Star Wars trilogy revealed Darth Vader\'s true identity.', emoji: '⚔️' },
  { year: 1989, month: 5, day: 0,  type: 'toys',      title: 'Game Boy Released by Nintendo',          description: 'Nintendo\'s handheld gaming system launched with Tetris, creating portable gaming culture.', emoji: '🎮' },
  { year: 1986, month: 5, day: 0,  type: 'tv',        title: 'ALF Premieres on NBC',                  description: 'The wise-cracking alien from Melmac living with the Tanner family became a pop culture sensation.', emoji: '👽' },
  { year: 1982, month: 6, day: 0,  type: 'tech',      title: 'Sony CD Player Goes on Sale',            description: 'The Sony CDP-101 became the first commercially available compact disc player, revolutionizing music.', emoji: '💿' },
  { year: 1984, month: 6, day: 8,  type: 'culture',   title: 'Tetris Created by Alexey Pajitnov',      description: 'The Russian programmer created the addictive puzzle game that would become one of the best-selling of all time.', emoji: '🟦' },
  { year: 1985, month: 6, day: 0,  type: 'music',     title: 'Live Aid Concert Broadcast Worldwide',    description: 'The dual-venue concert organized by Bob Geldof raised millions for famine relief and was watched by 1.9 billion.', emoji: '🎤' },
  { year: 1985, month: 7, day: 0,  type: 'movies',    title: 'Back to the Future Opens',              description: 'Robert Zemeckis\' time-travel adventure starring Michael J. Fox became the highest-grossing film of 1985.', emoji: '⚡' },
  { year: 1981, month: 7, day: 29, type: 'culture',   title: 'Prince Charles & Lady Diana Wed',        description: 'The royal wedding was watched by an estimated 750 million people worldwide, the "wedding of the century."', emoji: '💍' },
  { year: 1983, month: 7, day: 0,  type: 'toys',      title: 'Cabbage Patch Kids Craze',               description: 'The adoption-themed dolls caused riots in toy stores during the holiday shopping season.', emoji: '👶' },
  { year: 1987, month: 7, day: 0,  type: 'tv',        title: 'Full House Premieres on ABC',            description: 'The Tanner family sitcom starring Bob Saget became a beloved classic for multiple generations.', emoji: '🏠' },
  { year: 1981, month: 8, day: 1,  type: 'tv',        title: 'MTV Launches',                           description: 'Music Television launched with "Video Killed the Radio Star," forever changing the music industry.', emoji: '📺' },
  { year: 1984, month: 8, day: 0,  type: 'movies',    title: 'Ghostbusters Hits Theaters',             description: 'Bill Murray, Dan Aykroyd, and Harold Ramis starred in the supernatural comedy that spawned a franchise.', emoji: '👻' },
  { year: 1988, month: 8, day: 0,  type: 'tech',      title: 'Nintendo Entertainment System Dominates', description: 'The NES was at peak popularity, with Super Mario Bros. 3 becoming the most anticipated game release.', emoji: '🕹️' },
  { year: 1986, month: 8, day: 0,  type: 'music',     title: 'Madonna\'s "True Blue" Album Released',   description: 'Madonna\'s third album produced hits like "Papa Don\'t Preach" and "Open Your Heart" and topped charts worldwide.', emoji: '💃' },
  { year: 1986, month: 9, day: 0,  type: 'tv',        title: 'The Oprah Winfrey Show Debuts',          description: 'Oprah launched her nationally syndicated talk show, eventually becoming the highest-rated talk show in TV history.', emoji: '📺' },
  { year: 1980, month: 9, day: 0,  type: 'toys',      title: 'Atari 2600 at Peak Popularity',          description: 'The Atari 2600 was in millions of homes, making video games a staple of childhood.', emoji: '🎮' },
  { year: 1989, month: 11, day: 9, type: 'culture',   title: 'Berlin Wall Falls',                     description: 'The fall of the Berlin Wall became the defining symbol of the end of the Cold War.', emoji: '🧱' },
  { year: 1982, month: 10, day: 0,  type: 'tech',      title: 'First CD Pressed in Mass Production',    description: 'The first commercial compact disc, The Visitors by ABBA, was pressed at a Philips factory in Germany.', emoji: '💿' },
  { year: 1985, month: 10, day: 0,  type: 'movies',    title: 'The Goonies Opens in Theaters',          description: 'Steven Spielberg\'s adventure about kids hunting pirate treasure became a beloved 80s cult classic.', emoji: '🗺️' },
  { year: 1984, month: 10, day: 0,  type: 'music',     title: 'Van Halen\'s "1984" Album Released',    description: 'The album featuring "Jump" and "Hot for Teacher" became Van Halen\'s most commercially successful release.', emoji: '🎸' },
  { year: 1981, month: 10, day: 0,  type: 'toys',      title: 'He-Man and Masters of the Universe',    description: 'Mattel\'s muscular action figure line and Filmation cartoon became an 80s cultural staple.', emoji: '⚔️' },
  { year: 1983, month: 11, day: 0,  type: 'culture',   title: 'The Day After Airs on TV',               description: 'ABC\'s nuclear war film was watched by over 100 million Americans, sparking national debate about nuclear weapons.', emoji: '☢️' },
  { year: 1986, month: 11, day: 0,  type: 'movies',    title: 'Top Gun Takes Box Office by Storm',      description: 'Tom Cruise\'s fighter pilot film became the highest-grossing movie of 1986 and a cultural phenomenon.', emoji: '✈️' },
  { year: 1989, month: 11, day: 0,  type: 'tv',        title: 'The Simpsons Premieres on Fox',          description: 'The animated family from Springfield debuted as a standalone series after Tracey Ullman Show shorts.', emoji: '🍟' },
  { year: 1988, month: 12, day: 21, type: 'culture',   title: 'Pan Am Flight 103 Bombing',              description: 'A terrorist bomb destroyed the airliner over Lockerbie, Scotland, killing all 259 on board and 11 on the ground.', emoji: '🕊️' },
  { year: 1982, month: 12, day: 0,  type: 'toys',      title: 'Transformers Hit Store Shelves',         description: 'Hasbro\'s shape-shifting robot toys from Japan became an instant hit, spawning cartoons and comics.', emoji: '🤖' },
  { year: 1980, month: 12, day: 8,  type: 'music',     title: 'John Lennon Assassinated in New York',    description: 'The Beatles legend was shot outside the Dakota apartment building, devastating fans worldwide.', emoji: '🎵' },
];

const data1990s: HistoryEntry[] = [
  { year: 1991, month: 1, day: 17, type: 'culture',   title: 'Gulf War Begins',                      description: 'Operation Desert Storm launched as a US-led coalition drove Iraqi forces from Kuwait.', emoji: '⚔️' },
  { year: 1993, month: 1, day: 0,  type: 'tv',        title: 'The Final Episode of Cheers',          description: 'After 11 seasons, the beloved Boston bar sitcom aired its series finale, watched by 80 million viewers.', emoji: '🍺' },
  { year: 1995, month: 1, day: 0,  type: 'tech',      title: 'Yahoo! Founded',                      description: 'Jerry Yang and David Filo founded Yahoo! in a campus trailer, creating one of the internet\'s first portals.', emoji: '🌐' },
  { year: 1992, month: 1, day: 0,  type: 'movies',    title: 'Wayne\'s World Party On',               description: 'The SNL sketch turned hit movie brought "party on" and "excellent" into everyday vocabulary.', emoji: '🎸' },
  { year: 1993, month: 2, day: 0,  type: 'culture',   title: 'World Trade Center Bombing',             description: 'A terrorist truck bomb exploded in the underground garage of the WTC, killing 6 and injuring over 1,000.', emoji: '🗽' },
  { year: 1994, month: 2, day: 0,  type: 'music',     title: 'Nirvana Unplugged in New York Airs',     description: 'MTV aired Nirvana\'s intimate acoustic performance, one of Kurt Cobain\'s final recorded appearances.', emoji: '🎸' },
  { year: 1997, month: 2, day: 0,  type: 'tech',      title: 'Deep Blue Beats Kasparov at Chess',     description: 'IBM\'s supercomputer defeated world chess champion Garry Kasparov, a landmark in artificial intelligence.', emoji: '♟️' },
  { year: 1990, month: 2, day: 0,  type: 'tv',        title: 'The Simpsons Becomes a Hit Series',     description: 'The animated series moved to its regular time slot and quickly became Fox\'s flagship show.', emoji: '📺' },
  { year: 1997, month: 3, day: 0,  type: 'movies',    title: 'Titanic Breaks Box Office Records',      description: 'James Cameron\'s epic romance became the first film to gross $1 billion, winning 11 Academy Awards.', emoji: '🚢' },
  { year: 1991, month: 3, day: 0,  type: 'music',     title: 'R.E.M.\'s "Out of Time" Released',      description: 'The album featuring "Losing My Religion" became R.E.M.\'s breakthrough mainstream success.', emoji: '🎵' },
  { year: 1990, month: 3, day: 0,  type: 'toys',      title: 'Teenage Mutant Ninja Turtles Peak',      description: 'The turtle heroes were everywhere: toys, cereal, comics, and the live-action film was a box office hit.', emoji: '🐢' },
  { year: 1992, month: 4, day: 29, type: 'culture',   title: 'LA Riots Erupt',                       description: 'The acquittal of officers in the Rodney King beating trial triggered days of rioting across Los Angeles.', emoji: '🗽' },
  { year: 1994, month: 4, day: 0,  type: 'culture',   title: 'Nelson Mandela Elected President',        description: 'South Africa held its first multiracial democratic election, making Mandela the country\'s first Black president.', emoji: '🗳️' },
  { year: 1996, month: 4, day: 0,  type: 'tech',      title: 'Yahoo! IPO on Wall Street',             description: 'Yahoo! went public at $13 per share, jumping to $43 on the first day and signaling the dot-com boom.', emoji: '📈' },
  { year: 1993, month: 4, day: 0,  type: 'movies',    title: 'Jurassic Park Opens',                   description: 'Spielberg\'s dinosaur epic wowed audiences with groundbreaking CGI and became the highest-grossing film ever.', emoji: '🦖' },
  { year: 1998, month: 5, day: 0,  type: 'movies',    title: 'The Big Lebowski Released',             description: 'The Coen Brothers\' cult classic about The Dude became one of the most quoted films of the decade.', emoji: '🎳' },
  { year: 1992, month: 5, day: 0,  type: 'toys',      title: 'Super Soaker Becomes the Summer Toy',    description: 'Lonnie Johnson\'s high-powered water gun became the ultimate backyard weapon of summer.', emoji: '🔫' },
  { year: 1994, month: 6, day: 17, type: 'culture',   title: 'O.J. Simpson White Bronco Chase',        description: 'The low-speed police chase of O.J. Simpson\'s white Ford Bronco was watched live by 95 million Americans.', emoji: '🚔' },
  { year: 1997, month: 6, day: 0,  type: 'tech',      title: 'Deep Blue vs. Kasparov Rematch',         description: 'IBM\'s Deep Blue supercomputer won the six-game rematch against the world chess champion.', emoji: '🤖' },
  { year: 1990, month: 6, day: 0,  type: 'music',     title: 'MC Hammer\'s "Please Hammer Don\'t Hurt \'Em"', description: 'The album became the first hip-hop record to go diamond, powered by "U Can\'t Touch This."', emoji: '🎈' },
  { year: 1991, month: 7, day: 0,  type: 'culture',   title: 'World Wide Web Goes Public',             description: 'Tim Berners-Lee made the World Wide Web publicly available, beginning the internet revolution.', emoji: '🌐' },
  { year: 1996, month: 7, day: 0,  type: 'movies',    title: 'Independence Day Dominates Box Office',   description: 'Will Smith and Jeff Goldblum saved the world from aliens in the summer\'s biggest blockbuster.', emoji: '👽' },
  { year: 1994, month: 7, day: 0,  type: 'music',     title: 'Woodstock \'94: Mud, Music, Memories',    description: 'The anniversary concert drew 350,000 fans to Saugerties, NY, recreating the iconic festival\'s spirit.', emoji: '🎸' },
  { year: 1998, month: 7, day: 0,  type: 'tech',      title: 'iMac G3 Unveiled by Apple',              description: 'Steve Jobs unveiled the colorful, all-in-one iMac, beginning Apple\'s spectacular comeback.', emoji: '🍎' },
  { year: 1991, month: 8, day: 0,  type: 'culture',   title: 'Soviet Coup Attempt Fails',              description: 'A hardline coup against Gorbachev collapsed in just two days, accelerating the USSR\'s dissolution.', emoji: '🗳️' },
  { year: 1995, month: 8, day: 24, type: 'tech',      title: 'Windows 95 Released',                    description: 'Microsoft launched Windows 95 with the Start menu, Taskbar, and massive marketing featuring "Start Me Up."', emoji: '🪟' },
  { year: 1997, month: 8, day: 31, type: 'culture',   title: 'Princess Diana Dies in Paris',            description: 'The beloved Princess of Wales was killed in a car crash in Paris, prompting an unprecedented outpouring of grief.', emoji: '👑' },
  { year: 1993, month: 8, day: 0,  type: 'tv',        title: 'The X-Files Becomes a Cult Phenomenon',   description: 'Mulder and Scully\'s paranormal investigations captivated audiences and spawned a massive fan culture.', emoji: '👽' },
  { year: 1998, month: 9, day: 4,  type: 'culture',   title: 'Google Founded in a Garage',             description: 'Larry Page and Sergey Brin founded Google in a Menlo Park garage, creating the world\'s most popular search engine.', emoji: '🔍' },
  { year: 1993, month: 9, day: 0,  type: 'music',     title: 'Nirvana\'s "In Utero" Released',         description: 'Nirvana\'s raw, unpolished third album debuted at #1, featuring "Heart-Shaped Box" and "All Apologies."', emoji: '🎸' },
  { year: 1996, month: 9, day: 0,  type: 'toys',      title: 'Tickle Me Elmo Craze',                  description: 'The giggling Sesame Street toy caused near-riots in toy stores, with parents fighting over limited stock.', emoji: '😂' },
  { year: 1991, month: 9, day: 0,  type: 'movies',    title: 'Beauty and the Beast Enchants Theaters', description: 'Disney\'s animated masterpiece became the first animated film nominated for Best Picture at the Oscars.', emoji: '🌹' },
  { year: 1993, month: 10, day: 0,  type: 'tech',      title: 'Doom Released by id Software',            description: 'John Carmack\'s first-person shooter revolutionized gaming and networked multiplayer deathmatches.', emoji: '🔫' },
  { year: 1994, month: 10, day: 0,  type: 'tv',        title: 'Friends Premieres on NBC',               description: 'Rachel, Ross, Monica, Chandler, Joey, and Phoebe became America\'s favorite group of friends.', emoji: '☕' },
  { year: 1998, month: 10, day: 0,  type: 'movies',    title: 'Saving Private Ryan Released',           description: 'Spielberg\'s WWII epic with its harrowing D-Day landing scene was praised as one of the greatest war films.', emoji: '🎖️' },
  { year: 1992, month: 10, day: 0,  type: 'music',     title: 'The Cranberries\' "No Need to Argue"',   description: 'The Irish band\'s second album featured the massive hit "Zombie" and went multi-platinum worldwide.', emoji: '🎵' },
  { year: 1995, month: 11, day: 0,  type: 'tech',      title: 'Amazon.com Launches Online',             description: 'Jeff Bezos launched Amazon from his garage, initially selling only books but with a much bigger vision.', emoji: '📦' },
  { year: 1996, month: 11, day: 0,  type: 'culture',   title: 'Bill Clinton Re-elected President',       description: 'Clinton defeated Bob Dole to win a second term, becoming the first Democrat to do so since FDR.', emoji: '🗳️' },
  { year: 1997, month: 12, day: 0,  type: 'movies',    title: 'Titanic Becomes a Cultural Event',        description: 'James Cameron\'s epic ruled theaters through the holidays, with audiences seeing it multiple times.', emoji: '❤️' },
  { year: 1995, month: 12, day: 0,  type: 'tech',      title: 'eBay Founded as AuctionWeb',              description: 'Pierre Omidyar launched the online auction site that would become the world\'s largest marketplace.', emoji: '🏬' },
  { year: 1992, month: 12, day: 0,  type: 'toys',      title: 'Mighty Morphin Power Rangers Toys',      description: 'The live-action superhero show spawned one of the biggest toy lines of the early 90s.', emoji: '🦸' },
  { year: 1999, month: 12, day: 31, type: 'culture',   title: 'Y2K Fears and Millennium Celebrations',   description: 'The world celebrated the new millennium amid fears of the Y2K computer bug, which ultimately caused minimal disruption.', emoji: '🎆' },
];

const data2000s: HistoryEntry[] = [
  { year: 2001, month: 1, day: 0,  type: 'tech',      title: 'Wikipedia Launches',                     description: 'Jimmy Wales and Larry Sanger launched the free online encyclopedia that would change how the world accesses knowledge.', emoji: '📖' },
  { year: 2000, month: 1, day: 0,  type: 'culture',   title: 'Y2K Bug Fears Subside',                  description: 'The feared Y2K computer crisis passed with minimal disruption, and the world breathed a collective sigh of relief.', emoji: '🎆' },
  { year: 2005, month: 1, day: 0,  type: 'tv',        title: 'Desperate Housewives Dominates TV',      description: 'The suburban dramedy was the most-watched show of the 2004-2005 TV season, revitalizing primetime soaps.', emoji: '🏠' },
  { year: 2008, month: 1, day: 0,  type: 'music',     title: 'Radiohead\'s "In Rainbows" Pay-What-You-Want', description: 'The band\'s innovative release model let fans choose their price, challenging the music industry.', emoji: '🎵' },
  { year: 2004, month: 2, day: 4,  type: 'culture',   title: 'Facebook Founded at Harvard',            description: 'Mark Zuckerberg launched "TheFacebook" from his Harvard dorm room, beginning a social media revolution.', emoji: '👤' },
  { year: 2003, month: 2, day: 0,  type: 'music',     title: '50 Cent\'s "Get Rich or Die Tryin\'" Released', description: 'The debut album featuring "In Da Club" sold 872,000 copies in its first week.', emoji: '🎤' },
  { year: 2000, month: 2, day: 0,  type: 'movies',    title: 'American Beauty Sweeps the Oscars',      description: 'The dark suburban drama won 5 Academy Awards including Best Picture, cementing its cultural impact.', emoji: '🌹' },
  { year: 2005, month: 3, day: 0,  type: 'tech',      title: 'YouTube Founded',                       description: 'Chad Hurley, Steve Chen, and Jawed Karim created the video-sharing platform that would revolutionize media.', emoji: '▶️' },
  { year: 2002, month: 3, day: 0,  type: 'movies',    title: 'The Lord of the Rings: The Two Towers',  description: 'Peter Jackson\'s middle chapter wowed audiences with the Battle of Helm\'s Deep and Gollum\'s CGI.', emoji: '💍' },
  { year: 2009, month: 3, day: 0,  type: 'tv',        title: 'Breaking Bad Premieres',                description: 'Bryan Cranston\'s transformation from mild teacher to drug kingpin began on AMC, redefining television.', emoji: '⚗️' },
  { year: 2003, month: 4, day: 9,  type: 'culture',   title: 'Fall of Baghdad',                       description: 'US forces captured Baghdad, and the statue of Saddam Hussein was toppled in Firdos Square.', emoji: '🏛️' },
  { year: 2006, month: 4, day: 0,  type: 'tech',      title: 'Twitter Launches at SXSW',               description: 'Jack Dorsey\'s micro-blogging platform debuted at South by Southwest and began changing real-time communication.', emoji: '🐦' },
  { year: 2008, month: 4, day: 0,  type: 'movies',    title: 'Iron Man Launches the MCU',              description: 'Robert Downey Jr.\'s portrayal of Tony Stark started the Marvel Cinematic Universe, the highest-grossing film franchise ever.', emoji: '🦾' },
  { year: 2000, month: 5, day: 0,  type: 'tech',      title: 'The Dot-Com Bubble Bursts',              description: 'The NASDAQ crashed, wiping out trillions in tech stock value and ending the internet gold rush.', emoji: '📉' },
  { year: 2006, month: 5, day: 0,  type: 'toys',      title: 'Nintendo Wii Announced',                 description: 'Nintendo revealed its motion-controlled console, making gaming accessible to all ages.', emoji: '🎮' },
  { year: 2009, month: 5, day: 0,  type: 'tv',        title: 'Glee Premieres on Fox',                  description: 'The high school musical dramedy became a cultural phenomenon, spawning hit cover songs and a massive fanbase.', emoji: '🎵' },
  { year: 2007, month: 6, day: 29, type: 'tech',      title: 'First iPhone Released',                  description: 'Apple revolutionized the smartphone industry with the iPhone, combining a phone, iPod, and internet device.', emoji: '📱' },
  { year: 2004, month: 6, day: 0,  type: 'movies',    title: 'Harry Potter and the Prisoner of Azkaban', description: 'Alfonso Cuarón\'s darker, more mature take on the wizarding world was widely considered the best film in the series.', emoji: '⚡' },
  { year: 2009, month: 6, day: 25, type: 'music',     title: 'Michael Jackson Passes Away',             description: 'The King of Pop died unexpectedly at age 50, sparking a global outpouring of grief and tribute.', emoji: '👑' },
  { year: 2005, month: 7, day: 0,  type: 'movies',    title: 'Harry Potter and the Half-Blood Prince Book', description: 'The sixth book sold 9 million copies in 24 hours at worldwide midnight release events.', emoji: '📚' },
  { year: 2000, month: 7, day: 0,  type: 'tech',      title: 'Napster at Peak Popularity',              description: 'The peer-to-peer file sharing service had tens of millions of users, fundamentally disrupting the music industry.', emoji: '🎧' },
  { year: 2002, month: 7, day: 0,  type: 'music',     title: 'Eminem\'s "The Eminem Show" Released',    description: 'The album featuring "Without Me" and "Cleanin\' Out My Closet" was the year\'s best-selling album.', emoji: '🎤' },
  { year: 2005, month: 8, day: 29, type: 'culture',   title: 'Hurricane Katrina Devastates New Orleans', description: 'The Category 5 hurricane caused catastrophic damage, killing over 1,800 people and exposing systemic failures.', emoji: '🌪️' },
  { year: 2008, month: 8, day: 8,  type: 'culture',   title: 'Beijing Olympics Opening Ceremony',       description: 'China staged the most spectacular opening ceremony in Olympic history, wowing billions with its scale and artistry.', emoji: '🏅' },
  { year: 2006, month: 8, day: 0,  type: 'movies',    title: 'The Departed Hits Theaters',             description: 'Martin Scorsese\'s Boston crime thriller starring Leonardo DiCaprio and Matt Damon won 4 Academy Awards.', emoji: '🔫' },
  { year: 2004, month: 8, day: 0,  type: 'toys',      title: 'Nintendo DS Released',                   description: 'Nintendo\'s dual-screen handheld launched, introducing touch-screen gaming to a new generation.', emoji: '🎮' },
  { year: 2001, month: 9, day: 11, type: 'culture',   title: 'September 11 Terrorist Attacks',          description: 'The deadliest terrorist attack in US history killed 2,977 people and fundamentally changed the world.', emoji: '🗽' },
  { year: 2008, month: 9, day: 0,  type: 'culture',   title: 'Global Financial Crisis Escalates',       description: 'Lehman Brothers collapsed, triggering the worst financial crisis since the Great Depression.', emoji: '📉' },
  { year: 2003, month: 9, day: 0,  type: 'tech',      title: 'Skype Launches',                        description: 'The VoIP service launched, offering free voice and video calls over the internet and changing global communication.', emoji: '📞' },
  { year: 2007, month: 9, day: 0,  type: 'tv',        title: 'Mad Men Premieres on AMC',               description: 'Matthew Weiner\'s stylish drama about 1960s advertising executives redefined prestige television.', emoji: '🎩' },
  { year: 2001, month: 10, day: 0,  type: 'culture',   title: 'War in Afghanistan Begins',              description: 'The US and allies invaded Afghanistan in response to the 9/11 attacks, beginning the longest war in US history.', emoji: '⚓' },
  { year: 2004, month: 10, day: 0,  type: 'tech',      title: 'Firefox 1.0 Browser Released',           description: 'Mozilla\'s open-source browser launched, challenging Internet Explorer\'s dominance of the web.', emoji: '🦊' },
  { year: 2008, month: 10, day: 0,  type: 'movies',    title: 'The Dark Knight Breaks Records',          description: 'Heath Ledger\'s iconic Joker performance in the Batman sequel became a cultural phenomenon.', emoji: '🦇' },
  { year: 2005, month: 10, day: 0,  type: 'music',     title: 'Green Day\'s "American Idiot" Sweeps',    description: 'The punk rock opera won the Grammy for Best Rock Album and was adapted into a Broadway musical.', emoji: '🎸' },
  { year: 2008, month: 11, day: 4,  type: 'culture',   title: 'Barack Obama Elected President',         description: 'Obama became the first African-American president, winning in a historic election on a message of hope and change.', emoji: '🗳️' },
  { year: 2006, month: 11, day: 0,  type: 'tech',      title: 'PlayStation 3 Released',                 description: 'Sony\'s next-gen console launched with Blu-ray support, starting the HD console gaming era.', emoji: '🎮' },
  { year: 2000, month: 11, day: 0,  type: 'tv',        title: 'Survivor Launches Reality TV Craze',     description: 'The first season finale of Survivor drew 52 million viewers, igniting the reality TV boom.', emoji: '🏝️' },
  { year: 2003, month: 12, day: 13, type: 'culture',   title: 'Saddam Hussein Captured',                 description: 'US forces found the former Iraqi dictator hiding in a spider hole near his hometown of Tikrit.', emoji: '📰' },
  { year: 2006, month: 12, day: 0,  type: 'tech',      title: 'Wii Launches in North America',           description: 'Nintendo\'s motion-controlled console sold out instantly, bringing casual gaming to living rooms everywhere.', emoji: '🕹️' },
  { year: 2009, month: 12, day: 0,  type: 'movies',    title: 'Avatar Breaks All Box Office Records',    description: 'James Cameron\'s sci-fi epic used revolutionary 3D technology and became the highest-grossing film of all time.', emoji: '🔵' },
];

const data2010s: HistoryEntry[] = [
  { year: 2010, month: 1, day: 0,  type: 'tech',      title: 'Apple iPad Announced',                   description: 'Steve Jobs unveiled the iPad, creating the tablet computer category and transforming mobile computing.', emoji: '📱' },
  { year: 2011, month: 1, day: 0,  type: 'culture',   title: 'Arab Spring Protests Begin',              description: 'Popular uprisings across the Arab world toppled governments in Tunisia and Egypt, reshaping the Middle East.', emoji: '✊' },
  { year: 2015, month: 1, day: 0,  type: 'tv',        title: 'Making a Murderer Released on Netflix',   description: 'The true crime docuseries became Netflix\'s first viral hit, sparking nationwide debate about the justice system.', emoji: '🎥' },
  { year: 2013, month: 1, day: 0,  type: 'music',     title: 'Beyoncé Surprise Album Drop',             description: 'Beyoncé secretly released her self-titled album with no promotion, selling 825,000 copies in 3 days.', emoji: '👑' },
  { year: 2012, month: 2, day: 0,  type: 'culture',   title: 'Whitney Houston Passes Away',             description: 'The legendary singer was found dead at the Beverly Hilton at age 48, stunning the music world.', emoji: '🎤' },
  { year: 2014, month: 2, day: 0,  type: 'movies',    title: 'The Lego Movie Surprises Everyone',       description: '"Everything is awesome" — the animated film exceeded all expectations, earning over $468 million worldwide.', emoji: '🧱' },
  { year: 2012, month: 3, day: 0,  type: 'movies',    title: 'The Hunger Games Opens',                  description: 'Jennifer Lawrence\'s Katniss Everdeen launched a blockbuster franchise based on Suzanne Collins\' dystopian novels.', emoji: '🏹' },
  { year: 2014, month: 3, day: 0,  type: 'tv',        title: 'True Detective\'s First Season Ends',     description: 'Matthew McConaughey and Woody Harrelson\'s gripping crime anthology captivated audiences.', emoji: '🔍' },
  { year: 2013, month: 4, day: 15, type: 'culture',   title: 'Boston Marathon Bombing',                description: 'Two bombs exploded near the marathon finish line, killing 3 and injuring 264 in a terrorist attack.', emoji: '🕊️' },
  { year: 2015, month: 4, day: 0,  type: 'tech',      title: 'Apple Watch Officially Goes on Sale',      description: 'Apple\'s first wearable device launched, kickstarting mainstream interest in smartwatches.', emoji: '⌚' },
  { year: 2012, month: 4, day: 0,  type: 'movies',    title: 'The Avengers Assembles',                  description: 'Marvel\'s superhero team-up became the third highest-grossing film of all time, validating the MCU formula.', emoji: '🦸' },
  { year: 2011, month: 4, day: 0,  type: 'music',     title: 'Adele\'s "21" Breaks Records',           description: 'Adele\'s sophomore album became the best-selling album of the 21st century, fueled by "Rolling in the Deep."', emoji: '🎤' },
  { year: 2011, month: 5, day: 1,  type: 'culture',   title: 'Osama bin Laden Killed',                  description: 'US Navy SEALs raided bin Laden\'s compound in Abbottabad, Pakistan, ending a decade-long manhunt.', emoji: '📰' },
  { year: 2014, month: 5, day: 0,  type: 'movies',    title: 'Godzilla Roars Back into Theaters',       description: 'The legendary monster returned in a spectacular reboot directed by Gareth Edwards.', emoji: '🦎' },
  { year: 2019, month: 5, day: 0,  type: 'movies',    title: 'Avengers: Endgame Breaks Records',        description: 'The culmination of the Infinity Saga became the highest-grossing film of all time, surpassing Avatar.', emoji: '⚔️' },
  { year: 2012, month: 5, day: 0,  type: 'tech',      title: 'SpaceX Dragon Reaches the ISS',           description: 'SpaceX\'s Dragon became the first commercial spacecraft to dock with the International Space Station.', emoji: '🚀' },
  { year: 2013, month: 6, day: 0,  type: 'culture',   title: 'Edward Snowden Reveals NSA Surveillance',  description: 'The former NSA contractor leaked classified documents revealing massive government surveillance programs.', emoji: '🔐' },
  { year: 2015, month: 6, day: 0,  type: 'movies',    title: 'Jurassic World Breaks Box Office Records', description: 'Chris Pratt starred in the dinosaur reboot that set a global opening weekend record of $524 million.', emoji: '🦖' },
  { year: 2016, month: 6, day: 0,  type: 'tv',        title: 'Game of Thrones "Battle of the Bastards"', description: 'The epic battle episode was hailed as one of the greatest TV episodes ever made.', emoji: '🗡️' },
  { year: 2014, month: 7, day: 0,  type: 'movies',    title: 'Dawn of the Planet of the Apes',         description: 'The sequel wowed audiences with its motion-capture performances and thoughtful storytelling.', emoji: '🐒' },
  { year: 2011, month: 7, day: 0,  type: 'tech',      title: 'Final Space Shuttle Mission (Atlantis)',  description: 'NASA\'s Space Shuttle Atlantis launched on the final mission of the 30-year shuttle program.', emoji: '🚀' },
  { year: 2014, month: 8, day: 0,  type: 'culture',   title: 'Ice Bucket Challenge Goes Viral',        description: 'The ALS awareness campaign swept social media, raising over $115 million for research.', emoji: '🧊' },
  { year: 2012, month: 8, day: 0,  type: 'culture',   title: 'London Summer Olympics',                  description: 'The XXX Olympiad featured spectacular Opening Ceremonies directed by Danny Boyle, and Usain Bolt defended his titles.', emoji: '🏅' },
  { year: 2010, month: 8, day: 0,  type: 'tech',      title: 'Instagram Launches',                     description: 'Kevin Systrom and Mike Krieger launched the photo-sharing app that would transform visual social media.', emoji: '📸' },
  { year: 2011, month: 9, day: 0,  type: 'culture',   title: 'Occupy Wall Street Movement Begins',       description: 'Protesters camped in Zuccotti Park to protest economic inequality, sparking a global movement.', emoji: '✊' },
  { year: 2017, month: 9, day: 0,  type: 'movies',    title: 'IT Becomes Highest-Grossing Horror Film', description: 'Bill Skarsgård\'s Pennywise terrified audiences, and the film grossed over $700 million worldwide.', emoji: '🎈' },
  { year: 2012, month: 9, day: 0,  type: 'music',     title: 'PSY\'s "Gangnam Style" Goes Viral',       description: 'The Korean pop hit became the first YouTube video to reach 1 billion views, a global dance craze.', emoji: '💃' },
  { year: 2016, month: 10, day: 0,  type: 'movies',    title: 'Rogue One: A Star Wars Story',            description: 'The standalone Star Wars film told the story of how the Death Star plans were stolen.', emoji: '⚔️' },
  { year: 2013, month: 10, day: 0,  type: 'tv',        title: 'Breaking Bad Series Finale',            description: 'Walter White\'s journey came to a dramatic conclusion in "Felina," widely regarded as one of TV\'s greatest endings.', emoji: '⚗️' },
  { year: 2016, month: 11, day: 8,  type: 'culture',   title: 'Donald Trump Elected President',          description: 'The businessman and reality TV star won a stunning upset victory over Hillary Clinton.', emoji: '🗳️' },
  { year: 2013, month: 11, day: 0,  type: 'tech',      title: 'PlayStation 4 Released',                 description: 'Sony\'s next-gen console launched to massive demand, outselling Xbox One in the early going.', emoji: '🎮' },
  { year: 2015, month: 12, day: 0,  type: 'movies',    title: 'Star Wars: The Force Awakens Opens',     description: 'J.J. Abrams revived the Star Wars franchise, breaking box office records and introducing a new generation of fans.', emoji: '⚔️' },
  { year: 2013, month: 12, day: 0,  type: 'tech',      title: 'Xbox One and PS4 Holiday Season',        description: 'The next-gen console war heated up as both consoles vied for holiday shopping dominance.', emoji: '🎮' },
  { year: 2011, month: 12, day: 0,  type: 'tv',        title: 'SpongeBob Hits 200 Episodes',            description: 'Bikini Bottom\'s favorite absorbent hero reached a major milestone, cementing his place in pop culture.', emoji: '🍍' },
];

const decadeDataMap: Record<string, HistoryEntry[]> = {
  '1970s': data1970s,
  '1980s': data1980s,
  '1990s': data1990s,
  '2000s': data2000s,
  '2010s': data2010s,
};

function getDecadeKey(year: number): string {
  const decade = Math.floor(year / 10) * 10;
  const key = `${decade}s`;
  return decadeDataMap[key] ? key : '1970s';
}

function getEntriesForDate(data: HistoryEntry[], month: number, day: number): HistoryEntry[] {
  const exact = data.filter(e => e.month === month && e.day === day);
  if (exact.length > 0) return exact;

  const monthEntries = data.filter(e => e.month === month);
  return monthEntries.length > 0 ? monthEntries : data.slice(0, 5);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const birthYear = parseInt(searchParams.get('birthYear') || '1985', 10);

  const clampedYear = Math.max(1970, Math.min(2015, birthYear));

  const decadeKey = getDecadeKey(clampedYear);
  const pool = decadeDataMap[decadeKey] || data1980s;

  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const entries = getEntriesForDate(pool, month, day);

  const seed = clampedYear + month;
  const shuffled = [...entries].sort((a, b) => {
    const ha = ((a.year * 31 + a.day * 7 + seed) % 100) / 100;
    const hb = ((b.year * 31 + b.day * 7 + seed) % 100) / 100;
    return ha - hb;
  });

  const results = shuffled.slice(0, 8).map(entry => ({
    year: entry.year,
    type: entry.type,
    title: entry.title,
    description: entry.description,
    emoji: entry.emoji,
  }));

  return NextResponse.json({
    date: `${month}/${day}`,
    decade: decadeKey,
    birthYear: clampedYear,
    items: results,
  });
}
