"""Keep owner originals; convert HEIC using macOS sips and export EXIF-free WebP."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont
import subprocess, json
root=Path(__file__).resolve().parent.parent
originals=root/'assets/originals/Surfbrothers_Stay'
out=root/'site/public/media'; out.mkdir(parents=True,exist_ok=True)
preview=root/'assets/contact-sheets'; preview.mkdir(parents=True,exist_ok=True)
records=[]
files=sorted(originals.glob('*'))
photos=[]
for f in files:
    if f.suffix.lower() not in ['.jpg','.jpeg','.heic']:continue
    source=f
    if f.suffix.lower()=='.heic':
        source=preview/(f.stem+'.jpg')
        subprocess.run(['sips','-s','format','jpeg',str(f),'--out',str(source)],check=True,capture_output=True)
    im=ImageOps.exif_transpose(Image.open(source)).convert('RGB')
    name=f.stem.replace('PHOTO-2026-02-13-20-40-29','stay').replace('(','-').replace(')','').lower()
    dims=im.size
    im.thumbnail((1920,1920));im.save(out/(name+'.webp'),'WEBP',quality=83,method=6)
    small=ImageOps.fit(im,(360,240));photos.append((f.name,name,small))
    im.thumbnail((780,780));im.save(out/(name+'-small.webp'),'WEBP',quality=78,method=6)
    records.append({'original':f.name,'export':name+'.webp','dimensions':dims,'webBytes':(out/(name+'.webp')).stat().st_size})
for start in range(0,len(photos),12):
    batch=photos[start:start+12]
    sheet=Image.new('RGB',(1200,330*((len(batch)+2)//3)), '#f4efe4'); d=ImageDraw.Draw(sheet)
    for i,(fname,name,im) in enumerate(batch):
        x=(i%3)*400;y=(i//3)*330
        sheet.paste(im,(x+20,y+10));d.text((x+20,y+260),fname,fill='#122f2e');d.text((x+20,y+281),name,fill='#122f2e')
    sheet.save(preview/f'photos-{start//12+1}.jpg')
(root/'assets/media-inventory.json').write_text(json.dumps(records,indent=2))
print(json.dumps(records,indent=2))
