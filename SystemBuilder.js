

// returns a color based off of the heat
// from coldest to hottest, something like red to white to blue.
function sunColorFromHeat(heat)
{
    let maxHeat = 1000.0;
    heat-=100.0;
    heat = Math.max(0.0, Math.min(maxHeat, heat));
    let cols = [
        [230, 69, 57],
        [255, 137, 51],
        [255, 82, 119],
        [163, 167, 194],
        [79, 164, 184]
    ];

    let i = Math.floor((heat/maxHeat) * cols.length);
    console.log(i)
    let c = cols[i];
    return c;
   // return VecScale(c, 1.4);
}

// used to determine what types of planets are viable at location & what they will look like
function planetTempurate(distFromSun, sunTemp)
{
    console.log(sunTemp/(distFromSun));
    return Math.max(0.0, Math.min(1.0, sunTemp/(distFromSun)))
}

function tempAtPoint(point, sunTemp)
{
    let d = VecMag(point);
    return planetTempurate(d, sunTemp);
}

const gasGiantMinDist = 1000;

// returns a list of planet-types that are viable with the given conditions
function possiblePlanetClasses(planetTemp, distFromSun, planetSize)
{
    
}

var Compounds = [];

class CompoundType
{
    constructor(name="Default",type="Rock", probability=1.0, gasPoint=100.0, freezePoint=10.0, freezeColor=[0.75,0.75,0.95], solidColor=[1.0,1.0,1.0], gasColor=[0.85,1.0,0.95])
    {
        this.name=name;
        this.type=type;
        this.probability=probability;
        this.freezePoint=freezePoint;
        this.gasPoint=gasPoint;
        this.freezeColor=freezeColor;
        this.solidColor=solidColor;
        this.gasColor=gasColor;

    }
}


Compounds.push(new CompoundType("Iron", "Rock", 1.0, 100.0, 0.0, [125,56,51], [171,81,48], [207,117,43]));
Compounds.push(new CompoundType("Silicone", "Rock", 1.0, 100.0, 0.0,[64,73,115], [163,167,194], [104,111,153]));

Compounds.push(new CompoundType("Water", "Liquid", 0.5, 50.0, 20.0, [223,224,232], [79,164,184], [245,255,232]));
Compounds.push(new CompoundType("Mercury", "Liquid", 0.5, 45.0, 5.0, [40,53,64], [44,53,77], [75,29,82]));

Compounds.push(new CompoundType("Hydrogen", "Gas", 0.4, 20.0, 5.0, [82,51,63], [255,174,112], [255,194,161]));






function generatePlanetData()
{
    let compoundCount = Math.floor(1.0 + Math.random()*4.0);

    let rocks = [];
    let liquids = [];
    let gases = [];
    for(let i = 0; i < compoundCount; i++)
    {
        let c = Compounds[Math.floor(Math.random()*Compounds.length)];
        switch(c.type){
            case "Liquid":
                liquids.push(c);
                break;
            case "Gas":
                gases.push(c);
                break;
            default:
                rocks.push(c);
                break;
        }
    }

    let domType = "dead rock";
    
    return {type:domType, rocks:rocks, liquids:liquids, gases:gases};
}

function determineClouds(main, fromPlanet)
{
    let d = fromPlanet.data;
    let t = fromPlanet.temp;

    let layerSum = 2.5;
    
    d.liquids.forEach(e => {
        if(t >= e.gasPoint)
        {

            layerSum+=Math.random()*4.0 + 1.0;
            addSystemObj(main, new Cloud(fromPlanet, e.gasColor, layerSum))
        }
    });

    d.gases.forEach(e => {
        layerSum+=Math.random()*4.0 + 1.0;
        addSystemObj(main, new Cloud(fromPlanet, e.solidColor, layerSum));
        layerSum+=Math.random()*4.0 + 1.0;
        addSystemObj(main, new Cloud(fromPlanet, e.gasColor, layerSum));
    });
}

