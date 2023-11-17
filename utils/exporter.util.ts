import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter";
import {Delay, LogError, Raise} from "./common.util";
import {CommonErrorCode, Module} from "../enums/common.enum";
import {clone} from "three/examples/jsm/utils/SkeletonUtils";
import {IsBone, IsSkinnedMesh, SetPose} from "./model.util";
import {BoneMatrix} from "../types/model.type";
import {Result} from "../types/common.type";
import GLTFExporterRemoveSkinDuplicatesExtension from "./threejs/export-plugin.util";
import {Bone, BufferGeometry, Material, Matrix4, Object3D, Scene, Skeleton, SkinnedMesh} from "three";
import {mergeGeometries} from "three/examples/jsm/utils/BufferGeometryUtils";
import {degToRad} from "three/src/math/MathUtils";
import {VrmStructure} from "../interfaces/export.interface";

class ExporterUtil {
  private static _instance: ExporterUtil;
  private _gltfExporter: GLTFExporter | undefined;
  private _vrmExporter: GLTFExporter | undefined;
    
  public static Instance() {
    if(ExporterUtil._instance === undefined)
      ExporterUtil._instance = new ExporterUtil();
    
    return ExporterUtil._instance;
  }
  
  public GltfExporter() {
    if(this._gltfExporter == undefined) {
      this._gltfExporter = new GLTFExporter();
    }
    
    return this._gltfExporter;
  }
  
  public VrmExporter() {
    if (this._vrmExporter == undefined) {
      this._vrmExporter = new GLTFExporter();
      this._vrmExporter.register(writer => new GLTFExporterRemoveSkinDuplicatesExtension(writer));
    }
    
    return this._vrmExporter;
  }
}

export async function ExportModelGlb(model: GLTF | undefined): Promise<Result<Blob>> {
  if (model == undefined)
    Raise("Model can't be undefined if trying to export!");

  const exporter = ExporterUtil.Instance().GltfExporter();
  // CleanModelForExport(model); // TODO: use at some point
  const out = await exporter.parseAsync(model.scene, {
    animations: model.animations,
    binary: true,
  });

  return {success: true, value: new Blob([out as ArrayBuffer], {type: 'application/octet-stream'})};
}

export async function ExportObjectGltf(model: Object3D | undefined): Promise<Result<Blob>> {
  if (model == undefined)
    Raise("Model can't be undefined if trying to export!");

  const exporter = ExporterUtil.Instance().GltfExporter();
  
  const gltf = await exporter.parseAsync(model, {
    animations: [],
  });
  
  // Export gltf
  const output = JSON.stringify( gltf, null, 2 );
  return {success: true, value:  new Blob( [ output ], { type: 'text/plain' } )};
}

export async function ExportModelVrmOG(model: GLTF | undefined, pose?: Record<string, BoneMatrix | undefined>): Promise<Result<Blob>> {
  const exporter = ExporterUtil.Instance().GltfExporter();
  try {
    if (model == undefined)
      Raise("Model can't be undefined if trying to export!");

    const sceneClone = clone(model.scene);

    SetPose(sceneClone, pose);

    // CleanModelForExport(model); // TODO: use at some point
    let gltf = await exporter.parseAsync(sceneClone, {
      animations: [],
    }) as VrmStructure;
    
    console.log("LeGltf: ", gltf);
    // Export gltf
    // const output = JSON.stringify( gltf, null, 2 );
    // return {success: true, value:  new Blob( [ output ], { type: 'text/plain' } )};
    
    gltf = {
      ...gltf,
      ...VrmBase
    };
    gltf.extensionsUsed?.push("VRM");

    // const cSkins = CleanSkins(gltf.skins);
    // if (cSkins.success)
    //   gltf.skins = cSkins.value;
    //
    // const rScenes = AddNoBoneScenes(gltf.nodes, gltf.skins);
    // if (rScenes.success)
    //   gltf.scenes = rScenes.value;
    

    // Add vrm info to gltf
    const newMaterialProperties = GenerateVrmMaterialProperties(gltf.materials);
    gltf.extensions.VRM.materialProperties = newMaterialProperties.success ? newMaterialProperties.value : undefined;
    console.log(gltf);

    // Binary gltf
    const vrmArrayBuffer = await BinarizeGltfToVrm(gltf);
    if (!vrmArrayBuffer.success)
      return vrmArrayBuffer;

    return {
      success: true,
      value: new Blob([vrmArrayBuffer.value], { type: 'application/octet-stream' })
    };
  } catch (err) {
    const msg = "Error while exporting to VRM!";
    void LogError(Module.ExporterUtil, msg, err);
    return {success: false, errMessage: msg, errCode: CommonErrorCode.InternalError};
  }
}

