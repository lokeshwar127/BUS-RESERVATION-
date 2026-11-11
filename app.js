// ============================================================================
// PART A: PHOTOREALISTIC 3D "BHARAT BUS AT GOLDEN HOUR" (BB-7869) WEBGL ENGINE
// Features:
//  - 360° Golden-Hour HDRI-style Procedural Environment Map (envMap)
//  - THREE.MeshPhysicalMaterial Automotive Clearcoat Paint & See-Through Glass
//  - Beveled Aerodynamic Coach Fuselage + Visible 3D Interior Cabin & Seats
//  - Deep-Dish 6x2 Multi-Axle Chrome Alcoa Wheels & Recessed Wheel Arches
//  - Fluted Classical Sandstone Pillars with Bump Mapping & Real-Time Shadows
//  - 100% Preserved GSAP ScrollTrigger & Mouse Parallax Motion
// ============================================================================
let scene, camera, renderer, vehicleGroup, gantryRingGroup;
let busWheels = [];
let mouseX = 0, mouseY = 0;
let stepTargetRotY = -0.56;
let stepTargetRotX = 0.14;
let sideLiveryMatRef = null;

// 1. Generates a 360° Equirectangular Golden-Hour Environment Reflection Map
//    so metallic paint, chrome rims, and glass have realistic 3D reflections!
function createGoldenHourEnvMap() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Sky to Ground Golden Hour Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0.0, "#1E140E");
  skyGrad.addColorStop(0.28, "#8C4215");
  skyGrad.addColorStop(0.46, "#FF9A3C");
  skyGrad.addColorStop(0.50, "#FFF1C9"); // Bright Horizon Sun Band
  skyGrad.addColorStop(0.54, "#4A2C18"); // Ground Horizon
  skyGrad.addColorStop(1.0, "#0F0A06");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Glowing Golden Sun Disc for Specular Highlights on Glass & Paint
  const sunGlow = ctx.createRadialGradient(320, 230, 10, 320, 230, 220);
  sunGlow.addColorStop(0, "rgba(255, 252, 235, 1.0)");
  sunGlow.addColorStop(0.3, "rgba(255, 165, 60, 0.75)");
  sunGlow.addColorStop(1, "rgba(255, 110, 0, 0)");
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, 1024, 512);

  // Architectural Colonnade Silhouette Reflections
  ctx.fillStyle = "rgba(35, 20, 10, 0.45)";
  for (let x = 40; x < 1024; x += 95) {
    ctx.fillRect(x, 80, 28, 175);
  }

  const envTex = new THREE.CanvasTexture(canvas);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envTex.needsUpdate = true;
  return envTex;
}

// 2. Generates a Procedural Sandstone Grain & Fluted Bump Texture for 3D Pillars
function createSandstoneBumpTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 512, 512);

  // Vertical Classical Column Fluting Grooves
  for (let x = 0; x < 512; x += 32) {
    const fluteGrad = ctx.createLinearGradient(x, 0, x + 32, 0);
    fluteGrad.addColorStop(0, "#383838");
    fluteGrad.addColorStop(0.5, "#EAEAEA");
    fluteGrad.addColorStop(1, "#383838");
    ctx.fillStyle = fluteGrad;
    ctx.fillRect(x, 0, 32, 512);
  }

  // Horizontal Stone Block Seams
  ctx.fillStyle = "#222222";
  for (let y = 0; y < 512; y += 64) {
    ctx.fillRect(0, y, 512, 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// 3. Dynamically Paints High-Res "BHARAT BUS" + Ashoka Chakra + Orange Swoosh Livery
function createBharatBusSideLiveryTexture(operatorTitle) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Metallic Pearl White Base with subtle vertical automotive shading
  const baseGrad = ctx.createLinearGradient(0, 0, 0, 512);
  baseGrad.addColorStop(0, "#FFFFFF");
  baseGrad.addColorStop(0.65, "#F6F3EC");
  baseGrad.addColorStop(1, "#DED8CC");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 2048, 512);

  // Sweeping Aerodynamic Saffron-Orange Curves (Matching "Bharat Bus at Golden Hour.png")
  const orangeGrad = ctx.createLinearGradient(0, 0, 2048, 512);
  orangeGrad.addColorStop(0, "#E65100");
  orangeGrad.addColorStop(0.5, "#FF6D00");
  orangeGrad.addColorStop(1, "#FF9E22");

  ctx.fillStyle = orangeGrad;
  ctx.beginPath();
  ctx.moveTo(0, 200);
  ctx.bezierCurveTo(460, 230, 820, 445, 1380, 385);
  ctx.bezierCurveTo(1680, 355, 1890, 205, 2048, 165);
  ctx.lineTo(2048, 512);
  ctx.lineTo(0, 512);
  ctx.closePath();
  ctx.fill();

  // Upper Dynamic Swoosh Arch over "BHARAT BUS"
  ctx.strokeStyle = "#FF6B00";
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.moveTo(880, 125);
  ctx.quadraticCurveTo(1310, 22, 1710, 155);
  ctx.stroke();

  // White Speed Ribbon Cutting Through Lower Orange Wave
  ctx.fillStyle = "#FBF9F5";
  ctx.beginPath();
  ctx.moveTo(30, 260);
  ctx.quadraticCurveTo(480, 355, 960, 435);
  ctx.lineTo(960, 470);
  ctx.quadraticCurveTo(460, 395, 30, 312);
  ctx.closePath();
  ctx.fill();

  // 24-Spoke Golden-Orange Ashoka Chakra Wheel Emblem
  const cx = 545, cy = 230, radius = 94;
  ctx.save();
  ctx.strokeStyle = "#D95900";
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#D95900";
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, Math.PI * 2);
  ctx.fill();

  for (let s = 0; s < 24; s++) {
    const angle = (s * Math.PI * 2) / 24;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * (radius - 14), cy + Math.sin(angle) * (radius - 14));
    ctx.stroke();
  }
  ctx.restore();

  // Bold "BHARAT BUS" Italic Typography with Subtle Drop Shadow
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.font = "italic 900 136px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "#E85D00";
  ctx.fillText("BHARAT", 685, 272);

  ctx.fillStyle = "#16181D";
  ctx.fillText("BUS", 1295, 272);

  if (operatorTitle) {
    ctx.shadowBlur = 0;
    ctx.font = "700 34px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#3E2723";
    ctx.fillText(operatorTitle.toUpperCase(), 695, 330);
  }
  ctx.restore();

  // Recessed Luggage Bay Door Seams & Flush Black Latches
  ctx.strokeStyle = "rgba(0,0,0,0.28)";
  ctx.lineWidth = 4;
  for (let x = 320; x <= 1720; x += 240) {
    ctx.strokeRect(x, 345, 232, 158);
    ctx.fillStyle = "#141619";
    ctx.fillRect(x + 98, 435, 36, 20);
    // Amber Side Marker Reflector LED
    ctx.fillStyle = "#FF8F00";
    ctx.fillRect(x + 15, 480, 22, 9);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

// 4. Front Fascia Texture ("BHARAT BUS" + BB-7869 License Plate + Lower Grille Mesh)
function createFrontFasciaTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#FBF9F5";
  ctx.fillRect(0, 0, 512, 256);

  // Orange V-Swoosh on Front Bumper
  ctx.fillStyle = "#FF6B00";
  ctx.beginPath();
  ctx.moveTo(0, 32);
  ctx.quadraticCurveTo(256, 138, 512, 32);
  ctx.lineTo(512, 90);
  ctx.quadraticCurveTo(256, 185, 0, 90);
  ctx.closePath();
  ctx.fill();

  // "BHARAT BUS" Front Emblem
  ctx.font = "italic 900 44px 'Space Grotesk', sans-serif";
  ctx.fillStyle = "#E85D00";
  ctx.fillText("BHARAT", 108, 72);
  ctx.fillStyle = "#181A1F";
  ctx.fillText("BUS", 302, 72);

  // Lower Honeycomb Intake Grille
  ctx.fillStyle = "#1E2026";
  ctx.fillRect(110, 155, 292, 82);

  // Black Number Plate "BB-7869"
  ctx.fillStyle = "#0B0C0E";
  ctx.fillRect(172, 170, 168, 52);
  ctx.strokeStyle = "#F8FAFC";
  ctx.lineWidth = 3;
  ctx.strokeRect(172, 170, 168, 52);

  ctx.font = "700 28px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("BB-7869", 193, 206);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

// REALISTIC ENVIRONMENT: builds HDR-style reflections with PMREM instead of a flat painted canvas
function createRealisticEnvironment(renderer) {
  const envScene = new THREE.Scene();

  // Golden-hour sky dome
  const c = document.createElement("canvas");
  c.width = 512; c.height = 512;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, "#2A1A10");
  grad.addColorStop(0.45, "#C46A2A");
  grad.addColorStop(0.5, "#FFE3B0");
  grad.addColorStop(0.56, "#3A2415");
  grad.addColorStop(1.0, "#120A06");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  const skyTex = new THREE.CanvasTexture(c);
  skyTex.encoding = THREE.sRGBEncoding;
  envScene.add(new THREE.Mesh(
    new THREE.SphereGeometry(50, 64, 32),
    new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide })
  ));

  // Bright sun softbox (color multiplied above 1 = real HDR light source)
  const sunColor = new THREE.Color(0xFFF1D0).multiplyScalar(6);
  const sun = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 7),
    new THREE.MeshBasicMaterial({ color: sunColor, side: THREE.DoubleSide })
  );
  sun.position.set(-14, 16, 12);
  sun.lookAt(0, 0, 0);
  envScene.add(sun);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();
  return envTex;
}

