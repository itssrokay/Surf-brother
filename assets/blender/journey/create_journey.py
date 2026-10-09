"""Original animated clay coastal diorama. No external model/texture dependencies.
Blender --background --python assets/blender/journey/create_journey.py -- --preview
Omit --preview to render the complete 96-frame web sequence.
"""
import bpy, math, os, sys, random
from mathutils import Vector
from math import sin,cos,pi
ROOT=os.path.dirname(os.path.abspath(__file__))
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
sc=bpy.context.scene
sc.render.engine='CYCLES';sc.cycles.samples=16;sc.cycles.use_denoising=True
sc.cycles.device='CPU'  # Reliable headless render on this Mac.
sc.render.resolution_x=960;sc.render.resolution_y=960;sc.render.resolution_percentage=100
sc.render.image_settings.file_format='PNG';sc.render.film_transparent=True
sc.world.color=(.38,.38,.38);sc.view_settings.view_transform='AgX'
sc.frame_start=1;sc.frame_end=96;sc.render.fps=30
random.seed(8)
def mat(name,c,rough=.5):
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=rough
 return m
sand=mat('Warm sculpted sand',(.76,.55,.29));wet=mat('Damp shoreline',(.56,.40,.20));water=mat('Lagoon jade',(.025,.34,.30),.23)
deep=mat('Deep ocean edge',(.014,.13,.13));foam=mat('Warm white seafoam',(.91,.95,.82),.5)
cream=mat('Ivory board',(.95,.88,.68),.25);orange=mat('Burnt orange stripes',(.98,.21,.045),.28)
skin=mat('Surfer warm brown skin',(.38,.16,.075));shirt=mat('Sun orange rash vest',(.92,.25,.065));shorts=mat('Deep teal board shorts',(.016,.07,.08));hair=mat('Dark sculpted hair',(.035,.021,.014));leafmat=mat('Palm fronds',(.08,.25,.115));trunkmat=mat('Palm trunk',(.31,.14,.055))
def mesh(name,v,f,m):
 me=bpy.data.meshes.new(name);me.from_pydata(v,[],f);me.update();ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob);ob.data.materials.append(m)
 for p in me.polygons:p.use_smooth=True
 return ob
def sphere(name,loc,scale,m,parent=None):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(m)
 for p in o.data.polygons:p.use_smooth=True
 if parent:o.parent=parent
 return o
def tube(name,pts,r,m,parent=None):
 cv=bpy.data.curves.new(name,'CURVE');cv.dimensions='3D';cv.resolution_u=12;cv.bevel_depth=r;cv.bevel_resolution=3
 s=cv.splines.new('BEZIER');s.bezier_points.add(len(pts)-1)
 for b,p in zip(s.bezier_points,pts):b.co=p;b.handle_left_type='AUTO';b.handle_right_type='AUTO'
 ob=bpy.data.objects.new(name,cv);bpy.context.collection.objects.link(ob);ob.data.materials.append(m)
 if parent:ob.parent=parent
 return ob
def empty(name,parent=None):
 o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.parent=parent;return o
# A single circular miniature shoreline; an artwork, not a model of the property.
bpy.ops.mesh.primitive_cylinder_add(vertices=128,radius=6,depth=.32,location=(0,0,-.29));o=bpy.context.object;o.name='Sculpted ocean plinth';o.data.materials.append(deep)
bev=o.modifiers.new('Rounded rim','BEVEL');bev.width=.16;bev.segments=4
# Water surface with subtle fixed ripples.
N=128;R=48;verts=[(0,0,.015)];faces=[]
for j in range(1,R+1):
 r=6*j/R
 for k in range(N):
  a=2*pi*k/N;x=r*cos(a);y=r*sin(a);z=.025*sin(x*3+y*2)+.015*cos(y*5-x)
  verts.append((x,y,z))
for k in range(N):faces.append((0,1+k,1+(k+1)%N))
for j in range(R-1):
 for k in range(N):
  a=1+j*N+k;b=1+j*N+(k+1)%N;faces.append((a,a+N,b+N,b))
