from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageFont
import subprocess
root=Path(__file__).resolve().parent.parent;media=root/'site/public/media'
board=Image.open(root/'assets/blender/surfbrothers-longboard.png')
bbox=board.getchannel('A').getbbox();board=board.crop((bbox[0]-35,bbox[1]-35,bbox[2]+35,bbox[3]+35));board.thumbnail((1400,1000));board.save(media/'surfbrothers-board.webp','WEBP',quality=88,method=6)
# Serve responsive, metadata-free image derivatives. Original media stays untouched.
for name in ['stay-6','stay-4','stay-7','stay-8','img_8272','img_8225','img_8229','img_8275']:
    original=Image.open(media/(name+'.webp'));original.thumbnail((1400,1400));original.save(media/(name+'.webp'),'WEBP',quality=76,method=6)
    original.thumbnail((780,780));original.save(media/(name+'-small.webp'),'WEBP',quality=72,method=6)
# Owner-provided evening clip, no audio, no autoplay, metadata removed. User decides to play.
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(root/'assets/originals/Surfbrothers_Stay/IMG_8271.MOV'),'-map','0:v:0','-an','-vf','scale=960:-2','-c:v','libx264','-crf','27','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart','-map_metadata','-1',str(media/'house-evening.mp4')],check=True)
# Social image composed from authorised photo and the original Blender asset.
card=Image.new('RGB',(1200,630),'#073e3e');photo=ImageOps.fit(Image.open(media/'hero.webp'),(590,630),centering=(.58,.6));card.paste(photo,(610,0));d=ImageDraw.Draw(card)
fontpath=root/'assets/fonts/barlow-condensed-800.ttf';f=ImageFont.truetype(str(fontpath),92);small=ImageFont.truetype(str(root/'assets/fonts/dm-sans-600.ttf'),20)
d.text((45,34),'SURFBROTHERS MULKI',font=small,fill='#f5f0e5');d.text((45,103),'GOOD WAVES.',font=f,fill='#f5f0e5');d.text((45,197),'BETTER',font=f,fill='#fa854b');d.text((45,291),'COMPANY.',font=f,fill='#f5f0e5');d.text((48,460),'STAY • SURF • BELONG',font=small,fill='#fa854b');d.text((48,566),'A little home by the backwaters.',font=small,fill='#f5f0e5');card.save(root/'site/public/social-preview.jpg',quality=88,optimize=True)
print('Exports complete. Board:',board.size,'video bytes:',(media/'house-evening.mp4').stat().st_size)
