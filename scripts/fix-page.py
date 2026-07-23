#!/usr/bin/env python3
"""Rebuild page.tsx removing Camera, Memories, Vault, FunStuff tabs and all dead code."""

import re

with open('/home/z/my-project/src/app/page.tsx', 'r') as f:
    lines = f.readlines()

total = len(lines)
print(f"Read {total} lines")

output = []

def add_lines(start, end):
    """Add lines 1-indexed inclusive."""
    for i in range(start - 1, min(end, total)):
        output.append(lines[i])

# 1. Imports (lines 1-27) - keep as-is
add_lines(1, 27)

# 2. CrtLoadingScreen (lines 28-135)
add_lines(28, 135)

# 3. DustMotes (lines 136-181)
add_lines(136, 181)

# 4. HeroSection (lines 182-309)
add_lines(182, 309)

# 5. QuoteBanner (lines 310-335)
add_lines(310, 335)

# SKIP MemoryCard (336-366) and CategoryGrid (367-379)

# 6. PersonalTimeline (lines 380-422) - KEEP
add_lines(380, 422)

# SKIP EraSpotlight (423-477) and BreatherMessage (478-520)

# 7. Dashboard function start comment + signature (lines 521-527)
add_lines(521, 527)

# 8. Replace state declarations
output.append("  const [activeTab, setActiveTab] = useState('journal');\n")
output.append("  const [showReel, setShowReel] = useState(false);\n")
output.append("  const [showAuth, setShowAuth] = useState(false);\n")
output.append("  const { data: session } = useSession();\n")
output.append("\n")

# SKIP categoryMap (lines 534-546)

# 9. handleTabChange (lines 547-567)
add_lines(547, 567)

# 10. Replace tabs array
output.append("\n")
output.append("  const tabs = [\n")
output.append("    { id: 'reel', label: 'Reel', icon: <Clapperboard className=\"h-4 w-4\" /> },\n")
output.append("    { id: 'journal', label: 'Journal', icon: <BookOpen className=\"h-4 w-4\" /> },\n")
output.append("    { id: 'games', label: 'Games', icon: <Gamepad2 className=\"h-4 w-4\" /> },\n")
output.append("    { id: 'contacts', label: 'Contacts', icon: <Phone className=\"h-4 w-4\" /> },\n")
output.append("    { id: 'timeline', label: 'Timeline', icon: <Clock className=\"h-4 w-4\" /> },\n")
output.append("    { id: 'settings', label: 'Settings', icon: <Settings className=\"h-4 w-4\" /> },\n")
output.append("  ];\n")

# 11. Process JSX return line by line (from line 581 onwards)
i = 580  # 0-indexed = line 581
in_skip = False

while i < total:
    line = lines[i]
    stripped = line.strip()
    
    # Start skipping at these section comments
    if ('MEMORIES TAB' in line or 'FUN STUFF TAB' in line or 
        'CAMERA TAB' in line or 'VAULT TAB' in line or
        'FLOATING VINTAGE CAMERA' in line):
        in_skip = True
        i += 1
        continue
    
    # Stop skipping when we hit the next section comment or specific markers
    if in_skip:
        # Next tab section comment means stop
        if re.search(r'/\*.*═.*TAB.*═.*\*/', line):
            in_skip = False
        # Also stop at MEMORY REEL OVERLAY (after floating camera)
        elif 'MEMORY REEL OVERLAY' in line:
            in_skip = False
        else:
            i += 1
            continue
    
    output.append(line)
    i += 1

with open('/home/z/my-project/src/app/page.tsx', 'w') as f:
    f.writelines(output)

print(f"Written {len(output)} lines (removed {total - len(output)} lines)")