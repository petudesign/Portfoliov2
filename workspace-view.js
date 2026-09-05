const enterButton = document.querySelector('.workspace-enter');
const exitButton = document.querySelector('.workspace-exit');
const view = document.querySelector('.workspace-view');
const canvasHost = document.querySelector('.workspace-canvas');
const enterLabel = enterButton.querySelector('span:last-child').innerHTML;

let workspace;
let opening = false;

const loadThree = () => new Promise((resolve, reject) => {
  if (window.THREE) {
    resolve(window.THREE);
    return;
  }
  const script = document.createElement('script');
  script.src = 'assets/three.min.js?v=160.0.0';
  script.onload = () => window.THREE ? resolve(window.THREE) : reject(new Error('Three.js loaded without a global API.'));
  script.onerror = () => reject(new Error('The local Three.js file could not be loaded.'));
  document.head.append(script);
});

const roundedBox = (THREE, width, height, depth, radius, material) => {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 4 });
  geometry.center();
  return new THREE.Mesh(geometry, material);
};

const roundedFootprintBox = (THREE, width, height, depth, radius, material, bevel = 0) => {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const z = -depth / 2;
  shape.moveTo(x + radius, z);
  shape.lineTo(x + width - radius, z);
  shape.quadraticCurveTo(x + width, z, x + width, z + radius);
  shape.lineTo(x + width, z + depth - radius);
  shape.quadraticCurveTo(x + width, z + depth, x + width - radius, z + depth);
  shape.lineTo(x + radius, z + depth);
  shape.quadraticCurveTo(x, z + depth, x, z + depth - radius);
  shape.lineTo(x, z + radius);
  shape.quadraticCurveTo(x, z, x + radius, z);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: bevel > 0,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: bevel > 0 ? 2 : 1,
    curveSegments: 6,
  });
  geometry.center();
  geometry.rotateX(Math.PI / 2);
  return new THREE.Mesh(geometry, material);
};

const namePart = (object, name, parent = '') => {
  object.name = name;
  object.userData.sculptPart = name;
  if (parent) object.userData.explodeWithParent = parent;
  return object;
};

const loadAssetTexture = (THREE, path) => {
  const texture = new THREE.TextureLoader().load(
    path,
    (loaded) => { loaded.needsUpdate = true; },
    undefined,
    undefined
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const createAppleMark = (THREE, black, silver) => {
  const group = new THREE.Group();
  const markMaterial = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide, toneMapped: false });
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(0, -.55);
  bodyShape.bezierCurveTo(-.22, -.54, -.53, -.27, -.55, .08);
  bodyShape.bezierCurveTo(-.58, .39, -.36, .61, -.1, .58);
  bodyShape.bezierCurveTo(.02, .56, .1, .5, .2, .54);
  bodyShape.bezierCurveTo(.43, .63, .62, .42, .58, .17);
  bodyShape.bezierCurveTo(.55, -.14, .35, -.48, .12, -.55);
  bodyShape.bezierCurveTo(.07, -.57, .03, -.57, 0, -.55);
  const body = new THREE.Mesh(new THREE.ShapeGeometry(bodyShape, 18), markMaterial);
  body.rotation.x = -Math.PI / 2;
  group.add(body);
  const bite = new THREE.Mesh(new THREE.CircleGeometry(.18, 18), silver);
  bite.position.set(.52, .002, .2);
  bite.rotation.x = -Math.PI / 2;
  group.add(bite);
  const leaf = new THREE.Mesh(new THREE.CircleGeometry(.21, 18), markMaterial);
  leaf.scale.set(.42, 1, 1);
  leaf.rotation.set(-Math.PI / 2, 0, -.55);
  leaf.position.set(.18, .006, -.66);
  group.add(leaf);
  group.scale.setScalar(.15);
  return group;
};

const createMacMini = (THREE, materials) => {
  const { silver, dark, black, indicator } = materials;
  const group = new THREE.Group();
  group.name = 'mac-mini';
  group.userData.reconstruction = 'approximate-single-view';

  const enclosure = namePart(roundedFootprintBox(THREE, .68, .24, .65, .065, silver, .012), 'mac-enclosure');
  enclosure.position.y = .12;
  group.add(enclosure);

  const base = namePart(roundedFootprintBox(THREE, .61, .035, .58, .04, dark), 'mac-vented-base', 'mac-enclosure');
  base.position.y = .016;
  group.add(base);

  const topMark = namePart(createAppleMark(THREE, black, silver), 'mac-apple-mark', 'mac-enclosure');
  topMark.position.set(0, .255, -.015);
  group.add(topMark);

  for (let index = 0; index < 17; index += 1) {
    const vent = namePart(roundedBox(THREE, .018, .025, .008, .005, black), `mac-vent-${index + 1}`, 'mac-vented-base');
    vent.position.set(-.255 + index * .032, .026, .329);
    vent.rotation.z = -.32;
    group.add(vent);
  }

  [-.19, -.12].forEach((x, index) => {
    const port = namePart(roundedBox(THREE, .018, .05, .008, .008, black), `mac-usb-c-${index + 1}`, 'mac-enclosure');
    port.position.set(x, .125, .345);
    group.add(port);
  });

  const led = namePart(new THREE.Mesh(new THREE.SphereGeometry(.006, 10, 8), indicator), 'mac-status-led', 'mac-enclosure');
  led.position.set(.12, .126, .345);
  group.add(led);
  const jack = namePart(new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .01, 20), black), 'mac-headphone-jack', 'mac-enclosure');
  jack.rotation.x = Math.PI / 2;
  jack.position.set(.23, .125, .345);
  group.add(jack);
  // Keep the Mac Mini visually slim beside the DAC without changing its footprint.
  group.scale.set(1, .82, 1);
  return group;
};

const createSuperellipsoidGeometry = (THREE, width, height, depth, exponent = .58) => {
  const columns = 32;
  const rows = 18;
  const vertices = [];
  const indices = [];
  const signedPower = (value) => Math.sign(value) * Math.pow(Math.abs(value), exponent);
  for (let row = 0; row <= rows; row += 1) {
    const latitude = -Math.PI / 2 + row / rows * Math.PI;
    const latitudeCosine = signedPower(Math.cos(latitude));
    for (let column = 0; column <= columns; column += 1) {
      const longitude = -Math.PI + column / columns * Math.PI * 2;
      vertices.push(
        width / 2 * latitudeCosine * signedPower(Math.cos(longitude)),
        height / 2 * signedPower(Math.sin(latitude)),
        depth / 2 * latitudeCosine * signedPower(Math.sin(longitude))
      );
    }
  }
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const a = row * (columns + 1) + column;
      const b = a + columns + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
};

