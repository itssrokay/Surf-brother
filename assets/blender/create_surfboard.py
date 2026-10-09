"""Original SurfBrothers proposal board. Blender 5.x, no simulation/external assets.
Run from project root: Blender --background --python assets/blender/create_surfboard.py
"""
import bpy, math, os
from mathutils import Vector
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
OUT = os.path.join(ROOT, 'assets/blender')
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES'; scene.cycles.samples=64
scene.cycles.use_denoising=True
scene.render.resolution_x=1600; scene.render.resolution_y=1600; scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.world.color=(0.3,0.3,0.3)
scene.view_settings.view_transform='AgX'
def mat(name,color,rough=.3,metal=.0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
    p.inputs['Coat Weight'].default_value=.35
    return m
cream=mat('Sun-warmed ivory deck',(.93,.86,.68),.28)
orange=mat('Burnt-sun orange stripe',(.94,.18,.048),.25)
teal=mat('Deep ocean rails',(.018,.13,.12),.24)
ink=mat('Ocean ink wordmark',(.015,.09,.08),.5)
# Smooth continuous twin stripes from local coordinates, no face-stepping.
nodes=cream.node_tree.nodes;links=cream.node_tree.links
coord=nodes.new('ShaderNodeTexCoord');separate=nodes.new('ShaderNodeSeparateXYZ');links.new(coord.outputs['Object'],separate.inputs[0])
absolute=nodes.new('ShaderNodeMath');absolute.operation='ABSOLUTE';links.new(separate.outputs['X'],absolute.inputs[0])
above=nodes.new('ShaderNodeMath');above.operation='GREATER_THAN';above.inputs[1].default_value=.12;links.new(absolute.outputs[0],above.inputs[0])
below=nodes.new('ShaderNodeMath');below.operation='LESS_THAN';below.inputs[1].default_value=.32;links.new(absolute.outputs[0],below.inputs[0])
mask=nodes.new('ShaderNodeMath');mask.operation='MULTIPLY';links.new(above.outputs[0],mask.inputs[0]);links.new(below.outputs[0],mask.inputs[1])
mix=nodes.new('ShaderNodeMixRGB');mix.inputs[1].default_value=(.93,.86,.68,1);mix.inputs[2].default_value=(.8,.095,.018,1);links.new(mask.outputs[0],mix.inputs[0]);links.new(mix.outputs[0],nodes.get('Principled BSDF').inputs['Base Color'])
# Longitudinal rings, rounded rails; foam-board proportions with modest nose rocker.
verts=[]; faces=[]; slots=[]
N=120; K=64
for j in range(N+1):
    t=j/N; y=(t-.5)*6.2
    width=.90 * max(.008, math.sin(math.pi*(.075+.925*t)))**.57
    if j==N: width=.006
    rocker=.03+.27*t**5+.07*(1-t)**5
    for k in range(K):
        a=2*math.pi*k/K; x=width*math.cos(a)
        z=rocker+.12*math.sin(a)
        verts.append((x,y,z))
for j in range(N):
    for k in range(K):
        faces.append((j*K+k,j*K+(k+1)%K,(j+1)*K+(k+1)%K,(j+1)*K+k))
        a=2*math.pi*(k+.5)/K
        x=verts[j*K+k][0]
        slots.append(2 if math.sin(a)<.22 else 0)
faces.append(tuple(range(K-1,-1,-1))); slots.append(2)
faces.append(tuple(N*K+k for k in range(K))); slots.append(0)
mesh=bpy.data.meshes.new('Shaped foam deck mesh'); mesh.from_pydata(verts,[],faces); mesh.update()
board=bpy.data.objects.new('Original SB striped longboard',mesh); bpy.context.collection.objects.link(board)
for m in [cream,orange,teal]:mesh.materials.append(m)
for p,s in zip(mesh.polygons,slots):p.material_index=s;p.use_smooth=True
# Typography is real editable Blender text, not a texture.
def label(body,loc,size,rot=0):
    c=bpy.data.curves.new(body,'FONT');c.body=body;c.size=size;c.align_x='CENTER';c.align_y='CENTER';c.extrude=.0005
    ob=bpy.data.objects.new(body,c);bpy.context.collection.objects.link(ob);ob.location=loc;ob.rotation_euler[2]=rot;ob.data.materials.append(ink)
    t=(loc[1]/6.2)+.5;ob.location.z=.03+.27*t**5+.07*(1-t)**5+.12+.012
    return ob
label('SURF', (0,.92,.159),.20)
label('BROTHERS', (0,.64,.154),.14)
label('M U L K I',(0,.40,.152),.083)
label('STAY  /  SURF  /  BELONG',(0,-.85,.16),.055,math.pi/2)
# Fins on the reverse, with a swept profile.
for x,y,s in [(0,-2.0,1),(-.47,-1.5,.68),(.47,-1.5,.68)]:
    points=[(x-.025,y,0),(x+.025,y,0),(x+.025,y+.6*s,-.01),(x+.025,y+.45*s,-.52*s),(x+.025,y+.07*s,-.36*s),(x-.025,y+.07*s,-.36*s),(x-.025,y+.45*s,-.52*s),(x-.025,y+.6*s,-.01)]
    mf=bpy.data.meshes.new('Swept fin');mf.from_pydata(points,[],[(0,1,2,7),(1,4,3,2),(0,7,6,5),(3,4,5,6),(2,3,6,7),(0,5,4,1)]);mf.update()
    ob=bpy.data.objects.new('Ocean fin',mf);bpy.context.collection.objects.link(ob);ob.data.materials.append(teal)
    bevel=ob.modifiers.new('Soft fin edges','BEVEL');bevel.width=.035;bevel.segments=3
# Rotate the complete design together, leaving a clean transparent studio render.
root=bpy.data.objects.new('Board assembly',None);bpy.context.collection.objects.link(root)
for ob in list(bpy.context.scene.objects):
    if ob!=root:ob.parent=root
root.rotation_euler=(math.radians(3),math.radians(-12),math.radians(-26))
def area(name,loc,power,size,color):
    bpy.ops.object.light_add(type='AREA',location=loc);ob=bpy.context.object;ob.name=name;ob.data.energy=power;ob.data.shape='DISK';ob.data.size=size;ob.data.color=color
    ob.rotation_euler=(Vector((0,0,0))-ob.location).to_track_quat('-Z','Y').to_euler()
area('Warm large softbox',(-4,-1,7),850,5,(1,.87,.69))
area('Cool edge softbox',(4,3,4),1100,4,(.67,.85,1))
area('Tail fill',(0,-5,3),500,3,(1,1,1))
bpy.ops.object.camera_add(location=(3,-4,11))
cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.05))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=7.5;scene.camera=cam
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'surfbrothers-longboard.blend'))
scene.render.filepath=os.path.join(OUT,'surfbrothers-longboard.png');bpy.ops.render.render(write_still=True)
print('ORIGINAL_ASSET_COMPLETE',scene.render.filepath)
