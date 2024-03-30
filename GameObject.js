class Transform {
	constructor() {
		this.loc = [0, 0, 0];
		this.rot = [0, 0, 0];
		this.scale = [1, 1, 1];

		this.forward = [0, 0, 1];
		this.right = [1, 0, 0];
		this.up = [0, 1, 0];
	}

	setLoc(loc)
	{
		this.loc = loc;
	}

	setRot(rot) {
		this.rot = rot;

		let Rx = [
			[1, 0, 0, 0],
			[0, Math.cos(rot[0]), -Math.sin(rot[0]), 0],
			[0, Math.sin(rot[0]), Math.cos(rot[0]), 0],
			[0, 0, 0, 1]
		];
		let Ry = [
			[Math.cos(rot[1]), 0, Math.sin(rot[1]), 0],
			[0, 1, 0, 0],
			[-Math.sin(rot[1]), 0, Math.cos(rot[1]), 0],
			[0, 0, 0, 1]
		];
		let Rz = [
			[Math.cos(rot[2]), -Math.sin(rot[2]), 0, 0],
			[Math.sin(rot[2]), Math.cos(rot[2]), 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 1]
		]

		
		this.forward = this.vec4to3(this.crossMultiply(Rz, this.crossMultiply(Ry, this.crossMultiply(Rx, [0.0, 0.0, 1.0, 0.0]))))
		this.right = this.vec4to3(this.crossMultiply(Rz, this.crossMultiply(Ry, this.crossMultiply(Rx, [1, 0, 0, 0]))))
		this.up = this.vec4to3(this.crossMultiply(Rz, this.crossMultiply(Ry, this.crossMultiply(Rx, [0, 1, 0, 0]))))
		
	}

	vec4to3(vec)
	{
		return [vec[0], vec[1], vec[2]];
	}

	crossMultiply(M, V) {
		var temp = [
			M[0][0] * V[0] + M[0][1] * V[1] + M[0][2] * V[2] + M[0][3] * V[3],
			M[1][0] * V[0] + M[1][1] * V[1] + M[1][2] * V[2] + M[1][3] * V[3],
			M[2][0] * V[0] + M[2][1] * V[1] + M[2][2] * V[2] + M[2][3] * V[3],
			M[3][0] * V[0] + M[3][1] * V[1] + M[3][2] * V[2] + M[3][3] * V[3]
		]
		return temp;
	}
}

function BuildObjFromVerts(verts=[],pos=[0.0,0.0,0.0], rot=[0.0,0.0,0.0], color=[1.0,1.0,1.0],scale=1.0,texture="https://cdn.discordapp.com/emojis/865721361225351176.png", func=d=>{})
{
	let obj = new GameObject();

	obj.renderer = new RenderObj(obj.transform, texture);
	obj.updateFunc = func;

	obj.transform.scale = [scale,scale,scale];
	obj.transform.loc = pos;
	obj.transform.rot = rot;

		// color it...
		for(let i = 3; i < verts.length; i+=4)
		{
			obj.renderer.addFace(verts[i-3], verts[i-2], verts[i-1], verts[i], color);
		}

		obj.renderer.rebuffer();

		return obj;
}

function BuildRendererFromVerts(verts=[], transform=null, color=[1.0,1.0,1.0],texture="https://cdn.discordapp.com/emojis/865721361225351176.png")
{

	let obj = new RenderObj(transform, texture);

		// color it...
		for(let i = 3; i < verts.length; i+=4)
		{
			obj.addFace(verts[i-3], verts[i-2], verts[i-1], verts[i], color);
		}

		obj.rebuffer();

		return obj;
}

function CreateSphere(divisions=4, roundness=1.0)
{
	let verts = CreateCube([0,0,0], 1, divisions);

	for(v in verts)
	{
		verts[v] = VecLerp(verts[v], CubeToSphere(verts[v]), roundness);
	}

	return verts;
}


function CubeToSphere(p, amount=1.0)
{
	return VecScale(VecNormalize(p),amount);
}	


function CreateCube(center, size, resolution)
{
	if(resolution < 1)
		resolution = 1;
	let verts = [];
	verts.push.apply(verts, CreatePlane(VecAdd(center, [0,size*0.5, 0]), size, resolution, "up"));
	verts.push.apply(verts, CreatePlane(VecAdd(center, [0, size*-0.5,0]), size, resolution, "up"));

	verts.push.apply(verts, CreatePlane(VecAdd(center, [size*0.5, 0, 0]), size, resolution, "left"));
	verts.push.apply(verts, CreatePlane(VecAdd(center, [size*-0.5,0, 0]), size, resolution, "left"));

	verts.push.apply(verts, CreatePlane(VecAdd(center, [0,0, size*0.5]), size, resolution, "forward"));
	verts.push.apply(verts, CreatePlane(VecAdd(center, [0,0, size*-0.5]), size, resolution, "forward"));

	return verts;
}