const createMouseShellGeometry = (THREE) => {
  const sections = [
    { z: -.29, width: .055, height: .04, shift: -.004 },
    { z: -.23, width: .125, height: .085, shift: -.004 },
    { z: -.1, width: .168, height: .145, shift: .003 },
    { z: .07, width: .18, height: .17, shift: .012 },
    { z: .2, width: .155, height: .13, shift: .018 },
    { z: .29, width: .07, height: .045, shift: .012 },
  ];
  const ringSegments = 20;
  const vertices = [];
  const indices = [];
  sections.forEach(({ z, width, height, shift }) => {
    for (let segment = 0; segment < ringSegments; segment += 1) {
      const angle = segment / ringSegments * Math.PI * 2;
      const sin = Math.sin(angle);
      vertices.push(shift + Math.cos(angle) * width, .035 + sin * (sin > 0 ? height : .028), z);
    }
  });
  for (let ring = 0; ring < sections.length - 1; ring += 1) {
    for (let segment = 0; segment < ringSegments; segment += 1) {
      const next = (segment + 1) % ringSegments;
      const a = ring * ringSegments + segment;
      const b = ring * ringSegments + next;
      const c = (ring + 1) * ringSegments + next;
      const d = (ring + 1) * ringSegments + segment;
      indices.push(a, b, d, b, c, d);
    }
  }
  [0, sections.length - 1].forEach((ring, capIndex) => {
    const section = sections[ring];
    const centerIndex = vertices.length / 3;
    vertices.push(section.shift, .035, section.z);
    for (let segment = 0; segment < ringSegments; segment += 1) {
      const next = (segment + 1) % ringSegments;
      const a = ring * ringSegments + segment;
      const b = ring * ringSegments + next;
      if (capIndex === 0) indices.push(centerIndex, b, a);
      else indices.push(centerIndex, a, b);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
};

const createMouse = (THREE, materials) => {
  const { white, dark, black } = materials;
  const group = new THREE.Group();
  group.name = 'white-mouse';
  group.userData.reconstruction = 'approximate-single-view';

  const base = namePart(roundedFootprintBox(THREE, .3, .028, .49, .075, dark), 'mouse-base');
  base.position.set(.012, .018, .012);
  group.add(base);

  const shell = namePart(new THREE.Mesh(createMouseShellGeometry(THREE), white), 'mouse-shell');
  group.add(shell);

  const wheel = namePart(new THREE.Mesh(new THREE.CylinderGeometry(.027, .027, .035, 16), black), 'mouse-wheel');
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(-.006, .166, -.095);
  group.add(wheel);
  [-.08, -.015].forEach((z, index) => {
    const sideButton = namePart(roundedBox(THREE, .014, .032, .052, .007, black), `mouse-side-button-${index + 1}`);
    sideButton.position.set(-.173, .105, z);
    sideButton.rotation.z = -.12;
    group.add(sideButton);
  });
  return group;
};

const createKeyboardGlowTexture = (THREE) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  [
    [0, '#ff4c72'],
    [.16, '#d65cff'],
    [.33, '#566cff'],
    [.5, '#45d9ff'],
    [.67, '#55e8ad'],
    [.83, '#ffd34e'],
    [1, '#ff4c72'],
  ].forEach(([stop, color]) => gradient.addColorStop(stop, color));
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set(.72, 1);
  return texture;
};

const createKeyboard = (THREE, materials) => {
  const { white, keyWhite, dark } = materials;
  const group = new THREE.Group();
  group.name = 'compact-keyboard';
  group.userData.reconstruction = 'approximate-single-view';

  const chassis = namePart(roundedBox(THREE, 1.48, .075, .49, .045, white), 'keyboard-chassis');
  chassis.position.y = .038;
  chassis.rotation.x = -.025;
  group.add(chassis);

  const glowTexture = createKeyboardGlowTexture(THREE);
  const glowBed = namePart(new THREE.Mesh(
    new THREE.PlaneGeometry(1.37, .405),
    new THREE.MeshBasicMaterial({ map: glowTexture, transparent: true, opacity: .42, toneMapped: false, depthWrite: false })
  ), 'keyboard-rgb-bed', 'keyboard-chassis');
  glowBed.rotation.x = -Math.PI / 2;
  glowBed.position.y = .079;
  group.add(glowBed);

  const edgeGlowMaterial = new THREE.MeshBasicMaterial({
    map: glowTexture,
    transparent: true,
    opacity: .78,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    depthWrite: false,
  });
  const frontGlow = namePart(new THREE.Mesh(new THREE.PlaneGeometry(1.39, .022), edgeGlowMaterial), 'keyboard-rgb-front', 'keyboard-chassis');
  frontGlow.position.set(0, .059, .254);
  group.add(frontGlow);
  [-1, 1].forEach((side) => {
    const sideGlow = namePart(new THREE.Mesh(new THREE.PlaneGeometry(.47, .022), edgeGlowMaterial), side < 0 ? 'keyboard-rgb-left' : 'keyboard-rgb-right', 'keyboard-chassis');
    sideGlow.rotation.y = Math.PI / 2;
    sideGlow.position.set(side * .746, .059, 0);
    group.add(sideGlow);
  });
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  group.userData.animate = reduceMotion ? undefined : (time) => {
    glowTexture.offset.x = (time * .0000065) % 1;
  };

  const unit = .078;
  const gap = .007;
  const rows = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 1],
    [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 1],
    [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75, 1, 1],
    [1.25, 1.25, 1.25, 5.5, 1.25, 1.25, 1.25, 1, 1, 1],
  ];
  const keys = [];
  const wideKeys = [];
  rows.forEach((widths, row) => {
    const totalUnits = widths.reduce((sum, width) => sum + width, 0);
    const totalWidth = totalUnits * unit + (widths.length - 1) * gap;
    let cursor = -totalWidth / 2;
    widths.forEach((width) => {
      const keyWidth = width * unit + (width - 1) * gap;
      const key = { x: cursor + keyWidth / 2, z: -.17 + row * .085, width: keyWidth };
      if (width === 1) keys.push(key);
      else wideKeys.push(key);
      cursor += keyWidth + gap;
    });
  });
  const keyGeometry = new THREE.BoxGeometry(unit, .045, .065);
  const keyMesh = namePart(new THREE.InstancedMesh(keyGeometry, keyWhite, keys.length), 'keyboard-key-field');
  const dummy = new THREE.Object3D();
  keys.forEach(({ x, z }, index) => {
    dummy.position.set(x, .105, z);
    dummy.rotation.x = -.025;
    dummy.updateMatrix();
    keyMesh.setMatrixAt(index, dummy.matrix);
  });
  group.add(keyMesh);

  wideKeys.forEach(({ x, z, width }, index) => {
    const key = namePart(roundedBox(THREE, width, .045, .065, .012, keyWhite), `keyboard-wide-key-${index + 1}`);
    key.position.set(x, .105, z);
    group.add(key);
  });
  const cablePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, .05, -.24),
    new THREE.Vector3(-.035, .048, -.58),
    new THREE.Vector3(.055, .045, -1.02),
    new THREE.Vector3(.025, .046, -1.52),
    new THREE.Vector3(.02, .046, -1.86),
    new THREE.Vector3(.02, -.12, -2.02),
  ]);
  const cable = namePart(new THREE.Mesh(new THREE.TubeGeometry(cablePath, 36, .011, 8, false), white), 'keyboard-cable');
  group.add(cable);
  return group;
};

const createDacDisplayTexture = (THREE) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 150;
  const context = canvas.getContext('2d');
  context.fillStyle = '#08090a';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#d98b18';
  context.font = '700 82px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('19 dB', 290, 78);
  context.fillStyle = '#4ca9ff';
  context.font = '600 25px sans-serif';
  context.fillText('USB', 62, 39);
  context.fillStyle = '#d98b18';
  context.fillText('DAC', 62, 111);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const createHelsinkiMapTexture = (THREE) => {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 920;
  const context = canvas.getContext('2d');
  context.fillStyle = '#e6e5e1';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = 'rgba(25, 27, 29, .55)';
  context.lineWidth = 2;
  for (let i = 0; i < 70; i += 1) {
    const y = 70 + i * 9;
    context.beginPath();
    context.moveTo(28, y + Math.sin(i * 1.7) * 18);
    context.lineTo(692, y + Math.cos(i * .9) * 22);
    context.stroke();
  }
  context.strokeStyle = 'rgba(20, 22, 24, .82)';
  context.lineWidth = 5;
  [
    [[20, 205], [210, 270], [380, 230], [690, 330]],
    [[120, 30], [180, 190], [170, 420], [315, 610], [500, 760]],
    [[680, 80], [550, 220], [515, 430], [620, 620], [680, 860]],
  ].forEach((route) => {
    context.beginPath();
    route.forEach(([x, y], index) => index ? context.lineTo(x, y) : context.moveTo(x, y));
    context.stroke();
  });
  context.fillStyle = 'rgba(25, 27, 29, .18)';
  context.beginPath();
  context.ellipse(180, 580, 135, 90, -.25, 0, Math.PI * 2);
  context.ellipse(550, 460, 95, 145, .15, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#1c1d1f';
  context.font = '700 62px Arial, sans-serif';
  context.textAlign = 'center';
  context.fillText('HELSINKI', 360, 815);
  context.font = '400 22px Arial, sans-serif';
  context.letterSpacing = '8px';
  context.fillText('HELSINGFORS', 360, 860);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const createBookSpineTexture = (THREE, book) => {
  const canvas = document.createElement('canvas');
  canvas.width = 180;
  canvas.height = 720;
  const context = canvas.getContext('2d');

  if (book.style === 'infinity') {
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#9ab9cd');
    gradient.addColorStop(.48, '#657baf');
    gradient.addColorStop(1, '#182d70');
    context.fillStyle = gradient;
  } else {
    context.fillStyle = book.background;
  }
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (book.style === 'user-friendly') {
    context.fillStyle = '#3299e5';
    context.beginPath();
    context.arc(92, 565, 17, 0, Math.PI * 2);
    context.fill();
  }
  if (book.style === 'build') {
    ['#ec428b', '#58a9db', '#68b46d', '#e8a342'].forEach((color, index) => {
      context.strokeStyle = color;
      context.lineWidth = 3;
      context.strokeRect(24 + index * 18, 460 - index * 24, 54, 76);
    });
  }

  const fitRotatedText = (text, maxLength, initialSize, weight = 800) => {
    let size = initialSize;
    do {
      context.font = `${weight} ${size}px Arial, sans-serif`;
      size -= 1;
    } while (context.measureText(text).width > maxLength && size > 20);
  };

  context.save();
  context.translate(91, 666);
  context.rotate(-Math.PI / 2);
  context.fillStyle = book.foreground;
  fitRotatedText(book.title, 570, book.titleSize || 48, book.weight || 800);
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  context.fillText(book.title, 0, 0);
  context.restore();

  context.save();
  context.translate(151, 666);
  context.rotate(-Math.PI / 2);
  context.fillStyle = book.foreground;
  context.globalAlpha = .82;
  context.font = '600 18px Arial, sans-serif';
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  context.fillText(book.author.toUpperCase(), 0, 0);
  context.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const createLeafSurfaceTextures = (THREE) => {
  const size = 128;
  const colorCanvas = document.createElement('canvas');
  const bumpCanvas = document.createElement('canvas');
  colorCanvas.width = bumpCanvas.width = size;
  colorCanvas.height = bumpCanvas.height = size;
  const colorContext = colorCanvas.getContext('2d');
  const bumpContext = bumpCanvas.getContext('2d');
  const colorImage = colorContext.createImageData(size, size);
  const bumpImage = bumpContext.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4;
      const grain = (
        Math.sin(x * .17) +
        Math.sin(y * .13) +
        Math.sin((x + y) * .071) +
        Math.sin(Math.hypot(x - 64, y - 64) * .19)
      ) / 4;
      colorImage.data[index] = 18 + grain * 5;
      colorImage.data[index + 1] = 49 + grain * 12;
      colorImage.data[index + 2] = 27 + grain * 6;
      colorImage.data[index + 3] = 255;
      const height = 118 + grain * 28;
      bumpImage.data[index] = bumpImage.data[index + 1] = bumpImage.data[index + 2] = height;
      bumpImage.data[index + 3] = 255;
    }
  }
  colorContext.putImageData(colorImage, 0, 0);
  bumpContext.putImageData(bumpImage, 0, 0);
  const color = new THREE.CanvasTexture(colorCanvas);
  color.colorSpace = THREE.SRGBColorSpace;
  color.anisotropy = 4;
  const bump = new THREE.CanvasTexture(bumpCanvas);
  bump.anisotropy = 4;
  return { color, bump };
};

const createDac = (THREE, materials) => {
  const { dark, black, metal } = materials;
  const group = new THREE.Group();
  group.name = 'topping-dac';
  group.userData.reconstruction = 'approximate-single-view';

  const chassis = namePart(roundedBox(THREE, .72, .19, .48, .03, dark), 'dac-chassis');
  chassis.position.y = .095;
  group.add(chassis);

  const display = namePart(new THREE.Mesh(
    new THREE.PlaneGeometry(.39, .13),
    new THREE.MeshBasicMaterial({ map: createDacDisplayTexture(THREE), toneMapped: false })
  ), 'dac-display');
  display.position.set(-.07, .102, .242);
  group.add(display);

  const knob = namePart(new THREE.Mesh(new THREE.CylinderGeometry(.085, .085, .075, 28), metal), 'dac-volume-knob');
  knob.rotation.x = Math.PI / 2;
  knob.position.set(.265, .103, .265);
  group.add(knob);

  const jackRing = namePart(new THREE.Mesh(new THREE.TorusGeometry(.028, .007, 8, 20), metal), 'dac-headphone-ring', 'dac-chassis');
  jackRing.position.set(-.292, .083, .245);
  group.add(jackRing);
  const jack = namePart(new THREE.Mesh(new THREE.CircleGeometry(.02, 18), black), 'dac-headphone-jack', 'dac-chassis');
  jack.position.set(-.292, .083, .253);
  group.add(jack);
  return group;
};

const createHeadphones = (THREE, materials) => {
  const group = new THREE.Group();
  group.name = 'desk-headphones';
  const shell = materials.black;
  const cushion = materials.dark;
  const bandCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.19, .16, 0),
    new THREE.Vector3(-.16, .38, 0),
    new THREE.Vector3(0, .52, 0),
    new THREE.Vector3(.16, .38, 0),
    new THREE.Vector3(.19, .16, 0),
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(bandCurve, 20, .035, 10, false), shell));
  [-.19, .19].forEach((x) => {
    const cup = new THREE.Mesh(new THREE.TorusGeometry(.145, .038, 12, 28), shell);
    cup.position.set(x, .11, 0);
    group.add(cup);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(.108, .108, .035, 24), cushion);
    pad.rotation.x = Math.PI / 2;
    pad.position.set(x, .11, .012);
    group.add(pad);
    const yoke = new THREE.Mesh(new THREE.BoxGeometry(.04, .13, .035), shell);
    yoke.position.set(x, .235, 0);
    group.add(yoke);
  });
  return group;
};