function initThreeJsHangar() {
  const canvas = document.getElementById("webglHangarCanvas");
  if (!canvas || typeof THREE === "undefined") return;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x2B190E, 0.006);

  camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0.45, 21.5);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x2B190E, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  // Realistic reflections from the golden-hour environment (drives all metal/glass/paint)
  const envMap = createRealisticEnvironment(renderer);
  scene.environment = envMap;

  // ==========================================================================
  // 1. CINEMATIC GOLDEN-HOUR 3D LIGHTING & REAL-TIME SHADOW CASTING
  // ==========================================================================
  const hemiLight = new THREE.HemisphereLight(0xFFE0B2, 0x26150A, 0.55);
  scene.add(hemiLight);

  const goldenSunLight = new THREE.DirectionalLight(0xFFF3D6, 2.6);
  goldenSunLight.position.set(-14, 16, 12);
  goldenSunLight.castShadow = true;
  goldenSunLight.shadow.mapSize.width = 2048;
  goldenSunLight.shadow.mapSize.height = 2048;
  goldenSunLight.shadow.camera.near = 2;
  goldenSunLight.shadow.camera.far = 45;
  goldenSunLight.shadow.bias = -0.0005;
  goldenSunLight.shadow.radius = 6;
  scene.add(goldenSunLight);

  const warmKeyLight = new THREE.PointLight(0xFF7B00, 2.5, 55);
  warmKeyLight.position.set(11, 5, 9);
  scene.add(warmKeyLight);

  const frontFillLight = new THREE.PointLight(0xFFD59E, 1.4, 38);
  frontFillLight.position.set(0, 2, 15);
  scene.add(frontFillLight);

  // ==========================================================================
  // 2. WET ASPHALT CONCOURSE FLOOR & CARVED FLUTED SANDSTONE COLONNADE
  // ==========================================================================
  const stoneBump = createSandstoneBumpTexture();

  // Reflective Wet-Asphalt Road Plane Beneath the Coach
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x1A130E,
    metalness: 0.2,
    roughness: 0.35,
    envMap,
    envMapIntensity: 1.2
  });
  const roadGeo = new THREE.PlaneGeometry(90, 90);
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.y = -3.2;
  roadMesh.receiveShadow = true;
  scene.add(roadMesh);

  // Overhead Heritage Rotunda Dome with 3D Moulding Rings
  gantryRingGroup = new THREE.Group();
  gantryRingGroup.position.set(0, 7.4, -3.5);

  const carvedSandstoneMat = new THREE.MeshStandardMaterial({
    color: 0xD9A779,
    bumpMap: stoneBump,
    bumpScale: 0.08,
    metalness: 0.15,
    roughness: 0.55,
    envMap,
    side: THREE.DoubleSide
  });

  const bronzeTrimMat = new THREE.MeshStandardMaterial({
    color: 0x4A2E1B,
    metalness: 0.75,
    roughness: 0.28,
    envMap,
    side: THREE.DoubleSide
  });

  const glowingSaffronMat = new THREE.MeshStandardMaterial({
    color: 0xFF8C24,
    emissive: 0xD95300,
    emissiveIntensity: 0.85,
    roughness: 0.2,
    side: THREE.DoubleSide
  });

  gantryRingGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(9.1, 9.1, 1.5, 64, 1, true), bronzeTrimMat));
  gantryRingGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(8.1, 8.1, 1.1, 64, 1, true), glowingSaffronMat));

  // Torus 3D Architectural Cornice Ring
  const corniceTorus = new THREE.Mesh(new THREE.TorusGeometry(8.6, 0.32, 20, 64), carvedSandstoneMat);
  corniceTorus.rotation.x = Math.PI / 2;
  corniceTorus.position.y = -0.65;
  gantryRingGroup.add(corniceTorus);

  // 24 Radial Skylight Beams
  const beamGeo = new THREE.BoxGeometry(16.0, 0.22, 0.22);
  for (let s = 0; s < 12; s++) {
    const beam = new THREE.Mesh(beamGeo, carvedSandstoneMat);
    beam.rotation.y = (s * Math.PI) / 12;
    beam.position.y = 0.35;
    gantryRingGroup.add(beam);
  }
  scene.add(gantryRingGroup);

  // Classical Fluted Sandstone Pillars with Stepped Pedestals & Corinthian Capitals
  const flutedPillarGeo = new THREE.CylinderGeometry(0.68, 0.80, 22, 32);
  const capitalGeo = new THREE.BoxGeometry(2.05, 0.85, 2.05);
  const collarTorusGeo = new THREE.TorusGeometry(0.76, 0.14, 16, 32);
  collarTorusGeo.rotateX(Math.PI / 2);

  for (let i = -3; i <= 3; i++) {
    const zPos = i * 5 - 6;
    [-13.8, 13.8].forEach((xSide) => {
      const colGroup = new THREE.Group();
      const shaft = new THREE.Mesh(flutedPillarGeo, carvedSandstoneMat);
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      colGroup.add(shaft);

      const cap = new THREE.Mesh(capitalGeo, bronzeTrimMat);
      cap.position.y = 5.65;
      colGroup.add(cap);

      const neckRing = new THREE.Mesh(collarTorusGeo, glowingSaffronMat);
      neckRing.position.y = 5.15;
      colGroup.add(neckRing);

      const baseRing = new THREE.Mesh(collarTorusGeo, bronzeTrimMat);
      baseRing.scale.set(1.15, 1.15, 1.15);
      baseRing.position.y = -3.0;
      colGroup.add(baseRing);

      colGroup.position.set(xSide, 0, zPos);
      scene.add(colGroup);
    });
  }

  // ==========================================================================
  // 3. HIGH-POLY 3D "BHARAT BUS" (BB-7869) WITH CLEARCOAT & INTERIOR CABIN
  // ==========================================================================
  vehicleGroup = new THREE.Group();
  busWheels = [];

  // Automotive Clearcoat Pearl White Material
  const pearlClearcoatMat = new THREE.MeshPhysicalMaterial({
    color: 0xFBF9F5,
    metalness: 0.15,
    roughness: 0.28,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMap,
    envMapIntensity: 1.35
  });

  // Automotive Clearcoat Side Livery Material
  sideLiveryMatRef = new THREE.MeshPhysicalMaterial({
    map: createBharatBusSideLiveryTexture("ALL-INDIA EXPRESS"),
    metalness: 0.18,
    roughness: 0.3,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMap,
    envMapIntensity: 1.25
  });

  const frontFasciaMat = new THREE.MeshPhysicalMaterial({
    map: createFrontFasciaTexture(),
    metalness: 0.18,
    roughness: 0.3,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMap,
    envMapIntensity: 1.25
  });

  // Realistic Transparent Automotive Tinted Glass (Shows 3D Seats Inside!)
  const realGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x070B12,
    metalness: 0.25,
    roughness: 0.04,
    transparent: true,
    opacity: 0.78,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    envMap,
    envMapIntensity: 2.2
  });

  const blackPillarTrimMat = new THREE.MeshPhysicalMaterial({
    color: 0x0F1218,
    metalness: 0.5,
    roughness: 0.18,
    clearcoat: 0.9,
    envMap
  });

  const saffronLedMat = new THREE.MeshStandardMaterial({
    color: 0xFF8000,
    emissive: 0xFF6B00,
    emissiveIntensity: 0.7
  });

  const chromeMat = new THREE.MeshPhysicalMaterial({
    color: 0xFFFFFF,
    metalness: 1.0,
    roughness: 0.08,
    clearcoat: 1.0,
    envMap,
    envMapIntensity: 2.0
  });

  const tireRubberMat = new THREE.MeshStandardMaterial({
    color: 0x141518,
    metalness: 0.08,
    roughness: 0.92,
    bumpMap: stoneBump,
    bumpScale: 0.03
  });

  // 3A. Lower Coach Body with Beveled Wheel Arches & Livery Mapping
  // Rounded coach shell (soft, curved edges instead of sharp box corners).
  // Falls back to a plain box if the RoundedBoxGeometry script did not load.
  const lowerBodyGeo = THREE.RoundedBoxGeometry
    ? new THREE.RoundedBoxGeometry(10.6, 1.58, 2.68, 8, 0.42)
    : new THREE.BoxGeometry(10.6, 1.58, 2.68);
  const lowerBodyMaterials = [
    frontFasciaMat,   // +X Front Bumper ("BHARAT BUS" & "BB-7869")
    pearlClearcoatMat,// -X Rear Bumper
    pearlClearcoatMat,// +Y Deck Floor
    blackPillarTrimMat,// -Y Undercarriage
    sideLiveryMatRef, // +Z Right Side Livery
    sideLiveryMatRef  // -Z Left Side Livery
  ];
  const lowerBody = new THREE.Mesh(lowerBodyGeo, lowerBodyMaterials);
  lowerBody.position.set(0, -0.46, 0);
  lowerBody.castShadow = true;
  lowerBody.receiveShadow = true;
  vehicleGroup.add(lowerBody);

  // Sculpted 3D Wheel Arch Flares (Front & Rear on Both Sides)
  const archGeo = new THREE.TorusGeometry(0.76, 0.09, 16, 32, Math.PI);
  const wheelPositionsX = [3.15, -2.55, -3.95]; // 6x2 Multi-Axle Volvo/Scania Layout
  wheelPositionsX.forEach((xPos) => {
    [1.33, -1.33].forEach((zSide) => {
      const arch = new THREE.Mesh(archGeo, saffronLedMat);
      arch.position.set(xPos, -1.16, zSide);
      vehicleGroup.add(arch);
    });
  });

  // 3B. Visible 3D Interior Cabin: Warm Ceiling LED Lighting, 10 Rows of 3D Seats & Driver Cockpit!
  const cabinInteriorGroup = new THREE.Group();
  const seatFabricMat = new THREE.MeshStandardMaterial({
    color: 0xC85A17, // Warm Terracotta/Saffron Luxury Recliner Upholstery
    roughness: 0.65
  });
  const headrestMat = new THREE.MeshStandardMaterial({
    color: 0xFBF9F5,
    roughness: 0.5
  });

  // 10 Rows of 2x2 Recliner Seats inside the Upper Cabin
  const cushionGeo = new THREE.BoxGeometry(0.42, 0.55, 0.46);
  const headrestGeo = new THREE.BoxGeometry(0.32, 0.22, 0.42);
  for (let r = 0; r < 10; r++) {
    const rowX = 3.6 - r * 0.82;
    [-0.92, -0.42, 0.42, 0.92].forEach((seatZ) => {
      const seatBack = new THREE.Mesh(cushionGeo, seatFabricMat);
      seatBack.position.set(rowX, 0.68, seatZ);
      seatBack.rotation.z = 0.14;
      cabinInteriorGroup.add(seatBack);

      const head = new THREE.Mesh(headrestGeo, headrestMat);
      head.position.set(rowX - 0.04, 1.02, seatZ);
      cabinInteriorGroup.add(head);
    });
  }

  // Driver Cockpit Dashboard & Steering Wheel (+X Front)
  const dashMesh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.48, 2.35), blackPillarTrimMat);
  dashMesh.position.set(4.85, 0.45, 0);
  cabinInteriorGroup.add(dashMesh);

  // Warm Interior Ceiling Ambient Light Strip
  const cabinGlowStrip = new THREE.Mesh(
    new THREE.BoxGeometry(9.2, 0.05, 0.8),
    new THREE.MeshBasicMaterial({ color: 0xFFE0B2 })
  );
  cabinGlowStrip.position.set(-0.2, 1.48, 0);
  cabinInteriorGroup.add(cabinGlowStrip);
  vehicleGroup.add(cabinInteriorGroup);

  // 3C. Transparent Panoramic Glass Greenhouse & 3D Structural Window Mullions
  const glassHouseGeo = THREE.RoundedBoxGeometry
    ? new THREE.RoundedBoxGeometry(10.42, 1.30, 2.64, 6, 0.3)
    : new THREE.BoxGeometry(10.42, 1.30, 2.64);
  const glassHouse = new THREE.Mesh(glassHouseGeo, realGlassMat);
  glassHouse.position.set(-0.04, 0.92, 0);
  vehicleGroup.add(glassHouse);

  // 3D Glossy Black Window Pillars & Entry Door Frame
  const pillarMullionGeo = new THREE.BoxGeometry(0.14, 1.32, 2.67);
  for (let m = -4.2; m <= 4.2; m += 1.4) {
    const mullion = new THREE.Mesh(pillarMullionGeo, blackPillarTrimMat);
    mullion.position.set(m, 0.92, 0);
    vehicleGroup.add(mullion);
  }

  // Curved Aerodynamic Roof Crown (Extruded Rounded Profile) & Integrated AC Unit
  const roofCapGeo = new THREE.CylinderGeometry(1.34, 1.34, 10.58, 32, 1, false, 0, Math.PI);
  roofCapGeo.rotateZ(Math.PI / 2);
  const roofCap = new THREE.Mesh(roofCapGeo, pearlClearcoatMat);
  roofCap.scale.set(1, 0.24, 1);
  roofCap.position.set(0, 1.56, 0);
  vehicleGroup.add(roofCap);

  const acUnitGeo = new THREE.BoxGeometry(4.8, 0.28, 1.88);
  const acUnit = new THREE.Mesh(acUnitGeo, pearlClearcoatMat);
  acUnit.position.set(-0.35, 1.82, 0);
  vehicleGroup.add(acUnit);

  // Curved Aerodynamic Front Windshield & Dual 3D Windshield Wipers (+X Front)
  const frontWindshieldGeo = new THREE.CylinderGeometry(1.33, 1.34, 1.42, 32, 1, false, -Math.PI / 2.2, Math.PI / 1.1);
  const frontWindshield = new THREE.Mesh(frontWindshieldGeo, realGlassMat);
  frontWindshield.scale.set(0.32, 1, 1);
  frontWindshield.position.set(5.12, 0.88, 0);
  vehicleGroup.add(frontWindshield);

  // Dual 3D Windshield Wipers
  const wiperGeo = new THREE.BoxGeometry(0.06, 0.68, 0.05);
  [-0.45, 0.45].forEach((zWiper) => {
    const wiper = new THREE.Mesh(wiperGeo, blackPillarTrimMat);
    wiper.position.set(5.52, 0.48, zWiper);
    wiper.rotation.x = 0.65;
    vehicleGroup.add(wiper);
  });

  // Glowing Saffron-Orange LED Edge Strip Under Windows & Front Windshield
  const sideLedGeo = new THREE.BoxGeometry(10.66, 0.055, 2.71);
  const sideLed = new THREE.Mesh(sideLedGeo, saffronLedMat);
  sideLed.position.set(0, 0.28, 0);
  vehicleGroup.add(sideLed);

  // 3D Triple Projector Headlight Bezels & Glowing Lenses (+X Front)
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    emissive: 0xFFF3D1,
    emissiveIntensity: 4.0
  });
  const bezelGeo = new THREE.BoxGeometry(0.22, 0.26, 0.62);
  const lensGeo = new THREE.SphereGeometry(0.075, 16, 16);

  [0.96, -0.96].forEach((zSide) => {
    const bezel = new THREE.Mesh(bezelGeo, blackPillarTrimMat);
    bezel.position.set(5.26, -0.56, zSide);
    vehicleGroup.add(bezel);

    // 3 individual projector bulbs inside each headlight housing (Matches your photo!)
    [-0.18, 0, 0.18].forEach((zOffset) => {
      const bulb = new THREE.Mesh(lensGeo, lensMat);
      bulb.position.set(5.36, -0.56, zSide + zOffset);
      vehicleGroup.add(bulb);
    });
  });

  // Sculpted 3D Gullwing Coach Mirrors (White & Saffron-Orange Tips)
  const mirrorArmGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.68, 16);
  mirrorArmGeo.rotateX(Math.PI / 2);
  const mirrorHousingGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.72, 20);
  const mirrorTipGeo = new THREE.SphereGeometry(0.125, 20, 20);

  [1, -1].forEach((dir) => {
    const arm = new THREE.Mesh(mirrorArmGeo, pearlClearcoatMat);
    arm.position.set(5.18, 1.22, dir * 1.46);
    vehicleGroup.add(arm);

    const housing = new THREE.Mesh(mirrorHousingGeo, pearlClearcoatMat);
    housing.position.set(5.48, 0.90, dir * 1.72);
    vehicleGroup.add(housing);

    const orangeCap = new THREE.Mesh(mirrorTipGeo, saffronLedMat);
    orangeCap.position.set(5.48, 0.52, dir * 1.72);
    vehicleGroup.add(orangeCap);
  });

  // 3D Deep-Dish Multi-Axle Alcoa Chrome Wheels (6 Wheels with Lug Nuts & Brake Rotors)
  const tireWallGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.48, 36);
  tireWallGeo.rotateX(Math.PI / 2);
  const tireShoulderGeo = new THREE.TorusGeometry(0.60, 0.11, 16, 36);
  const deepRimGeo = new THREE.CylinderGeometry(0.43, 0.36, 0.50, 28);
  deepRimGeo.rotateX(Math.PI / 2);
  const centerHubGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.54, 20);
  centerHubGeo.rotateX(Math.PI / 2);
  const lugBoltGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.52, 8);
  lugBoltGeo.rotateX(Math.PI / 2);

  wheelPositionsX.forEach((xPos) => {
    [-1.30, 1.30].forEach((zPos) => {
      const wheelUnit = new THREE.Group();
      wheelUnit.add(new THREE.Mesh(tireWallGeo, tireRubberMat));

      // Rounded 3D Tire Sidewall Shoulders
      const outerShoulder = new THREE.Mesh(tireShoulderGeo, tireRubberMat);
      outerShoulder.position.z = 0.18;
      wheelUnit.add(outerShoulder);

      const innerShoulder = new THREE.Mesh(tireShoulderGeo, tireRubberMat);
      innerShoulder.position.z = -0.18;
      wheelUnit.add(innerShoulder);

      // Polished Chrome Rim & Center Axle Cap
      wheelUnit.add(new THREE.Mesh(deepRimGeo, chromeMat));
      wheelUnit.add(new THREE.Mesh(centerHubGeo, saffronLedMat));

      // 8 Chrome Lug Bolts Circle
      for (let b = 0; b < 8; b++) {
        const ang = (b * Math.PI * 2) / 8;
        const bolt = new THREE.Mesh(lugBoltGeo, chromeMat);
        bolt.position.set(Math.cos(ang) * 0.28, Math.sin(ang) * 0.28, 0);
        wheelUnit.add(bolt);
      }

      wheelUnit.position.set(xPos, -1.18, zPos);
      wheelUnit.castShadow = true;
      vehicleGroup.add(wheelUnit);
      busWheels.push(wheelUnit);
    });
  });

  // Initial Hero Angle (Matches the 3/4 Golden-Hour perspective of your attached bus photo!)
  vehicleGroup.position.set(0, 0.15, 4.2);
  vehicleGroup.rotation.set(0.12, -0.56, -0.05);
  scene.add(vehicleGroup);

  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  loadRealisticCoach(envMap);
  setupGsapScrollChoreography();
  animateThreeJsLoop();
}

