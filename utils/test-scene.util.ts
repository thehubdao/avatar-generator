import {AxesHelper, BoxGeometry, DoubleSide, Mesh, MeshPhongMaterial, PointLight, AmbientLight} from "three";

export function GetTestCube(): Mesh {
  const geometry = new BoxGeometry(2, 16, 2);
  const material = new MeshPhongMaterial( {
    color: 0x156289,
    emissive: 0x072534,
    side: DoubleSide,
    flatShading: true
  } );

  const cube = new Mesh(geometry, material);
  cube.position.set(1, 8, 1);
  return cube;
}

export function GetTestAxis(size: number): AxesHelper {
  const axesHelper = new AxesHelper(size);
  return axesHelper;
}

export function GetTestLights(): PointLight[] {
  const lights: PointLight[] = [];
  lights[ 0 ] = new PointLight( 0xffffff, 1, 0 );
  // lights[ 1 ] = new PointLight( 0xffffff, 3, 0 );
  // lights[ 2 ] = new PointLight( 0xffffff, 3, 0 );

  lights[ 0 ].position.set( 1, 1, 10 );
  // lights[ 1 ].position.set( 100, 200, 100 );
  // lights[ 2 ].position.set( - 100, - 200, - 100 );
  
  return lights;
}

export function GetAmbientLights(): AmbientLight[] {
  const lights: AmbientLight[] = [];
  lights[ 0 ] = new AmbientLight( 0x404040 );
  
  return lights;
}