function textureFromPlanetData(data)
{
    let h = 100;
    let colors = [];
    for(let i = 0; i < h; i++){
        colors[i] = [];
    }

    data.liquids.forEach(l => {

        for(let i = 0; i <h; i++){
            if(i <= l.freezePoint)
                colors[i].push(l.freezeColor);
            else if(i <= l.gasPoint)
                colors[i].push(l.gasColor);
            else
                colors[i].push(l.solidColor);
        }
    });

    data.gases.forEach(g => {

        for(let i = 0; i < h; i++){
            if(i <= g.freezePoint)
                colors[i].push(g.freezeColor);
            else if(i <= g.gasPoint)
                colors[i].push(g.gasColor);
            else
                colors[i].push(g.solidColor);
        }

    });

    data.rocks.forEach(r => {

        for(let c = 0; c < h; c++)
        {
            colors[c].push(r.freezeColor);
            colors[c].push(r.solidColor);
            colors[c].push(r.gasColor);
        }

    });

    return generateColorTexture2D(colors);
}





function generateColorTexture2D(colors=[])
{
    const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	const level = 0;
	const internalFormat = gl.RGBA;
	const width = colors[0].length;
	const height = colors.length;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	let map = new Uint8Array(4*width*height);

    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++)
        {
            let col = colors[y][x];
            
            
           // console.log(x+","+y+" = " + col);
        
            let mapIndex = (y*width + x)*4;

        for(let c = 0; c < col.length; c++)
            map[mapIndex+c] = Math.floor(col[c]);
            
            
            if(col.length < 4);
                map[mapIndex+3] = 255;
        }
}

    //console.log(map);
	gl.texImage2D(
		gl.TEXTURE_2D,
		level,
		internalFormat,
        width,
		height,
		border,
		srcFormat,
		srcType,
		map
	);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

   // console.log(texture);
    return texture;
}

function generateColorTexture1D(colors=[])
{
    const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	const level = 0;
	const internalFormat = gl.RGBA;
	const width = colors.length;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	let map = new Uint8Array(4*width);

    for(let i = 0; i < width; i++)
    {
        let col = colors[i];
       
        let mapIndex = i*4;

       for(let c = 0; c < col.length; c++)
        map[mapIndex+c] = Math.floor(col[c]);
        
        
        if(col.length < 4);
            map[mapIndex+3] = 255;
    }

    //console.log(map);
	gl.texImage2D(
		gl.TEXTURE_2D,
		level,
		internalFormat,
        width,
		height,
		border,
		srcFormat,
		srcType,
		map
	);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

   // console.log(texture);
    return texture;
}

function generateNoiseTexture(scale=0.01, res=1024)
{
    const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	const level = 0;
	const internalFormat = gl.RGBA;
	const width = res;
	const height = res;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	let noiseData = new Uint8ClampedArray(4*res*res);

    noise.seed(Math.random());

    for(let i = 0; i < noiseData.length; i+=4)
    {
       let x = Math.floor((i*0.25) % res);
       let y = Math.floor((i*0.25) / res);
       let n = (noise.simplex2(x*scale, y*scale)+1.0)*0.5;
     

       let m = Math.floor(n*255);
    
       for(let c = 0; c < 3; c++)
        noiseData[i+c] = m;
        
        noiseData[i+3] = 255;
    }

   //console.log(noiseData);

    const noiseImage = new ImageData(noiseData, res,res, {colorSpace:"srgb"});
	gl.texImage2D(
		gl.TEXTURE_2D,
		level,
		internalFormat,
		srcFormat,
		srcType,
		noiseImage
	);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

   // console.log(texture);
    return texture;
}

class Sun_Light extends Light{
    constructor(size=250.0, color=[1.0,0.75,0.5], cWarm=[1.25, 1.2,1.1], cCool = [0.05,0.05,0.15])
    {
        super(cWarm, cCool);
        this.visible = true;
		this.phys = true;
        this.trigger = true; 

        this.mass = 10000.0;
        this.static = true;

        this.spinSpeed = 0.15;
        this.angVelocity = [0.0,this.spinSpeed,0.0];

        this.transform.scale = [size,size,size];
        this.collider = new SphereCollider(size);

        this.renderer = BuildRendererFromVerts(CreateSphere(10.0), this.transform, color, "");

        this.onCollisionEnter = this.s_collide;
        this.updateFunc=this.s_update;   
    }

    s_collide(hit)
    {
        console.log("OOPS" + m.gameObjects[hit.id].name + hit.dist);
        // todo, kill thing.
    }