// resolution is the number of quads to create within the plane. i.e. 1 -> 1 face per plane, 2 -> 2x2 faces on one plane
function CreatePlane(center, size, resolution, dir)
{
	if(resolution < 1)
		resolution = 1;

	let verts = [];
	let step = size/resolution;
	let root = -size*0.5;

	for(let x = 0; x < resolution; x++)
	{
		for(let y = 0; y < resolution; y++)
		{

			// we need to add a whole face here, not just a single vert.
			// each vert will need an offset from the center, this can be a constant.
			// offset = size/2 essentially.
			// using x & y as the bottom-left vert.

		//	var px1 = x*size/(resolution);
		//	var px2 = (x+1)*size/(resolution);
		//	var py1 = y*size/(resolution);
		//	var py2 = (y+1)*size/(resolution);

			var px = root + x*step;
			var py = root + y*step;

			// theres definitely a way to do this more matheetmayically but im lazy
			if(dir=="up" || dir=="down") 
			{
				verts.push(VecAdd(center, [px, 0, py]));
				verts.push(VecAdd(center, [px, 0, py+step]));
				verts.push(VecAdd(center, [px+step, 0, py]));
				verts.push(VecAdd(center, [px+step, 0, py+step]));

				//verts.push([px1+center[0], center[1], py1+center[2]]);
				//verts.push([px2+center[0], center[1], py2+center[2]]);
			}
			else if(dir=="left" || dir=="right")
			{
				verts.push(VecAdd(center, [0, px, py]));
				verts.push(VecAdd(center, [0, px, py+step]));
				verts.push(VecAdd(center, [0, px+step, py]));
				verts.push(VecAdd(center, [0, px+step, py+step]));
				//verts.push([center[0], px1+center[1], py1+center[2]]);
				//verts.push([center[0], py2+center[1], px2+center[2]]);
			}
			else
			{
				verts.push(VecAdd(center, [px, py, 0]));
				verts.push(VecAdd(center, [px, py+step, 0]));
				verts.push(VecAdd(center, [px+step, py, 0]));
				verts.push(VecAdd(center, [px+step, py+step, 0]));
				
				//verts.push([px1+center[0], py1+center[1], center[2]]);
				//verts.push([px2+center[0], py2+center[1], center[2]]);
			}
		}
	}

	return verts;
}

// taken from: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
	console.log("loading texture: " + url);
	const texture = gl.createTexture();
	

	// Because images have to be downloaded over the internet
	// they might take a moment until they are ready.
	// Until then put a single pixel in the texture so we can
	// use it immediately. When the image has finished downloading
	// we'll update the texture with the contents of the image.
	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixel = new Uint8Array([255, 255, 255, 255]); // opaque white
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(
		gl.TEXTURE_2D,
		level,
		internalFormat,
		width,
		height,
		border,
		srcFormat,
		srcType,
		pixel
	);
	
	// modification.
	if(url != "" && url.length > 1) // only load a texture if we supply a url. this way i can still have silly vertex color only objects
	{
		const image = new Image();
		image.crossOrigin = "anonymous";

		image.onload = () => {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(
			gl.TEXTURE_2D,
			level,
			internalFormat,
			srcFormat,
			srcType,
			image
			);

			// WebGL1 has different requirements for power of 2 images
			// vs. non power of 2 images so check if the image is a
			// power of 2 in both dimensions.
			if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
			// Yes, it's a power of 2. Generate mips.
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.generateMipmap(gl.TEXTURE_2D);
			} else {
			// No, it's not a power of 2. Turn off mips and set
			// wrapping to clamp to edge
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			}

		
	};
	image.src = url;
}

	return texture;
	}


	function isPowerOf2(value) {
		return (value & (value - 1)) === 0;
		}

