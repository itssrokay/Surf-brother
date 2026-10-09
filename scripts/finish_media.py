"""Limit shipped assets to referenced media; generate the auditable asset manifest."""
from pathlib import Path
import json,shutil,hashlib
root=Path(__file__).resolve().parent.parent
c=json.loads((root/'site/src/content.json').read_text());public=root/'site/public/media';unused=root/'assets/unused-exports';unused.mkdir(exist_ok=True)
used={'journey','hero.webp','surfbrothers-board.webp',c['stay']['video'],c['stay']['videoPoster']}
for g in c['gallery']:used.update([g['file'],g['thumb']])
for p in public.iterdir():
    if p.name not in used:shutil.move(str(p),str(unused/p.name))
originals=root/'assets/originals/Surfbrothers_Stay'
selected={g['original']:g for g in c['gallery']};selected['IMG_8271.MOV']={'title':'Silent evening clip','file':c['stay']['video']}
records=[]
for p in sorted(originals.iterdir()):
    g=selected.get(p.name)
    exports=[]
    if g:
        for name in dict.fromkeys([g.get('file'),g.get('thumb')]):
            if not name:continue
            q=public/name;exports.append({'path':str(q.relative_to(root)),'bytes':q.stat().st_size})
    records.append({'filename':p.name,'originalPath':str(p.relative_to(root)),'sourceFolder':c['source']['mediaFolder'],'creator':'SurfBrothers owner-supplied; photographer attribution to confirm','rights':'Owner supplied via user and authorised for this private proposal. Public reuse and guest permissions to confirm.','inspected':True,'inspectionMethod':'Contact sheets; video sampled at 12%, 45%, 78%','selected':bool(g),'use':g.get('title') if g else 'Inspected, retained as original, not shipped','originalBytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'exports':exports})
records.append({'filename':'surfbrothers-longboard.blend','originalPath':'assets/blender/surfbrothers-longboard.blend','generationScript':'assets/blender/create_surfboard.py','renderLog':'assets/blender/render.log','creator':'Original procedural design created in Blender for this proposal','rights':'Original asset, included in handover; no external textures or model dependencies','selected':True,'use':'Original surfboard study in the surf section; conceptual brand artwork, not an equipment claim','exports':[{'path':'assets/blender/surfbrothers-longboard.png','bytes':(root/'assets/blender/surfbrothers-longboard.png').stat().st_size},{'path':'site/public/media/surfbrothers-board.webp','bytes':(public/'surfbrothers-board.webp').stat().st_size}]})
records.append({'filename':'surf-journey.blend','originalPath':'assets/blender/journey/surf-journey.blend','generationScript':'assets/blender/journey/create_journey.py','renderLog':'assets/blender/journey/render.log','creator':'Original procedural Blender coastal scene, adult character and animation created for this proposal','rights':'Original asset; no external textures, models or character dependencies','selected':True,'use':'Scroll-controlled illustrated shore/paddle/ride journey; not the actual surf beach or a learning guarantee','detailedManifest':'docs/journey-manifest.json','exportScript':'scripts/export_journey.py','exportDirectory':'site/public/media/journey'})
manifest={'checked':'2026-10-08','sourceFolder':c['source']['mediaFolder'],'folderTitle':'Surfbrothers_Stay','downloadMethod':'Google Drive folder menu > Download in Codex in-app browser; ZIP extracted locally. Shared files were not changed.','assets':records,'fonts':{'families':['Barlow Condensed 800','DM Sans 400–600'],'sourceStylesheets':['assets/font-source.css','assets/woff-font-source.css'],'source':'https://fonts.google.com/','license':'SIL Open Font License 1.1','licenseFiles':['site/public/fonts/barlow-OFL.txt','site/public/fonts/dm-sans-OFL.txt'],'originalTTFDirectory':'assets/fonts','webDirectory':'site/public/fonts'},'socialPreview':{'path':'site/public/social-preview.jpg','createdWith':'scripts/export_assets.py, authorised original photo plus original typography','rights':'Same private-proposal permission as the source photo; public reuse to confirm'},'thirdPartyMedia':'No third-party social videos or accommodation stock downloaded; social stories are linked.'}
(root/'docs/asset-manifest.json').write_text(json.dumps(manifest,indent=2))
print('Shipped media bytes:',sum(p.stat().st_size for p in public.rglob('*') if p.is_file()),'files:',sum(1 for p in public.rglob('*') if p.is_file()))