    s_update(dt)
    {

    }
}
var sunTemp = 50.0;
var sunSize = 0.0;
function BuildSun()
{
    sunTemp = Math.random()*1000 + 100.0;
    sunSize = Math.random()*300 + 100.0;

    let sCol = VecScale(sunColorFromHeat(sunTemp), 1.5 * 1.0/255.0);
    

    let sun = new Sun_Light(sunSize, sCol);

    return sun;
}

function BuildPlanet(dist)
{
    let angle = Math.random() * 2.0 * Math.PI;
    let size = Math.random()*150.0 + 100.0;
    let data = generatePlanetData();
    console.log(data);
    let temp = planetTempurate(dist, sunTemp);
    let roughness = Math.random()*0.5 + 0.5;

    if(data.rocks.length < 1)
        roughness *= 0.1;
    
    let p = new Planet(size, dist, angle, data, roughness, temp);



    return p;
}

function noise3D(pos, scale)
{
   return (1.0 + noise.simplex3(pos[0]*scale,pos[1]*scale,pos[2]*scale)) * 0.5;
}

class Planet extends GameObject{
    constructor(size=100.0, solarDist=200.0, solarAngle=-Math.PI, data=generatePlanetData(), roughness=1.0, temp=0.5, matNames=[["Default","Type"]])
    {
        super();
        this.visible = true;
		this.phys = true;
        this.trigger = false;

        this.mass = 10000.0;
        this.static = true;

        this.spinSpeed = 0.15 * Math.random() + 0.1;
        this.angVelocity = [0.0,this.spinSpeed,0.0];

        this.temp = temp;

        let A = size + 50.0 + sunSize + solarDist;
        this.transform.loc = [A* Math.cos(solarAngle), 0.0, A*Math.sin(solarAngle)];
        this.transform.scale = [size,size,size];
        this.collider = new SphereCollider(size);

        //this.renderer = BuildRendererFromVerts(CreateSphere(10.0), this.transform, [1.0,1.0,1.0], "https://cdn.discordapp.com/attachments/753993397391589419/1096065855512649838/planet1.png");

        this.renderer = new RenderObj(this.transform, "", 0);

        this.renderer.texture = textureFromPlanetData(data);
        this.data = data;
        let verts = CreateSphere(75.0);

       // console.log(verts.length);
        let vertNoises = [];
        let uvs = []; 
        let normals = [];

        let scales = [0.6, 1.2, 4.0];
        console.log(this.temp);
        noise.seed(Math.random());
        for(let i = 0; i < verts.length; i++)
        {
  
            let low = noise3D(verts[i], scales[0]);
            let mid = noise3D(verts[i], scales[1]);;
            let high = noise3D(verts[i], scales[2]);;
            let bonus = 1;

            vertNoises[i] = [low, mid, high];

            let v = low*(mid*0.75+high*0.25)

            verts[i] = VecScale(verts[i], lerp(1.0, 0.8+v*0.2, roughness));

            uvs[i] = [this.temp, 0.5 + Math.abs(verts[i][1])*0.5 + mid*0.1];
        }

        this.renderer.vertices = [];
        for(let i = 3; i < verts.length; i+=4)
		{
			this.renderer.addVert(verts[i-3], vertNoises[i-3], uvs[i-3]);
            this.renderer.addVert(verts[i-2], vertNoises[i-2], uvs[i-2]);
            this.renderer.addVert(verts[i-1], vertNoises[i-1], uvs[i-1]);

            this.renderer.addVert(verts[i-2], vertNoises[i-2], uvs[i-2]);
            this.renderer.addVert(verts[i-1], vertNoises[i-1], uvs[i-1]);
            this.renderer.addVert(verts[i], vertNoises[i], uvs[i-3]);
		}

        this.renderer.rebuffer();

        

        this.program = 1;
        //this.renderer.texture = generateNoiseTexture();
       // this.onCollisionEnter = this.s_collide;
        this.updateFunc=this.s_update;   
    }


    s_update(dt)
    {

    }
}