class RenderObj
 {
static blankTexture = null;
 constructor(transform=null, textureUrl="", batch=0)
 {
	 this.batchId = batch;
     this.buffer=gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	
     //Now we want to add color to our vertices information.
	 // info looks like x,y,z,r,g,b,u,v,nx,ny,nz
     this.vertices = [];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);


    this.transform = transform;
	this.texture = null;

	if(textureUrl != "")
		this.texture = loadTexture(gl, textureUrl);
	else
	{
		if(RenderObj.blankTexture == null)
		RenderObj.blankTexture = loadTexture(gl, "");

		this.texture = RenderObj.blankTexture;
	}

	this.extraRenderFunc = program =>{};
 }

 combineToVerts(verts=[], colors=[], uvs=[], normals=[])
 {
	if(verts.length!=colors.length || verts.length!=uvs.length || verts.length!=normals.length)
	{
		console.error("combineToVerts failed, incorrect input lengths.");
		return;
	}

	let v = [];
	let count = verts.length;

	for(let i = 0; i<count; i++)
	{
		let vi = i*8;
		v[vi] = verts[i][0];
		v[vi+1] = verts[i][1];
		v[vi+2] = verts[i][2];

		v[vi+3] = colors[i][0];
		v[vi+4] = colors[i][1];
		v[vi+5] = colors[i][2];

		v[vi+6] = uvs[i][0];
		v[vi+7] = uvs[i][1];

		v[vi+8] = normals[i][0];
		v[vi+9] = normals[i][1];
		v[vi+10] = normals[i][2];
	}

	this.vertices = v;
 }

 changeTexture(textureUrl="https://cdn.discordapp.com/emojis/865721361225351176.png")
 {
	this.texture = loadTexture(gl, textureUrl);
 }

addFace(v0,v1,v2,v3, color)
{
	this.addTri(v0,v1,v2, color);
	this.addTri(v1, v2, v3, color);
}

addTri(v0, v1, v2, color)
{
	this.addVert(v0, color);
	this.addVert(v1, color);
	this.addVert(v2, color);
}

 addVert(pos, color,uv=SphereUV(pos),normal=SphereNormal(pos))
 {
	this.addVertRaw(pos[0], pos[1], pos[2], 
		color[0], color[1], color[2],
		uv[0],uv[1],
		normal[0], normal[1], normal[2]);
 }

 addVertRaw(x,y,z,r,g,b,u,v,nx,ny,nz)
 {
	this.vertices.push(x);
	this.vertices.push(y);
	this.vertices.push(z);

	this.vertices.push(r);
	this.vertices.push(g);
	this.vertices.push(b);

	this.vertices.push(u);
	this.vertices.push(v);

	this.vertices.push(nx);
	this.vertices.push(ny);
	this.vertices.push(nz);
 }

 vertCount()
 {
	return this.vertices.length/6;
 }

 // sends the current vertex data to the GPU for rendering. dont do this too frequently
 rebuffer()
 {
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
 }

 batchBuffer(program)
 {

	// how many elements do we have per vertex?
	var stride = 11*Float32Array.BYTES_PER_ELEMENT;
	//Position
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	
	var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var size = 3;          
    var type = gl.FLOAT;   
    var normalize = false; 
      
    var offset = 0;        // start at the beginning of the buffer
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    //Color
    var colorAttributeLocation = gl.getAttribLocation(program,"a_color");
    size = 3;
    type = gl.FLOAT;
    normalize = false;   
    offset = 3*Float32Array.BYTES_PER_ELEMENT;    
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);

	//UV
	var uvAttributeLocation = gl.getAttribLocation(program,"a_uv");
	size = 2;
	type = gl.FLOAT;
	normalize = false;   
	offset = 6*Float32Array.BYTES_PER_ELEMENT;    
	gl.enableVertexAttribArray(uvAttributeLocation);
	gl.vertexAttribPointer(uvAttributeLocation, size, type, normalize, stride, offset);

	//normal
	var normalAttributeLocation = gl.getAttribLocation(program,"a_normal");
	size = 3;
	type = gl.FLOAT;
	normalize = false;  
	offset = 8*Float32Array.BYTES_PER_ELEMENT;    
	gl.enableVertexAttribArray(normalAttributeLocation);
	gl.vertexAttribPointer(normalAttributeLocation, size, type, normalize, stride, offset);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.texture);

	var texLoc = gl.getUniformLocation(program, 'u_texSampler');
	gl.uniform1i(texLoc, 0);


 }

bufferPointLight()
{
	m.lights.forEach(e => {
		if(e.transform == this.transform)
			e.lightDir = VecNormalize(VecAdd(m.player.transform.loc, VecScale(this.transform.loc,-1.0)));
		else
			e.lightDir = VecNormalize(VecAdd(e.transform.loc, VecScale(this.transform.loc,-1.0)));
		e.l_buffer(0.0);
	});
}

render(program)
{
		//Position
	//	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	
   
	//Texture
	if(this.batchId == 0){
		this.batchBuffer(program);
	}
	
	this.bufferPointLight();
            
	//Transform
    var tranLoc  = gl.getUniformLocation(program,'u_translation');
    gl.uniform3fv(tranLoc,new Float32Array(this.transform.loc));
    var thetaLoc = gl.getUniformLocation(program,'u_rotation');
    gl.uniform3fv(thetaLoc,new Float32Array(this.transform.rot));
	var scaleLoc = gl.getUniformLocation(program,'u_scale');
    gl.uniform3fv(scaleLoc,new Float32Array(this.transform.scale));

	this.extraRenderFunc(program);

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = this.vertCount();
    gl.drawArrays(primitiveType, offset, count);
    }
 }