const createCuttingMatTexture = (THREE) => {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  context.fillStyle = '#1d2828';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = 'rgba(171, 202, 193, .15)';
  context.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 24) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 24) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }
  context.strokeStyle = 'rgba(187, 213, 205, .26)';
  context.lineWidth = 2;
  for (let x = 0; x <= canvas.width; x += 96) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 96) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }
  context.strokeStyle = 'rgba(208, 224, 218, .3)';
  context.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const createDeskPaperTexture = (THREE, background, label, accent, variant = 0) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 360;
  const context = canvas.getContext('2d');
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#77716a';
  context.font = '600 20px sans-serif';
  context.fillText(label.toUpperCase(), 34, 45);
  context.strokeStyle = accent;
  context.lineWidth = 5;
  if (variant === 0) {
    context.strokeRect(54, 105, 118, 76);
    context.strokeRect(320, 186, 118, 76);
    context.beginPath();
    context.moveTo(172, 143);
    context.lineTo(320, 224);
    context.stroke();
  } else if (variant === 1) {
    for (let row = 0; row < 5; row += 1) {
      context.beginPath();
      context.moveTo(50, 105 + row * 40);
      context.lineTo(440 - row * 24, 105 + row * 40);
      context.stroke();
    }
  } else if (variant === 2) {
    context.strokeStyle = 'rgba(188, 65, 82, .55)';
    for (let row = 0; row < 3; row += 1) {
      context.beginPath();
      context.moveTo(52, 205 + row * 35);
      context.lineTo(430 - row * 36, 205 + row * 35);
      context.stroke();
    }
  } else {
    context.beginPath();
    context.arc(250, 180, 78, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(135, 245);
    context.quadraticCurveTo(245, 90, 382, 235);
    context.stroke();
  }
  context.fillStyle = '#4e4b47';
  context.font = 'italic 22px Georgia, serif';
  context.fillText(variant === 0 ? 'make the next step obvious' : variant === 1 ? 'pace can be designed' : 'break the scroll', 36, 322);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const createHeroSheetTexture = (THREE) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  const context = canvas.getContext('2d');
  context.fillStyle = '#fbfaf5';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = 'rgba(104, 65, 139, .12)';
  context.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 32) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let y = 0; y < canvas.height; y += 32) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }
  context.fillStyle = '#ffd55a';
  context.fillRect(72, 58, 245, 42);
  context.fillStyle = '#252323';
  context.font = '700 20px sans-serif';
  context.fillText('AI DESIGN ENGINEERING', 88, 86);
  context.fillStyle = '#df218d';
  context.fillRect(346, 58, 290, 42);
  context.fillStyle = '#ffffff';
  context.fillText('ANALYTICS · PROTOTYPES · CODE', 362, 86);
  context.fillStyle = '#232323';
  context.font = '500 78px sans-serif';
  context.fillText("Moi — I'm Petteri.", 72, 220);
  context.font = '500 70px sans-serif';
  context.fillText('I turn messy', 72, 315);
  context.fillText('product problems', 72, 400);
  context.fillText('into', 72, 485);
  context.fillStyle = '#68418b';
  context.font = 'italic 700 86px Georgia, serif';
  context.fillText('clear directions.', 205, 485);
  context.fillStyle = '#55504b';
  context.font = '24px sans-serif';
  context.fillText("I'm a Product Designer becoming an AI Design Engineer.", 74, 565);
  context.fillStyle = '#68418b';
  context.font = '600 23px sans-serif';
  context.fillText('How I turn chaos into direction  ↗', 74, 655);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const createSudokuTexture = (THREE) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 640;
  const context = canvas.getContext('2d');
  context.fillStyle = '#eee2ca';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#665d51';
  context.font = 'italic 32px Georgia, serif';
  context.fillText('Take a break', 38, 62);
  for (let index = 0; index <= 9; index += 1) {
    context.strokeStyle = index % 3 === 0 ? '#5c554b' : 'rgba(92,85,75,.45)';
    context.lineWidth = index % 3 === 0 ? 3 : 1;
    context.beginPath();
    context.moveTo(54 + index * 44, 125);
    context.lineTo(54 + index * 44, 521);
    context.stroke();
    context.beginPath();
    context.moveTo(54, 125 + index * 44);
    context.lineTo(450, 125 + index * 44);
    context.stroke();
  }
  context.font = '26px Georgia, serif';
  [[1,1,8],[4,2,2],[7,1,6],[2,5,9],[6,6,4],[8,7,1]].forEach(([x,y,value]) => context.fillText(value, 68 + x * 44, 157 + y * 44));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const createFolderPageTexture = (THREE, side) => {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 400;
  const context = canvas.getContext('2d');
  context.fillStyle = '#f4efe5';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#6d6255';
  context.font = '600 17px monospace';
  context.fillText(side === 'left' ? 'CASE NO. PH—001' : 'SELECTED CASE 01', 38, 44);
  if (side === 'left') {
    context.fillStyle = '#d8c9ef';
    context.fillRect(36, 78, 560, 230);
  } else {
    context.fillStyle = '#292624';
    context.font = '600 46px sans-serif';
    context.fillText('Brio', 40, 112);
    context.fillStyle = '#68418b';
    context.font = 'italic 30px Georgia, serif';
    context.fillText('Move. Choose. Continue.', 40, 158);
    context.strokeStyle = '#b7ada0';
    context.lineWidth = 3;
    for (let row = 0; row < 4; row += 1) {
      context.beginPath();
      context.moveTo(42, 215 + row * 38);
      context.lineTo(560 - row * 35, 215 + row * 38);
      context.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const createPhoneTexture = (THREE) => {
  const canvas = document.createElement('canvas');
  canvas.width = 420;
  canvas.height = 760;
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#244034');
  gradient.addColorStop(1, '#101713');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#347a49';
  context.fillRect(26, 82, 368, 330);
  context.fillStyle = '#17231d';
  for (let x = 42; x < 390; x += 64) context.fillRect(x, 96, 34, 300);
  context.fillStyle = '#ffffff';
  context.font = '600 22px sans-serif';
  context.fillText('SERVICE DESIGN', 28, 485);
  context.font = '700 48px sans-serif';
  context.fillText('S-Hävikki', 28, 548);
  context.font = '24px sans-serif';
  context.fillText('Making near-expiry food', 28, 600);
  context.fillText('easier to choose.', 28, 635);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const createCrumpledPaperBall = (THREE, material) => {
  const geometry = new THREE.SphereGeometry(.105, 32, 22);
  const positions = geometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const z = positions.getZ(index);
    const broadFold = Math.sin(x * 31 + y * 37 - z * 27);
    const mediumFold = Math.sin(x * 61 - y * 43 + z * 55);
    const distortion = .94 + broadFold * .07 + mediumFold * .035;
    positions.setXYZ(index, x * distortion * 1.08, y * distortion * .94, z * distortion);
  }
  geometry.computeVertexNormals();
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 256;
  bumpCanvas.height = 128;
  const bumpContext = bumpCanvas.getContext('2d');
  bumpContext.fillStyle = '#b8b8b8';
  bumpContext.fillRect(0, 0, bumpCanvas.width, bumpCanvas.height);
  for (let fold = 0; fold < 18; fold += 1) {
    const startX = (fold * 73) % 256;
    const startY = (fold * 47) % 128;
    bumpContext.strokeStyle = fold % 3 === 0 ? '#686868' : '#8a8a8a';
    bumpContext.lineWidth = fold % 3 === 0 ? 3 : 1.5;
    bumpContext.beginPath();
    bumpContext.moveTo(startX, startY);
    bumpContext.bezierCurveTo(
      (startX + 38) % 256, (startY + 31) % 128,
      (startX + 81) % 256, (startY - 25 + 128) % 128,
      (startX + 124) % 256, (startY + 17) % 128
    );
    bumpContext.stroke();
  }
  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.wrapS = THREE.RepeatWrapping;
  const paperMaterial = material.clone();
  paperMaterial.color.set(0xf5f1e8);
  paperMaterial.flatShading = false;
  paperMaterial.roughness = .96;
  paperMaterial.metalness = 0;
  paperMaterial.color.set(0xffffff);
  paperMaterial.emissive.set(0x3b3834);
  paperMaterial.emissiveIntensity = .22;
  paperMaterial.bumpMap = bumpTexture;
  paperMaterial.bumpScale = .018;
  return namePart(new THREE.Mesh(geometry, paperMaterial), 'crumpled-paper');
};

const createDeskLayers = (THREE, materials) => {
  const group = new THREE.Group();
  group.name = 'original-desk-layer';

  const mat = namePart(new THREE.Mesh(
    new THREE.PlaneGeometry(2.36, 1.48),
    new THREE.MeshStandardMaterial({ map: createCuttingMatTexture(THREE), roughness: .88, metalness: 0 })
  ), 'cutting-mat');
  mat.rotation.x = -Math.PI / 2;
  mat.position.set(.4, .012, .935);
  group.add(mat);

  const folder = new THREE.Group();
  folder.name = 'project-folder';
  const folderBody = namePart(roundedFootprintBox(THREE, 2.2, .026, .48, .04, materials.folder), 'folder-cover');
  folderBody.position.y = .026;
  folder.add(folderBody);
  ['left', 'right'].forEach((side, index) => {
    const pageX = index === 0 ? -.535 : .535;
    [0xd8d1c5, 0xe0d9ce, 0xe8e2d8, 0xeee8de, 0xf4efe5].forEach((color, layer) => {
      const layerMaterial = materials.paper.clone();
      layerMaterial.color.setHex(color);
      const pageBlock = namePart(roundedFootprintBox(THREE, 1.04, .005, .5, .02, layerMaterial), `folder-page-block-${side}-${layer + 1}`, 'folder-cover');
      pageBlock.position.set(pageX, .036 + layer * .006, .002 + layer * .006);
      folder.add(pageBlock);
    });
    const page = namePart(new THREE.Mesh(
      new THREE.PlaneGeometry(1.04, .52),
      new THREE.MeshStandardMaterial({ map: createFolderPageTexture(THREE, side), roughness: .92, side: THREE.DoubleSide })
    ), `folder-page-${side}`);
    page.rotation.x = -Math.PI / 2;
    page.position.set(pageX, .074, .014);
    folder.add(page);
  });
  const folderBrio = namePart(new THREE.Mesh(
    new THREE.PlaneGeometry(.4, .119),
    new THREE.MeshBasicMaterial({ map: loadAssetTexture(THREE, 'assets/brio-pushup-transparent.png'), transparent: true, alphaTest: .04, side: THREE.DoubleSide, toneMapped: false })
  ), 'folder-brio-asset', 'folder-page-left');
  folderBrio.rotation.x = -Math.PI / 2;
  folderBrio.position.set(-.535, .079, .014);
  folder.add(folderBrio);
  const spine = namePart(new THREE.Mesh(new THREE.BoxGeometry(.035, .018, .5), materials.folderLight), 'folder-spine', 'folder-cover');
  spine.position.set(0, .057, .014);
  folder.add(spine);
  const frontLip = namePart(roundedFootprintBox(THREE, 2.14, .035, .075, .025, materials.folder), 'folder-front-lip', 'folder-cover');
  frontLip.position.set(0, .052, .225);
  folder.add(frontLip);
  folder.position.set(.4, .012, 1.48);
  folder.scale.set(.93, .46, 2.3);
  group.add(folder);

  const papers = [
    { x: -.62, z: .54, w: .58, d: .42, color: '#ddd8cf', label: 'interaction study', accent: '#68418b', angle: -.16, variant: 0 },
    { x: 1.05, z: .25, w: .49, d: .38, color: '#e6d6d9', label: 'Brio / movement', accent: '#bc4152', angle: .12, variant: 2 },
    { x: .35, z: .96, w: .65, d: .34, color: '#dce4e2', label: 'reading / focus', accent: '#4c817a', angle: .05, variant: 1 },
    { x: .98, z: 1, w: .52, d: .34, color: '#e8dfcf', label: 'flow / first pass', accent: '#68418b', angle: -.08, variant: 0 },
  ];
  papers.forEach((paper, index) => {
    const holder = new THREE.Group();
    const sheet = namePart(new THREE.Mesh(
      new THREE.PlaneGeometry(paper.w, paper.d),
      new THREE.MeshStandardMaterial({
        map: createDeskPaperTexture(THREE, paper.color, paper.label, paper.accent, paper.variant),
        roughness: .94,
        side: THREE.DoubleSide,
      })
    ), `desk-paper-${index + 1}`);
    sheet.rotation.x = -Math.PI / 2;
    sheet.position.y = .014 + index * .001;
    holder.add(sheet);
    if (paper.variant === 2) {
      const art = namePart(new THREE.Mesh(
        new THREE.PlaneGeometry(.3, .089),
        new THREE.MeshBasicMaterial({ map: loadAssetTexture(THREE, 'assets/brio-pushup-transparent.png'), transparent: true, alphaTest: .04, side: THREE.DoubleSide, toneMapped: false })
      ), 'brio-paper-asset', `desk-paper-${index + 1}`);
      art.rotation.x = -Math.PI / 2;
      art.position.set(0, .017 + index * .001, -.015);
      holder.add(art);
    }
    holder.position.set(paper.x, 0, paper.z);
    holder.rotation.y = paper.angle;
    group.add(holder);
  });

  const sudokuHolder = new THREE.Group();
  const sudoku = namePart(new THREE.Mesh(
    new THREE.PlaneGeometry(.62, .77),
    new THREE.MeshStandardMaterial({ map: loadAssetTexture(THREE, 'assets/sudoku-open-pages.svg'), transparent: true, alphaTest: .04, roughness: .95, side: THREE.DoubleSide })
  ), 'sudoku-sheet');
  sudoku.rotation.x = -Math.PI / 2;
  sudoku.position.y = .013;
  sudokuHolder.add(sudoku);
  sudokuHolder.position.set(.18, 0, .31);
  sudokuHolder.rotation.y = .19;
  group.add(sudokuHolder);

  const heroHolder = new THREE.Group();
  const hero = namePart(new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, .92),
    new THREE.MeshStandardMaterial({ map: createHeroSheetTexture(THREE), roughness: .94, side: THREE.DoubleSide })
  ), 'hero-moi-sheet');
  hero.rotation.x = -Math.PI / 2;
  hero.position.y = .028;
  heroHolder.add(hero);
  heroHolder.position.set(-.1, 0, .58);
  heroHolder.rotation.y = -.018;
  group.add(heroHolder);

  const sticky = namePart(roundedFootprintBox(THREE, .28, .008, .23, .008, materials.sticky), 'sticky-note');
  sticky.position.set(1.35, .025, .36);
  sticky.rotation.y = .16;
  group.add(sticky);

  const airpods = new THREE.Group();
  airpods.name = 'airpods-case';
  const airpodsWhite = materials.white.clone();
  airpodsWhite.roughness = .24;
  const airpodsBody = namePart(new THREE.Mesh(createSuperellipsoidGeometry(THREE, .165, .068, .125, .54), airpodsWhite), 'airpods-body');
  airpodsBody.position.y = .049;
  airpods.add(airpodsBody);

  const chargePort = namePart(roundedBox(THREE, .032, .012, .005, .005, materials.dark), 'airpods-usb-c', 'airpods-body');
  chargePort.position.set(0, .018, .067);
  airpods.add(chargePort);
  airpods.position.set(1.34, .012, .68);
  airpods.rotation.y = -.1;
  group.add(airpods);

  const paperBall = createCrumpledPaperBall(THREE, materials.keyWhite);
  paperBall.position.set(-.68, .057, 1.12);
  paperBall.scale.setScalar(.54);
  group.add(paperBall);

  const phone = new THREE.Group();
  phone.name = 'showreel-phone';
  const phoneBody = namePart(roundedFootprintBox(THREE, .285, .026, .59, .055, materials.black, .005), 'phone-body');
  phoneBody.position.y = .072;
  phone.add(phoneBody);
  const phoneScreen = namePart(new THREE.Mesh(
    new THREE.PlaneGeometry(.254, .536),
    new THREE.MeshBasicMaterial({ map: loadAssetTexture(THREE, 'assets/shavikki-kaappikuva-768.webp'), toneMapped: false })
  ), 'phone-screen', 'phone-body');
  phoneScreen.rotation.x = -Math.PI / 2;
  phoneScreen.position.y = .087;
  phone.add(phoneScreen);
  const island = namePart(roundedFootprintBox(THREE, .095, .005, .024, .012, materials.black), 'phone-dynamic-island', 'phone-body');
  island.position.set(0, .091, -.232);
  phone.add(island);
  phone.position.set(.78, .01, .56);
  phone.rotation.y = -.13;
  group.add(phone);

  const pencil = new THREE.Group();
  pencil.name = 'desk-pencil';
  const pencilBody = namePart(new THREE.Mesh(new THREE.CylinderGeometry(.016, .016, .68, 8), materials.pencil), 'pencil-body');
  pencilBody.rotation.z = Math.PI / 2;
  pencil.add(pencilBody);
  const pencilTip = namePart(new THREE.Mesh(new THREE.ConeGeometry(.024, .075, 8), materials.wood), 'pencil-tip', 'pencil-body');
  pencilTip.rotation.z = Math.PI / 2;
  pencilTip.position.x = -.375;
  pencil.add(pencilTip);
  const ferrule = namePart(new THREE.Mesh(new THREE.CylinderGeometry(.019, .019, .055, 10), materials.metal), 'pencil-ferrule', 'pencil-body');
  ferrule.rotation.z = Math.PI / 2;
  ferrule.position.x = .365;
  pencil.add(ferrule);
  const eraser = namePart(new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .07, 10), materials.eraser), 'pencil-eraser', 'pencil-body');
  eraser.rotation.z = Math.PI / 2;
  eraser.position.x = .425;
  pencil.add(eraser);
  pencil.position.set(1.2, .026, 1.13);
  pencil.rotation.y = Math.PI - .34;
  pencil.scale.setScalar(.75);
  group.add(pencil);
  return group;
};

