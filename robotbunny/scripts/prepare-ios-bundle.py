#!/usr/bin/env python3
"""Copy only offline runtime resources, retaining the original www paths."""
import json
from pathlib import Path
import re
import shutil
import sys

root = Path(__file__).resolve().parents[1]
destination = Path(sys.argv[1]).resolve()
if destination == root or root in destination.parents and destination.name != 'www':
    raise SystemExit('Destination must be a separate www runtime folder')
destination.mkdir(parents=True, exist_ok=True)
sources = ['index.html', 'index-old.html', 'index-endless.html', 'engine', 'images', 'sounds',
           'biome-config.json', 'level-config.json', 'music-patterns.json', 'game.js',
           'player.js', 'utils.js', 'boss-system.js', 'threat-system.js',
           'segment-generator.js', 'meta-progression.js', 'music-engine.js']
for name in sources:
    source = root / name
    if not source.exists():
        raise SystemExit(f'Missing offline resource: {name}')
    target = destination / name
    if source.is_dir():
        if target.exists(): shutil.rmtree(target)
        shutil.copytree(source, target, ignore=shutil.ignore_patterns('._*', '.DS_Store'))
    else:
        shutil.copy2(source, target)
# Verify every original image/audio URL before allowing an Xcode build to succeed.
html = (destination / 'index.html').read_text()
urls = re.findall(r"['\"]((?:images|sounds)/[^'\"]+\.(?:png|mp3))['\"]", html)
for url in urls:
    if not (destination / url).is_file(): raise SystemExit(f'Missing referenced file: {url}')
entry = (destination / 'engine/index.html').read_text()
for url in re.findall(r'(?:src|href)="([^"]+)"', entry):
    if url.startswith(('http:', 'https:', '//')): raise SystemExit('Remote engine dependency: ' + url)
    target = destination / 'engine' / url
    if target.is_dir(): target = target / 'index.html'
    if not target.is_file(): raise SystemExit('Missing engine resource: ' + url)
print(f'Bundled offline resources; verified {len(set(urls))} original artwork/audio references.')