class GameObject {
	constructor() {
		this.transform = new Transform();
		this.collider = null;
		this.renderer = null;
		this.program = 0;

		this.visible = true;
		this.phys = true;
		this.static = false; // just means it doesnt move
		this.trigger = false;

		this.mass = 1.0;

		this.velocity = [0.0,0.0,0.0];
		this.angVelocity = [0.0,0.0,0.0];

		this.drag = 0.0;
		this.angDrag = 0.0;

		this.name = "Default";
		this.id = 0;

		this.colHit=null;
		this.onCollisionEnter = hit=>{};
		this.onCollisionExit = hit=>{};	

		this.updateFunc = dt => {};
		this.lateUpdateFunc = dt => {};
	}

	update(deltatime) {
		this.updateFunc(deltatime);
	}

	physUpdate(deltatime)
	 {
	this.transform.setRot(VecAdd(this.transform.rot, VecScale(this.angVelocity, deltatime)));

	let nextPos = VecAdd(this.transform.loc, VecScale(this.velocity, deltatime));

		// collision check
		this.transform.setLoc(nextPos);
		let hitInfo = m.checkCollision(this);
	
		if(hitInfo.hit)
		{
			
			if(!hitInfo.trigger && !this.trigger && !this.static)
			{
				this.transform.loc = VecAdd(nextPos, VecScale(hitInfo.dir, (hitInfo.dist)));
				//this.velocity = VecMult(this.velocity, VecAdd([1.0,1.0,1.0], VecScale(hitInfo.dir, -1.0)));
				//console.log(hitInfo.dir);
			}

			if(this.colHit != hitInfo)
			{
				if(this.colHit != null)
				{
					this.onCollisionExit(this.colHit);
				}
				this.colHit=hitInfo;
				this.onCollisionEnter(this.colHit);
			}

		//	this.velocity = VecMult(this.velocity, VecAdd([1.0,1.0,1.0], VecScale(hitInfo.dir, -1.0)));
		}
		else // no collision!
		{
			if(this.colHit != null)
			{
				this.onCollisionExit(this.colHit);
			}
		}

		// apply drag
		this.velocity = VecScale(this.velocity, 1.0-this.drag*deltatime);
		this.angVelocity = VecScale(this.angVelocity, 1.0-this.angDrag*deltatime);
 }
}


class Light extends GameObject
{
	constructor(c_warm=[1.0,1.0,1.0], c_cool=[0.0,0.0,0.1], brightness=1.0)
	{
		super();
		this.visible = false;
		this.phys = false;

		this.warm = c_warm;
		this.cool = c_cool;
		this.brightness = brightness;

		this.lightDir = this.transform.forward;
		
	//	this.updateFunc=this.l_buffer;
	}

	l_buffer(dt)
	{
		/*
		uniform vec4 u_warmColor;
		uniform vec4 u_coolColor;
		uniform vec3 u_dLightDir;
		*/

		var warmLoc  = gl.getUniformLocation(m.programs[m.curProgram],'u_warmColor');
		gl.uniform3fv(warmLoc,new Float32Array(this.warm));
		var coolLoc = gl.getUniformLocation(m.programs[m.curProgram],'u_coolColor');
		gl.uniform3fv(coolLoc,new Float32Array(this.cool));

		var dirLoc = gl.getUniformLocation(m.programs[m.curProgram],'u_dLightDir');
		gl.uniform3fv(dirLoc,new Float32Array(this.lightDir));
	}
}

class SphereCollider{
	constructor(radius)
	{
		this.r=radius;
	}

	bounds()
	{
		return [
			[this.r,this.r,this.r],
			[this.r,this.r, -this.r],
			[this.r,-this.r,this.r],
			[this.r,-this.r, -this.r],
			[-this.r,this.r,this.r],
			[-this.r,this.r, -this.r],
			[-this.r,-this.r,this.r],
			[-this.r,-this.r, -this.r]
		];
	}

	dist(closestRelative)
	{
		return {amt:VecMag(closestRelative) - this.r, dir:VecNormalize(closestRelative)};
	}


}

class BoxCollider{
	constructor(width, height, depth)
	{
		this.w=width*0.5;
		this.h=height*0.5;
		this.d=depth*0.5;
	}

	bounds()
	{
		return [
			[this.w,this.h,this.d],
			[this.w,this.h, -this.d],
			[this.w,-this.h,this.d],
			[this.w,-this.h, -this.d],
			[-this.w,this.h,this.d],
			[-this.w,this.h, -this.d],
			[-this.w,-this.h,this.d],
			[-this.w,-this.h, -this.d]
		];
	}