const createScreenTexture = (THREE, variant) => {
  const canvas = document.createElement('canvas');
  canvas.width = 740;
  canvas.height = 400;
  const context = canvas.getContext('2d');
  context.fillStyle = '#071434';
  context.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  let wallpaperReady = false;
  let playback = { ...window.portfolioPlaybackState };
  let appOpen = false;
  const dockIconFiles = ['vscode.png', 'chrome.svg', 'spotify.svg', 'discord.svg', 'steam.svg', 'figma.svg', 'codex.svg', 'obsidian.svg', 'lmstudio.svg', 'xcode.svg'];
  const dockIcons = [];

  const formatScreenTime = (milliseconds) => {
    const seconds = Math.max(0, Math.floor((milliseconds || 0) / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };
  const helsinkiClock = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Helsinki',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const playerBounds = { x: 452, y: 288, width: 172, height: 62 };

  const draw = () => {
    if (!wallpaperReady) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(wallpaper, 0, 0, canvas.width, canvas.height);
    // Draw the UI in the original 640px coordinate system while matching the monitor's 1.85:1 mesh.
    context.save();
    context.scale(canvas.width / 640, 1);

    // macOS menu bar
    context.fillStyle = 'rgba(12, 18, 39, .48)';
    context.fillRect(0, 0, canvas.width, 14);
    context.fillStyle = 'rgba(255, 255, 255, .94)';
    context.font = '600 6.5px Arial, sans-serif';
    context.textBaseline = 'middle';
    context.textAlign = 'left';
    context.fillText('●', 8, 7);
    context.fillText('Finder   File   Edit   View   Go   Window   Help', 18, 7);
    context.textAlign = 'right';
    context.fillText(`⌁   ◉   ${helsinkiClock.format(new Date()).replace(',', '')}`, 633, 7);

    // macOS Dock
    const dockWidth = 208;
    const dockX = (640 - dockWidth) / 2;
    context.fillStyle = 'rgba(239, 241, 255, .34)';
    context.strokeStyle = 'rgba(255, 255, 255, .45)';
    context.lineWidth = 1;
    context.beginPath();
    context.roundRect(dockX, 372, dockWidth, 24, 8);
    context.fill();
    context.stroke();
    dockIcons.forEach((icon, index) => {
      const size = 16;
      const gap = 3;
      const total = dockIcons.length * size + (dockIcons.length - 1) * gap;
      const x = 320 - total / 2 + index * (size + gap);
      context.fillStyle = index === 6 ? 'rgba(255,255,255,.9)' : 'rgba(13,17,28,.78)';
      context.beginPath();
      context.roundRect(x, 375, size, size, 4);
      context.fill();
      if (icon.complete && icon.naturalWidth) context.drawImage(icon, x + 2, 377, 12, 12);
      if (index < 3 || (index === 6 && appOpen)) {
        context.fillStyle = 'rgba(255,255,255,.9)';
        context.beginPath();
        context.arc(x + size / 2, 394, 1, 0, Math.PI * 2);
        context.fill();
      }
    });

    if (variant === 0 && playback?.playingURI && (playback.position > 0 || playback.duration > 0)) {
      const { x: cardX, y: cardY, width: cardWidth, height: cardHeight } = playerBounds;
      const progress = playback.duration ? Math.min(1, playback.position / playback.duration) : 0;
      context.fillStyle = 'rgba(10, 13, 24, .78)';
      context.beginPath();
      context.roundRect(cardX, cardY, cardWidth, cardHeight, 10);
      context.fill();
      context.fillStyle = '#1ed760';
      context.beginPath();
      context.arc(cardX + 13, cardY + 13, 3, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = 'rgba(255,255,255,.7)';
      context.font = '600 5.5px Arial, sans-serif';
      context.textAlign = 'left';
      context.fillText('NOW PLAYING', cardX + 21, cardY + 13);
      context.fillStyle = '#fff';
      context.font = '600 8px Arial, sans-serif';
      const title = playback.title || 'Petteri\'s playlist';
      context.fillText(title.length > 22 ? `${title.slice(0, 21)}…` : title, cardX + 11, cardY + 29);
      context.fillStyle = 'rgba(255,255,255,.24)';
      context.fillRect(cardX + 11, cardY + 37, cardWidth - 55, 2);
      context.fillStyle = '#1ed760';
      context.fillRect(cardX + 11, cardY + 37, (cardWidth - 55) * progress, 2);
      context.fillStyle = 'rgba(255,255,255,.72)';
      context.font = '500 5.5px Arial, sans-serif';
      context.fillText(`${formatScreenTime(playback.position)} / ${formatScreenTime(playback.duration)}`, cardX + 11, cardY + 49);
      context.fillStyle = 'rgba(255,255,255,.12)';
      context.beginPath();
      context.arc(cardX + cardWidth - 20, cardY + 29, 12, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#fff';
      context.font = playback.isPlaying ? '700 10px Arial, sans-serif' : '700 9px Arial, sans-serif';
      context.textAlign = 'center';
      context.fillText(playback.isPlaying ? 'Ⅱ' : '▶', cardX + cardWidth - 20, cardY + 30);
    }
    context.restore();
    texture.needsUpdate = true;
  };

  dockIconFiles.forEach((file) => {
    const icon = new Image();
    icon.onload = draw;
    icon.src = `/assets/dock/${file}?v=1`;
    dockIcons.push(icon);
  });

  const wallpaper = new Image();
  wallpaper.onload = () => {
    wallpaperReady = true;
    draw();
  };
  wallpaper.src = 'assets/desktop-wallpaper.png?v=2';
  window.setInterval(draw, 30_000);
  texture.userData = {
    setPlayback(nextPlayback) {
      playback = { ...nextPlayback };
      draw();
    },
    isPlayerControlAt(uv) {
      if (variant !== 0 || !playback?.playingURI || (!playback.position && !playback.duration)) return false;
      const x = uv.x * canvas.width;
      const logicalX = x / (canvas.width / 640);
      const y = (1 - uv.y) * canvas.height;
      const buttonX = playerBounds.x + playerBounds.width - 20;
      const buttonY = playerBounds.y + 29;
      return Math.hypot(logicalX - buttonX, y - buttonY) <= 17;
    },
    dockIconAt(uv) {
      const x = (uv.x * canvas.width) / (canvas.width / 640);
      const y = (1 - uv.y) * canvas.height;
      if (y < 372 || y > 399) return -1;
      const size = 16;
      const gap = 3;
      const total = dockIcons.length * size + (dockIcons.length - 1) * gap;
      const start = 320 - total / 2;
      const index = Math.floor((x - start) / (size + gap));
      if (index < 0 || index >= dockIcons.length) return -1;
      const iconX = start + index * (size + gap);
      return x >= iconX && x <= iconX + size ? index : -1;
    },
    setAppOpen(nextOpen) {
      appOpen = Boolean(nextOpen);
      draw();
    },
  };
  return texture;
};

const createSofa = (THREE) => {
  const sofa = new THREE.Group();
  sofa.name = 'room-sofa';

  const fabric = new THREE.MeshPhysicalMaterial({
    color: 0x403a39,
    roughness: .92,
    sheen: .35,
    sheenColor: new THREE.Color(0x82736f),
  });
  const cushionFabric = fabric.clone();
  cushionFabric.color.setHex(0x494240);
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x171516, roughness: .64 });
  const addPart = (name, width, height, depth, radius, material, x, y, z) => {
    const part = roundedBox(THREE, width, height, depth, radius, material);
    part.name = name;
    part.position.set(x, y, z);
    sofa.add(part);
    return part;
  };

  addPart('sofa-base', 2.12, .28, .58, .10, fabric, 0, .27, 0);
  addPart('sofa-back', 2.08, .72, .18, .09, fabric, 0, .70, -.31);
  addPart('sofa-left-arm', .20, .48, .58, .09, fabric, -1.01, .48, 0);
  addPart('sofa-right-arm', .20, .48, .58, .09, fabric, 1.01, .48, 0);
  addPart('sofa-left-cushion', .91, .15, .48, .075, cushionFabric, -.48, .48, .02);
  addPart('sofa-right-cushion', .91, .15, .48, .075, cushionFabric, .48, .48, .02);
  [-.82, .82].forEach((x) => {
    [-.16, .16].forEach((z) => addPart('sofa-leg', .09, .18, .09, .018, legMaterial, x, .09, z));
  });
  return sofa;
};

// A closed-volume sleeping puppy: lit meshes and surface spots, no photo plane.
const createDalmatianPuppy = (THREE) => {
  const puppy = new THREE.Group();
  puppy.name = 'dalmatian-puppy';
  const fur = new THREE.MeshStandardMaterial({ color: 0xf3eee5, roughness: .95 });
  const black = new THREE.MeshStandardMaterial({ color: 0x171719, roughness: .86 });
  const noseMaterial = new THREE.MeshStandardMaterial({ color: 0x252125, roughness: .42 });
  const innerEar = new THREE.MeshStandardMaterial({ color: 0x574b50, roughness: 1 });
  const sphere = new THREE.SphereGeometry(1, 36, 24);
  let seed = 1829;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  const spottedMaterial = (count) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f3eee5'; ctx.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < count; i++) {
      const x = 30 + random() * 964, y = 65 + random() * 382;
      const radius = 9 + random() * 13;
      ctx.fillStyle = i % 4 ? '#252427' : '#454146';
      ctx.beginPath();
      for (let j = 0; j < 12; j++) {
        const angle = j / 12 * Math.PI * 2;
        const r = radius * (.8 + random() * .4);
        const px = x + Math.cos(angle) * r, py = y + Math.sin(angle) * r * .75;
        if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: texture, roughness: .96 });
  };
  const ellipsoid = (parent, name, material, position, scale) => {
    const mesh = new THREE.Mesh(sphere, material);
    mesh.name = name; mesh.position.set(...position); mesh.scale.set(...scale);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  const body = new THREE.Group(); body.name = 'puppy-breathing-body'; puppy.add(body);
  ellipsoid(body, 'puppy-torso', spottedMaterial(45), [.08, .175, 0], [.35, .17, .18]);
  ellipsoid(body, 'puppy-haunch', spottedMaterial(22), [.30, .145, -.005], [.185, .14, .165]);
  ellipsoid(body, 'puppy-shoulder', spottedMaterial(18), [-.16, .175, .02], [.205, .175, .18]);
  ellipsoid(puppy, 'puppy-back-leg', spottedMaterial(12), [.28, .075, .17], [.20, .075, .085]);
  ellipsoid(puppy, 'puppy-back-paw', fur, [.09, .055, .21], [.12, .053, .073]);
  ellipsoid(puppy, 'puppy-front-leg-near', spottedMaterial(9), [-.29, .075, .17], [.23, .065, .065]);
  ellipsoid(puppy, 'puppy-front-paw-near', fur, [-.47, .05, .18], [.12, .048, .074]);
  ellipsoid(puppy, 'puppy-front-leg-far', fur, [-.27, .068, -.12], [.23, .055, .06]);
  ellipsoid(puppy, 'puppy-front-paw-far', fur, [-.46, .045, -.11], [.11, .045, .067]);
  const head = new THREE.Group(); head.name = 'puppy-head'; head.position.set(-.36, .14, .035); head.rotation.z = .06; puppy.add(head);
  ellipsoid(head, 'puppy-skull', spottedMaterial(17), [0, .075, 0], [.17, .145, .145]);
  ellipsoid(head, 'puppy-muzzle', fur, [-.135, .006, .017], [.15, .082, .107]);
  ellipsoid(head, 'puppy-nose', noseMaterial, [-.258, .023, .018], [.047, .035, .061]);
  const earNear = ellipsoid(head, 'puppy-floppy-ear-near', black, [.045, .012, .132], [.082, .145, .035]);
  earNear.rotation.z = -.3;
  const earFar = ellipsoid(head, 'puppy-floppy-ear-far', black, [.045, .023, -.13], [.077, .14, .034]); earFar.rotation.z = -.25;
  ellipsoid(head, 'puppy-ear-fold', innerEar, [.061, -.035, .145], [.045, .055, .014]);
  const curve = (parent, name, points, radius, material) => {
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), 20, radius, 7, false), material);
    mesh.name = name; mesh.castShadow = true; parent.add(mesh); return mesh;
  };
  curve(head, 'puppy-closed-eye-near', [[-.112,.099,.103],[-.085,.084,.122],[-.058,.091,.131]], .005, black);
  curve(head, 'puppy-closed-eye-far', [[-.112,.099,-.103],[-.085,.084,-.122],[-.058,.091,-.131]], .005, black);
  curve(head, 'puppy-mouth', [[-.24,-.016,.068],[-.18,-.03,.096],[-.11,-.023,.092]], .003, black);
  curve(puppy, 'puppy-tail', [[.39,.14,-.045],[.51,.09,-.12],[.48,.055,-.24],[.32,.048,-.265]], .027, fur);
  ellipsoid(puppy, 'puppy-tail-tip', black, [.32,.048,-.265], [.043,.027,.03]);
  for (const z of [.15,.20]) curve(puppy,'puppy-toe', [[-.545,.066,z],[-.515,.082,z]], .0025, innerEar);
  // A soft cushion contact shadow grounds the body; the animal itself is all 3D.
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext('2d'); const gradient = ctx.createRadialGradient(64,64,8,64,64,64);
  gradient.addColorStop(0,'rgba(0,0,0,.38)'); gradient.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.3,.75),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));
  shadow.name='puppy-contact-shadow';shadow.rotation.x=-Math.PI/2;shadow.position.y=.008;puppy.add(shadow);
  puppy.userData.animate = (time) => { body.scale.y = 1 + Math.sin(time * .0015) * .014; };
  return puppy;
};