export async function ExportModelVrm(model: GLTF | undefined, pose?: Record<string, BoneMatrix | undefined>): Promise<Result<Blob>> {
  const exporter = ExporterUtil.Instance().VrmExporter();
  try {
    if (model == undefined)
      Raise("Model can't be undefined if trying to export!");

    // TODO: Check how to force scale on sub objects without changing scale on those subobjects
    
    console.log(model);
    
    const sceneClone = clone(model.scene);
    SetPose(sceneClone, pose);

    const sceneReal = new Scene();
    sceneReal.name = "Scene";
    sceneReal.userData.name = "Scene";
    
    try {
      const skinnedMeshArray: SkinnedMesh[] = [];
      const geometryArray: BufferGeometry[] = [];
      const materialArray: Material[] = [];

      sceneClone.traverse(obj => {
        if (IsSkinnedMesh(obj)) {
          skinnedMeshArray.push(obj);
          geometryArray.push(obj.geometry.clone());
          const mat = obj.material;
          if (mat instanceof Material) {
            materialArray.push(mat.clone());
          } else {
            const lel = mat.map(m => m.clone());
            materialArray.push(...lel);
          }
        }
      });
    
      const allowedProps = Object.keys(geometryArray[0].attributes);
      
      for (const geom of geometryArray) {
        for (const key of Object.keys(geom.attributes)) {
          if (!allowedProps.includes(key))
            delete geom.attributes[key];
        }
      }

      const firstSM = skinnedMeshArray[0];
      const matrixCopy = firstSM.skeleton.boneInverses.map(b => b.clone());
      const actualBones = firstSM.skeleton.bones[0].clone(true);
      const boneArray: Bone[] = [];
      
      actualBones.traverse(obj => {
        if (IsBone(obj)) {
          boneArray.push(obj);
        }
      });
      
      const avatarGeom = mergeGeometries(geometryArray, true);

      const leSkinnedMesh = new SkinnedMesh(avatarGeom, materialArray);
      leSkinnedMesh.name = "Avatar";
      leSkinnedMesh.userData.name = "Avatar";
      
      // leSkinnedMesh.scale.setScalar(0.01);
      // leSkinnedMesh.rotateX(degToRad(90));
      // leSkinnedMesh.position.setScalar(0);
      // leSkinnedMesh.updateMatrix();
      // leSkinnedMesh.geometry.applyMatrix4(leSkinnedMesh.matrix);
      // leSkinnedMesh.scale.setScalar(1);
      // leSkinnedMesh.rotation.set(0, 0, 0);
      // leSkinnedMesh.position.setScalar(0);
      // leSkinnedMesh.updateMatrix();

      actualBones.scale.setScalar(0.01);
      actualBones.rotateX(degToRad(90));
      actualBones.position.setScalar(0);
      actualBones.updateMatrix();
      
      const newSkeleton = new Skeleton(boneArray, matrixCopy);
      const identity = new Matrix4();
      leSkinnedMesh.bind(newSkeleton, identity);
      
      leSkinnedMesh.scale.setScalar(0.01);
      leSkinnedMesh.rotateX(degToRad(90));
      leSkinnedMesh.updateMatrix();
      leSkinnedMesh.geometry.applyMatrix4(leSkinnedMesh.matrix);

      // leSkinnedMesh.updateMatrix();
      
      // actualBones.scale.setScalar(0.01);
      // actualBones.rotateX(degToRad(90));
      // actualBones.position.setScalar(0);
      // actualBones.updateMatrix();

      // actualBones.scale.setScalar(0.01);
      // actualBones.rotateX(degToRad(90));
      // actualBones.position.setScalar(0);
      // actualBones.updateMatrix();

      // leSkinnedMesh.updateMatrix();
      // leSkinnedMesh.geometry.applyMatrix4(leSkinnedMesh.matrix);
      // leSkinnedMesh.scale.setScalar(1);
      // leSkinnedMesh.position.setScalar(0);
      // leSkinnedMesh.rotation.set(0, 0, 0);
      // leSkinnedMesh.updateMatrix();
      
      // const armatureGroup = new Group();
      // armatureGroup.name = "Main";
      // armatureGroup.userData.name = "Main";
      // armatureGroup.scale.setScalar(0.01);
      // armatureGroup.rotateX(degToRad(90));
      // armatureGroup.rotateZ(degToRad(180));
      
      // armatureGroup.children.push(actualBones);
      // armatureGroup.children.push(leSkinnedMesh);
      // armatureGroup.add(actualBones);
      // armatureGroup.add(leSkinnedMesh);

      // sceneReal.children.push(armatureGroup);

      // sceneReal.children.push(actualBones);
      // sceneReal.children.push(leSkinnedMesh);

      // sceneReal.add(actualBones);
      // sceneReal.add(leSkinnedMesh);

      
      // actualBones.geometry.applyMatrix4(leSkinnedMesh.matrix);
      // actualBones.scale.setScalar(1);
      // actualBones.updateMatrix();

      sceneReal.children.push(actualBones);
      sceneReal.children.push(leSkinnedMesh);
      
      // sceneReal.position.setScalar(0);
      // sceneReal.rotation.set(0, 0, 0);
      // sceneReal.scale.setScalar(1);
      // sceneReal.updateMatrix();
    } catch (e) {
      console.error(e);
    }
    
    console.log(sceneReal);

    // CleanModelForExport(model);
    let glb = await exporter.parseAsync(sceneReal, {
      animations: [],
      binary: true,
      trs: true,
    }) as ArrayBuffer;
    
    // return {
    //   success: true,
    //   value: new Blob([glb], { type: 'application/octet-stream' })
    // };

    const headerView = new DataView( glb, 0, BINARY_EXTENSION_HEADER_LENGTH );
    const textDecoder = new TextDecoder();

    const header = {
      magic: textDecoder.decode( new Uint8Array( glb.slice( 0, 4 ) ) ),
      version: headerView.getUint32( 4, true ),
      length: headerView.getUint32( 8, true )
    };

    const chunkContentsLength = header.length - BINARY_EXTENSION_HEADER_LENGTH;
    const chunkView = new DataView( glb, BINARY_EXTENSION_HEADER_LENGTH );
    let chunkIndex = 0;
    let content: string | undefined;
    let body: ArrayBuffer | undefined;

    while ( chunkIndex < chunkContentsLength ) {
      const chunkLength = chunkView.getUint32( chunkIndex, true );
      chunkIndex += 4;

      const chunkType = chunkView.getUint32( chunkIndex, true );
      chunkIndex += 4;

      if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON ) {
        const contentArray = new Uint8Array( glb, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength );
        content = textDecoder.decode( contentArray );
      } else if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN ) {
        const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
        body = glb.slice( byteOffset, byteOffset + chunkLength );
      }

      // Clients must ignore chunks with unknown types.
      chunkIndex += chunkLength;
    }

    let gltf = JSON.parse(content ?? "");
        
    gltf = {
      ...gltf,
      ...VrmBase
    };
    gltf.extensionsUsed?.push("VRM");
    // gltf.scenes[0].nodes = [66, 64, 65];

    console.log(gltf);
    
    // Add vrm info to gltf
    const newMaterialProperties = GenerateVrmMaterialProperties(gltf.materials);
    gltf.extensions.VRM.materialProperties = newMaterialProperties.success ? newMaterialProperties.value : undefined;

    const textEncoder = new TextEncoder();

    // Binary chunk.
    const binaryChunk = GetPaddedArrayBuffer(body ?? new ArrayBuffer(0));
    const binaryChunkPrefix = new DataView(new ArrayBuffer(GLB_CHUNK_PREFIX_BYTES));
    binaryChunkPrefix.setUint32(0, binaryChunk.byteLength, true);
    binaryChunkPrefix.setUint32(4, GLB_CHUNK_TYPE_BIN, true);

    // JSON chunk.
    const jsonChunk = GetPaddedArrayBuffer(textEncoder.encode(JSON.stringify(gltf)).buffer, 0x20);
    const jsonChunkPrefix = new DataView(new ArrayBuffer(GLB_CHUNK_PREFIX_BYTES));
    jsonChunkPrefix.setUint32(0, jsonChunk.byteLength, true);
    jsonChunkPrefix.setUint32(4, GLB_CHUNK_TYPE_JSON, true);

    // GLB header.
    const header2 = new ArrayBuffer(GLB_HEADER_BYTES);
    const headerView2 = new DataView(header2);
    headerView2.setUint32(0, GLB_HEADER_MAGIC, true);
    headerView2.setUint32(4, GLB_VERSION, true);
    const totalByteLength = GLB_HEADER_BYTES
      + jsonChunkPrefix.byteLength + jsonChunk.byteLength
      + binaryChunkPrefix.byteLength + binaryChunk.byteLength;
    headerView2.setUint32(8, totalByteLength, true);

    const vrmBlob = new Blob([
      header2,
      jsonChunkPrefix,
      jsonChunk,
      binaryChunkPrefix,
      binaryChunk
    ], {type: 'application/octet-stream'});

    return { success: true, value: vrmBlob };
  } catch (err) {
    const msg = "Error while exporting to VRM!";
    void LogError(Module.ExporterUtil, msg, err);
    return {success: false, errMessage: msg, errCode: CommonErrorCode.InternalError};
  }
}