	dist(closestRelative)
	{
		let dx = Math.abs(closestRelative[0]) - this.w;
		let dy = Math.abs(closestRelative[1]) - this.h;
		let dz = Math.abs(closestRelative[2]) - this.d;

		let mx = Math.max(dx, 0.0);
		let my = Math.max(dy, 0.0);
		let mz = Math.max(dz, 0.0);

		let minMax = Math.min(Math.max(dx, dy, dz), 0.0);

		return {amt:VecMag([mx,my,mz]) + minMax, dir:VecNormalize([dx,dy,dz])};
	}
}

// adapted from https://iquilezles.org/articles/normalsSDF/	
function colNormal(col, p) // for function f(p)
{
const h = 0.001; // replace by an appropriate value - no :)
let xyy = [1.0,-1.0,-1.0];
let yyx = [-1.0,-1.0,1.0];
let yxy = [-1.0,1.0,-1.0];
let xxx = [-1.0,-1.0,-1.0];

return VecNormalize(VecAdd(VecScale(xyy,col.dist(VecAdd(p, VecScale(xyy,h))).amt),
					VecAdd(VecScale(yyx,col.dist(VecAdd(p, VecScale(yyx,h))).amt),
					VecAdd(VecScale(yxy,col.dist(VecAdd(p, VecScale(yxy,h))).amt),
					VecScale(xxx,col.dist(VecAdd(p, VecScale(xxx,h))).amt)))));
}

class WallCollider{
	constructor(width, height, depth)
	{
		this.w=width*0.5;
		this.h=height*0.5;
		this.d=depth*0.5;
	}

	dist(closestRelative)
	{
		let dx = Math.abs(closestRelative[0]) - this.w;
		let dy = Math.abs(closestRelative[1]) - this.h;
		let dz = Math.abs(closestRelative[2]) - this.d;

		let mx = Math.max(dx, 0.0);
		let my = Math.max(dy, 0.0);
		let mz = Math.max(dz, 0.0);

		let minMax = Math.min(Math.max(dx, dy, dz), 0.0);

		return {amt:-(VecMag([mx,my,mz]) + minMax), dir:VecNormalize([mx,my,mz])};
	}
}

function SphereUV(inpos)
{
//	return asin(inPos)/PI + 0.5;
	let lat = Math.asin(inpos[1])/Math.PI + 0.5;
	//let long = -Math.asin(inpos[1])/Math.PI + 0.5;
	let long = -Math.atan2(inpos[2], inpos[0]) / (2.0 * Math.PI) + 0.5;
   return [lat, long];
}

function SphereNormal(inpos)
{
	return CubeToSphere(inpos, 1.0);
}

function VecAdd(vec1, vec2)
{
	let v = [];
	for(let i = 0; i < vec1.length; i++)
	{
		v[i] = vec1[i]+vec2[i];
	}
	return v;
}

function VecScale(vec, s)
{
	return VecMult(vec, [s,s,s]);
}

function VecMult(vec1, vec2)
{
	return [vec1[0]*vec2[0], vec1[1]*vec2[1], vec1[2]*vec2[2]];
}

function VecSqr(vec)
{
	return VecMult(vec, vec);
}

function VecRoot(vec)
{
	return [Math.sqrt(vec[0]), Math.sqrt(vec[1]), Math.sqrt(vec[2])];
}

function VecMag(vec)
{
	let vsqr = VecSqr(vec);
	return Math.sqrt(vsqr[0]+vsqr[1]+vsqr[2]);
}

function VecNormalize(vec)
{
	return VecScale(vec, 1.0/VecMag(vec));
}

function VecAbs(vec)
{
	return [Math.abs(vec[0]), Math.abs(vec[1]), Math.abs(vec[2])];
}

function VecLerp(veca, vecb, t)
{
	return [lerp(veca[0], vecb[0], t), lerp(veca[1], vecb[1], t), lerp(veca[2], vecb[2], t)];
}

 // we be lerpin
 function lerp(a, b, t)
 {
	 return a + (b - a) * t;
 }


