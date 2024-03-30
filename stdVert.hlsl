attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec3 a_color;
attribute vec2 a_uv;
varying vec3 v_color;
varying vec3 v_normal;
varying vec3 v_pos;

varying vec2 uv;

uniform vec2 u_RES;
varying vec2 screenCoord;

uniform vec3 u_translation;
uniform vec3 u_rotation;
uniform vec3 u_scale;

uniform vec3 cameraRotation;
uniform vec3 cameraPosition;

uniform float n;
uniform float f;
//uniform float r;
//uniform float t;
uniform float fov;
uniform float aspect;

const float chunk= 12.623219;

vec4 PositionObject(vec4 pos)
{
	mat4 translateM = mat4(1.0,0.0,0.0,0.0,
							0.0,1.0,0.0,0.0,
							0.0,0.0,1.0,0.0,
							u_translation.x, u_translation.y, u_translation.z, 1.0);
	return translateM*pos;
}

vec4 ScaleObject(vec4 pos)
{
	if(length(u_scale) == 0.0)
		return pos;

	mat4 scaleM = mat4(u_scale.x,0.0,0.0,0.0,
						0.0, u_scale.y, 0.0, 0.0,
						0.0,0.0,u_scale.z,0.0,
						0.0,0.0,0.0,1.0);

	return scaleM*pos;
}

vec4 RotateObject(vec4 pos)
{
	vec3 c = cos(u_rotation);
	vec3 s = sin(u_rotation);

	mat4 Rx = mat4(1.0, 0.0, 0.0, 0.0,
					0.0, c.x, s.x, 0.0,
					0.0, -s.x, c.x, 0.0,
					0.0, 0.0, 0.0, 1.0);

	mat4 Ry = mat4(c.y, 0.0, -s.y, 0.0,
					0.0, 1.0, 0.0, 0.0,
					s.y, 0.0, c.y, 0.0,
					0.0, 0.0, 0.0, 1.0);
	

	mat4 Rz = mat4(c.z, s.z, 0.0, 0.0,
					-s.z, c.z, 0.0, 0.0,
					0.0, 0.0, 1.0,0.0,
					0.0, 0.0, 0.0, 1.0);
	return Rx * Ry * Rz * pos;
}

// Symetric projection
vec4 Project(vec4 pos)
{
	float nr = 1.0 / tan(radians(fov) * 0.5);
	float nt = nr / aspect;
	
	mat4 projectM = mat4(nr, 0.0, 0.0, 0.0,
							0.0,nt, 0.0, 0.0,
							0.0, 0.0, -(f+n)/(f-n), -1.0,
							0.0, 0.0, -2.0*(f*n)/(f-n), 0.0);

	return projectM * pos;
}

vec4 MoveCamera(vec4 pos)
{
	vec3 c = cos(cameraRotation);
	vec3 s = sin(cameraRotation);

	
	mat4 Rx = mat4(1.0, 0.0, 0.0, 0.0,
					0.0, c.x, s.x, 0.0,
					0.0, -s.x, c.x, 0.0,
					0.0, 0.0, 0.0, 1.0);

	mat4 Ry = mat4(c.y, 0.0, -s.y, 0.0,
					0.0, 1.0, 0.0, 0.0,
					s.y, 0.0, c.y, 0.0,
					0.0, 0.0, 0.0, 1.0);
	

	mat4 Rz = mat4(c.z, s.z, 0.0, 0.0,
					-s.z, c.z, 0.0, 0.0,
					0.0, 0.0, 1.0,0.0,
					0.0, 0.0, 0.0, 1.0);

	mat4 translateM = mat4(1.0,0.0,0.0,0.0,
	0.0,1.0,0.0,0.0,
	0.0,0.0,-1.0,0.0,
	-cameraPosition.x, -cameraPosition.y, cameraPosition.z, 1.0);

	return Rx*Ry*Rz*translateM*pos;
}

vec4 ChunkPos(vec4 pos)
{
	return  floor(pos*chunk)/chunk;
}

#define PI 3.1415926538

vec2 SphereUvs(vec2 inPos)
{
	return asin(inPos)/PI + 0.5;
}

void main()
{
	v_color = a_color;

	uv = a_uv;

	vec4 pos = Project(ChunkPos(MoveCamera(PositionObject(RotateObject(ScaleObject(a_position))))));
	gl_Position = pos;
	screenCoord = (pos.xy/pos.w+1.0)*0.5;

	v_normal = normalize(RotateObject(ScaleObject(vec4(a_normal, 1.0)))).xyz;
}	