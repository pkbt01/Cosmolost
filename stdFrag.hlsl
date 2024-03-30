//Fragment shaders do not have precision so we have to set it.
precision mediump float;
varying vec3 v_color;
varying vec2 uv;
varying vec3 v_normal;
varying vec3 v_pos;

uniform vec2 u_RES;
varying vec2 screenCoord;

    // temp directional lighting
    uniform vec3 u_warmColor;
    uniform vec3 u_coolColor;
    uniform vec3 u_dLightDir;

#define LIGHT_COUNT 8
/*		uniform float u_ambientIntensity;

// per-light data
uniform vec3 u_warmColor[LIGHT_COUNT];
uniform vec3 u_coolColor[LIGHT_COUNT];
uniform vec3 u_dLightDir[LIGHT_COUNT];
uniform vec3 u_dLightPos[LIGHT_COUNT];
uniform float u_lightFalloff[LIGHT_COUNT];
uniform float u_lightAngle[LIGHT_COUNT];
uniform int u_lightType[LIGHT_COUNT];
*/
uniform sampler2D u_texSampler; // texutres!!! :D

const float C_DEPTH = 16.0; // number of shades per color channel available :)

vec4 CrushCol(vec4 col)
{
    return floor(col*C_DEPTH)/C_DEPTH;
}

int mod(int x, int y)
{
    return x - y * int(floor(float(x/y)));
}

float Lum(vec4 col)
{
    return 0.2126*pow(col.r, 2.2) + 0.7152*pow(col.g, 2.2) + 0.0722*pow(col.b, 2.2);
}

float Bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2. + a.y * a.y * .75);
}

#define Bayer4(a)   (Bayer2 (.5 *(a)) * .25 + Bayer2(a))


vec4 dither(vec4 col)
{	
    vec2 pixel = vec2(screenCoord*u_RES);
    float dithering = (Bayer4(pixel) * 2.0 - 1.0) * 0.25;
    vec4 dCol = min(col, 1.0) + dithering;
    float dLum = Lum(dCol);



    //col += dithering;   
    
    //if(dCol.g < 0.5)
    //	dCol = vec4(1.0);
    
    dCol = vec4(dLum<0.5);
    //return dCol;
//	dCol = vec4(dLum);

    dCol = (col*dCol*dLum);
    return vec4(vec3(clamp(col - clamp(dCol, 0.0, 0.33),0.0,1.0)), col.a);
}

vec4 calcDirLight(vec3 dir, vec3 cool, vec3 warm)
{
    float d = (dot(normalize(v_normal), dir)+1.0)*0.5;
    //float f = u_lightIntensity;

    vec3 col = mix(cool, warm, d);

    return vec4(col.rgb, 1.0);
}
/*
vec4 calcPointLight(vec3 pos, float fallOff, vec4 cool, vec4 warm)
{
    vec3 dir = normalize(gl_Position - pos);
    float dist = length(gl_Position - pos);
    float d = (dot(normalize(v_normal), dir)+1.0)*0.5;
    //float f = u_lightIntensity;

    vec4 col = mix(cool, warm, d * (1.0-dist/fallOff));

    return col;
}

vec4 calcSpotLight(vec3 pos, vec3 dir, float angle, float fallOff, vec4 cool, vec4 warm)
{
    vec3 dir = normalize(gl_Position - pos);
    float dist = length(gl_Position - pos);
    float d = (dot(normalize(v_normal), dir)+1.0)*0.5;
    //float f = u_lightIntensity;

    vec4 col = mix(cool, warm, d * (1.0-dist/fallOff));

    return col;
}

vec4 calcLighting()
{
    vec4 v = vec4(0.0);
    for(int i = 0; i < LIGHT_COUNT; i++)
    {
        if(u_lightType[i] == 0)
        {
            v+=calcDirLight(u_dLightDir[i], u_coolColor[i], u_warmColor[i]);
        }
        else if (u_lightType[i]==1)
        {
            
        }
        else
        {

        }
    }
    
    v =  max(u_ambientIntesnity, v)
    return v;
}
*/
void main()
{
vec4 vertCol = vec4(v_color, 1);
vec4 texCol = texture2D(u_texSampler, uv);
vec4 lightCol = calcDirLight(u_dLightDir, u_coolColor, u_warmColor);
//gl_FragColor = lightCol;
    gl_FragColor = CrushCol(dither(vertCol * texCol * lightCol));
}