const buildWorkspace = async () => {
  const THREE = await loadThree();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x171719);
  scene.fog = new THREE.Fog(0x171719, 8, 15);

  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.05, 30);
  camera.position.set(0, 1.34, 3.18);
  camera.rotation.order = 'YXZ';

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  canvasHost.append(renderer.domElement);
  const bookTooltip = document.createElement('div');
  bookTooltip.className = 'workspace-book-tooltip';
  bookTooltip.hidden = true;
  view.append(bookTooltip);

  const standard = (color, roughness = .72, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const white = standard(0xe8e7e2, .58);
  const keyWhite = standard(0xf2f1ed, .42);
  const dark = standard(0x202124, .66);
  const black = standard(0x08090a, .4);
  const metal = standard(0x34363a, .35, .72);
  const silver = standard(0xd9dad8, .38, .18);
  const indicator = new THREE.MeshBasicMaterial({ color: 0xe9e5d7, toneMapped: false });
  const folder = standard(0xc9a852, .82);
  const folderLight = standard(0xe2c570, .78);
  const sticky = standard(0xf1d46c, .9);
  const pencil = standard(0xd99b37, .58);
  const wood = standard(0xd8b07d, .8);
  const eraser = standard(0xd96868, .72);
  const paper = standard(0xf4efe5, .92);

  const addBox = (width, height, depth, material, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  };

  // Blank room: intentionally quiet until real wall objects are defined.
  const frontWall = addBox(9, 5, .12, standard(0x242326, .94), 0, 2.4, -1.3);
  frontWall.name = 'room-front-wall';
  addBox(9, .12, 8, standard(0x121315, .96), 0, -.02, .7);
  const sideWall = new THREE.MeshStandardMaterial({
    color: 0x454248,
    roughness: .96,
    emissive: 0x0b090d,
    emissiveIntensity: .45,
  });
  const rightWall = addBox(.12, 5, 8, sideWall, 3.6, 2.4, 2.64);
  rightWall.name = 'room-right-wall';

  // Sofa runs along the right wall beside the seated viewer, clear of the desk.
  const sofa = createSofa(THREE);
  sofa.position.set(3.14, .04, 2.50);
  sofa.rotation.y = -Math.PI / 2;
  scene.add(sofa);
  const puppy = createDalmatianPuppy(THREE);
  puppy.position.set(.05, .565, .015);
  puppy.rotation.y = Math.PI;
  puppy.scale.setScalar(.92);
  sofa.add(puppy);

  const wallDecorStart = scene.children.length;
  // A quiet location marker above the monitors.
  const mapFrame = roundedBox(THREE, 1.05, 1.41, .055, .035, black);
  mapFrame.position.set(0, 3.5, -2.01);
  scene.add(mapFrame);
  const map = new THREE.Mesh(
    new THREE.PlaneGeometry(.91, 1.27),
    new THREE.MeshBasicMaterial({ map: loadAssetTexture(THREE, '/assets/helsinki-map.png?v=3'), side: THREE.DoubleSide, toneMapped: false })
  );
  map.position.set(0, 3.5, -1.96);
  map.renderOrder = 2;
  scene.add(map);

  // Slim wall shelves keep the wall personal without turning it into another dense board.
  const shelfMaterial = standard(0x111214, .7);
  [-1.32, 1.32].forEach((x) => addBox(1.12, .055, .25, shelfMaterial, x, 3.08, -1.89));

  const bookTargets = [];
  const bookSpecs = [
    { title: 'USER FRIENDLY', author: 'Kuang + Fabricant', style: 'user-friendly', x: -1.68, width: .085, height: .5, color: 0xf1efeb, background: '#f4f2ee', foreground: '#202124', titleSize: 43, weight: 500 },
    { title: 'START WITH WHY', author: 'Simon Sinek', style: 'start-with-why', x: -1.585, width: .075, height: .54, color: 0xd84b36, background: '#d94c38', foreground: '#fffaf2', titleSize: 44 },
    { title: 'THE INFINITY MACHINE', author: 'Sebastian Mallaby', style: 'infinity', x: -1.485, width: .085, height: .49, color: 0x536c9d, background: '#536c9d', foreground: '#ffffff', titleSize: 38, weight: 600 },
    { title: 'BLACK BOX THINKING', author: 'Matthew Syed', style: 'black-box', x: -1.375, width: .09, height: .56, color: 0xff5a0a, background: '#ff5a0a', foreground: '#111111', titleSize: 42 },
    { title: 'BUILD', author: 'Tony Fadell', style: 'build', x: -1.27, width: .08, height: .47, color: 0xf1f0ec, background: '#f3f2ef', foreground: '#171719', titleSize: 61 },
  ];
  bookSpecs.forEach((book) => {
    const { x, width, height, color } = book;
    const y = 3.11 + height / 2;
    const bookRoot = new THREE.Group();
    bookRoot.position.set(x, y, -1.84);
    bookRoot.userData.restZ = -1.84;
    const bookBody = new THREE.Mesh(new THREE.BoxGeometry(width, height, .18), standard(color, .78));
    bookBody.userData.book = book;
    bookBody.userData.bookRoot = bookRoot;
    bookRoot.add(bookBody);
    const spine = new THREE.Mesh(
      new THREE.PlaneGeometry(width * .9, height * .94),
      new THREE.MeshBasicMaterial({ map: createBookSpineTexture(THREE, book), toneMapped: false })
    );
    spine.name = `book-spine-${book.style}`;
    spine.position.z = .096;
    spine.userData.book = book;
    spine.userData.bookRoot = bookRoot;
    bookRoot.add(spine);
    bookTargets.push(bookBody, spine);
    scene.add(bookRoot);
  });

  const potMaterial = standard(0xded9cf, .72);
  const leafTextures = createLeafSurfaceTextures(THREE);
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: leafTextures.color,
    bumpMap: leafTextures.bump,
    bumpScale: .008,
    roughness: .9,
    side: THREE.DoubleSide,
  });
  const stemMaterial = standard(0x214a2a, .88);
  const veinMaterial = new THREE.LineBasicMaterial({ color: 0x284f30, transparent: true, opacity: .28 });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(.12, .15, .22, 16), potMaterial);
  pot.position.set(1.16, 3.22, -1.84);
  scene.add(pot);
  const soil = new THREE.Mesh(new THREE.CircleGeometry(.113, 20), standard(0x46372d, .95));
  soil.rotation.x = -Math.PI / 2;
  soil.position.set(1.16, 3.335, -1.84);
  scene.add(soil);
  const screenTextures = [];
  let mainScreen;
  [
    { x: .99, y: 3.55, z: -1.81, rotation: .42, scale: .84 },
    { x: 1.08, y: 3.69, z: -1.845, rotation: .2, scale: .68 },
    { x: 1.18, y: 3.62, z: -1.805, rotation: -.05, scale: 1 },
    { x: 1.3, y: 3.68, z: -1.84, rotation: -.22, scale: .72 },
    { x: 1.39, y: 3.52, z: -1.815, rotation: -.48, scale: .86 },
  ].forEach(({ x, y, z, rotation, scale }) => {
    const stemPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.16, 3.33, -1.845),
      new THREE.Vector3((1.16 + x) / 2, y - .13, -1.84),
      new THREE.Vector3(x, y + .035, -1.835),
    ]);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(stemPath, 16, .007, 7, false), stemMaterial));

    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, -.19);
    leafShape.bezierCurveTo(-.09, -.13, -.14, -.02, -.12, .08);
    leafShape.bezierCurveTo(-.1, .16, -.035, .14, 0, .075);
    leafShape.bezierCurveTo(.035, .14, .1, .16, .12, .08);
    leafShape.bezierCurveTo(.14, -.02, .09, -.13, 0, -.19);
    const leafGroup = new THREE.Group();
    const leaf = new THREE.Mesh(new THREE.ShapeGeometry(leafShape, 18), leafMaterial);
    leafGroup.add(leaf);
    const veinPoints = [
      0, -.17, .004, 0, .08, .004,
      0, -.1, .004, -.07, -.035, .004,
      0, -.1, .004, .07, -.035, .004,
      0, -.035, .004, -.09, .035, .004,
      0, -.035, .004, .09, .035, .004,
      0, .02, .004, -.065, .095, .004,
      0, .02, .004, .065, .095, .004,
    ];
    leafGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(veinPoints, 3)), veinMaterial));
    leafGroup.position.set(x, y, z);
    leafGroup.rotation.z = rotation;
    leafGroup.scale.setScalar(scale);
    scene.add(leafGroup);
  });

  const basketball = new THREE.Group();
  basketball.position.set(1.58, 3.235, -1.82);
  basketball.add(new THREE.Mesh(new THREE.SphereGeometry(.13, 24, 16), standard(0xc66b2d, .72)));
  const seamMaterial = standard(0x2b1c16, .86);
  [
    [0, 0, 0],
    [Math.PI / 2, 0, 0],
    [0, Math.PI / 2, .55],
  ].forEach(([x, y, z]) => {
    const seam = new THREE.Mesh(new THREE.TorusGeometry(.131, .006, 6, 36), seamMaterial);
    seam.rotation.set(x, y, z);
    basketball.add(seam);
  });
  scene.add(basketball);
  scene.children.slice(wallDecorStart).forEach(object => { object.position.z += .8; });

  // The user's 160 x 80 cm desk. The back edge stays put while the front edge
  // extends toward the seated camera, leaving more usable surface in view.
  const desktopSurface = addBox(4.9, .1, 2.45, white, 0, .76, .15);
  desktopSurface.name = 'room-desk-surface';
  addBox(.11, 1.52, .11, metal, -2.18, 0, .9);
  addBox(.11, 1.52, .11, metal, 2.18, 0, .9);

  // One dual-monitor arm and two modest monitors.
  addBox(.13, 1.18, .13, metal, -.48, 1.39, -1.02);
  addBox(2.25, .1, .12, metal, -.48, 1.62, -.96);
  [
    { x: .57, z: -.62, angle: 0 },
    { x: -1.61, z: -.71, angle: .14 },
  ].forEach(({ x, z, angle }, index) => {
    addBox(.1, .34, .1, metal, x, 1.55, z - .13);
    const frame = roundedBox(THREE, 2.19, 1.2, .09, .035, black);
    frame.position.set(x, 1.87, z);
    frame.rotation.y = angle;
    scene.add(frame);
    const screenTexture = createScreenTexture(THREE, index);
    screenTextures.push(screenTexture);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.11, 1.14),
      new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false })
    );
    screen.position.set(x + Math.sin(angle) * .055, 1.87, z + Math.cos(angle) * .055);
    screen.rotation.y = angle;
    scene.add(screen);
    if (index === 0) mainScreen = screen;
  });

  // App windows are opened from the dock. The supplied Codex screenshot is used
  // as-is (with only its surrounding wallpaper made transparent).
  const appWindow = new THREE.Group();
  appWindow.visible = true;
  const appTexture = loadAssetTexture(THREE, '/assets/codex-window.png?v=2');
  appTexture.colorSpace = THREE.SRGBColorSpace;
  const appPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.62, .88),
    new THREE.MeshBasicMaterial({ map: appTexture, transparent: true, depthWrite: false, toneMapped: false })
  );
  // Default Codex window lives on the left-hand display.
  appPlane.position.set(-1.61 + Math.sin(.14) * .07, 1.92, -.71 + Math.cos(.14) * .07);
  appPlane.rotation.y = .14;
  appWindow.add(appPlane);
  scene.add(appWindow);
  let appWindowMaximized = false;
  let draggingAppWindow = false;
  let dragLastX = 0;
  let dragLastY = 0;
  const appNames = ['VS Code', 'Chrome', 'Spotify', 'Discord', 'Steam', 'Figma', 'Codex', 'Obsidian', 'LM Studio', 'Xcode'];
  const actionableApps = new Set([0, 1, 6, 7, 8, 9]);
  const dockTooltip = document.createElement('div');
  dockTooltip.className = 'workspace-dock-tooltip';
  dockTooltip.hidden = true;
  view.append(dockTooltip);
  const openDockApp = (index) => {
    if (!actionableApps.has(index)) return;
    appWindow.visible = true;
    screenTextures.forEach((screenTexture) => screenTexture.userData.setAppOpen?.(true));
    appWindowMaximized = false;
    appWindow.scale.set(1, 1, 1);
  };
  const appWindowControlAt = (event) => {
    if (!appWindow.visible) return '';
    setRayFromEvent(event);
    const hit = raycaster.intersectObject(appPlane, false)[0];
    if (!hit?.uv) return '';
    const x = hit.uv.x;
    const y = 1 - hit.uv.y;
    // The asset is cropped to the app window, so traffic lights are near the
    // left edge (not at the original full-image x coordinates).
    if (x < .03 && y < .13) return 'close';
    if (x < .06 && y < .13) return 'minimize';
    if (x < .09 && y < .13) return 'maximize';
    return '';
  };
  const appWindowHeaderAt = (event) => {
    if (!appWindow.visible) return false;
    setRayFromEvent(event);
    const hit = raycaster.intersectObject(appPlane, false)[0];
    if (!hit?.uv) return false;
    const y = 1 - hit.uv.y;
    return y < .16;
  };

  const propMaterials = { white, keyWhite, dark, black, metal, silver, indicator, folder, folderLight, sticky, pencil, wood, eraser, paper };
  const deskLayers = createDeskLayers(THREE, propMaterials);
  deskLayers.position.set(0, .81, -.3);
  scene.add(deskLayers);
  const mac = createMacMini(THREE, propMaterials);
  mac.position.set(-.48, .81, -.56);
  scene.add(mac);
  const dac = createDac(THREE, propMaterials);
  dac.position.set(.47, .81, -.57);
  scene.add(dac);
  const headphones = createHeadphones(THREE, propMaterials);
  headphones.position.set(1.78, .24, 1.42);
  headphones.rotation.z = -.08;
  scene.add(headphones);
  // Small white height-adjustment lever under the desk edge; the headphones hang from it.
  const deskLever = new THREE.Mesh(new THREE.BoxGeometry(.035, .25, .035), white);
  deskLever.position.set(2.03, .64, 1.35);
  deskLever.rotation.z = -.22;
  scene.add(deskLever);
  const cableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(.178, .895, -.317),
    new THREE.Vector3(.05, .82, -.1),
    new THREE.Vector3(-.2, .815, .18),
    new THREE.Vector3(.22, .815, .68),
    new THREE.Vector3(.82, .815, 1.03),
    new THREE.Vector3(1.4, .76, 1.27),
    new THREE.Vector3(1.72, .61, 1.4),
  ]);
  const headphoneCable = new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 40, .008, 8, false), black);
  headphoneCable.name = 'headphone-cable';
  scene.add(headphoneCable);
  const keyboard = createKeyboard(THREE, propMaterials);
  keyboard.position.set(-1.58, .81, .55);
  keyboard.rotation.y = .12;
  scene.add(keyboard);
  const mouse = createMouse(THREE, propMaterials);
  mouse.position.set(1.85, .81, .62);
  mouse.scale.set(.9, .9, .78);
  scene.add(mouse);

  const ambient = new THREE.HemisphereLight(0xc9c5d0, 0x242126, 1.05);
  scene.add(ambient);
  // Soft reflected room light makes the side seating readable away from the monitors.
  const sofaFill = new THREE.PointLight(0xffead7, 9, 6, 2);
  sofaFill.position.set(1.6, 2.7, 3.5);
  scene.add(sofaFill);
  const warmLight = new THREE.PointLight(0xffead0, 24, 6, 1.7);
  warmLight.position.set(-2.25, 2.25, .15);
  scene.add(warmLight);
  const purpleLight = new THREE.PointLight(0x8154a3, 26, 4.2, 1.8);
  purpleLight.position.set(0, 1.15, -1.22);
  scene.add(purpleLight);

  let active = false;
  let startTime = 0;
  let targetYaw = 0;
  let targetPitch = -.08;
  let yaw = 0;
  let pitch = -.52;
  let cameraDragging = false;
  let cameraLastX = 0;
  let cameraLastY = 0;
  let frameId;
  let hoveredBookRoot;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const setRayFromEvent = (event) => {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    );
    raycaster.setFromCamera(pointer, camera);
  };

  const playerControlHit = (event) => {
    if (!active || !mainScreen) return false;
    setRayFromEvent(event);
    const hit = raycaster.intersectObject(mainScreen, false)[0];
    return Boolean(hit?.uv && screenTextures[0].userData.isPlayerControlAt(hit.uv));
  };

  const dockHit = (event) => {
    if (!active || !mainScreen) return -1;
    setRayFromEvent(event);
    const hit = raycaster.intersectObject(mainScreen, false)[0];
    return hit?.uv ? screenTextures[0].userData.dockIconAt(hit.uv) : -1;
  };

  const updateBookHover = (event) => {
    if (!active) return;
    setRayFromEvent(event);
    const hit = raycaster.intersectObjects(bookTargets, false)[0];
    const nextRoot = hit?.object.userData.bookRoot;
    if (hoveredBookRoot && hoveredBookRoot !== nextRoot) hoveredBookRoot.position.z = hoveredBookRoot.userData.restZ;
    hoveredBookRoot = nextRoot;
    if (!hit || !nextRoot) {
      bookTooltip.hidden = true;
      return;
    }
    nextRoot.position.z = nextRoot.userData.restZ + .045;
    const { title, author } = hit.object.userData.book;
    bookTooltip.replaceChildren();
    const titleLine = document.createElement('strong');
    titleLine.textContent = title;
    const authorLine = document.createElement('span');
    authorLine.textContent = author;
    bookTooltip.append(titleLine, authorLine);
    bookTooltip.style.left = `${Math.min(innerWidth - 190, event.clientX + 16)}px`;
    bookTooltip.style.top = `${Math.min(innerHeight - 70, event.clientY + 16)}px`;
    bookTooltip.hidden = false;
  };

  const onPointerMove = (event) => {
    if (draggingAppWindow) {
      const dx = (event.clientX - dragLastX) / innerWidth * 4.15;
      const dy = -(event.clientY - dragLastY) / innerHeight * 2.25;
      dragLastX = event.clientX;
      dragLastY = event.clientY;
      // The plane starts over the left display; these offsets keep its full
      // width inside the combined two-monitor span while crossing the seam.
      appWindow.position.x = THREE.MathUtils.clamp(appWindow.position.x + dx, -.22, 2.3);
      // Move the window toward the nearer display's depth as it crosses the seam.
      const seamProgress = THREE.MathUtils.clamp(appWindow.position.x / 2.3, 0, 1);
      appWindow.position.z = THREE.MathUtils.smoothstep(seamProgress, 0, 1) * .105;
      // Keep the window above the Dock and inside the monitor's top edge.
      appWindow.position.y = THREE.MathUtils.clamp(appWindow.position.y + dy, -.08, .08);
      renderer.domElement.classList.add('is-over-control');
      return;
    }
    if (event.pointerType === 'touch' && cameraDragging) {
      event.preventDefault();
      const dx = event.clientX - cameraLastX;
      const dy = event.clientY - cameraLastY;
      cameraLastX = event.clientX;
      cameraLastY = event.clientY;
      targetYaw = THREE.MathUtils.clamp(targetYaw - dx * .004, -1.48, 1.48);
      targetPitch = THREE.MathUtils.clamp(targetPitch - dy * .003, -.62, .2);
      return;
    }
    if (event.pointerType === 'touch') return;
    const nx = event.clientX / innerWidth * 2 - 1;
    const ny = event.clientY / innerHeight * 2 - 1;
    targetYaw = nx * -1.48;
    targetPitch = THREE.MathUtils.clamp(-ny * .46 - .12, -.62, .2);
    const dockIndex = dockHit(event);
    const appControl = appWindowControlAt(event);
    renderer.domElement.classList.toggle('is-over-control', playerControlHit(event) || dockIndex >= 0 || Boolean(appControl) || appWindowHeaderAt(event));
    if (dockIndex >= 0) {
      dockTooltip.textContent = appNames[dockIndex];
      dockTooltip.style.left = `${Math.min(innerWidth - 150, event.clientX + 14)}px`;
      dockTooltip.style.top = `${Math.max(10, event.clientY - 38)}px`;
      dockTooltip.hidden = false;
    } else {
      dockTooltip.hidden = true;
    }
    updateBookHover(event);
  };

  const onPointerDown = (event) => {
    if (document.body.classList.contains('has-desktop')) {
      setRayFromEvent(event);
      if (mainScreen && raycaster.intersectObject(mainScreen, false).length) {
        event.preventDefault();
        closeWorkspace();
        return;
      }
    }
    const appControl = appWindowControlAt(event);
    if (appControl) {
      event.preventDefault();
      if (appControl === 'close' || appControl === 'minimize') {
        appWindow.visible = false;
        screenTextures.forEach((screenTexture) => screenTexture.userData.setAppOpen?.(false));
      }
      if (appControl === 'maximize') {
        appWindowMaximized = !appWindowMaximized;
        appWindow.scale.setScalar(appWindowMaximized ? 1.12 : 1);
      }
      return;
    }
    if (appWindowHeaderAt(event)) {
      event.preventDefault();
      draggingAppWindow = true;
      dragLastX = event.clientX;
      dragLastY = event.clientY;
      renderer.domElement.setPointerCapture?.(event.pointerId);
      renderer.domElement.classList.add('is-dragging-window');
      return;
    }
    if (playerControlHit(event)) {
      event.preventDefault();
      window.dispatchEvent(new Event('portfolio:toggle-playback'));
      return;
    }
    const dockIndex = dockHit(event);
    if (dockIndex >= 0) {
      openDockApp(dockIndex);
      return;
    }
    if (event.pointerType === 'touch') {
      event.preventDefault();
      cameraDragging = true;
      cameraLastX = event.clientX;
      cameraLastY = event.clientY;
      renderer.domElement.setPointerCapture?.(event.pointerId);
    }
  };
  const onPointerUp = (event) => {
    if (draggingAppWindow) {
      draggingAppWindow = false;
      renderer.domElement.classList.remove('is-dragging-window');
    }
    cameraDragging = false;
    if (renderer.domElement.hasPointerCapture?.(event.pointerId)) {
      renderer.domElement.releasePointerCapture(event.pointerId);
    }
  };

  const audioForward = new THREE.Vector3();
  const audioUp = new THREE.Vector3();
  const audioHeadphones = new THREE.Vector3();
  const render = (time) => {
    if (!active) return;
    keyboard.userData.animate?.(time);
    puppy.userData.animate?.(time);
    const lift = Math.min(1, (time - startTime) / 1050);
    const easedLift = 1 - Math.pow(1 - lift, 3);
    yaw += (targetYaw - yaw) * .055;
    pitch += (targetPitch - pitch) * .045;
    camera.position.y = 1.34 + easedLift * .48;
    camera.position.z = 3.18 - easedLift * .36;
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
    camera.getWorldDirection(audioForward);
    audioUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
    headphones.getWorldPosition(audioHeadphones);
    window.portfolioAudio?.updateRoom(camera.position, audioForward, audioUp, audioHeadphones);
    renderer.render(scene, camera);
    frameId = requestAnimationFrame(render);
  };

  const resize = () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(innerWidth, innerHeight);
  };

  addEventListener('resize', resize);
  view.addEventListener('pointermove', onPointerMove, { passive: false });
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointercancel', onPointerUp);
  window.addEventListener('portfolio:playback', (event) => {
    screenTextures.forEach((screenTexture) => screenTexture.userData.setPlayback(event.detail));
  });

  return {
    open() {
      active = true;
      appWindow.visible = !document.body.classList.contains('has-desktop');
      startTime = performance.now();
      pitch = -.52;
      targetPitch = -.08;
      frameId = requestAnimationFrame(render);
    },
    close() {
      active = false;
      cancelAnimationFrame(frameId);
      renderer.domElement.classList.remove('is-over-control');
      if (hoveredBookRoot) hoveredBookRoot.position.z = hoveredBookRoot.userData.restZ;
      hoveredBookRoot = undefined;
      bookTooltip.hidden = true;
      dockTooltip.hidden = true;
      appWindow.visible = false;
      screenTextures.forEach((screenTexture) => screenTexture.userData.setAppOpen?.(false));
      draggingAppWindow = false;
      renderer.domElement.classList.remove('is-dragging-window');
    },
  };
};