class Camera extends GameObject {
	constructor(programs=m.programs) {
		super();
		this.aspect = 0.5625; // 16 x 9
		this.fov = 70.0;
		this.nearPlane = 0.25;
		this.farPlane = 10000.0;

		//this.pTransform = new Transform();
		//this.pTransform.loc = VecAdd(this.transform.loc, VecScale(this.transform.forward, this.farPlane-10.0));
		//this.pTransform.setRot(this.transform.rot);

		this.renderer = new RenderObj(this.transform, "", 0);


		let vPlane = CreatePlane([0.0,0.0,0.9999999], 2.0, 1.0, "forward");
		/*for(let i = 0; i < vPlane.length; i++)
		{
			this.renderer.addVert(vPlane[i], [1.0,1.0,1.0], [vPlane[i][0], vPlane[i][1]]);
		}*/

		this.renderer.addFace(vPlane[0], vPlane[1], vPlane[2],vPlane[3], [1.0,1.0,1.0]);
		this.renderer.texture = generateNoiseTexture(0.1);
		this.program=2;
		this.renderer.rebuffer();

		for(let i = 0; i < programs.length; i++)
		{
			let program = programs[i];
			gl.useProgram(program);
			var viewFOVLoc = gl.getUniformLocation(program, 'fov');
			gl.uniform1f(viewFOVLoc, this.fov);
			var viewAspectLoc = gl.getUniformLocation(program, 'aspect');
			gl.uniform1f(viewAspectLoc, this.aspect);

			var viewNearLoc = gl.getUniformLocation(program, 'n');
			gl.uniform1f(viewNearLoc, this.nearPlane);
			var viewFarLoc = gl.getUniformLocation(program, 'f');
			gl.uniform1f(viewFarLoc, this.farPlane);
		}

		gl.useProgram(programs[m.curProgram]);
	}

	moveCamera(programs) {
		for(let i = 0; i < programs.length; i++)
		{
			let program = programs[i];
			gl.useProgram(program);
			var cameraTranLoc = gl.getUniformLocation(program, 'cameraPosition');
			gl.uniform3fv(cameraTranLoc, this.transform.loc);
			var cameraRotLoc = gl.getUniformLocation(program, 'cameraRotation');
			gl.uniform3fv(cameraRotLoc, this.transform.rot);
		}

		//this.pTransform.loc = VecAdd(this.transform.loc, VecScale(this.transform.forward, this.farPlane-10.0));
		//this.pTransform.setRot(this.transform.rot);

		gl.useProgram(programs[m.curProgram]);
	}

	changeFov(newFov)
	{
		newFov = Math.max(0.0, Math.min(newFov, 179.0));
		
		for(let i = 0; i < m.programs.length; i++)
		{
			let program = m.programs[i];
			gl.useProgram(program);
			var viewFOVLoc = gl.getUniformLocation(program, 'fov');
			gl.uniform1f(viewFOVLoc, this.fov);
		}

		gl.useProgram(programs[m.curProgram]);
	}

	update(dTime) {

	} 
}

class FlyingPlayer extends GameObject{
	constructor(){
		super();
		
		this.static=false;

		this.collider = new SphereCollider(0.75);	

		this.moveInput = [0.0,0.0,0.0];
		this.rotInput = [0.0,0.0,0.0];

		this.accel = 50.0;
		this.angAccel = 6.0;

		this.maxVel = 5000.0;
		this.maxAngVel = 6.0;

		this.drag = 0.5;
		this.angDrag=5.0;

		this.bulletSpeed = 50.0;

		this.prevShotTime = -1.0;
		this.shotDelay =0.15;
		this.sideShot = 1.0;

		this.updateFunc = this.p_update;
		this.lateUpdateFunc = this.p_lateUpdate;
		this.onCollisionEnter = this.p_collision;

		// model nightmare

	}

	getInput()
	{
		// shift = 16
		// space = 32
		let mv = [];
		mv[0] = m.getKeyAxis('A', 'D');
		mv[1] = m.getKeyAxis('Q', 'E');
		mv[2] = m.getKeyAxis('S', 'W');
		this.moveInput = mv;

		let rv = [];
		rv[0] = -m.getKeyAxis('K', 'I');
		rv[1] = m.getKeyAxis('J', 'L');
		rv[2] = m.getKeyAxis('U', 'O');
		this.rotInput = rv;
	}

	p_update(dtime)
	{
		this.visible = showPlayerModel;

		this.getInput();

		let Rx = VecScale(this.transform.right, this.rotInput[0]);
		let Ry = VecScale(this.transform.up, this.rotInput[1]);
		let Rz = VecScale(this.transform.forward, this.rotInput[2]);

		let rv = VecAdd(Rx, VecAdd(Ry, Rz));
		
		Ry =  VecScale(this.transform.up, this.moveInput[0]);
		rv=Ry; // temp. fuck those other axes till i get quaternions working or magically solve gimbal lock
		
		rv = VecScale(rv, this.angAccel*dtime);
		this.angVelocity=VecAdd(this.angVelocity, rv);
		
		if(VecMag(this.angVelocity) > this.maxAngVel)
		{
			this.angVelocity = VecScale(VecNormalize(this.angVelocity), this.maxAngVel);
		}
		
		let mv = VecScale(this.transform.forward, this.moveInput[2]);
		mv = VecAdd(mv, VecScale(this.transform.up, this.moveInput[1]));
		mv = VecAdd(mv, VecScale(this.transform.right, this.moveInput[0]));

		//mv=VecMult(this.transform.forward, this.moveInput);

		/*console.log("PLAYER_INFO\n" +
		"FWD=" + this.transform.forward+"\n"+
		"MI=" + this.moveInput+"\n"+
		"MV=" + mv+"\n");*/

		if(useLameInput)
		{
			let tx = Math.cos(this.transform.rot[1]);
			let ty = Math.sin(this.transform.rot[1]);

			mv = VecScale([ty,0.0,tx], this.moveInput[2]);
			mv = VecAdd(mv, VecScale(this.transform.up, this.moveInput[1]));
		}

		mv = VecScale(mv, this.accel*dtime);
		this.velocity=VecAdd(this.velocity, mv);

		if(VecMag(this.velocity) > this.maxVel)
		{
			this.velocity = VecScale(VecNormalize(this.velocity), this.maxVel);
		}

		if(m.isKeyPressed(' '))
		{
			if(m.prevTime*0.001 - this.prevShotTime >= this.shotDelay)
				this.p_shoot();
			
		}
	}

