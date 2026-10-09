"""Make a reviewable static upload, with Vercel headers at the zip's root."""
from pathlib import Path
import json, zipfile
root = Path(__file__).resolve().parent.parent
dist = root / 'site/dist'
out = root / 'deliverables'
out.mkdir(exist_ok=True)
archive = out / 'surfbrothers-vercel-drop.zip'
files = [p for p in sorted(dist.rglob('*')) if p.is_file()]
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zip:
    for p in files:
        relative = p.relative_to(dist)
        # Editable originals are retained locally. Only delivery packs are used on the web.
        if relative.parts[:3] in [('media', 'journey', 'large'), ('media', 'journey', 'small')]:
            continue
        zip.write(p, str(relative))
with zipfile.ZipFile(archive) as zip:
    names = zip.namelist()
    assert 'index.html' in names and 'vercel.json' in names
    manifest = json.loads(zip.read('media/journey/sequence.json'))
    for packs in manifest['packs'].values():
        for p in packs: assert 'media/journey/' + p['url'] in names
    assert zip.testzip() is None
print(json.dumps({'zip': str(archive), 'bytes': archive.stat().st_size, 'files': len(names)}))
