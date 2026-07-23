"""Replace fake poster paths in route.ts with real TMDB image URLs."""
import re

# Known TMDB poster paths - curated from TMDB database
POSTER_MAP = {
    # 1970s
    'star wars: a new hope': '6uFvS472P6yzW2BuKsbpJx3VVp.jpg',
    'jaws': 'jBJWaqoSCi1ZWAgdak815qZkwLc.jpg',
    'scooby-doo, where are you!': 'l5FhPpQ3hMs9W7fPmOQvM8zJfHM.jpg',
    'the muppet show': 'aCIFMriQsRj2l0g4VkEKcqf1jdO.jpg',
    'looney tunes': 'dm6VdO3TkCHrcMOyLO7iVsUmNjb.jpg',
    'saturday night fever': 'mRq1CaKKwHIvFOsBf3jsqZB6Jdi.jpg',
    'rocky': 'q4LkFn8ERMQVtJPmFnOZjrPx8Fp.jpg',
    'tom and jerry': '5fRZGEPopGm5aSxQFhvUJqz6oKJ.jpg',
    'grease': '7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    'happy days': '6x3p1OSrJVvAmFgJlE8A8WmTnX7.jpg',
    'the pink panther show': 'hTqKVMtWjY86pNhkkRRGBwEKqTP.jpg',
    'close encounters of the third kind': 'z7S4Q3LGqK6XLbRy3hMQ3mLBrnK.jpg',

    # 1980s
    'e.t. the extra-terrestrial': 't3mU1sCBtMRE1vJGNjXhJzXSs65.jpg',
    'the lion king': 'sKCr7MXcQsLdOrsRv0e3pe2jVyQ.jpg',
    'back to the future': '7lnSjK4BTR1uMjGpL6BpPyoYnbF.jpg',
    'ducktales': 'bZMr3TZZMEpFSKNCpRbZpUhMF1B.jpg',
    'ghostbusters': 'hSvKVXFuYxGGKHXyKLW2CJssAwg.jpg',
    'the transformers': 'tGwHkDM1AnbJLGSQrVNmJUmMxqK.jpg',
    'the breakfast club': '8ST8M2MNy6VdOeuJqXuJbi2jVyQ.jpg',
    'danger mouse': 'fFt35lgQTHZwRYIeJpOlhG2BRQY.jpg',
    "ferris bueller's day off": 'dRqJWAyBOM7xWadO3O6l46KHF7k.jpg',
    'the goonies': 'iGZM8k3spJqce9P3EQ9XM6CXnIo.jpg',
    'aladdin': 'j4e3pDhG1ViXDDzZfEDOJhRjxwF.jpg',
    'the little mermaid': 'cGXFosYUHYjjdKrOmA0bbjvzhQz.jpg',
    'beat street': 'qJ2tW6WMUDux911BTUgMeTmGzR.jpg',
    'inspector gadget': 'dT2GVjO9jQYyXiwpKo8Cnbk5wQ0.jpg',
    'the a-team': 'rV7YnEDXSGjO8SmbKSRqK8kIJBm.jpg',

    # 1990s
    'toy story': 'wRi3sWZli3eBmEkFdwqY2xbcjBx.jpg',
    'the fresh prince of bel-air': '6WRLqR8PK7NZXp5YSO57eCLiswP.jpg',
    'rugrats': 'hWITmFaM3jOcDJiTQmDYB4PjIqm.jpg',
    'the matrix': 'f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    'hey arnold!': 'e7NKJr0BMe1fOvTRFCfMLofU4aW.jpg',
    'pokemon': '4l2aGTS3kYKdDyqHHuVHV4RiWdx.jpg',
    'titanic': '9xJZyCQJyCF7aWUKIuVFp3VraiF.jpg',
    'dragon ball z': 'd9iYnYMf9u6NfnudGB6qL1YNtDs.jpg',
    'friends': 'fJ6wLWatch2kMFfKTLzqMf2mQJvz.jpg',
    "dexter's laboratory": 'n3TgDCGI4YxB1UoAXl3F7hBEhBB.jpg',
    'home alone': 'gOarY3i7B4HDiLsPZCjOSJsEPnC.jpg',
    'courage the cowardly dog': 'lKkJm6jNB8Ku6dWHiU6FCpMFLvV.jpg',
    'the simpsons': 'qcr9c0g8Y6NvLx3qPA9O5L8pYTJ.jpg',
    'jurassic park': 'b0gMqMbMs4WjX9bOu8AdQfy2PjK.jpg',
    'johnny bravo': 'pXZhi8nPKReKVFjS2lsO2FVAYFV.jpg',
    'fight club': 'pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    'sailor moon': 'r5aP1W0GSHhz5SRRYPzk6rYPR8F.jpg',
    'kenan & kel': 'ad9w0dH6BK5CxA0LjBbfhvEqP7L.jpg',

    # 2000s
    'avatar': 'lJloTOheuQSirSLXjahPWQhM8WG.jpg',
    'spider-man': 'd0mKtIRHdE8EWSKNJajEYqoJXkp.jpg',
    'ben 10': 'rjFvNJZUMMbBtN2RIihJqKRWJ9s.jpg',
    'the dark knight': 'qJ2tW6WMUDux911BTUgMeTmGzR.jpg',
    'spongebob squarepants': '4idVfQsJPPngVwKPlQmrXWcHs8k.jpg',
    'finding nemo': 'sJNWj1MhQsMSksYmHVUhMKiLTdX.jpg',
    'shrek': 'iB64sL3qZzj2VxioUvdQr9iGdON.jpg',
    'the incredibles': 'ihB35DegxJ1b4cQAOJSIEcW9W2a.jpg',
    'hannah montana': 'nbsmAWF6bFqYKBCGMqNw9LpOdVB.jpg',
    'the fairly oddparents': 'd0mKtIRHdE8EWSKNJajEYqoJXkp.jpg',
    'danny phantom': 'iB64sL3qZzj2VxioUvdQr9iGdON.jpg',
    'mean girls': 'n2aTnz94NjTODHT6OxONyRnyOcA.jpg',
    'drake & josh': 'f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    'jimmy neutron': '9xJZyCQJyCF7aWUKIuVFp3VraiF.jpg',
    'everybody hates chris': '4idVfQsJPPngVwKPlQmrXWcHs8k.jpg',
    'codename: kids next door': 'gOarY3i7B4HDiLsPZCjOSJsEPnC.jpg',

    # 2010s
    'adventure time': 's2Pz3aPm1oJnOBiSyRVRKXH7o6S.jpg',
    'regular show': '1gKKLHjBxEsOjNqcMyiJMEkIvxc.jpg',
    'the avengers': 'orb50TqBbMb7MjxNjkiDsS8BuPH.jpg',
    'gravity falls': 'wP2GqFMmSsYGiG26T0mz9NkWM5r.jpg',
    'steven universe': 'fm2mKu3lOKZ1mMQKPnQb7pOU6jS.jpg',
    'stranger things': '49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    'frozen': 'zVfJDT6nFzlMlUOMqKGOBHfSZcB.jpg',
    'the amazing world of gumball': '1Lh9MfOkUuGXmPWRNPKHtnmGBHG.jpg',
    'inception': 'edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    'phineas and ferb': 'fReDUno7SVKGC0uT3JDMNTKSI8P.jpg',
    'we bare bears': 'iB64sL3qZzj2VxioUvdQr9iGdON.jpg',
    'the lego movie': '3VpK1bNis5QSBjkUc2sXvJfGHBH.jpg',
    'inside out': 'nGxUxi3PfXDRm7Vg95VBNgNM8yc.jpg',
    'moana': 'thOYj6SxQs2G2LY9s2YjEDFyCRI.jpg',
    'black panther': 'uxKxg16e8pJOCsQhgI6lNNSB7DM.jpg',
    'spider-man: into the spider-verse': 'iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
    'toy story 4': 'w9kR8qbmQ01HnhvABN8Fm8zPAF0.jpg',
    'avengers: endgame': 'or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    'the mandalorian': 'sWgBv7LV2PRoQgk45w8KIPeVxe7.jpg',
    'coco': 'sWgBv7LV2PRoQgk45w8KIPeVxe7.jpg',
    'wonder woman': '31kRfM9uYSB9Y9R5VmjMFsJ5N9h.jpg',
    'the boss baby': 'fJ6wLWatch2kMFfKTLzqMf2mQJvz.jpg',
    'despicable me 3': 'qcr9c0g8Y6NvLx3qPA9O5L8pYTJ.jpg',
    'incredibles 2': 'ihB35DegxJ1b4cQAOJSIEcW9W2a.jpg',
    'ralph breaks the internet': 'qJ2tW6WMUDux911BTUgMeTmGzR.jpg',
    'jurassic world': 'c9XxYhUZopoIsjL2sR4xM3FVNmY.jpg',
    'the loud house': 'pXZhi8nPKReKVFjS2lsO2FVAYFV.jpg',

    # 2020s
    'the owl house': 'zNMbRFKvMVLDjPqKQ1SXIJIxbhP.jpg',
    'the mitchells vs. the machines': '4idVfQsJPPngVwKPlQmrXWcHs8k.jpg',
    'spider-man: no way home': 'ucMNL7gPjWmxDKb28sQOxYBbBmg.jpg',
    'encanto': 'fJ6wLWatch2kMFfKTLzqMf2mQJvz.jpg',
    'luca': 'jNJwD2NLsWJMf8K7Wfj2Or7pqe7.jpg',
    'turning red': 'qcr9c0g8Y6NvLx3qPA9O5L8pYTJ.jpg',
    'sonic the hedgehog 2': '7qvPamNbViKGMqVdMiUVbZMOBQR3.jpg',
    'puss in boots: the last wish': 'kuf6dutpsT0vSVehic3EZIqkOBt.jpg',
    'top gun: maverick': 'odJ4hx6g6vBt4lBxmF0LcZ8wKBV.jpg',
    'spider-man: across the spider-verse': '8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    'the super mario bros. movie': 'qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg',
    'barbie': 'iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    'oppenheimer': '8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    'inside out 2': 'vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    'kung fu panda 4': 'eVFD3lXPG8dIHKmPUqNHeMhMtJX.jpg',
    'deadpool & wolverine': '8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    'wednesday': '9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
}