	p_shoot()
	{
		let offset = this.transform.right;
		offset = VecScale(offset, this.sideShot);
		offset[1] = -1.5;
		this.sideShot*=-1.0;

		let b = new Bullet(this.transform.forward, 
			this.velocity, this.bulletSpeed, 
			VecAdd(this.transform.loc, offset), this.transform.rot);
		
		m.addObj(b, "Bullet");

		this.prevShotTime=m.prevTime*0.001;
	}

	p_lateUpdate(dtime)
	{
		if(freezeCam)
			return;



		if(thirdPerson)
		{
			cam.transform.setLoc(VecAdd(this.transform.loc,
				 VecAdd(VecScale(this.transform.forward, -5.0), VecScale(this.transform.up, 2.5))));
		
			cam.transform.setRot(VecLerp(cam.transform.rot, this.transform.rot, 12.0*dtime));
		}
		else
		{
			cam.transform.setLoc(this.transform.loc);
			cam.transform.setRot(this.transform.rot);
		}
		
	}

	p_collision(hit)
	{
		this.velocity = VecScale(this.velocity, 0.9);
	}
}

class Bullet extends GameObject
{
	constructor(dir, startVel, speed, pos, rot)
	{
		super();

		this.collider = new SphereCollider(0.15);
		this.transform.scale=[0.33,0.33,2.5];

		this.renderer = BuildRendererFromVerts(CreateCube([0.0,0.0,0.0], 0.5, 1.0), this.transform, [1.0, 0.1,0.15], "");
		this.renderer.batchId=1;
		//this.renderer.texture = loadTexture(gl, "");

		this.flyDir = dir;
		this.maxSpeed = speed;
		this.curSpeed = speed*0.01;
		this.accel = 120.0;
		this.startVel = startVel

		this.velocity = VecAdd(startVel, VecScale(dir, this.curSpeed));

		this.updateFunc = d =>{
			this.curSpeed += this.accel*d;
			if(this.curSpeed>this.maxSpeed)
				this.curSpeed=this.maxSpeed;
			
			this.velocity= VecAdd(this.startVel, VecScale(this.flyDir, this.curSpeed));
		};
		
		this.transform.loc = pos;
		this.transform.setRot(rot);

		this.onCollisionEnter = this.b_collide;

		this.spawnTime = m.prevTime*0.001;
		this.maxAge = 8.0;

		this.dead = false;
		this.lateUpdateFunc=this.b_lateUpdate;
	}

	b_collide(h)
	{
		this.collider = null;
		this.phys=false;
		this.dead=true;

		let explosionSettings = {loc:this.transform.loc, size:1.0, duration:0.3};

		let o = m.gameObjects[h.id];
		console.log(o.name);
		if(o.name.includes("Asteroid"))
		{
			o.hits++;
			console.log(h.dir);

			if(o.hits >= 3)
			{

				let s = VecMag(o.transform.scale);
				if(s> 4.0)
				{
					// break em up
					let a = new Asteroid(s*0.25);
					let b = new Asteroid(s*0.25);

					a.transform.loc = o.transform.loc;
					b.transform.loc = o.transform.loc;

					a.velocity = VecScale(VecNormalize([Math.random(), Math.random(), Math.random()]), 6.0);
					b.velocity = VecScale(VecNormalize([Math.random(), Math.random(), Math.random()]), 6.0);

					m.addObj(a);
					m.addObj(b);
				}

				m.removeObj(o);
				explosionSettings.size=2.5;
				explosionSettings.duration=0.9;
			}
			else
			{
				o.velocity = VecScale(h.dir, 4.0);
			}
		}

		let ex = new Explosion(explosionSettings.loc, explosionSettings.size, explosionSettings.duration);
		m.addObj(ex);
	}