const openWorkspace = async () => {
  if (opening || view.classList.contains('is-open') || view.classList.contains('is-returning')) return;
  opening = true;
  enterButton.disabled = true;
  enterButton.querySelector('span:last-child').textContent = 'Looking up…';
  document.body.classList.add('is-workspace-open', 'is-workspace-entering');
  view.classList.add('is-open');
  view.querySelector('.workspace-loading').textContent = 'Loading the workspace…';
  view.setAttribute('aria-hidden', 'false');
  view.inert = false;
  document.querySelector('.desktop')?.setAttribute('inert', '');
  document.querySelector('.folder-section')?.setAttribute('inert', '');
  exitButton.focus();
  enterButton.setAttribute('aria-expanded', 'true');
  try {
    workspace ||= await buildWorkspace();
    if (!view.classList.contains('is-open')) return;
    view.classList.add('is-ready');
    workspace.open();
    window.portfolioAudio?.setRoom(true);
  } catch (error) {
    view.querySelector('.workspace-loading').textContent = `The workspace could not be loaded: ${error.message}`;
    console.error(error);
  } finally {
    opening = false;
    enterButton.disabled = false;
    enterButton.querySelector('span:last-child').innerHTML = enterLabel;
  }
};

const closeWorkspace = () => {
  if (!view.classList.contains('is-open') || view.classList.contains('is-returning')) return;
  window.portfolioAudio?.setRoom(false);
  view.classList.add('is-returning');
  view.classList.remove('is-open');
  view.setAttribute('aria-hidden', 'true');
  enterButton.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('is-workspace-open', 'is-workspace-entering');
  view.inert = true;
  document.querySelector('.desktop')?.removeAttribute('inert');
  document.querySelector('.folder-section')?.removeAttribute('inert');
  (document.querySelector('.room-button') || enterButton).focus({ preventScroll: true });
  window.setTimeout(() => {
    workspace?.close();
    view.classList.remove('is-returning');
  }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 480);
};

enterButton?.addEventListener('click', openWorkspace);
exitButton?.addEventListener('click', closeWorkspace);
addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && view?.classList.contains('is-open')) closeWorkspace();
});

