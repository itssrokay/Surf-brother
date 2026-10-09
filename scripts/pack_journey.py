"""Group unchanged WebP frames into 12-frame, content-addressed delivery packs."""
from pathlib import Path
import hashlib, json, struct
import shutil

root = Path(__file__).resolve().parent.parent
media = root / 'site/public/media/journey'
manifest = json.loads((media / 'sequence.json').read_text())
shutil.copyfile(media / 'large/001.webp', media / 'shore.webp')
manifest['packs'] = {}
for variant in manifest['variants']:
    folder = media / 'packs' / variant
    folder.mkdir(parents=True, exist_ok=True)
    packs = []
    for first in range(1, manifest['frameCount'] + 1, 12):
        payload = bytearray()
        entries = []
        for frame in range(first, min(first + 12, manifest['frameCount'] + 1)):
            data = (media / variant / f'{frame:03}.webp').read_bytes()
            entries.append({'frame': frame, 'offset': len(payload), 'length': len(data)})
            payload.extend(data)
        header = json.dumps(entries, separators=(',', ':')).encode()
        data = b'SBJ1' + struct.pack('<I', len(header)) + header + payload
        digest = hashlib.sha256(data).hexdigest()[:12]
        filename = f'{first:03}-{digest}.sbj'
        (folder / filename).write_bytes(data)
        packs.append({'first': first, 'last': entries[-1]['frame'],
                      'url': f'packs/{variant}/{filename}', 'bytes': len(data)})
    manifest['packs'][variant] = packs
(media / 'sequence.json').write_text(json.dumps(manifest, indent=2) + '\n')
provenance = json.loads((root / 'docs/journey-manifest.json').read_text())
provenance['deliveryPacks'] = manifest['packs']
provenance['packScript'] = 'scripts/pack_journey.py'
provenance['packNote'] = 'Unchanged original WebP frames; 12 frames per content-addressed pack. 8 requests per viewport variant.'
(root / 'docs/journey-manifest.json').write_text(json.dumps(provenance, indent=2) + '\n')
print(json.dumps({key: {'requests': len(value), 'bytes': sum(p['bytes'] for p in value)}
                  for key, value in manifest['packs'].items()}))