const BINARY_EXTENSION_HEADER_LENGTH = 12;
const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 } as const;
const GLB_CHUNK_TYPE_BIN = 0x004E4942;
const GLB_CHUNK_PREFIX_BYTES = 8;
const GLB_CHUNK_TYPE_JSON = 0x4E4F534A;
const GLB_HEADER_BYTES = 12;
const GLB_HEADER_MAGIC = 0x46546C67;
const GLB_VERSION = 2;

export async function ExportModelVrmTest1(model: GLTF | undefined, pose?: Record<string, BoneMatrix | undefined>): Promise<Result<Blob>> {
  const exporter = ExporterUtil.Instance().GltfExporter();
  try {
    if (model == undefined)
      Raise("Model can't be undefined if trying to export!");

    const sceneClone = clone(model.scene);

    SetPose(sceneClone, pose);

    // CleanModelForExport(model); // TODO: use at some point
    let glbAB = await exporter.parseAsync(sceneClone, {
      animations: [],
      binary: true
    }) as ArrayBuffer;

    const headerView = new DataView( glbAB, 0, BINARY_EXTENSION_HEADER_LENGTH );
    const textDecoder = new TextDecoder();

    const header = {
      magic: textDecoder.decode( new Uint8Array( glbAB.slice( 0, 4 ) ) ),
      version: headerView.getUint32( 4, true ),
      length: headerView.getUint32( 8, true )
    };

    console.log("SomeDecoding: ", header);

    const chunkContentsLength = header.length - BINARY_EXTENSION_HEADER_LENGTH;
    const chunkView = new DataView( glbAB, BINARY_EXTENSION_HEADER_LENGTH );
    let chunkIndex = 0;
    let content: string | undefined;
    let body: ArrayBuffer | undefined;

    while ( chunkIndex < chunkContentsLength ) {
      console.log("While true!");
      const chunkLength = chunkView.getUint32( chunkIndex, true );
      chunkIndex += 4;

      const chunkType = chunkView.getUint32( chunkIndex, true );
      chunkIndex += 4;
      
      console.log(chunkLength, chunkType);

      if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON ) {

        const contentArray = new Uint8Array( glbAB, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength );
        content = textDecoder.decode( contentArray );
        console.log("ContentArray: ", contentArray.byteLength)

      } else if ( chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN ) {

        const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
        body = glbAB.slice( byteOffset, byteOffset + chunkLength );
      }

      // Clients must ignore chunks with unknown types.

      chunkIndex += chunkLength;

    }
    
    let gltf = JSON.parse(content ?? "");
        
    // Export gltf
    // const output = JSON.stringify( gltf, null, 2 );
    // return {success: true, value:  new Blob( [ output ], { type: 'text/plain' } )};

    gltf = {
      ...gltf,
      ...VrmBase
    };
    gltf.extensionsUsed?.push("VRM");
    
    // // const cSkins = CleanSkins(gltf.skins);
    // // if (cSkins.success)
    // //   gltf.skins = cSkins.value;
    
    // // const rScenes = AddNoBoneScenes(gltf.nodes, gltf.skins);
    // // if (rScenes.success)
    // //   gltf.scenes = rScenes.value;
    
    // Add vrm info to gltf
    const newMaterialProperties = GenerateVrmMaterialProperties(gltf.materials);
    gltf.extensions.VRM.materialProperties = newMaterialProperties.success ? newMaterialProperties.value : undefined;
    // console.log(gltf);
    
    // // Binary gltf
    // const vrmArrayBuffer = await BinarizeGltfToVrm(gltf);
    // if (!vrmArrayBuffer.success)
    //   return vrmArrayBuffer;

    const textEncoder = new TextEncoder();
    const stringi = JSON.stringify(gltf);
    
    // console.log(gltf);
    console.log(stringi, textEncoder.encode(stringi))
    console.log(header, headerView.byteLength, body?.byteLength);

    // Binary chunk.
    const binaryChunk = GetPaddedArrayBuffer(body ?? new ArrayBuffer(0));
    const binaryChunkPrefix = new DataView(new ArrayBuffer(GLB_CHUNK_PREFIX_BYTES));
    binaryChunkPrefix.setUint32(0, binaryChunk.byteLength, true);
    binaryChunkPrefix.setUint32(4, GLB_CHUNK_TYPE_BIN, true);

    // JSON chunk.
    const jsonChunk = GetPaddedArrayBuffer(textEncoder.encode(JSON.stringify(gltf)).buffer, 0x20);
    const jsonChunkPrefix = new DataView(new ArrayBuffer(GLB_CHUNK_PREFIX_BYTES));
    jsonChunkPrefix.setUint32(0, jsonChunk.byteLength, true);
    jsonChunkPrefix.setUint32(4, GLB_CHUNK_TYPE_JSON, true);

    // GLB header.
    const header2 = new ArrayBuffer(GLB_HEADER_BYTES);
    const headerView2 = new DataView(header2);
    headerView2.setUint32(0, GLB_HEADER_MAGIC, true);
    headerView2.setUint32(4, GLB_VERSION, true);
    const totalByteLength = GLB_HEADER_BYTES
      + jsonChunkPrefix.byteLength + jsonChunk.byteLength
      + binaryChunkPrefix.byteLength + binaryChunk.byteLength;
    headerView2.setUint32(8, totalByteLength, true);
    
    const vrmBlob = new Blob([
      header2,
      jsonChunkPrefix,
      jsonChunk,
      binaryChunkPrefix,
      binaryChunk
    ], {type: 'application/octet-stream'});
    
    return {
      success: true,
      value: vrmBlob
    };
  } catch (err) {
    const msg = "Error while exporting to VRM!";
    void LogError(Module.ExporterUtil, msg, err);
    return {success: false, errMessage: msg, errCode: CommonErrorCode.InternalError};
  }
}

