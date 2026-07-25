import { NextResponse } from 'next/server';

const quizData: Record<string, { question: string; options: string[]; correctIndex: number; funFact: string; category: string; emoji: string }[]> = {
  '80s': [
    { question: 'What year did the first Space Shuttle launch?', options: ['1979', '1981', '1983', '1985'], correctIndex: 1, funFact: 'Space Shuttle Columbia launched on April 12, 1981 — the first reusable spacecraft.', category: 'tech', emoji: '🚀' },
    { question: 'Which video game is blamed for the 1983 industry crash?', options: ['Pac-Man', 'Donkey Kong', 'E.T. the Extra-Terrestrial', 'Asteroids'], correctIndex: 2, funFact: 'Atari buried millions of unsold E.T. cartridges in a New Mexico landfill.', category: 'games', emoji: '🎮' },
    { question: 'What was the best-selling toy of 1983?', options: ['He-Man', 'Cabbage Patch Kids', 'Transformers', 'My Little Pony'], correctIndex: 1, funFact: 'Cabbage Patch Kids riots broke out in stores during the 1983 holiday season.', category: 'toys', emoji: '🧸' },
    { question: 'What year did the Chernobyl disaster occur?', options: ['1984', '1985', '1986', '1987'], correctIndex: 2, funFact: 'The Chernobyl disaster on April 26, 1986 remains the worst nuclear accident in history.', category: 'culture', emoji: '☢️' },
    { question: 'Which movie was the highest-grossing film of the 1980s?', options: ['Back to the Future', 'E.T.', 'Star Wars: Episode V', 'Ghostbusters'], correctIndex: 1, funFact: 'E.T. made $792 million worldwide and held the record for 11 years.', category: 'movies', emoji: '🎬' },
    { question: 'What year did Michael Jackson release Thriller?', options: ['1981', '1982', '1983', '1984'], correctIndex: 1, funFact: 'Thriller is still the best-selling album of all time with over 66 million copies sold.', category: 'music', emoji: '🎵' },
    { question: 'What cable channel launched in 1981 showing only music videos?', options: ['VH1', 'BET', 'MTV', 'Nickelodeon'], correctIndex: 2, funFact: 'The first MTV video was "Video Killed the Radio Star" by The Buggles.', category: 'tv', emoji: '📺' },
    { question: 'What year did the Berlin Wall fall?', options: ['1987', '1988', '1989', '1990'], correctIndex: 2, funFact: 'The fall of the Berlin Wall on November 9, 1989 symbolized the end of the Cold War.', category: 'culture', emoji: '🧱' },
    { question: 'Which sitcom about a bar in Boston premiered in 1982?', options: ['Family Ties', 'Cheers', 'Night Court', 'Taxi'], correctIndex: 1, funFact: 'Cheers ran for 11 seasons and everyone really did know your name.', category: 'tv', emoji: '🍺' },
    { question: 'What iconic Nike shoe got its name from a movie character?', options: ['Air Force 1', 'Air Jordan', 'Cortez', 'Dunk'], correctIndex: 1, funFact: 'Air Jordans debuted in 1985 and were banned by the NBA — Nike paid the $5,000 fine per game.', category: 'culture', emoji: '👟' },
    { question: 'What year did the first Macintosh computer launch?', options: ['1982', '1983', '1984', '1985'], correctIndex: 2, funFact: 'The Mac was introduced with the famous "1984" Super Bowl commercial directed by Ridley Scott.', category: 'tech', emoji: '💻' },
    { question: 'Which band sang "Sweet Child O\' Mine"?', options: ['Guns N\' Roses', 'Bon Jovi', 'Mötley Crüe', 'Def Leppard'], correctIndex: 0, funFact: 'Appetite for Destruction (1987) is the best-selling debut album in US history.', category: 'music', emoji: '🎸' },
    { question: 'What was the Rubik\'s Cube originally called?', options: ['Magic Cube', 'Color Puzzle', 'Brain Twister', 'Hexagon'], correctIndex: 0, funFact: 'Over 350 million Rubik\'s Cubes have been sold worldwide since 1980.', category: 'toys', emoji: '🟩' },
    { question: 'Which movie featured the line "Nobody puts Baby in a corner"?', options: ['Pretty in Pink', 'Footloose', 'Dirty Dancing', 'Flashdance'], correctIndex: 2, funFact: 'Dirty Dancing (1987) was a low-budget film that became a massive cultural phenomenon.', category: 'movies', emoji: '💃' },
    { question: 'What year did the Challenger shuttle explode?', options: ['1984', '1985', '1986', '1987'], correctIndex: 2, funFact: 'The Challenger disaster on January 28, 1986 was witnessed live by millions on TV.', category: 'tech', emoji: '🚀' },
  ],
  '90s': [
    { question: 'What year did Friends first premiere?', options: ['1993', '1994', '1995', '1996'], correctIndex: 1, funFact: 'Friends ran for 10 seasons and each cast member earned $1 million per episode by the end.', category: 'tv', emoji: '☕' },
    { question: 'What toy was the must-have Christmas gift of 1996?', options: ['Tickle Me Elmo', 'Tamagotchi', 'Beanie Babies', 'N64'], correctIndex: 0, funFact: 'Tickle Me Elmo caused actual riots in toy stores during the 1996 holiday season.', category: 'toys', emoji: '🧸' },
    { question: 'Which film became the first animated movie to win Best Picture?', options: ['The Lion King', 'Beauty and the Beast', 'Toy Story', 'Shrek'], correctIndex: 1, funFact: 'Beauty and the Beast (1991) was nominated for Best Picture before the Best Animated Feature category existed.', category: 'movies', emoji: '🥀' },
    { question: 'What year did Titanic become the highest-grossing film ever?', options: ['1996', '1997', '1998', '1999'], correctIndex: 1, funFact: 'Titanic earned over $2.2 billion worldwide and held the record until Avatar (2009).', category: 'movies', emoji: '🚢' },
    { question: 'Which boy band had the biggest hit of 1999?', options: '*NSYNC', 'Backstreet Boys', '98 Degrees', 'Five'], correctIndex: 1, funFact: '"I Want It That Way" was nominated for 5 MTV VMAs and became an anthem of the era.', category: 'music', emoji: '🎤' },
    { question: 'What year did the World Wide Web become publicly available?', options: ['1990', '1991', '1992', '1993'], correctIndex: 1, funFact: 'Tim Berners-Lee published the first website in August 1991 at CERN.', category: 'tech', emoji: '🌐' },
    { question: 'What game console launched in 1994 and used CD-ROMs instead of cartridges?', options: ['Sega Saturn', 'PlayStation', 'Nintendo 64', '3DO'], correctIndex: 1, funFact: 'The original PlayStation sold over 100 million units worldwide.', category: 'games', emoji: '🎮' },
    { question: 'Which cartoon about a baby aired on Nickelodeon starting in 1991?', options: ['Hey Arnold!', 'Rugrats', 'Doug', 'Rocko\'s Modern Life'], correctIndex: 1, funFact: 'Rugrats was one of Nickelodeon\'s most successful shows, running from 1991 to 2004.', category: 'tv', emoji: '👶' },
    { question: 'What year did Google launch?', options: ['1996', '1997', '1998', '1999'], correctIndex: 2, funFact: 'Google\'s original name was "BackRub" — they renamed it in 1997 before launching in 1998.', category: 'tech', emoji: '🔍' },
    { question: 'Which Spice Girls hit was the best-selling single by a girl group?', options: ['Wannabe', 'Say You\'ll Be There', '2 Become 1', 'Spice Up Your Life'], correctIndex: 0, funFact: '"Wannabe" reached #1 in 37 countries when it debuted in 1996.', category: 'music', emoji: '💃' },
    { question: 'What virtual pet toy became a global craze in 1996?', options: ['Giga Pet', 'Nano Pet', 'Tamagotchi', 'Digimon'], correctIndex: 2, funFact: 'Over 82 million Tamagotchis were sold worldwide by 2019.', category: 'toys', emoji: '🥚' },
    { question: 'What year did the Columbine shooting occur?', options: ['1997', '1998', '1999', '2000'], correctIndex: 2, funFact: 'The Columbine tragedy on April 20, 1999 profoundly changed American school culture.', category: 'culture', emoji: '🕯️' },
    { question: 'Which 90s sitcom featured a coffee shop called Central Perk?', options: ['Seinfeld', 'Frasier', 'Friends', 'Mad About You'], correctIndex: 2, funFact: 'The Central Perk set was so popular a replica café opened in Manhattan in 2022.', category: 'tv', emoji: '☕' },
    { question: 'What year did Nintendo 64 launch in the US?', options: ['1995', '1996', '1997', '1998'], correctIndex: 1, funFact: 'Super Mario 64 and GoldenEye 007 were launch titles that defined 3D gaming.', category: 'games', emoji: '🎮' },
    { question: 'Which Nirvana album is considered the defining album of the 90s?', options: ['Bleach', 'In Utero', 'Nevermind', 'MTV Unplugged'], correctIndex: 2, funFact: 'Nevermind knocked Michael Jackson\'s Dangerous off #1 in January 1992, signaling a cultural shift.', category: 'music', emoji: '🎸' },
  ],
  '2000s': [
    { question: 'What year did YouTube launch?', options: ['2004', '2005', '2006', '2007'], correctIndex: 1, funFact: 'The first YouTube video was uploaded on April 23, 2005 — "Me at the zoo" by Jawed Karim.', category: 'tech', emoji: '▶️' },
    { question: 'Which iPod was the first to have a click wheel?', options: ['iPod (1st gen)', 'iPod Mini', 'iPod Nano', 'iPod (3rd gen)'], correctIndex: 3, funFact: 'The iPod (3rd gen, 2003) introduced the touch-sensitive click wheel that became iconic.', category: 'tech', emoji: '🎵' },
    { question: 'What was the highest-grossing film of 2009?', options: ['The Dark Knight', 'Avatar', 'Harry Potter 6', 'Transformers 2'], correctIndex: 1, funFact: 'Avatar earned $2.9 billion and held the all-time record until Endgame (2019).', category: 'movies', emoji: '🌊' },
    { question: 'Which social network launched in 2004 and was originally only for Harvard students?', options: ['MySpace', 'Facebook', 'Twitter', 'LinkedIn'], correctIndex: 1, funFact: 'Facebook reached 100 million users in August 2008 — faster than any platform in history.', category: 'tech', emoji: '👤' },
    { question: 'What year did the first iPhone launch?', options: ['2005', '2006', '2007', '2008'], correctIndex: 2, funFact: 'The original iPhone had no App Store, no copy-paste, and no video recording.', category: 'tech', emoji: '📱' },
    { question: 'Which TV show about a paper company premiered in 2005?', options: ['30 Rock', 'Parks & Rec', 'The Office (US)', 'Scrubs'], correctIndex: 2, funFact: 'The US Office ran for 9 seasons and is now considered one of the greatest comedies ever made.', category: 'tv', emoji: '📋' },
    { question: 'What gaming console launched in 2006 with a motion-sensing controller?', options: ['Xbox 360', 'PlayStation 3', 'Nintendo Wii', 'PS Vita'], correctIndex: 2, funFact: 'The Wii sold over 100 million units and made gaming accessible to all ages.', category: 'games', emoji: '🎮' },
    { question: 'Which artist released "Crazy in Love" in 2003?', options: ['Ashanti', 'Beyoncé', 'Missy Elliott', 'Alicia Keys'], correctIndex: 1, funFact: 'Dangerously in Love was Beyoncé\'s debut solo album after leaving Destiny\'s Child.', category: 'music', emoji: '🎤' },
    { question: 'What year did Twitter launch?', options: ['2005', '2006', '2007', '2008'], correctIndex: 1, funFact: 'The first tweet was sent by Jack Dorsey on March 21, 2006: "just setting up my twttr".', category: 'tech', emoji: '🐦' },
    { question: 'Which movie franchise had its first film in 2001?', options: ['The Avengers', 'Harry Potter', 'Lord of the Rings', 'Twilight'], correctIndex: 2, funFact: 'LOTR: Fellowship of the Ring won 4 Oscars and launched one of cinema\'s greatest trilogies.', category: 'movies', emoji: '💍' },
    { question: 'What reality TV show premiered in 2003 and became a cultural phenomenon?', options: ['The Osbournes', 'American Idol', 'The Simple Life', 'Newlyweds'], correctIndex: 1, funFact: 'American Idol\'s first winner Kelly Clarkson has sold over 25 million albums worldwide.', category: 'tv', emoji: '🎤' },
    { question: 'What year did Netflix start streaming?', options: ['2005', '2006', '2007', '2008'], correctIndex: 2, funFact: 'Netflix had 1 million subscribers by 2002 but didn\'t launch streaming until 2007.', category: 'tech', emoji: '📺' },
    { question: 'Which song by OutKast won 3 Grammys in 2004?', options: ['Ms. Jackson', 'Hey Ya!', 'Roses', 'The Way You Move'], correctIndex: 1, funFact: '"Hey Ya!" spent 9 weeks at #1 and its music video featured the famous animated characters.', category: 'music', emoji: '🎸' },
    { question: 'What portable gaming device launched in 2004 with two screens?', options: ['PSP', 'Nintendo DS', 'Game Boy Micro', 'N-Gage'], correctIndex: 1, funFact: 'The DS was a "gimmick" that became Nintendo\'s best-selling console with 154 million units.', category: 'games', emoji: '🎮' },
    { question: 'What year did MySpace reach its peak of 75 million monthly visitors?', options: ['2005', '2006', '2007', '2008'], correctIndex: 1, funFact: 'MySpace was the most visited website in the US from 2006-2008 before Facebook overtook it.', category: 'tech', emoji: '🌐' },
  ],
};

function seededShuffle(arr: typeof quizData['80s'], seed: string) {
  const shuffled = [...arr];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  for (let i = shuffled.length - 1; i > 0; i--) {
    hash = ((hash << 5) - hash) | 0;
    const j = Math.abs(hash) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const decade = searchParams.get('decade') || '90s';
  const count = Math.min(parseInt(searchParams.get('count') || '5'), 20);

  const questions = quizData[decade] || quizData['90s'];
  const selected = seededShuffle(questions, `${decade}-${new Date().toDateString()}`).slice(0, count);

  return NextResponse.json({ questions: selected, decade, total: questions.length });
}