// REALISTIC COACH (optional): loads bus.glb if it is next to index.html.
// If the file is missing or fails to load, the built-in coach stays visible.
// Set FRONT_FLIP to true if the model's front faces away from the camera.
const FRONT_FLIP = false;
function loadRealisticCoach(envMap) {
  if (typeof THREE.GLTFLoader === "undefined" || !vehicleGroup) return;
  new THREE.GLTFLoader().load("bus.glb", (gltf) => {
    const model = gltf.scene;

    // Lay the coach along the X axis (our coach faces +X)
    const first = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
    if (first.z > first.x) model.rotation.y = Math.PI / 2;
    if (FRONT_FLIP) model.rotation.y += Math.PI;
    model.updateMatrixWorld(true);

    // Match the original coach length (10.6) and center it on the origin
    const sized = new THREE.Box3().setFromObject(model);
    const size = sized.getSize(new THREE.Vector3());
    model.scale.setScalar(10.6 / size.x);
    model.updateMatrixWorld(true);
    const centered = new THREE.Box3().setFromObject(model);
    model.position.sub(centered.getCenter(new THREE.Vector3()));

    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.material) {
          o.material.envMap = envMap;
          o.material.envMapIntensity = 1.0;
          o.material.needsUpdate = true;
        }
      }
    });

    // Swap out the built-in coach for the real model
    vehicleGroup.children.forEach((c) => (c.visible = false));
    vehicleGroup.add(model);
  }, undefined, () => {
    console.info("bus.glb not found. Using the built-in coach.");
  });
}

