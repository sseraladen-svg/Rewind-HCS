import re

FILE = '/home/z/my-project/src/app/api/movies/route.ts'

with open(FILE, 'r') as f:
    content = f.read()

# Count before
before = len(re.findall(r'https://picsum\.photos/seed/[^"\']+', content))
print(f'Found {before} picsum URLs before replacement')

# Replace all poster: 'https://picsum.photos/seed/.../342/513' with poster: ''
content = re.sub(r"poster: 'https://picsum\.photos/seed/[^']+'", "poster: ''", content)

# Count after
after = len(re.findall(r'https://picsum\.photos/seed/[^"\']+', content))
print(f'Found {after} picsum URLs after replacement')

with open(FILE, 'w') as f:
    f.write(content)

print('Done!')