	b_lateUpdate(time)
	{
		if(m.prevTime*0.001-this.spawnTime >= this.maxAge)
			this.dead = true;

		if(this.dead===true)
		{
			//console.log("IM DED " + this.name + this.id);
			m.removeObj(this);
		}
	}
}



class Asteroid extends GameObject
{
	static asteroidTexture = null;
	constructor(size=null)
	{
		super();

		if(Asteroid.asteroidTexture==null)
		{
			Asteroid.asteroidTexture = loadTexture(gl, "https://cdn.discordapp.com/attachments/753993397391589419/1094339394527318147/asteroid_texture3.png");
		}

		this.hits = 0;
		this.name = "Asteroid";

		let minSize = 1.0;
		let maxSize = 10.0;
		if(size===null)
		{
			size = Math.max(minSize, Math.min(maxSize, Math.random()*maxSize+minSize));
		}

		let divs = 6.0;
		if(size <= minSize*2)
		{
			divs = 3.0;
		}

		

		// assign a render batch between 10-19. 10-11 are reserved for the small asteroids.

		let bid = Math.floor(Math.random() * 8) + 12;
		if(size <= minSize*2)
			bid = Math.floor(Math.random() * 2) + 10;

		let verts = [];
		let o = null;

		if(m != undefined && m.renderBatches[bid] != undefined && m.renderBatches[bid][0] != undefined)
		{
			verts = m.renderBatches[bid][0].renderer.vertices;
			o=new RenderObj(this.transform, "", bid);
			o.vertices = verts;
		}
		else{
			noise.seed(Math.random());
			let s=0.3;
			verts = CreateSphere(divs, 1.0);
			for(let i = 0; i<verts.length; i++)
			{
				let v = VecScale(verts[i], 1.0-s);
				let n = noise.simplex3(v[0], v[1], v[2]);
				verts[i] = VecScale(verts[i], (1.0-s) + n*s);
			}

			o = BuildRendererFromVerts(verts, this.transform, undefined, "");
		}
		
		o.texture=Asteroid.asteroidTexture;
		o.batchId=bid;
		this.renderer=o;
		
		//"https://pkdreams.neocities.org/sprites/asteroid_texture.png"
		//https://cdn.discordapp.com/attachments/956754995372511252/1094335214127435857/asteroid_texture2.png
		//https://cdn.discordapp.com/attachments/753993397391589419/1094339394527318147/asteroid_texture3.png
		// "https://cdn.discordapp.com/attachments/753993397391589419/1094076152534028348/asteroid_texture.png"
	//	o.updateFunc = d =>{};
		this.fakeMass = 1.0/size;
		this.onCollisionEnter = h =>
		{
			let force = VecScale(h.dir, -h.force*this.fakeMass);
			
			this.velocity = VecAdd(this.velocity, force);
		};

		this.drag = 0.1;
		//o.velocity[0] = 20.0*Math.random()-1.0;
		this.angVelocity[0] = 2.0*Math.random()-1.0;
		this.angVelocity[1] = 2.0*Math.random()-1.0;
		
		//console.log(o.angVelocity);

	
		
		
		let scale = [size,size,size]
		this.collider = new SphereCollider(size);
	

		if(size%3 == 0)
		{
			let i = Math.floor(Math.random()*3.0);
			scale = VecScale(scale, 0.5);
			scale[i] = size;
		}

		this.transform.scale = scale;

		
	}
}

class Explosion extends GameObject
{
	constructor(loc, size, duration)
	{
		super();

		this.transform.loc = loc;
		this.transform.scale = [0.2,0.2,0.2];
		this.maxSize = size;
		this.time = 0.0;
		this.duration = duration;

		this.phys=false;
		let verts = CreateSphere(2.0, 0.9);
		let r = BuildRendererFromVerts(verts, this.transform, [1.0, 0.4, 0.4], "");
		r.batchId=2;
		this.renderer = r;

		this.updateFunc = this.e_update;
	}

	e_update(dt)
	{
		// -(x-0.25)^{2} + 1
		let t = this.time-0.5;
		let s = Math.max((-(t*t) + 1.0) * this.maxSize, 0.00001);
		this.transform.scale=[s,s,s];

		this.transform.rot[1] += 5.0*dt;
		

		this.time+=dt/this.duration;
		if(t > 1.0)
		{
			m.removeObj(this);
		}
	}
}

class ChildObject extends GameObject
{
	constructor(parentObj, posOffset, rotOffset)
	{
		this.pTransform = parentObj.transform;
		this.pLoc;
		this.pRot;

		this.lateUpdateFunc=dt=>{
			this.transform.loc=VecAdd(this.pLoc, this.pTransform.loc);
			this.transform.rot=VecAdd(this.pRot, this.pTransform.rot);
		}
	}
}