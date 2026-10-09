"""Export the original Blender journey to two responsive WebP sequences and update provenance."""
from pathlib import Path
from PIL import Image
import json,hashlib
root=Path(__file__).resolve().parent.parent
src=root/'assets/blender/journey/frames';out=root/'site/public/media/journey'
for size in ('small','large'):(out/size).mkdir(parents=True,exist_ok=True)
frames=sorted(src.glob('*.png'))
for p in frames:
 im=Image.open(p).convert('RGBA')
 for folder,width,quality in [('large',960,79),('small',600,75)]:
  dest=out/folder/(p.stem+'.webp')
  if dest.exists() and dest.stat().st_mtime>=p.stat().st_mtime:continue
  result=im.copy();result.thumbnail((width,width));result.save(dest,'WEBP',quality=quality,method=2)
if (src/'084.png').exists():
 Image.open(src/'084.png').convert('RGBA').save(out/'poster.webp','WEBP',quality=84,method=2)
# Only advertise a complete sequence. Partial rendering remains a working static scene.
complete=all((src/f'{i:03}.png').exists() for i in range(1,97))
manifest={'frameCount':96 if complete else 1,'width':960,'height':960,'variants':{'large':960,'small':600},'format':'webp','renderer':'Blender Cycles, 16 samples with denoising','concept':'Original stylised shore → paddle → ride journey. Not the actual surf beach.'}
(out/'sequence.json').write_text(json.dumps(manifest,indent=2)+'\n')
files=sorted(out.rglob('*.webp'))
manifest['exports']=[{'path':str(p.relative_to(root)),'bytes':p.stat().st_size} for p in files]
manifest['bytesByVariant']={s:sum(p.stat().st_size for p in (out/s).glob('*.webp')) for s in ('small','large')}
manifest['originalSource']='assets/blender/journey/surf-journey.blend'
manifest['generationScript']='assets/blender/journey/create_journey.py'
manifest['exportScript']='scripts/export_journey.py'
manifest['renderLog']='assets/blender/journey/render.log'
manifest['rights']='Original procedural Blender meshes, materials, character and animation. No third-party model or texture dependencies.'
(root/'docs/journey-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'complete':complete,'frames':len(frames),'bytes':manifest['bytesByVariant']}))