mesh('Gentle ocean',verts,faces,water)
# Crescent island entirely within the ocean disk. Its edge curves gently through the composition.
ymin=-5.15;ymax=5.15
v=[];f=[]
def shore(y):return -1.7+.42*sin(y*.65)
for j in range(81):
 y=ymin+(ymax-ymin)*j/80;left=-math.sqrt(max(0,36-y*y));right=max(left,shore(y))
 for k in range(15):
  t=k/14;x=left+(right-left)*t;z=.035+.19*sin(pi*t)*sin(pi*j/80)+.035*(1-t)
  v.append((x,y,z))
for j in range(80):
 for k in range(14):a=j*15+k;f.append((a,a+1,a+16,a+15))
mesh('Sandy crescent',v,f,sand)
for offset,rad,ma in [(0,.10,wet),(.16,.055,foam),(.31,.022,foam)]:
 pts=[]
 for i in range(45):
  y=-5.05+i*10.1/44;pts.append((shore(y)+offset,y,.055))
 tube('Lapping shore',pts,rad,ma)
# A few sculpted palms frame the distant sand, clear of the action.
for x,y,h in [(-3.1,2.5,2.4),(-4.0,1.3,1.9),(-3.4,-3.0,1.65)]:
 tube('Curved palm trunk',[(x,y,.15),(x+.1,y,h*.45),(x+.35,y+.12,h)],.075,trunkmat)
 for k in range(7):
  a=k*2*pi/7;vs=[];fs=[]
  for j in range(13):
   t=j/12;cx=x+.35+cos(a)*1.4*t;cy=y+.12+sin(a)*1.4*t;z=h+.26*sin(pi*t)-.52*t*t;w=.19*sin(pi*t)
   vs.extend([(cx-sin(a)*w,cy+cos(a)*w,z),(cx+sin(a)*w,cy-cos(a)*w,z-.035)])
  for j in range(12):fs.append((j*2,j*2+1,j*2+3,j*2+2))
  mesh('Sculpted palm leaf',vs,fs,leafmat)
# Thin sculpted water accents, no simulation required.
for i in range(18):
 x=random.uniform(-.9,4.3);y=random.uniform(-4.6,4.6)
 if x*x+y*y>28:continue
 tube('Water glint',[(x-.3,y,.065),(x,y+.05,.072),(x+.34,y,.065)],.012,foam)
# Branded board, local +Y is the nose.
board=empty('ANIMATED board and rider')
v=[];f=[];n=70;kmax=32
for j in range(n+1):
 t=j/n;y=(t-.5)*3.3;w=.48*max(.003,sin(pi*(.055+.945*t)))**.55
 for k in range(kmax):
  a=2*pi*k/kmax;v.append((w*cos(a),y,.075*sin(a)+.13*t**5))
for j in range(n):
 for k in range(kmax):a=j*kmax+k;b=j*kmax+(k+1)%kmax;f.append((a,b,b+kmax,a+kmax))
