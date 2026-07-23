import { NextResponse } from 'next/server';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w342';
const TMDB_ORIG = 'https://image.tmdb.org/t/p/w500';

interface TmdbMovie {
  id: number;
  title: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
  media_type?: string;
}

interface TmdbWatchProvider {
  provider_name: string;
  logo_path: string | null;
}

interface WatchProviders {
  flatrate?: TmdbWatchProvider[];
  free?: TmdbWatchProvider[];
  ads?: TmdbWatchProvider[];
}

interface TmdbWatchResponse {
  id: number;
  results: Record<string, { link?: string; flatrate?: TmdbWatchProvider[]; free?: TmdbWatchProvider[]; ads?: TmdbWatchProvider[] }>;
}

/* ── genre map ─────────────────────────────── */
const GENRE_MAP: Record<number, string> = {
  16: 'Animation',
  35: 'Comedy',
  28: 'Action',
  12: 'Adventure',
  14: 'Fantasy',
  878: 'Sci-Fi',
  27: 'Horror',
  53: 'Thriller',
  18: 'Drama',
  10751: 'Family',
  80: 'Crime',
  9648: 'Mystery',
  10749: 'Romance',
  36: 'History',
  10402: 'Music',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37: 'Western',
};

/* ── curated fallback data per decade ────── */
const FALLBACK: Record<string, { title: string; year: number; type: 'movie' | 'tv' | 'cartoon'; poster: string; rating: number; genres: string[]; overview: string }[]> = {
  '1970s': [
    { title: 'Star Wars: A New Hope', year: 1977, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/6uFvS472P6yzW2BuKsbpJx3VVp.jpg', rating: 8.6, genres: ['Sci-Fi', 'Adventure', 'Fantasy'], overview: 'Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee, and two droids to save the galaxy from the Empire.' },
    { title: 'Jaws', year: 1975, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/jBJWaqoSCi1ZWAgdak815qZkwLc.jpg', rating: 8.2, genres: ['Thriller', 'Adventure'], overview: 'A giant great white shark begins to menace the small island community of Amity.' },
    { title: 'Scooby-Doo, Where Are You!', year: 1969, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/l5FhPpQ3hMs9W7fPmOQvM8zJfHM.jpg', rating: 7.8, genres: ['Animation', 'Comedy', 'Mystery'], overview: 'Scooby-Doo and the gang travel around in the Mystery Machine solving spooky mysteries.' },
    { title: 'The Muppet Show', year: 1976, type: 'tv', poster: 'https://image.tmdb.org/t/p/w342/aCIFMriQsRj2l0g4VkEKcqf1jdO.jpg', rating: 8.3, genres: ['Comedy', 'Family', 'Music'], overview: 'Kermit the Frog and his friends put on a weekly variety show with celebrity guests.' },
    { title: 'Looney Tunes', year: 1970, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/dm6VdO3TkCHrcMOyLO7iVsUmNjb.jpg', rating: 8.4, genres: ['Animation', 'Comedy', 'Family'], overview: 'Bugs Bunny, Daffy Duck, Porky Pig and the rest of the Looney Tunes gang in classic shorts.' },
    { title: 'Saturday Night Fever', year: 1977, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/mRq1CaKKwHIvFOsBf3jsqZB6Jdi.jpg', rating: 6.8, genres: ['Drama', 'Music'], overview: 'A Brooklyn teen feels trapped by his dead-end job and dumps his frustrations into disco dancing.' },
    { title: 'Rocky', year: 1976, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/q4LkFn8ERMQVtJPmFnOZjrPx8Fp.jpg', rating: 8.1, genres: ['Drama', 'Action'], overview: 'A small-time boxer gets a shot at the world heavyweight championship.' },
    { title: 'Tom and Jerry', year: 1975, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/5fRZGEPopGm5aSxQFhvUJqz6oKJ.jpg', rating: 8.5, genres: ['Animation', 'Comedy', 'Family'], overview: 'The iconic cat-and-mouse duo in their classic chase sequences.' },
    { title: 'Grease', year: 1978, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/7fn624j5lj3xTme2SgiLCeuedmO.jpg', rating: 7.4, genres: ['Comedy', 'Musical', 'Romance'], overview: 'Good girl Sandy and greaser Danny fall in love over the summer.' },
    { title: 'Happy Days', year: 1974, type: 'tv', poster: 'https://image.tmdb.org/t/p/w342/6x3p1OSrJVvAmFgJlE8A8WmTnX7.jpg', rating: 7.6, genres: ['Comedy', 'Family'], overview: 'The Cunningham family and their life in 1950s Milwaukee.' },
    { title: 'The Pink Panther Show', year: 1969, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/hTqKVMtWjY86pNhkkRRGBwEKqTP.jpg', rating: 7.5, genres: ['Animation', 'Comedy'], overview: 'The bumbling Inspector Clouseau and the cool Pink Panther in animated adventures.' },
    { title: 'Close Encounters of the Third Kind', year: 1977, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/z7S4Q3LGqK6XLbRy3hMQ3mLBrnK.jpg', rating: 7.6, genres: ['Sci-Fi', 'Drama'], overview: 'Roy Neary encounters a UFO and becomes obsessed with discovering its meaning.' },
  ],
  '1980s': [
    { title: 'E.T. the Extra-Terrestrial', year: 1982, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/t3mU1sCBtMRE1vJGNjXhJzXSs65.jpg', rating: 7.9, genres: ['Sci-Fi', 'Family', 'Adventure'], overview: 'A troubled child summons the courage to help a friendly alien escape Earth and return home.' },
    { title: 'The Lion King', year: 1994, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/sKCr7MXcQsLdOrsRv0e3pe2jVyQ.jpg', rating: 8.5, genres: ['Animation', 'Drama', 'Family'], overview: 'A young lion prince must reclaim his kingdom from his treacherous uncle.' },
    { title: 'Back to the Future', year: 1985, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/7lnSjK4BTR1uMjGpL6BpPyoYnbF.jpg', rating: 8.5, genres: ['Sci-Fi', 'Adventure', 'Comedy'], overview: 'Marty McFly is sent back to 1955 in a time-traveling DeLorean invented by the eccentric Doc Brown.' },
    { title: 'DuckTales', year: 1987, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/bZMr3TZZMEpFSKNCpRbZpUhMF1B.jpg', rating: 8.1, genres: ['Animation', 'Comedy', 'Adventure'], overview: 'Scrooge McDuck and his grandnephews Huey, Dewey, and Louie go on adventures around the world.' },
    { title: 'Ghostbusters', year: 1984, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/hSvKVXFuYxGGKHXyKLW2CJssAwg.jpg', rating: 7.8, genres: ['Comedy', 'Fantasy', 'Action'], overview: 'Three parapsychologists start a ghost-catching business in New York City.' },
    { title: 'The Transformers', year: 1984, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/tGwHkDM1AnbJLGSQrVNmJUmMxqK.jpg', rating: 7.9, genres: ['Animation', 'Action', 'Sci-Fi'], overview: 'Two warring factions of transforming robots from the planet Cybertron crash-land on Earth.' },
    { title: 'The Breakfast Club', year: 1985, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/8ST8M2MNy6VdOeuJqXuJbi2jVyQ.jpg', rating: 7.8, genres: ['Drama', 'Comedy'], overview: 'Five high school students meet in Saturday detention and discover they have more in common than they thought.' },
    { title: 'Danger Mouse', year: 1981, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/fFt35lgQTHZwRYIeJpOlhG2BRQY.jpg', rating: 7.7, genres: ['Animation', 'Comedy', 'Action'], overview: 'The daring secret agent Danger Mouse and his timid hamster sidekick Penfold fight evil.' },
    { title: 'Ferris Bueller\'s Day Off', year: 1986, type: 'movie', poster: '/ferris86.jpg', rating: 7.8, genres: ['Comedy'], overview: 'A high school wise guy is determined to have a day off from school.' },
    { title: 'He-Man and the Masters of the Universe', year: 1983, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/zNMbRFKvMVLDjPqKQ1SXIJIxbhP.jpg', rating: 7.2, genres: ['Animation', 'Action', 'Fantasy'], overview: 'Prince Adam transforms into He-Man to defend Eternia from the evil Skeletor.' },
    { title: 'The Goonies', year: 1985, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/iGZM8k3spJqce9P3EQ9XM6CXnIo.jpg', rating: 7.9, genres: ['Adventure', 'Comedy', 'Family'], overview: 'A group of kids embark on a wild adventure after finding a pirate treasure map.' },
    { title: 'Aladdin', year: 1992, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/j4e3pDhG1ViXDDzZfEDOJhRjxwF.jpg', rating: 8.0, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'A street urchin finds a magic lamp with a genie who grants him three wishes.' },
    { title: 'The Little Mermaid', year: 1989, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/cGXFosYUHYjjdKrOmA0bbjvzhQz.jpg', rating: 7.6, genres: ['Animation', 'Family', 'Fantasy'], overview: 'A mermaid princess makes a deal with a sea witch to become human.' },
    { title: 'Beat Street', year: 1984, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911BTUgMeTmGzR.jpg', rating: 6.6, genres: ['Drama', 'Music'], overview: 'An aspiring DJ from the Bronx and his friends pursue their dreams through hip-hop culture.' },
    { title: 'Inspector Gadget', year: 1983, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/dT2GVjO9jQYyXiwpKo8Cnbk5wQ0.jpg', rating: 7.1, genres: ['Animation', 'Comedy', 'Action'], overview: 'A bionic detective with countless gadgets fights crime with his niece Penny and dog Brain.' },
    { title: 'The A-Team', year: 1983, type: 'tv', poster: 'https://image.tmdb.org/t/p/w342/rV7YnEDXSGjO8SmbKSRqK8kIJBm.jpg', rating: 7.5, genres: ['Action', 'Adventure'], overview: 'Four Vietnam vets framed for a crime they didn\'t commit become mercenaries for hire.' },
  ],
  '1990s': [
    { title: 'Toy Story', year: 1995, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/wRi3sWZli3eBmEkFdwqY2xbcjBx.jpg', rating: 8.3, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'A cowboy doll is profoundly threatened when a spaceman action figure supplants him as top toy.' },
    { title: 'The Fresh Prince of Bel-Air', year: 1990, type: 'tv', poster: 'https://image.tmdb.org/t/p/w342/6WRLqR8PK7NZXp5YSO57eCLiswP.jpg', rating: 8.2, genres: ['Comedy', 'Drama', 'Family'], overview: 'A street-smart teenager from Philadelphia is sent to live with wealthy relatives in Bel-Air.' },
    { title: 'Rugrats', year: 1991, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/hWITmFaM3jOcDJiTQmDYB4PjIqm.jpg', rating: 7.8, genres: ['Animation', 'Comedy', 'Family'], overview: 'A group of toddlers embark on wild adventures from their perspective of the world.' },
    { title: 'The Matrix', year: 1999, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', rating: 8.7, genres: ['Sci-Fi', 'Action'], overview: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.' },
    { title: 'Hey Arnold!', year: 1996, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/e7NKJr0BMe1fOvTRFCfMLofU4aW.jpg', rating: 8.0, genres: ['Animation', 'Comedy', 'Family'], overview: 'A football-headed boy named Arnold lives in a boarding house with his grandparents in the big city.' },
    { title: 'Pokémon', year: 1997, type: 'cartoon', poster: '/pokemon97.jpg', rating: 7.7, genres: ['Animation', 'Action', 'Adventure'], overview: 'Ash Ketchum and his Pikachu travel the world, catching and training Pokémon.' },
    { title: 'Titanic', year: 1997, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/9xJZyCQJyCF7aWUKIuVFp3VraiF.jpg', rating: 7.9, genres: ['Drama', 'Romance'], overview: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.' },
    { title: 'Dragon Ball Z', year: 1989, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/d9iYnYMf9u6NfnudGB6qL1YNtDs.jpg', rating: 8.1, genres: ['Animation', 'Action', 'Fantasy'], overview: 'Goku and his friends defend Earth against powerful enemies and seek the Dragon Balls.' },
    { title: 'Friends', year: 1994, type: 'tv', poster: 'https://image.tmdb.org/t/p/w342/fJ6wLWatch2kMFfKTLzqMf2mQJvz.jpg', rating: 8.2, genres: ['Comedy', 'Romance'], overview: 'Six friends navigate life, love, and everything in between in Manhattan.' },
    { title: 'Dexter\'s Laboratory', year: 1996, type: 'cartoon', poster: '/dexter96.jpg', rating: 8.0, genres: ['Animation', 'Comedy', 'Sci-Fi'], overview: 'A boy genius with a secret laboratory constantly battles his annoying sister Dee Dee.' },
    { title: 'Home Alone', year: 1990, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/gOarY3i7B4HDiLsPZCjOSJsEPnC.jpg', rating: 7.7, genres: ['Comedy', 'Family'], overview: 'An eight-year-old troublemaker must protect his house from burglars when his family leaves for vacation.' },
    { title: 'Courage the Cowardly Dog', year: 1999, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/lKkJm6jNB8Ku6dWHiU6FCpMFLvV.jpg', rating: 8.3, genres: ['Animation', 'Comedy', 'Horror'], overview: 'A cowardly dog must protect his owners from supernatural threats in the middle of Nowhere.' },
    { title: 'The Simpsons', year: 1989, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/qcr9c0g8Y6NvLx3qPA9O5L8pYTJ.jpg', rating: 8.7, genres: ['Animation', 'Comedy'], overview: 'The satirical adventures of a working-class family in the misfit city of Springfield.' },
    { title: 'Jurassic Park', year: 1993, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/b0gMqMbMs4WjX9bOu8AdQfy2PjK.jpg', rating: 8.2, genres: ['Sci-Fi', 'Adventure', 'Thriller'], overview: 'A pragmatic paleontologist is touring an almost complete theme park on an island when the park\'s dinosaurs break free.' },
    { title: 'Johnny Bravo', year: 1997, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/pXZhi8nPKReKVFjS2lsO2FVAYFV.jpg', rating: 7.5, genres: ['Animation', 'Comedy'], overview: 'A muscular, Elvis-impersonating, flamboyant ladies\' man tries to get women to date him.' },
    { title: 'Fight Club', year: 1999, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', rating: 8.4, genres: ['Drama', 'Thriller'], overview: 'An insomniac office worker forms an underground fight club that evolves into much more.' },
    { title: 'Sailor Moon', year: 1992, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/r5aP1W0GSHhz5SRRYPzk6rYPR8F.jpg', rating: 7.6, genres: ['Animation', 'Action', 'Fantasy'], overview: 'A middle school girl transforms into a magical guardian named Sailor Moon to fight evil.' },
    { title: 'Kenan & Kel', year: 1996, type: 'tv', poster: 'https://image.tmdb.org/t/p/w342/ad9w0dH6BK5CxA0LjBbfhvEqP7L.jpg', rating: 7.4, genres: ['Comedy', 'Family'], overview: 'Two teenage friends get into hilarious situations working at a grocery store.' },
  ],
  '2000s': [
    { title: 'The Avatar: The Last Airbender', year: 2005, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/lJloTOheuQSirSLXjahPWQhM8WG.jpg', rating: 9.3, genres: ['Animation', 'Action', 'Adventure'], overview: 'A young boy known as the Avatar must master all four elements to restore balance to a world at war.' },
    { title: 'Spider-Man', year: 2002, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/d0mKtIRHdE8EWSKNJajEYqoJXkp.jpg', rating: 7.4, genres: ['Action', 'Adventure', 'Sci-Fi'], overview: 'When bitten by a genetically modified spider, a nerdy high school student gains spider-like abilities.' },
    { title: 'Ben 10', year: 2005, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/rjFvNJZUMMbBtN2RIihJqKRWJ9s.jpg', rating: 7.5, genres: ['Animation', 'Action', 'Sci-Fi'], overview: 'A boy discovers an alien watch that lets him transform into 10 different alien species.' },
    { title: 'The Dark Knight', year: 2008, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911BTUgMeTmGzR.jpg', rating: 9.0, genres: ['Action', 'Crime', 'Drama'], overview: 'Batman faces the Joker, a criminal mastermind who seeks to plunge Gotham City into anarchy.' },
    { title: 'SpongeBob SquarePants', year: 1999, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/4idVfQsJPPngVwKPlQmrXWcHs8k.jpg', rating: 8.2, genres: ['Animation', 'Comedy', 'Family'], overview: 'A sea sponge named SpongeBob lives in a pineapple under the sea in Bikini Bottom.' },
    { title: 'Finding Nemo', year: 2003, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/sJNWj1MhQsMSksYmHVUhMKiLTdX.jpg', rating: 8.2, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'A clown fish named Marlin searches the ocean for his missing son Nemo.' },
    { title: 'Shrek', year: 2001, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/iB64sL3qZzj2VxioUvdQr9iGdON.jpg', rating: 7.9, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'An ogre rescues a princess with the help of a donkey and other fairy tale creatures.' },
    { title: 'The Incredibles', year: 2004, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/ihB35DegxJ1b4cQAOJSIEcW9W2a.jpg', rating: 8.0, genres: ['Animation', 'Action', 'Adventure'], overview: 'A family of superheroes living undercover must save the world while juggling everyday life.' },
    { title: 'Hannah Montana', year: 2006, type: 'tv', poster: 'https://image.tmdb.org/t/p/w342/nbsmAWF6bFqYKBCGMqNw9LpOdVB.jpg', rating: 5.8, genres: ['Comedy', 'Family', 'Music'], overview: 'A teenage girl lives a double life as a normal schoolgirl and a famous pop star.' },
    { title: 'The Fairly OddParents', year: 2001, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/d0mKtIRHdE8EWSKNJajEYqoJXkp.jpg', rating: 7.8, genres: ['Animation', 'Comedy', 'Fantasy'], overview: 'A boy is granted two fairy godparents who can grant his every wish.' },
    { title: 'Danny Phantom', year: 2004, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/iB64sL3qZzj2VxioUvdQr9iGdON.jpg', rating: 7.8, genres: ['Animation', 'Action', 'Comedy'], overview: 'A teenager gains ghost powers after an accident and uses them to protect his town.' },
    { title: 'Mean Girls', year: 2004, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/n2aTnz94NjTODHT6OxONyRnyOcA.jpg', rating: 7.1, genres: ['Comedy'], overview: 'Cady Heron is a hit with The Plastics, the A-list girl clique at her new school.' },
    { title: 'Drake & Josh', year: 2004, type: 'tv', poster: 'https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', rating: 7.6, genres: ['Comedy', 'Family'], overview: 'Two stepbrothers with very different personalities must learn to live together.' },
    { title: 'Jimmy Neutron', year: 2002, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/9xJZyCQJyCF7aWUKIuVFp3VraiF.jpg', rating: 6.8, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'A boy genius invents gadgets and goes on adventures with his robot dog Goddard.' },
    { title: 'Everybody Hates Chris', year: 2005, type: 'tv', poster: 'https://image.tmdb.org/t/p/w342/4idVfQsJPPngVwKPlQmrXWcHs8k.jpg', rating: 8.2, genres: ['Comedy', 'Drama'], overview: 'A teenager growing up in Brooklyn in the 1980s navigates the challenges of adolescence.' },
    { title: 'Codename: Kids Next Door', year: 2002, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/gOarY3i7B4HDiLsPZCjOSJsEPnC.jpg', rating: 7.6, genres: ['Animation', 'Action', 'Comedy'], overview: 'Five kids operate a global organization from their treehouse to fight adult tyranny.' },
  ],
  '2010s': [
    { title: 'Adventure Time', year: 2010, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/s2Pz3aPm1oJnOBiSyRVRKXH7o6S.jpg', rating: 8.6, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'A boy and his magical dog go on adventures in the post-apocalyptic Land of Ooo.' },
    { title: 'Regular Show', year: 2010, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/1gKKLHjBxEsOjNqcMyiJMEkIvxc.jpg', rating: 8.3, genres: ['Animation', 'Comedy'], overview: 'Two best friends work as groundskeepers at a park and get into surreal misadventures.' },
    { title: 'The Avengers', year: 2012, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/orb50TqBbMb7MjxNjkiDsS8BuPH.jpg', rating: 8.0, genres: ['Action', 'Adventure', 'Sci-Fi'], overview: 'Earth\'s mightiest heroes must come together to stop an alien invasion.' },
    { title: 'Gravity Falls', year: 2012, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/wP2GqFMmSsYGiG26T0mz9NkWM5r.jpg', rating: 8.9, genres: ['Animation', 'Comedy', 'Mystery'], overview: 'Twins spend the summer with their great-uncle and discover supernatural mysteries in a small town.' },
    { title: 'Steven Universe', year: 2013, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/fm2mKu3lOKZ1mMQKPnQb7pOU6jS.jpg', rating: 8.2, genres: ['Animation', 'Action', 'Comedy'], overview: 'A young boy discovers he has magical powers inherited from his alien mother.' },
    { title: 'Stranger Things', year: 2016, type: 'tv', poster: 'https://image.tmdb.org/t/p/w342/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', rating: 8.7, genres: ['Drama', 'Fantasy', 'Horror'], overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.' },
    { title: 'Frozen', year: 2013, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/zVfJDT6nFzlMlUOMqKGOBHfSZcB.jpg', rating: 7.4, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'A fearless princess sets out on a journey to find her sister and end an eternal winter.' },
    { title: 'The Amazing World of Gumball', year: 2011, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/1Lh9MfOkUuGXmPWRNPKHtnmGBHG.jpg', rating: 7.9, genres: ['Animation', 'Comedy', 'Family'], overview: 'A blue cat and his goldfish brother get into bizarre adventures in the town of Elmore.' },
    { title: 'Inception', year: 2010, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', rating: 8.8, genres: ['Sci-Fi', 'Action', 'Thriller'], overview: 'A skilled thief who steals corporate secrets through dream-sharing technology is given the inverse task.' },
    { title: 'Phineas and Ferb', year: 2007, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/fReDUno7SVKGC0uT3JDMNTKSI8P.jpg', rating: 8.4, genres: ['Animation', 'Comedy', 'Adventure'], overview: 'Two stepbrothers invent elaborate schemes during summer vacation while their sister tries to bust them.' },
    { title: 'We Bare Bears', year: 2015, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/iB64sL3qZzj2VxioUvdQr9iGdON.jpg', rating: 8.1, genres: ['Animation', 'Comedy'], overview: 'Three bear brothers try to navigate human society and make friends in San Francisco.' },
    { title: 'The Lego Movie', year: 2014, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/3VpK1bNis5QSBjkUc2sXvJfGHBH.jpg', rating: 7.7, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'An ordinary Lego figure is mistakenly thought to be the prophesied savior of the Lego world.' },
    { title: 'Inside Out', year: 2015, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/nGxUxi3PfXDRm7Vg95VBNgNM8yc.jpg', rating: 8.1, genres: ['Animation', 'Comedy', 'Drama'], overview: 'Young Riley is uprooted from her Midwest life when her father starts a new job in San Francisco.' },
    { title: 'Moana', year: 2016, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/thOYj6SxQs2G2LY9s2YjEDFyCRI.jpg', rating: 7.6, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'A spirited teenager sails out on a daring mission to save her people and discovers her own identity.' },
    { title: 'Black Panther', year: 2018, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/uxKxg16e8pJOCsQhgI6lNNSB7DM.jpg', rating: 7.3, genres: ['Action', 'Adventure', 'Sci-Fi'], overview: 'T\'Challa, heir to the hidden but advanced kingdom of Wakanda, must step forward to lead his people.' },
    { title: 'Spider-Man: Into the Spider-Verse', year: 2018, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/d0mKtIRHdE8EWSKNJajEYqoJXkp.jpg', rating: 8.4, genres: ['Animation', 'Action', 'Adventure'], overview: 'Teen Miles Morales becomes the Spider-Man of his reality and crosses paths with counterparts from other dimensions.' },
    { title: 'The Lion King (2019)', year: 2019, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/sKCr7MXcQsLdOrsRv0e3pe2jVyQ.jpg', rating: 6.9, genres: ['Animation', 'Adventure', 'Drama'], overview: 'After the murder of his father, a young lion prince flees his kingdom only to learn the true meaning of responsibility.' },
    { title: 'Toy Story 4', year: 2019, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/wRi3sWZli3eBmEkFdwqY2xbcjBx.jpg', rating: 7.5, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'When a new toy called Forky joins Woody and the gang, a road trip alongside old and new friends reveals how big the world can be.' },
    { title: 'Avengers: Endgame', year: 2019, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/or06FN3Dka5tukK1e9sl16pB3iy.jpg', rating: 8.4, genres: ['Action', 'Adventure', 'Drama'], overview: 'After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos\' actions.' },
    { title: 'The Mandalorian', year: 2019, type: 'tv', poster: 'https://image.tmdb.org/t/p/w342/sWgBv7LV2PRoQgk45w8KIPeVxe7.jpg', rating: 8.7, genres: ['Action', 'Adventure', 'Sci-Fi'], overview: 'A lone gunfighter makes his way through the galaxy in the era after the fall of the Empire.' },
    { title: 'Coco', year: 2017, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/sWgBv7LV2PRoQgk45w8KIPeVxe7.jpg', rating: 8.4, genres: ['Animation', 'Adventure', 'Family'], overview: 'Aspiring musician Miguel enters the Land of the Dead to find his great-great-grandfather, a legendary singer.' },
    { title: 'Wonder Woman', year: 2017, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/31kRfM9uYSB9Y9R5VmjMFsJ5N9h.jpg', rating: 7.4, genres: ['Action', 'Adventure', 'Fantasy'], overview: 'When a pilot crashes and tells of conflict in the outside world, Diana leaves her home to fight a war to end all wars.' },
    { title: 'Trolls', year: 2016, type: 'cartoon', poster: '/trolls16.jpg', rating: 6.5, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'After the Bergens invade Troll Village, Poppy, the happiest Troll ever born, and the curmudgeonly Branch set off on a journey.' },
    { title: 'The Boss Baby', year: 2017, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/fJ6wLWatch2kMFfKTLzqMf2mQJvz.jpg', rating: 6.3, genres: ['Animation', 'Comedy', 'Family'], overview: 'A suit-wearing, briefcase-carrying baby pairs up with his 7-year old brother to stop the dastardly plot of the CEO of Puppy Co.' },
    { title: 'Despicable Me 3', year: 2017, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/qcr9c0g8Y6NvLx3qPA9O5L8pYTJ.jpg', rating: 6.3, genres: ['Animation', 'Comedy', 'Family'], overview: 'Gru meets his long-lost charming, cheerful, and more successful twin brother Dru who wants to team up for one last criminal heist.' },
    { title: 'Incredibles 2', year: 2018, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/ihB35DegxJ1b4cQAOJSIEcW9W2a.jpg', rating: 7.6, genres: ['Animation', 'Action', 'Adventure'], overview: 'The Incredibles family takes on a new mission while Elastigirl goes out to fight crime and Mr. Incredible stays home with the kids.' },
    { title: 'Ralph Breaks the Internet', year: 2018, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911BTUgMeTmGzR.jpg', rating: 7.0, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'Six years after the events of Wreck-It Ralph, Ralph and Vanellope embark on a new adventure through the internet.' },
    { title: 'Jurassic World', year: 2015, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/c9XxYhUZopoIsjL2sR4xM3FVNmY.jpg', rating: 7.0, genres: ['Action', 'Adventure', 'Sci-Fi'], overview: 'A new theme park built on the original site of Jurassic Park creates a genetically modified hybrid dinosaur that escapes containment.' },
    { title: 'The Loud House', year: 2016, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/pXZhi8nPKReKVFjS2lsO2FVAYFV.jpg', rating: 7.3, genres: ['Animation', 'Comedy', 'Family'], overview: 'Lincoln Loud is an 11-year-old boy living with ten sisters and his parents in a big family full of chaos and fun.' },
    { title: 'The Owl House', year: 2020, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/zNMbRFKvMVLDjPqKQ1SXIJIxbhP.jpg', rating: 8.5, genres: ['Animation', 'Adventure', 'Fantasy'], overview: 'A self-assured teenage girl befriends a rebellious witch and discovers a magical realm where she feels she truly belongs.' },
    { title: 'The Mitchells vs. the Machines', year: 2021, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/4idVfQsJPPngVwKPlQmrXWcHs8k.jpg', rating: 7.7, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'A quirky, dysfunctional family\'s road trip is upended when they find themselves in the middle of a robot apocalypse.' },
  ],
  '2020s': [
    { title: 'The Owl House', year: 2020, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/zNMbRFKvMVLDjPqKQ1SXIJIxbhP.jpg', rating: 8.5, genres: ['Animation', 'Adventure', 'Fantasy'], overview: 'A self-assured teenage girl befriends a rebellious witch and discovers a magical realm where she feels she truly belongs.' },
    { title: 'The Mitchells vs. the Machines', year: 2021, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/4idVfQsJPPngVwKPlQmrXWcHs8k.jpg', rating: 7.7, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'A quirky, dysfunctional family\'s road trip is upended when they find themselves in the middle of a robot apocalypse.' },
    { title: 'Spider-Man: No Way Home', year: 2021, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/d0mKtIRHdE8EWSKNJajEYqoJXkp.jpg', rating: 8.2, genres: ['Action', 'Adventure', 'Fantasy'], overview: 'Peter Parker\'s life is turned upside down when his identity is revealed and he asks Doctor Strange for help.' },
    { title: 'Encanto', year: 2021, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/fJ6wLWatch2kMFfKTLzqMf2mQJvz.jpg', rating: 7.2, genres: ['Animation', 'Comedy', 'Family'], overview: 'A magical Colombian family faces challenges when the magic that blesses them begins to fade.' },
    { title: 'Luca', year: 2021, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/jNJwD2NLsWJMf8K7Wfj2Or7pqe7.jpg', rating: 7.5, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'On the Italian Riviera, a boy with a secret shares adventures with a newfound friend.' },
    { title: 'Turning Red', year: 2022, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/qcr9c0g8Y6NvLx3qPA9O5L8pYTJ.jpg', rating: 7.0, genres: ['Animation', 'Comedy', 'Family'], overview: 'A 13-year-old girl turns into a giant red panda whenever she gets too excited.' },
    { title: 'Sonic the Hedgehog 2', year: 2022, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/7qvPamNbViKGMqVdMiUVbZMOBQR3.jpg', rating: 6.8, genres: ['Action', 'Adventure', 'Comedy'], overview: 'When the manic Dr. Robotnik returns to Earth with a new ally, Knuckles the Echidna, Sonic and his new friend Tails team up.' },
    { title: 'Puss in Boots: The Last Wish', year: 2022, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/kuf6dutpsT0vSVehic3EZIqkOBt.jpg', rating: 7.8, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'Puss in Boots discovers that his passion for adventure has taken its toll and he has burned through eight of his nine lives.' },
    { title: 'Top Gun: Maverick', year: 2022, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/odJ4hx6g6vBt4lBxmF0LcZ8wKBV.jpg', rating: 8.3, genres: ['Action', 'Drama'], overview: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, confronting ghosts of his past.' },
    { title: 'Spider-Man: Across the Spider-Verse', year: 2023, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/d0mKtIRHdE8EWSKNJajEYqoJXkp.jpg', rating: 8.6, genres: ['Animation', 'Action', 'Adventure'], overview: 'Miles Morales catapults across the multiverse where he encounters a team of Spider-People charged with protecting its existence.' },
    { title: 'The Super Mario Bros. Movie', year: 2023, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg', rating: 7.1, genres: ['Animation', 'Adventure', 'Comedy'], overview: 'A plumber named Mario travels through the Mushroom Kingdom with a princess to save his brother from a fire-breathing king.' },
    { title: 'Barbie', year: 2023, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', rating: 6.9, genres: ['Comedy', 'Adventure', 'Fantasy'], overview: 'Barbie and Ken experience the real world after leaving Barbieland.' },
    { title: 'Oppenheimer', year: 2023, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', rating: 8.3, genres: ['Drama', 'History'], overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.' },
    { title: 'Inside Out 2', year: 2024, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/nGxUxi3PfXDRm7Vg95VBNgNM8yc.jpg', rating: 7.6, genres: ['Animation', 'Comedy', 'Drama'], overview: 'Riley enters puberty and experiences new, more complex emotions led by Anxiety.' },
    { title: 'Kung Fu Panda 4', year: 2024, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/eVFD3lXPG8dIHKmPUqNHeMhMtJX.jpg', rating: 6.5, genres: ['Animation', 'Action', 'Comedy'], overview: 'Po must train a new warrior when he\'s chosen to become the Spiritual Leader of the Valley of Peace.' },
    { title: 'Deadpool & Wolverine', year: 2024, type: 'movie', poster: 'https://image.tmdb.org/t/p/w342/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', rating: 7.7, genres: ['Action', 'Adventure', 'Comedy'], overview: 'Deadpool teams up with Wolverine for a multiversal adventure that changes the Marvel Cinematic Universe forever.' },
    { title: 'Bluey', year: 2018, type: 'cartoon', poster: 'https://image.tmdb.org/t/p/w342/4idVfQsJPPngVwKPlQmrXWcHs8k.jpg', rating: 9.2, genres: ['Animation', 'Comedy', 'Family'], overview: 'An inexhaustible six-year-old Blue Heeler dog and her family play games that explore imagination and everyday life.' },
    { title: 'Heartstopper', year: 2022, type: 'tv', poster: 'https://image.tmdb.org/t/p/w342/lJloTOheuQSirSLXjahPWQhM8WG.jpg', rating: 8.4, genres: ['Drama', 'Romance'], overview: 'Teens Nick and Charlie discover their feelings for each other and navigate love and friendship at high school.' },
    { title: 'Wednesday', year: 2022, type: 'tv', poster: 'https://image.tmdb.org/t/p/w342/9PFonBhy4cQy7Jz20NpMygczOkv.jpg', rating: 8.1, genres: ['Comedy', 'Fantasy', 'Mystery'], overview: 'Wednesday Addams investigates a murder spree while making new friends at Nevermore Academy.' },
  ],
};

/* ── decade key helper ─────────────────────── */
function getDecadeKey(year: number): string {
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

/* ── fetch from TMDB ──────────────────────── */
async function fetchFromTmdb(
  birthYear: number,
  maxYear: number,
  category: string,
  page: number
): Promise<{ items: MovieItem[]; totalPages: number } | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;

  const items: MovieItem[] = [];
  let totalPages = 1;

  try {
    if (category === 'cartoon') {
      // Fetch both movies and TV with animation genre
      const [movieRes, tvRes] = await Promise.all([
        fetch(`${TMDB_BASE}/discover/movie?api_key=${apiKey}&with_genres=16&primary_release_date.gte=${birthYear}-01-01&primary_release_date.lte=${maxYear}-12-31&sort_by=popularity.desc&page=${page}`),
        fetch(`${TMDB_BASE}/discover/tv?api_key=${apiKey}&with_genres=16&first_air_date.gte=${birthYear}-01-01&first_air_date.lte=${maxYear}-12-31&sort_by=popularity.desc&page=${page}`),
      ]);

      const [movieData, tvData] = await Promise.all([movieRes.json(), tvRes.json()]);
      totalPages = Math.max(movieData.total_pages || 1, tvData.total_pages || 1);

      for (const m of (movieData.results || []).slice(0, 10)) {
        items.push(formatTmdbItem(m, 'movie'));
      }
      for (const t of (tvData.results || []).slice(0, 10)) {
        items.push(formatTmdbItem(t, 'tv'));
      }
    } else {
      const isMovie = category === 'movie';
      const dateField = isMovie ? 'primary_release_date' : 'first_air_date';
      const endpoint = isMovie ? 'movie' : 'tv';
      const res = await fetch(
        `${TMDB_BASE}/discover/${endpoint}?api_key=${apiKey}&${dateField}.gte=${birthYear}-01-01&${dateField}.lte=${maxYear}-12-31&sort_by=popularity.desc&page=${page}&vote_count.gte=50`
      );
      const data = await res.json();
      totalPages = data.total_pages || 1;

      for (const item of (data.results || []).slice(0, 20)) {
        items.push(formatTmdbItem(item, endpoint));
      }
    }
  } catch (err) {
    console.error('[api/movies] TMDB fetch error:', err);
    return null;
  }

  return { items, totalPages: Math.min(totalPages, 10) };
}

function formatTmdbItem(item: TmdbMovie, mediaType: string): MovieItem {
  const dateStr = item.release_date || item.first_air_date || '';
  const year = dateStr ? parseInt(dateStr.substring(0, 4)) : 0;
  const genres = (item.genre_ids || []).map((g) => GENRE_MAP[g] || '').filter(Boolean);
  const isCartoon = genres.includes('Animation') || genres.includes('Kids');

  return {
    id: String(item.id),
    title: item.title || item.name || 'Unknown',
    year,
    type: isCartoon ? 'cartoon' : (mediaType === 'tv' ? 'tv' : 'movie'),
    poster: item.poster_path ? `${TMDB_IMG}${item.poster_path}` : '',
    backdrop: item.backdrop_path ? `${TMDB_ORIG}${item.backdrop_path}` : '',
    rating: Math.round(item.vote_average * 10) / 10,
    genres,
    overview: item.overview || '',
    mediaType,
  };
}

/* ── response type ────────────────────────── */
interface MovieItem {
  id: string;
  title: string;
  year: number;
  type: 'movie' | 'tv' | 'cartoon';
  poster: string;
  backdrop?: string;
  rating: number;
  genres: string[];
  overview: string;
  mediaType?: string;
  watchProviders?: { name: string; logo: string }[];
}

/* ── GET handler ──────────────────────────── */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const birthYear = parseInt(searchParams.get('birthYear') || '1990');
  const category = searchParams.get('category') || 'all'; // all, movie, tv, cartoon
  const page = parseInt(searchParams.get('page') || '1');

  // Core age filter: birth year to 18 years old
  const minYear = birthYear;
  const maxYear = birthYear + 18;

  // Try TMDB first
  const tmdbResult = await fetchFromTmdb(minYear, maxYear, category, page);
  if (tmdbResult) {
    return NextResponse.json({
      items: tmdbResult.items,
      totalPages: tmdbResult.totalPages,
      minYear,
      maxYear,
      source: 'tmdb',
    });
  }

  // Fallback: curated data
  const allItems: MovieItem[] = [];
  const startDecade = Math.floor(minYear / 10) * 10;
  const endDecade = Math.floor(maxYear / 10) * 10;

  for (let d = startDecade; d <= endDecade; d += 10) {
    const key = `${d}s`;
    const decadeItems = FALLBACK[key] || [];
    for (const item of decadeItems) {
      if (item.year >= minYear && item.year <= maxYear) {
        if (category === 'all' || item.type === category) {
          allItems.push({
            id: `fb-${d}-${item.title.replace(/\s+/g, '-').toLowerCase()}`,
            title: item.title,
            year: item.year,
            type: item.type,
            poster: item.poster,
            rating: item.rating,
            genres: item.genres,
            overview: item.overview,
          });
        }
      }
    }
  }

  // Sort by year desc, then rating desc
  allItems.sort((a, b) => b.year - a.year || b.rating - a.rating);

  return NextResponse.json({
    items: allItems,
    totalPages: 1,
    minYear,
    maxYear,
    source: 'curated',
  });
}