function setupGsapScrollChoreography() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.create({
    trigger: "#heroScrollTrack",
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
    onUpdate: (self) => {
      const p = self.progress;
      const pct = Math.min(100, Math.round(18 + p * 82));
      const readout = document.getElementById("bottomTelemetryReadout");
      if (readout) readout.innerHTML = `REFINING IMAGERY &nbsp; ${pct}%`;

      const topBanner = document.getElementById("heroGiantWordmark");
      const centerMonument = document.getElementById("heroCenterMonument");
      if (topBanner) {
        topBanner.style.opacity = String(Math.max(0, 1 - p * 2.1));
        topBanner.style.transform = `translateY(${-p * 90}px) scale(${1 - p * 0.12})`;
      }
      if (centerMonument) {
        centerMonument.style.transform = `scale(${0.92 + p * 0.16})`;
        centerMonument.style.opacity = String(Math.max(0.18, 1 - Math.max(0, (p - 0.7) * 2.5)));
      }

      if (vehicleGroup) {
        if (p < 0.5) {
          // 3/4 Golden-Hour Photo Angle -> Full Side Profile showing "BHARAT BUS" + Ashoka Chakra
          const t = p / 0.5;
          stepTargetRotY = -0.56 * (1 - t) + 0.0 * t;
          stepTargetRotX = 0.14 * (1 - t) + 0.04 * t;
          vehicleGroup.rotation.z = -0.05 * (1 - t);
          vehicleGroup.position.z = 4.2 + t * 1.1;
        } else {
          // Full Side Profile -> Front Fascia showing "BHARAT BUS" & "BB-7869" plate
          const t = (p - 0.5) / 0.5;
          stepTargetRotY = (-Math.PI / 2) * t;
          stepTargetRotX = 0.04 * (1 - t) + 0.08 * t;
          vehicleGroup.rotation.z = 0;
          vehicleGroup.position.z = 5.3 - t * 1.5;
        }
      }
    }
  });
}

function animateThreeJsLoop() {
  requestAnimationFrame(animateThreeJsLoop);

  for (let i = 0; i < busWheels.length; i++) {
    busWheels[i].rotation.z -= 0.045;
  }

  if (vehicleGroup) {
    const targetY = stepTargetRotY + mouseX * 0.14;
    const targetX = stepTargetRotX + mouseY * 0.08;
    vehicleGroup.rotation.y += (targetY - vehicleGroup.rotation.y) * 0.06;
    vehicleGroup.rotation.x += (targetX - vehicleGroup.rotation.x) * 0.06;
  }

  if (gantryRingGroup) {
    gantryRingGroup.rotation.y += 0.0015;
  }

  renderer.render(scene, camera);
}