o=mesh('Longboard ivory deck',v,f,cream);o.parent=board
# shader stripes follow the deck curvature.
nd=cream.node_tree.nodes;lk=cream.node_tree.links;tc=nd.new('ShaderNodeTexCoord');sp=nd.new('ShaderNodeSeparateXYZ');lk.new(tc.outputs['Object'],sp.inputs[0]);ab=nd.new('ShaderNodeMath');ab.operation='ABSOLUTE';lk.new(sp.outputs['X'],ab.inputs[0]);gt=nd.new('ShaderNodeMath');gt.operation='GREATER_THAN';gt.inputs[1].default_value=.08;lt=nd.new('ShaderNodeMath');lt.operation='LESS_THAN';lt.inputs[1].default_value=.17;lk.new(ab.outputs[0],gt.inputs[0]);lk.new(ab.outputs[0],lt.inputs[0]);mul=nd.new('ShaderNodeMath');mul.operation='MULTIPLY';lk.new(gt.outputs[0],mul.inputs[0]);lk.new(lt.outputs[0],mul.inputs[1]);mix=nd.new('ShaderNodeMixRGB');mix.inputs[1].default_value=(.95,.88,.68,1);mix.inputs[2].default_value=(.95,.16,.025,1);lk.new(mul.outputs[0],mix.inputs[0]);lk.new(mix.outputs[0],nd.get('Principled BSDF').inputs['Base Color'])
cv=bpy.data.curves.new('SB board mark','FONT');cv.body='SB';cv.align_x='CENTER';cv.size=.23;cv.extrude=.001;ob=bpy.data.objects.new('SB board mark',cv);bpy.context.collection.objects.link(ob);ob.parent=board;ob.location=(0,.95,.10);ob.data.materials.append(deep)
# A stylised adult surfer with articulated limbs.
rider=empty('ANIMATED adult surfer',board)
torso=sphere('Orange rash vest torso',(0,0,0),(.30,.22,.46),shirt,rider)
hips=sphere('Board shorts',(0,0,0),(.30,.23,.25),shorts,rider)
headroot=empty('Head pose',rider)
sphere('Head',(0,0,0),(.22,.21,.265),skin,headroot)
sphere('Short dark hair',(0,-.025,.11),(.225,.205,.19),hair,headroot)
sphere('Nose',(0,.20,-.015),(.052,.064,.06),skin,headroot)
limbs={}
for name,rad,ma in [('luarm',.092,shirt),('ruarm',.092,shirt),('lfarm',.075,skin),('rfarm',.075,skin),('lthigh',.125,shorts),('rthigh',.125,shorts),('lshin',.085,skin),('rshin',.085,skin)]:
 limbs[name]=sphere(name,(0,0,0),(rad,rad,1),ma,rider)
feet=[sphere('Bare foot',(0,0,0),(.095,.21,.064),skin,rider) for _ in range(2)]
hands=[sphere('Hand',(0,0,0),(.08,.115,.065),skin,rider) for _ in range(2)]
def between(ob,a,b,rad):
 a=Vector(a);b=Vector(b);ob.location=(a+b)/2;ob.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();ob.scale=(rad,rad,(b-a).length/2+rad*.5)
def key(ob,fr):
 for prop in ['location','rotation_euler','scale']:ob.keyframe_insert(data_path=prop,frame=fr)
def pose(fr,kind):
 if kind=='prone':
  hip=(0,-.43,.31);chest=(0,.16,.35);hd=(0,.71,.48);sh=[(-.28,.38,.36),(.28,.38,.36)];el=[(-.58,.58,.21),(.58,.35,.19)];ha=[(-.68,.96,.12),(.69,-.17,.10)];kn=[(-.14,-.97,.20),(.14,-.92,.22)];ft=[(-.16,-1.35,.13),(.17,-1.32,.15)]
 elif kind=='crouch':
  hip=(0,-.3,.81);chest=(0,.11,1.12);hd=(0,.47,1.48);sh=[(-.27,.26,1.2),(.27,.26,1.2)];el=[(-.42,.48,.84),(.47,.35,.85)];ha=[(-.43,.66,.30),(.46,.64,.30)];kn=[(-.34,.04,.48),(.31,-.61,.43)];ft=[(-.13,.56,.14),(.14,-.72,.14)]
 else:
  hip=(0,-.17,1.13);chest=(.10,.02,1.64);hd=(.14,.16,2.20);sh=[(-.20,.06,1.83),(.39,.06,1.83)];el=[(-.62,.12,1.65),(.74,-.06,1.58)];ha=[(-.92,.45,1.70),(1.0,.13,1.55)];kn=[(-.25,.29,.69),(.23,-.60,.64)];ft=[(-.12,.57,.14),(.14,-.77,.14)]
 hips.location=hip;torso.location=chest;headroot.location=hd
 torso.rotation_euler=(Vector(chest)-Vector(hip)).to_track_quat('Z','Y').to_euler()
 for ob in [hips,torso,headroot]:key(ob,fr)
 for i,side in enumerate(['l','r']):
  hp=(hip[0]+(-.16 if i==0 else .16),hip[1],hip[2])
  for nm,a,b,r in [(side+'uarm',sh[i],el[i],.09),(side+'farm',el[i],ha[i],.074),(side+'thigh',hp,kn[i],.12),(side+'shin',kn[i],ft[i],.08)]:between(limbs[nm],a,b,r);key(limbs[nm],fr)
  feet[i].location=ft[i];hands[i].location=ha[i];key(feet[i],fr);key(hands[i],fr)