function GetPaddedArrayBuffer(arrayBuffer: ArrayBuffer, paddingByte = 0) {
  const paddedLength = GetPaddedBufferSize(arrayBuffer.byteLength);
  if (paddedLength !== arrayBuffer.byteLength) {
    const array = new Uint8Array(paddedLength);
    array.set(new Uint8Array(arrayBuffer));

    if (paddingByte !== 0) {
      for (let i = arrayBuffer.byteLength; i < paddedLength; i++) {
        array[i] = paddingByte;
      }
    }

    return array.buffer;
  }

  return arrayBuffer;
}

function GetPaddedBufferSize(bufferSize: number) {
  return Math.ceil(bufferSize / 4) * 4;
}

export async function ExportModelGltf(model: GLTF) {
    const exporter = ExporterUtil.Instance().GltfExporter();
    const out = await exporter.parseAsync(model.scene, {
        animations: model.animations,
    });

    const jsonString = JSON.stringify(out, null, 2);
    await SaveString(jsonString, `exported.gltf`);
}

export async function SaveFile(blob: Blob | undefined, fileName: string) {
  if (blob == undefined)
    return LogError(Module.ExporterUtil, "Missing blob to save as a file!");
  
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  
  await Delay(100);
  link.remove();
}

export async function SaveArrayBuffer(buffer: ArrayBuffer, fileName: string) {
  await SaveFile(new Blob([buffer], { type: 'application/octet-stream' }), fileName);
}

export async function SaveString(text: string, fileName: string) {
  await SaveFile(new Blob([text], {type: 'text/plain'}), fileName);
}