function scrollToReservationConsole() {
  const el = document.getElementById("reservationConsoleAnchor");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function scrollToConsoleAndSwitchPassenger() {
  switchToPassengerPortal();
  scrollToReservationConsole();
}

function jumpToStepFromNav(stepNo) {
  switchToPassengerPortal();
  goToStep(stepNo);
  scrollToReservationConsole();
}

// ============================================================================
// PART B: ALL-INDIA BUS RESERVATION, 5-MIN TIMER, WALLET & ADMIN LOGIC
// ============================================================================
const INDIA_CITIES = [
  "Chennai, Tamil Nadu", "Madurai, Tamil Nadu", "Coimbatore, Tamil Nadu",
  "Tiruchirappalli, Tamil Nadu", "Tirunelveli, Tamil Nadu", "Salem, Tamil Nadu",
  "Bengaluru, Karnataka", "Mysuru, Karnataka", "Mangaluru, Karnataka",
  "Kochi, Kerala", "Thiruvananthapuram, Kerala", "Kozhikode, Kerala",
  "Hyderabad, Telangana", "Warangal, Telangana", "Visakhapatnam, Andhra Pradesh",
  "Vijayawada, Andhra Pradesh", "Tirupati, Andhra Pradesh",
  "Mumbai, Maharashtra", "Pune, Maharashtra", "Nagpur, Maharashtra",
  "New Delhi, Delhi", "Jaipur, Rajasthan", "Ahmedabad, Gujarat",
  "Kolkata, West Bengal", "Bhubaneswar, Odisha", "Guwahati, Assam"
];

const BUS_OPERATORS_POOL = [
  { name: "SETC Ultra Deluxe (TNSTC)", type: "2+2 Executive Seater/Sleeper", baseFare: 550 },
  { name: "KPN Travels", type: "Volvo Multi-Axle AC Sleeper", baseFare: 890 },
  { name: "Parveen Travels", type: "Mercedes-Benz AC Sleeper", baseFare: 820 },
  { name: "SRM Transports", type: "Scania AC Multi-Axle", baseFare: 860 },
  { name: "KSRTC Airavat Club Class", type: "Volvo 9600 AC Seater", baseFare: 920 },
  { name: "VRL Travels", type: "AC Sleeper Coach", baseFare: 780 },
  { name: "Kallada Travels (Suresh Kallada)", type: "BharatBenz AC Sleeper", baseFare: 950 },
  { name: "TSRTC Garuda Plus", type: "Luxury AC Coach", baseFare: 800 },
  { name: "MSRTC Shivneri Royale", type: "Volvo AC Seater", baseFare: 740 },
  { name: "IntrCity SmartBus", type: "AC Lounge Sleeper", baseFare: 880 },
  { name: "Zingbus Maxx", type: "Premium AC Seater/Sleeper", baseFare: 840 },
  { name: "NueGo Electric Coach", type: "Zero-Emission AC Seater", baseFare: 760 }
];

const AVAILABLE = 0;
const RESERVED = 1;
const LOCKED_5MIN = 2;

let passengers = [];
let activePassengerId = null;
let currentStep = 1;
let isAdminAuthenticated = false;

let currentFromCity = "Chennai, Tamil Nadu";
let currentToCity = "Madurai, Tamil Nadu";
let busesByRouteKey = {};
let selectedBusId = null;
let selectedSeatNo = 1;
let pendingCancelContext = null;

function initApp() {
  initThreeJsHangar();

  const datalist = document.getElementById("indiaCitiesList");
  datalist.innerHTML = INDIA_CITIES.map(c => `<option value="${c}"></option>`).join("");

  ensureRouteBusesLoaded(currentFromCity, currentToCity);
  setInterval(tickFiveMinuteTimers, 1000);
}

function hashRouteString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) % 100000;
  }
  return h;
}

function ensureRouteBusesLoaded(fromCity, toCity) {
  const key = `${fromCity.trim()}__${toCity.trim()}`;
  if (busesByRouteKey[key]) return busesByRouteKey[key];

  const hash = hashRouteString(key);
  const timings = ["06:30 AM", "02:15 PM", "07:00 PM", "10:30 PM"];
  const buses = timings.map((time, idx) => {
    const op = BUS_OPERATORS_POOL[(hash + idx * 3) % BUS_OPERATORS_POOL.length];
    const fare = op.baseFare + ((hash + idx * 40) % 250);
    const seats = {};
    for (let s = 1; s <= 40; s++) {
      seats[s] = {
        status: AVAILABLE,
        holderId: null,
        holderName: null,
        remainingSeconds: 0,
        pnr: null,
        farePaid: 0,
        waitlist: []
      };
    }
    return {
      busId: `BUS-${hash % 900 + 100}-${idx + 1}`,
      operatorName: op.name,
      coachType: op.type,
      fromCity,
      toCity,
      departureTime: time,
      fare,
      seats
    };
  });

  busesByRouteKey[key] = buses;
  if (!selectedBusId) selectedBusId = buses[0].busId;
  return buses;
}

function getCurrentRouteBuses() {
  return ensureRouteBusesLoaded(currentFromCity, currentToCity);
}

function findBusById(busId) {
  for (const key of Object.keys(busesByRouteKey)) {
    const found = busesByRouteKey[key].find(b => b.busId === busId);
    if (found) return found;
  }
  return null;
}

function getActivePassenger() {
  return passengers.find(p => p.id === activePassengerId) || null;
}

function getPassengerById(id) {
  return passengers.find(p => p.id === id) || null;
}