for fr,kind in [(1,'prone'),(26,'prone'),(44,'prone'),(54,'crouch'),(68,'stand'),(96,'stand')]:pose(fr,kind)
for fr,s in [(1,0),(20,0),(29,1),(96,1)]:rider.scale=(s,s,s);rider.keyframe_insert(data_path='scale',frame=fr)
for fr,loc,rot in [(1,(-2.75,-1.0,.25),(0,0,-.5)),(20,(-2.20,-.55,.25),(0,0,-.8)),(40,(-.3,.15,.18),(.035,0,-1.0)),(58,(1.0,.1,.35),(.10,.03,-1.12)),(75,(1.9,.42,1.02),(.12,-.07,-1.37)),(96,(2.7,1.2,.82),(.04,.07,-1.58))]:
 board.location=loc;board.rotation_euler=rot;key(board,fr)
# A rising turquoise ribbon wave with a soft ivory crest, behind the rider.
wave=empty('ANIMATED rising wave')
v=[];f=[];nx=60;ny=24
for j in range(ny+1):
 t=j/ny
 for i in range(nx+1):
  u=i/nx;x=-2+6*u;y=-1.4+2.8*t;z=1.0*(sin(pi*t)**2)*sin(pi*u)**.6
  v.append((x,y,z))
for j in range(ny):
 for i in range(nx):a=j*(nx+1)+i;f.append((a,a+1,a+nx+2,a+nx+1))
o=mesh('Sculpted wave face',v,f,water);o.parent=wave
for j in range(3):
 tube('Foam along wave lip',[(-1.75+5.5*i/40,-.03+j*.075,.99*sin(pi*(.04+.92*i/40))**.6+j*.012) for i in range(41)],.032-j*.006,foam,wave)
wave.location=(1.0,1.05,-.09);wave.rotation_euler[2]=-.3
for fr,s in [(1,.002),(36,.002),(59,.4),(76,1),(96,.72)]:wave.scale=(1,1,s);wave.keyframe_insert(data_path='scale',frame=fr)
# Spray pearls appear only on the ride, grouped for editable animation.
spray=empty('ANIMATED spray',board)
for i in range(24):
 x=random.uniform(-.65,.65);y=random.uniform(-2.2,-1.25);z=random.uniform(.08,.40)
 sphere('Sea spray',(x,y,z),(.025,.07,.03),foam,spray)
for fr,s in [(1,0),(54,0),(70,1),(96,1)]:spray.scale=(s,s,s);spray.keyframe_insert(data_path='scale',frame=fr)
# Warm soft studio light, soft island shadows, a slow camera push and orbit.
def light(name,loc,energy,size,col):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=energy;o.data.shape='DISK';o.data.size=size;o.data.color=col;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
light('Large warm sun',(-3,-4,11),1900,8,(1,.85,.65));light('Cool ocean fill',(6,4,8),1450,7,(.64,.86,1))
bpy.ops.object.camera_add();cam=bpy.context.object;cam.name='ANIMATED editorial camera';cam.data.type='ORTHO';sc.camera=cam
for fr,loc,target,size in [(1,(9,-12,12),(-.2,0,.15),14.4),(38,(8,-12,11),(-.1,.1,.2),13.7),(70,(7,-12,10),(.1,.1,.55),14.1),(96,(6,-12,9),(.2,.3,.65),14.0)]:
 cam.location=loc;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();key(cam,fr);cam.data.ortho_scale=size;cam.data.keyframe_insert(data_path='ortho_scale',frame=fr)
sc.frame_set(1);bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'surf-journey.blend'))
frames=[1,45,84] if '--preview' in sys.argv else range(1,97)
for fr in frames:
 sc.frame_set(fr);sc.render.filepath=os.path.join(ROOT,'frames',f'{fr:03}.png');bpy.ops.render.render(write_still=True)
print('JOURNEY_RENDER_COMPLETE',len(frames))
