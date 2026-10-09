from pathlib import Path
import subprocess,json
from PIL import Image,ImageOps,ImageDraw
root=Path(__file__).resolve().parent.parent
records=[]
for f in sorted((root/'assets/originals/Surfbrothers_Stay').glob('*')):
    if f.suffix.lower() not in ['.mp4','.mov']:continue
    info=json.loads(subprocess.check_output(['ffprobe','-v','quiet','-show_format','-show_streams','-of','json',str(f)]))
    seconds=float(info['format']['duration']); frames=[]
    for j,sec in enumerate([seconds*.12,seconds*.45,seconds*.78]):
        target=root/'assets/contact-sheets'/f'{f.stem}-{j}.jpg'
        subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(sec),'-i',str(f),'-frames:v','1','-vf','scale=600:-1',str(target)],check=True)
        frames.append(target)
    sheet=Image.new('RGB',(1800,460),'#f4efe4');d=ImageDraw.Draw(sheet)
    for j,p in enumerate(frames):sheet.paste(ImageOps.fit(Image.open(p),(580,390)),(j*600,35))
    d.text((15,10),f.name,fill='#123b39');sheet.save(root/'assets/contact-sheets'/f'{f.stem}-sheet.jpg')
    records.append({'filename':f.name,'duration':seconds,'bytes':f.stat().st_size,'streams':[{'type':s['codec_type'],'codec':s.get('codec_name'),'width':s.get('width'),'height':s.get('height')} for s in info['streams']]})
(root/'assets/video-inventory.json').write_text(json.dumps(records,indent=2));print(json.dumps(records,indent=2))