function goToStep(stepNumber) {
  if (stepNumber >= 2 && passengers.length === 0) {
    alert("Please register a passenger account first on Step 1.");
    return;
  }
  if (stepNumber >= 3 && !getActivePassenger()) {
    alert("Please sign in with your registered passenger profile on Step 2.");
    return;
  }

  currentStep = stepNumber;
  for (let i = 1; i <= 6; i++) {
    const page = document.getElementById(`stepPage${i}`);
    const btn = document.getElementById(`stepBtn${i}`);
    if (page) page.classList.toggle("hidden", i !== stepNumber);
    if (btn) btn.classList.toggle("active-step", i === stepNumber);
  }

  const activeCard = document.getElementById(`stepPage${stepNumber}`);
  if (activeCard && typeof gsap !== "undefined") {
    gsap.fromTo(activeCard, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" });
  }

  const stepAngles = {
    1: { y: -0.56, x: 0.14 },
    2: { y: 0.0, x: 0.05 },
    3: { y: -0.75, x: 0.12 },
    4: { y: -1.57, x: 0.10 },
    5: { y: -0.35, x: 0.16 },
    6: { y: 0.0, x: 0.0 }
  };
  if (stepAngles[stepNumber]) {
    stepTargetRotY = stepAngles[stepNumber].y;
    stepTargetRotX = stepAngles[stepNumber].x;
  }

  if (stepNumber === 1) {
    document.getElementById("alreadyRegisteredBar").classList.toggle("hidden", passengers.length === 0);
  } else if (stepNumber === 2) {
    renderLoginPage();
  } else if (stepNumber === 3) {
    renderRouteBusesPage();
  } else if (stepNumber === 4) {
    renderSeatSelectionPage();
  } else if (stepNumber === 5) {
    renderPaymentPortalPage();
  } else if (stepNumber === 6) {
    renderConfirmationPage();
  }
  syncHeaderBar();
}

function syncHeaderBar() {
  const p = getActivePassenger();
  const pill = document.getElementById("activeUserHeaderPill");
  if (p) {
    pill.classList.remove("hidden");
    pill.classList.add("flex");
    document.getElementById("headerPassengerName").textContent = p.name;
    document.getElementById("headerWalletBalance").textContent = `₹${p.walletBalance}`;
  } else {
    pill.classList.add("hidden");
  }
}

function handlePassengerRegister(e) {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const initialWallet = Math.max(0, parseInt(document.getElementById("regWallet").value || "0", 10));

  const newPassenger = {
    id: `P${passengers.length + 1}`,
    name,
    email,
    phone,
    walletId: `WLT-${100 + passengers.length + 1}`,
    walletBalance: initialWallet
  };

  passengers.push(newPassenger);
  activePassengerId = newPassenger.id;

  document.getElementById("regName").value = "";
  document.getElementById("regEmail").value = "";
  document.getElementById("regPhone").value = "";

  goToStep(2);
}

function renderLoginPage() {
  const select = document.getElementById("loginPassengerSelect");
  select.innerHTML = passengers.map(p =>
    `<option value="${p.id}" ${p.id === activePassengerId ? "selected" : ""}>
      [${p.id}] ${p.name.toUpperCase()} — ${p.phone} — WALLET: ₹${p.walletBalance}
    </option>`
  ).join("");
  renderLoginPreviewCard();
}

function renderLoginPreviewCard() {
  const selectedId = document.getElementById("loginPassengerSelect").value;
  const p = getPassengerById(selectedId);
  if (!p) return;

  document.getElementById("loginProfileCard").innerHTML = `
    <div class="flex justify-between border-b border-sandstone/15 pb-1.5"><span class="text-sandstone/60">PASSENGER NAME:</span><strong class="text-ivory uppercase">${p.name}</strong></div>
    <div class="flex justify-between border-b border-sandstone/15 pb-1.5"><span class="text-sandstone/60">EMAIL ID:</span><span class="text-ivory">${p.email}</span></div>
    <div class="flex justify-between border-b border-sandstone/15 pb-1.5"><span class="text-sandstone/60">MOBILE NO:</span><span class="text-ivory">${p.phone}</span></div>
    <div class="flex justify-between pt-1"><span class="text-goldhour">DUMMY WALLET (${p.walletId}):</span><strong class="text-emerald-300 text-sm">₹${p.walletBalance}</strong></div>
  `;
}

function handlePassengerLogin() {
  const selectedId = document.getElementById("loginPassengerSelect").value;
  activePassengerId = selectedId;
  syncHeaderBar();
  goToStep(3);
}

function swapCities() {
  const fromInput = document.getElementById("fromCityInput");
  const toInput = document.getElementById("toCityInput");
  const temp = fromInput.value;
  fromInput.value = toInput.value;
  toInput.value = temp;
  searchRouteBuses();
}

function searchRouteBuses() {
  const fromVal = document.getElementById("fromCityInput").value.trim();
  const toVal = document.getElementById("toCityInput").value.trim();
  if (!fromVal || !toVal || fromVal.toLowerCase() === toVal.toLowerCase()) {
    alert("Please choose valid and distinct Boarding and Arrival cities.");
    return;
  }
  currentFromCity = fromVal;
  currentToCity = toVal;
  const buses = ensureRouteBusesLoaded(currentFromCity, currentToCity);
  selectedBusId = buses[0].busId;
  renderRouteBusesPage();
}

function renderRouteBusesPage() {
  const buses = getCurrentRouteBuses();
  const container = document.getElementById("busListContainer");

  container.innerHTML = buses.map(bus => {
    let freeCount = 0;
    for (let s = 1; s <= 40; s++) {
      if (bus.seats[s].status === AVAILABLE) freeCount++;
    }
    return `
      <div class="p-5 bg-espresso/90 border border-sandstone/30 hover:border-saffron transition flex flex-col justify-between gap-4">
        <div>
          <div class="flex items-center justify-between font-mono text-xs border-b border-sandstone/15 pb-2 mb-2">
            <span class="text-goldhour font-bold">${bus.departureTime}</span>
            <span class="text-lg font-extrabold text-ivory">₹${bus.fare}</span>
          </div>
          <h4 class="font-display text-2xl uppercase tracking-wide text-ivory">${bus.operatorName}</h4>
          <p class="font-mono text-[11px] text-sandstone/75 uppercase">${bus.coachType}</p>
          <p class="font-mono text-[11px] text-goldhour mt-1.5">${bus.fromCity} → ${bus.toCity}</p>
        </div>
        <div class="flex items-center justify-between pt-3 border-t border-sandstone/20 font-mono">
          <span class="text-xs text-sandstone/85">${freeCount} / 40 SEATS AVAILABLE</span>
          <button onclick="selectBusAndProceed('${bus.busId}')" class="bharat-cta-btn px-4 py-2">
            SELECT BUS & SEATS →
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function selectBusAndProceed(busId) {
  selectedBusId = busId;
  const bus = findBusById(busId);
  if (bus && sideLiveryMatRef) {
    sideLiveryMatRef.map = createBharatBusSideLiveryTexture(bus.operatorName);
    sideLiveryMatRef.needsUpdate = true;
  }
  goToStep(4);
}

function renderSeatSelectionPage() {
  const bus = findBusById(selectedBusId) || getCurrentRouteBuses()[0];
  if (!bus) return;

  document.getElementById("seatPageBusTitle").textContent = `${bus.operatorName} (${bus.departureTime})`;
  document.getElementById("seatPageRouteSubtitle").textContent = `${bus.fromCity} → ${bus.toCity} • FARE: ₹${bus.fare}`;

  const grid = document.getElementById("seatGridContainer");
  let rowsHtml = "";

  for (let row = 0; row < 10; row++) {
    let colsHtml = "";
    for (let col = 1; col <= 4; col++) {
      const seatNo = row * 4 + col;
      const seatObj = bus.seats[seatNo];
      let colorClass = "bg-emerald-500/20 border-emerald-400 text-emerald-200 hover:bg-emerald-400 hover:text-espresso";
      let label = `${String(seatNo).padStart(2, "0")}:FREE`;

      if (seatObj.status === LOCKED_5MIN) {
        colorClass = "bg-saffron/30 border-saffron text-ivory animate-pulse";
        label = `${String(seatNo).padStart(2, "0")}:LOCK`;
      } else if (seatObj.status === RESERVED) {
        colorClass = "bg-ivory text-espresso border-ivory font-extrabold";
        label = `${String(seatNo).padStart(2, "0")}:BOOK`;
      }

      const ringClass = (seatNo === selectedSeatNo) ? "ring-2 ring-saffron" : "";
      colsHtml += `
        <button onclick="inspectSeat(${seatNo})" class="px-2.5 py-2 border font-mono text-xs font-bold transition ${colorClass} ${ringClass}">
          ${label}
        </button>
      `;
      if (col === 2) {
        colsHtml += `<span class="font-mono text-sandstone/40 text-[10px] px-1">||</span>`;
      }
    }
    rowsHtml += `<div class="flex items-center justify-between gap-2">${colsHtml}</div>`;
  }

  grid.innerHTML = rowsHtml;
  renderSelectedSeatSidebar(bus, selectedSeatNo);
}

function inspectSeat(seatNo) {
  selectedSeatNo = seatNo;
  renderSeatSelectionPage();
}

function renderSelectedSeatSidebar(bus, seatNo) {
  const seat = bus.seats[seatNo];
  const p = getActivePassenger();
  const box = document.getElementById("selectedSeatActionBox");

  const waitlistText = seat.waitlist.length === 0
    ? "EMPTY"
    : seat.waitlist.map((w, idx) => `#${idx + 1} ${w.passengerName}`).join(" → ");

  if (seat.status === AVAILABLE) {
    box.innerHTML = `
      <h3 class="font-display text-3xl uppercase text-ivory mb-1">SEAT #${seatNo} — AVAILABLE</h3>
      <p class="font-mono text-xs text-sandstone/80 mb-5">PASSENGER: <strong>${p.name}</strong> • FARE: <strong class="text-goldhour">₹${bus.fare}</strong></p>
      <button onclick="lockSeatForFiveMinutes('${bus.busId}', ${seatNo})" class="bharat-cta-btn w-full py-3.5">
        LOCK SEAT #${seatNo} (START 05:00 TIMER) →
      </button>
    `;
  } else {
    const isHolder = p && seat.holderId === p.id;
    box.innerHTML = `
      <h3 class="font-display text-3xl uppercase text-ivory mb-1">SEAT #${seatNo} — ${seat.status === LOCKED_5MIN ? "5-MIN LOCK" : "CONFIRMED"}</h3>
      <p class="font-mono text-xs text-sandstone/85 mb-1">CURRENT HOLDER: <strong>${seat.holderName}</strong></p>
      ${seat.status === LOCKED_5MIN ? `<p class="font-mono text-xs text-goldhour font-bold mb-2">REMAINING TIMER: ${formatMMSS(seat.remainingSeconds)}</p>` : ""}
      <p class="font-mono text-xs text-sandstone/75 mb-5">FCFS WAITING LIST: <span class="text-goldhour font-bold">${waitlistText}</span></p>

      ${isHolder && seat.status === LOCKED_5MIN ? `
        <button onclick="goToStep(5)" class="bharat-cta-btn w-full py-3.5 mb-2">
          GO TO 5-MINUTE PAYMENT PORTAL →
        </button>
      ` : `
        <button onclick="joinSeatWaitlist('${bus.busId}', ${seatNo})" class="bharat-cta-btn w-full py-3.5">
          JOIN FCFS WAITING LIST AS ${p ? p.name.toUpperCase() : "PASSENGER"}
        </button>
      `}
    `;
  }
}

function lockSeatForFiveMinutes(busId, seatNo) {
  const bus = findBusById(busId);
  const p = getActivePassenger();
  if (!bus || !p) return;

  const seat = bus.seats[seatNo];
  if (seat.status !== AVAILABLE) {
    joinSeatWaitlist(busId, seatNo);
    return;
  }

  seat.status = LOCKED_5MIN;
  seat.holderId = p.id;
  seat.holderName = p.name;
  seat.remainingSeconds = 300;
  selectedBusId = busId;
  selectedSeatNo = seatNo;

  goToStep(5);
}

function joinSeatWaitlist(busId, seatNo) {
  const bus = findBusById(busId);
  const p = getActivePassenger();
  if (!bus || !p) return;

  const seat = bus.seats[seatNo];
  if (seat.holderId === p.id || seat.waitlist.some(w => w.passengerId === p.id)) {
    alert(`${p.name} is already holding or waitlisted for Seat #${seatNo}.`);
    return;
  }

  seat.waitlist.push({ passengerId: p.id, passengerName: p.name });
  alert(`${p.name} added to FCFS Waiting List for Seat #${seatNo} (Position #${seat.waitlist.length}).`);
  renderSeatSelectionPage();
}

function tickFiveMinuteTimers() {
  let needsRefresh = false;

  for (const key of Object.keys(busesByRouteKey)) {
    for (const bus of busesByRouteKey[key]) {
      for (let s = 1; s <= 40; s++) {
        const seat = bus.seats[s];
        if (seat.status === LOCKED_5MIN && seat.remainingSeconds > 0) {
          seat.remainingSeconds--;
          needsRefresh = true;

          if (seat.remainingSeconds <= 0) {
            handleSeatLockExpired(bus, s);
          }
        }
      }
    }
  }

  if (needsRefresh) {
    if (currentStep === 4) renderSeatSelectionPage();
    if (currentStep === 5) renderPaymentPortalPage();
    if (!document.getElementById("adminPortalSection").classList.contains("hidden")) {
      renderAdminDashboard();
    }
  }
}

function handleSeatLockExpired(bus, seatNo) {
  const seat = bus.seats[seatNo];
  const expiredHolder = seat.holderName;

  if (seat.waitlist.length > 0) {
    const nextInLine = seat.waitlist.shift();
    seat.status = LOCKED_5MIN;
    seat.holderId = nextInLine.passengerId;
    seat.holderName = nextInLine.passengerName;
    seat.remainingSeconds = 300;
    activePassengerId = nextInLine.passengerId;
    syncHeaderBar();
    alert(`5-Minute timer expired for ${expiredHolder}! Seat #${seatNo} is now automatically locked for 5 minutes for the next passenger in the FCFS Waiting List: ${nextInLine.passengerName}.`);
  } else {
    seat.status = AVAILABLE;
    seat.holderId = null;
    seat.holderName = null;
    seat.remainingSeconds = 0;
    alert(`5-Minute payment timer expired for ${expiredHolder}. Seat #${seatNo} is now AVAILABLE.`);
  }
}

function formatMMSS(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function renderPaymentPortalPage() {
  const bus = findBusById(selectedBusId);
  const p = getActivePassenger();
  if (!bus || !p) return;

  document.getElementById("paymentWalletSummary").textContent = `${p.name} (${p.walletId}) — BALANCE: ₹${p.walletBalance}`;
  const seat = bus.seats[selectedSeatNo];
  const container = document.getElementById("paymentPortalContent");

  if (seat.status === LOCKED_5MIN) {
    const waitlistStr = seat.waitlist.length > 0
      ? seat.waitlist.map((w, i) => `#${i + 1} ${w.passengerName}`).join(", ")
      : "No passengers waiting";

    container.innerHTML = `
      <div class="p-5 bg-espresso/95 border-2 border-saffron space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-sandstone/20 pb-3">
          <div>
            <span class="font-mono text-[10px] uppercase font-bold text-goldhour">ACTIVE 5-MINUTE SEAT LOCK</span>
            <h3 class="font-display text-3xl uppercase text-ivory">${bus.operatorName} — SEAT #${selectedSeatNo}</h3>
            <p class="font-mono text-xs text-sandstone/80">${bus.fromCity} → ${bus.toCity} (${bus.departureTime})</p>
          </div>
          <div class="text-right font-mono">
            <span class="text-[10px] text-sandstone/60 uppercase block">PAYMENT TIMER</span>
            <span class="text-4xl font-extrabold text-goldhour">${formatMMSS(seat.remainingSeconds)}</span>
          </div>
        </div>

        <div class="font-mono text-xs text-ivory/90 bg-asphalt p-3.5 border border-sandstone/25 space-y-1.5">
          <div>LOCKED FOR PASSENGER: <strong class="text-ivory uppercase">${seat.holderName}</strong></div>
          <div>TICKET FARE PAYABLE: <strong class="text-emerald-300">₹${bus.fare}</strong></div>
          <div>FCFS WAITING LIST QUEUE: <strong class="text-goldhour">${waitlistStr}</strong></div>
        </div>

        <div class="flex flex-wrap gap-3">
          <button onclick="completeWalletPayment('${bus.busId}', ${selectedSeatNo})" class="bharat-cta-btn flex-1 py-3.5 px-4">
            PAY ₹${bus.fare} FROM DUMMY WALLET & CONFIRM →
          </button>
          <button onclick="expireTimerNowDemo('${bus.busId}', ${selectedSeatNo})" class="py-3.5 px-4 bg-rose-600 hover:bg-ivory text-ivory hover:text-espresso font-mono font-bold text-xs uppercase tracking-widest transition">
            DEMO: EXPIRE 5M TIMER (TEST FCFS)
          </button>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="p-4 bg-espresso/90 border border-sandstone/25 font-mono text-xs text-sandstone/80">
        No active 5-minute lock on Seat #${selectedSeatNo}. Return to Step 4 to select and lock an available seat.
      </div>
    `;
  }
}

function topUpActivePassengerWallet() {
  const p = getActivePassenger();
  if (!p) return;
  const amount = parseInt(document.getElementById("customTopupInput").value || "0", 10);
  if (amount <= 0) return;

  p.walletBalance += amount;
  syncHeaderBar();
  renderPaymentPortalPage();
}

function expireTimerNowDemo(busId, seatNo) {
  const bus = findBusById(busId);
  if (!bus) return;
  bus.seats[seatNo].remainingSeconds = 1;
  tickFiveMinuteTimers();
}

function completeWalletPayment(busId, seatNo) {
  const bus = findBusById(busId);
  if (!bus) return;
  const seat = bus.seats[seatNo];
  const holder = getPassengerById(seat.holderId);
  if (!holder) return;

  if (holder.walletBalance < bus.fare) {
    alert(`Insufficient Dummy Wallet balance for ${holder.name} (Balance: ₹${holder.walletBalance}, Fare: ₹${bus.fare}). Please add funds below.`);
    return;
  }

  holder.walletBalance -= bus.fare;
  seat.status = RESERVED;
  seat.remainingSeconds = 0;
  seat.farePaid = bus.fare;
  seat.pnr = `PNR-${Math.floor(100000 + Math.random() * 900000)}`;

  activePassengerId = holder.id;
  syncHeaderBar();
  goToStep(6);
}

function renderConfirmationPage() {
  const bus = findBusById(selectedBusId);
  const p = getActivePassenger();
  const box = document.getElementById("confirmationDetailsBox");
  if (!bus || !p) return;

  const seat = bus.seats[selectedSeatNo];

  box.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-sandstone/25">
      <div>
        <span class="px-2.5 py-1 bg-emerald-500/20 border border-emerald-400 font-mono text-[11px] font-bold text-emerald-300 uppercase">
          BOOKING CONFIRMED
        </span>
        <h2 class="font-display text-4xl uppercase tracking-wide text-ivory mt-2">
          E-TICKET & RESERVATION MANIFEST
        </h2>
      </div>
      <div class="text-right font-mono">
        <span class="text-[10px] text-sandstone/60 uppercase block">BOOKING REFERENCE</span>
        <span class="text-2xl font-extrabold text-goldhour">${seat.pnr || "CONFIRMED"}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-5 font-mono text-xs bg-espresso/95 p-5 border border-sandstone/30">
      <div><span class="text-sandstone/60 block text-[10px]">PASSENGER NAME</span><strong class="text-ivory text-sm uppercase">${seat.holderName || p.name}</strong></div>
      <div><span class="text-sandstone/60 block text-[10px]">CONTACT DETAILS</span><strong class="text-ivory">${p.phone} • ${p.email}</strong></div>
      <div><span class="text-sandstone/60 block text-[10px]">BUS OPERATOR & TYPE</span><strong class="text-goldhour">${bus.operatorName} (${bus.coachType})</strong></div>
      <div><span class="text-sandstone/60 block text-[10px]">ROUTE & TIMING</span><strong class="text-ivory">${bus.fromCity} → ${bus.toCity} (${bus.departureTime})</strong></div>
      <div><span class="text-sandstone/60 block text-[10px]">CONFIRMED SEAT NO</span><strong class="text-emerald-300 text-sm">SEAT #${selectedSeatNo}</strong></div>
      <div><span class="text-sandstone/60 block text-[10px]">FARE PAID & WALLET LEFT</span><strong class="text-ivory">PAID: ₹${seat.farePaid || bus.fare} | WALLET: ₹${p.walletBalance}</strong></div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex gap-2">
        <button onclick="goToStep(4)" class="bharat-cta-btn px-5 py-2.5">
          + BOOK ANOTHER SEAT
        </button>
        <button onclick="goToStep(3)" class="px-4 py-2.5 border border-sandstone/35 font-mono text-xs uppercase hover:bg-saffron transition">
          CHANGE ROUTE / BUS
        </button>
      </div>

      ${seat.status === RESERVED ? `
        <button onclick="openCancelConfirmationModal('${bus.busId}', ${selectedSeatNo})" class="px-4 py-2.5 bg-rose-600 hover:bg-ivory text-ivory hover:text-espresso font-mono text-xs font-bold uppercase tracking-widest transition">
          CANCEL TICKET (5% FEE)
        </button>
      ` : ""}
    </div>
  `;
}

function openCancelConfirmationModal(busId, seatNo) {
  const bus = findBusById(busId);
  if (!bus) return;
  const seat = bus.seats[seatNo];
  const fare = seat.farePaid || bus.fare;
  const fee = Math.round(fare * 0.05);
  const netRefund = fare - fee;

  pendingCancelContext = { busId, seatNo };

  document.getElementById("cancelFeeBreakdownBox").innerHTML = `
    <div class="flex justify-between"><span>SEAT #${seatNo} TICKET FARE:</span><strong>₹${fare}</strong></div>
    <div class="flex justify-between text-rose-400"><span>CANCELLATION CHARGE (5%):</span><strong>- ₹${fee}</strong></div>
    <div class="flex justify-between text-emerald-300 pt-1.5 border-t border-sandstone/20"><span>NET REFUND TO WALLET (95%):</span><strong>+ ₹${netRefund}</strong></div>
  `;

  const modal = document.getElementById("cancelConfirmModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeCancelModal() {
  const modal = document.getElementById("cancelConfirmModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  pendingCancelContext = null;
}

function confirmCancelWithFivePercentFee() {
  if (!pendingCancelContext) return;
  const { busId, seatNo } = pendingCancelContext;
  const bus = findBusById(busId);
  if (!bus) return;

  const seat = bus.seats[seatNo];
  const holder = getPassengerById(seat.holderId);
  const fare = seat.farePaid || bus.fare;
  const fee = Math.round(fare * 0.05);
  const refund = fare - fee;

  if (holder) {
    holder.walletBalance += refund;
  }

  closeCancelModal();

  if (seat.waitlist.length > 0) {
    const nextInLine = seat.waitlist.shift();
    seat.status = LOCKED_5MIN;
    seat.holderId = nextInLine.passengerId;
    seat.holderName = nextInLine.passengerName;
    seat.remainingSeconds = 300;
    seat.pnr = null;
    seat.farePaid = 0;
    activePassengerId = nextInLine.passengerId;
    syncHeaderBar();
    alert(`Ticket cancelled (₹${fee} 5% fee deducted, ₹${refund} refunded). Seat #${seatNo} is now locked for 5 minutes for waitlisted passenger ${nextInLine.passengerName}!`);
    goToStep(5);
  } else {
    seat.status = AVAILABLE;
    seat.holderId = null;
    seat.holderName = null;
    seat.remainingSeconds = 0;
    seat.pnr = null;
    seat.farePaid = 0;
    syncHeaderBar();
    alert(`Ticket cancelled. ₹${fee} (5% fee) deducted and ₹${refund} refunded to wallet.`);
    goToStep(4);
  }
}

function openAdminLoginModal() {
  if (isAdminAuthenticated) {
    showAdminPortalSection();
    return;
  }
  document.getElementById("adminAuthError").classList.add("hidden");
  const modal = document.getElementById("adminAuthModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeAdminLoginModal() {
  const modal = document.getElementById("adminAuthModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById("adminEmailInput").value.trim();
  const pass = document.getElementById("adminPasswordInput").value;

  if (email === "bharathtrs@bharathmail.in" && pass === "bharath123") {
    isAdminAuthenticated = true;
    closeAdminLoginModal();
    showAdminPortalSection();
  } else {
    document.getElementById("adminAuthError").classList.remove("hidden");
  }
}

function showAdminPortalSection() {
  document.getElementById("passengerPortalSection").classList.add("hidden");
  document.getElementById("adminPortalSection").classList.remove("hidden");
  renderAdminDashboard();
  scrollToReservationConsole();
}

function switchToPassengerPortal() {
  document.getElementById("adminPortalSection").classList.add("hidden");
  document.getElementById("passengerPortalSection").classList.remove("hidden");
}

function logoutAdmin() {
  isAdminAuthenticated = false;
  switchToPassengerPortal();
}

function renderAdminDashboard() {
  const buses = getCurrentRouteBuses();
  const busSelect = document.getElementById("adminBusSelect");
  busSelect.innerHTML = buses.map(b =>
    `<option value="${b.busId}">${b.operatorName} (${b.fromCity} → ${b.toCity}, ${b.departureTime})</option>`
  ).join("");

  const pTable = document.getElementById("adminPassengerTable");
  if (passengers.length === 0) {
    pTable.innerHTML = `<p class="text-sandstone/60">No passengers registered yet.</p>`;
  } else {
    pTable.innerHTML = `
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-sandstone/25 text-goldhour">
            <th class="py-2">ID</th>
            <th class="py-2">PASSENGER NAME</th>
            <th class="py-2">EMAIL & MOBILE</th>
            <th class="py-2">DUMMY WALLET</th>
          </tr>
        </thead>
        <tbody>
          ${passengers.map(p => `
            <tr class="border-b border-sandstone/15">
              <td class="py-2 font-bold text-goldhour">${p.id}</td>
              <td class="py-2 font-bold text-ivory uppercase">${p.name}</td>
              <td class="py-2 text-sandstone/80">${p.email} • ${p.phone}</td>
              <td class="py-2 font-bold text-emerald-300">${p.walletId}: ₹${p.walletBalance}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  const rows = [];
  for (const key of Object.keys(busesByRouteKey)) {
    for (const bus of busesByRouteKey[key]) {
      for (let s = 1; s <= 40; s++) {
        const seat = bus.seats[s];
        if (seat.status !== AVAILABLE || seat.waitlist.length > 0) {
          rows.push({ bus, seatNo: s, seat });
        }
      }
    }
  }

  const mTable = document.getElementById("adminSeatManifestTable");
  if (rows.length === 0) {
    mTable.innerHTML = `<p class="text-sandstone/60">No locked or reserved seats yet.</p>`;
  } else {
    mTable.innerHTML = `
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-sandstone/25 text-goldhour">
            <th class="py-2">BUS & ROUTE</th>
            <th class="py-2">SEAT</th>
            <th class="py-2">STATUS</th>
            <th class="py-2">HOLDER</th>
            <th class="py-2">FCFS WAITLIST</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr class="border-b border-sandstone/15">
              <td class="py-2 text-ivory font-semibold">${r.bus.operatorName} <span class="text-sandstone/60 font-normal">(${r.bus.fromCity} → ${r.bus.toCity})</span></td>
              <td class="py-2 font-bold text-goldhour">Seat #${r.seatNo}</td>
              <td class="py-2">${r.seat.status === RESERVED ? '<span class="text-emerald-300 font-bold">RESERVED (NO TIMER)</span>' : `<span class="text-goldhour font-bold">5M LOCK (${formatMMSS(r.seat.remainingSeconds)})</span>`}</td>
              <td class="py-2 text-ivory">${r.seat.holderName || "-"}</td>
              <td class="py-2 text-goldhour">${r.seat.waitlist.map(w => w.passengerName).join(" → ") || "None"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }
}

function adminLockSeatNoTimer() {
  const busId = document.getElementById("adminBusSelect").value;
  const seatNo = parseInt(document.getElementById("adminSeatInput").value || "1", 10);
  const holder = document.getElementById("adminHolderInput").value.trim() || "Admin VIP Lock";

  const bus = findBusById(busId);
  if (!bus || seatNo < 1 || seatNo > 40) return;

  const seat = bus.seats[seatNo];
  seat.status = RESERVED;
  seat.holderId = "ADMIN";
  seat.holderName = `${holder} (Admin Locked)`;
  seat.remainingSeconds = 0;
  seat.pnr = `ADM-${Math.floor(100000 + Math.random() * 900000)}`;

  renderAdminDashboard();
  alert(`Seat #${seatNo} on ${bus.operatorName} has been permanently locked by Admin without a timer.`);
}

window.addEventListener("DOMContentLoaded", initApp);