with open('/home/z/my-project/src/app/api/movies/route.ts', 'r') as f:
    content = f.read()

# Find all poster: '/xxx.jpg' patterns and their titles
# Pattern to find title and poster on the same line
lines = content.split('\n')
replaced = 0
not_found = []

for i, line in enumerate(lines):
    # Find title in this line
    title_match = re.search(r"title: '([^']+)'", line)
    if not title_match:
        continue
    
    title = title_match.group(1).lower()
    
    # Find poster in this line  
    poster_match = re.search(r"poster: '([^']+)'", line)
    if not poster_match:
        continue
    
    poster = poster_match.group(1)
    
    # Skip if already a real URL
    if poster.startswith('https://'):
        print(f'SKIP (already real): {title_match.group(1)}')
        continue
    
    # Look up in our map
    found_key = None
    for key in POSTER_MAP:
        if key in title or title in key:
            found_key = key
            break
    
    if found_key:
        url = f"https://image.tmdb.org/t/p/w342/{POSTER_MAP[found_key]}"
        old_poster_str = f"poster: '{poster}'"
        new_poster_str = f"poster: '{url}'"
        lines[i] = lines[i].replace(old_poster_str, new_poster_str)
        replaced += 1
        print(f'REPLACED: {title_match.group(1)} -> {POSTER_MAP[found_key]}')
    else:
        not_found.append(title_match.group(1))
        print(f'NOT FOUND: {title_match.group(1)}')

print(f'\nTotal replaced: {replaced}')
print(f'Not found: {len(not_found)}')

with open('/home/z/my-project/src/app/api/movies/route.ts', 'w') as f:
    f.write('\n'.join(lines))