class Cloud extends GameObject{
    constructor(fromPlanet, color=[255.0,255.0,255.0], sizeAdd=100.0){
    super();
    console.log("CLOUD " + sizeAdd);
    this.visible = true;
    this.phys = true;
    this.trigger = false;

    this.mass = 10.0;
    this.static = true;

    this.spinSpeed = fromPlanet.spinSpeed * (2.0 - Math.random()*4.0);
    console.log(this.spinSpeed);
    this.angVelocity = [0.0,this.spinSpeed,0.0];

    this.temp = fromPlanet.temp;

    let size = fromPlanet.transform.scale[0] + sizeAdd + 10.0;
    this.transform.loc = fromPlanet.transform.loc;
    
    this.transform.scale = [size,size,size];
    console.log(this.transform.scale);

    //this.renderer = BuildRendererFromVerts(CreateSphere(10.0), this.transform, [1.0,1.0,1.0], "https://cdn.discordapp.com/attachments/753993397391589419/1096065855512649838/planet1.png");

    this.renderer = new RenderObj(this.transform, "", 0);

    this.renderer.texture = generateColorTexture1D([color]);
    console.log(this.renderer.texture);
    let verts = CreateSphere(40.0);

   // console.log(verts.length);
    let vertNoises = [];
    let uvs = []; 
    let normals = [];

    let scales = [0.6, 1.2, 4.0];

    noise.seed(Math.random());
    for(let i = 0; i < verts.length; i++)
    {

        let low = noise3D(verts[i], scales[0]);
        let mid = noise3D(verts[i], scales[1]);;
        let high = noise3D(verts[i], scales[2]);;

        vertNoises[i] = [low, mid, high];

        let v = low*(mid*0.75+high*0.25)

        verts[i] = VecScale(verts[i], lerp(1.0, 0.9+v*0.1, 0.5));

        uvs[i] = [this.temp, 0.5 + Math.abs(verts[i][1])*0.5 + mid*0.1];
    }

    this.renderer.vertices = [];
    for(let i = 3; i < verts.length; i+=4)
    {
        this.renderer.addVert(verts[i-3], vertNoises[i-3], uvs[i-3]);
        this.renderer.addVert(verts[i-2], vertNoises[i-2], uvs[i-2]);
        this.renderer.addVert(verts[i-1], vertNoises[i-1], uvs[i-1]);

        this.renderer.addVert(verts[i-2], vertNoises[i-2], uvs[i-2]);
        this.renderer.addVert(verts[i-1], vertNoises[i-1], uvs[i-1]);
        this.renderer.addVert(verts[i], vertNoises[i], uvs[i-3]);
    }

    this.renderer.rebuffer();

    

    this.program = 3;
    //this.renderer.texture = generateNoiseTexture();
   // this.onCollisionEnter = this.s_collide;
}

}

var systemObjs = [];
function addSystemObj(main, obj)
{
    systemObjs.push(obj);
    main.addObj(obj);
}

function clearSystem(main)
{
    systemObjs.forEach(o => {
        main.removeObj(o);
    });

    systemObjs=[];
}

function BuildSystem(main, seed="0")
{
    addSystemObj(main, BuildSun());

    let numPlanets = Math.floor(Math.random() * 9.0 + 1.0);
    let sumDist = 0.0;
    for(let i = 0; i < numPlanets; i++){
        let dist = Math.random()*400.0 + 250.0;
        sumDist+=dist;

        let p = BuildPlanet(sumDist);

        addSystemObj(main, p);

        determineClouds(main, p);

        if(Math.random() < 0.15) // asteroids!!
        {
            asteroidRing(main, p.transform.loc, p.size);
        }
        sumDist+=dist;
    }

   // main.addObj(new Planet(100.0, 400.0, 2.0));
   /* main.addObj(new Planet(100.0, 600.0, 20.0));
    main.addObj(new Planet(100.0, 400.0, 10.0));
    main.addObj(new Planet(100.0, 400.0, 100.0));
    main.addObj(new Planet(100.0, 400.0, 45.0));
    main.addObj(new Planet(100.0, 400.0, 150.0));*/
}

function asteroidRing(main, loc, radius=200.0)
{
    let mR = Math.random() * 75.0 + 50.0;
    for(let i = 0; i < 200; i++)
				{
					let o = new Asteroid();
                    addSystemObj(main, o);
					o.name += " " + i;

					let f = mR + radius + Math.random()*100.0;
					let angle=Math.random()*Math.PI*2.0;


                    let aLoc = [f*Math.cos(angle), Math.random() *  12.0-6.0, f*Math.sin(angle)];
					o.transform.loc = VecAdd(loc, aLoc);
                  
				}
}