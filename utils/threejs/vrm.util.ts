import {DeepPartial} from "redux";
import {mergeDeep} from "immutable";
import {
  GltfMaterial,
  GltfNode,
  GltfScene,
  GltfSkin,
  VrmMaterialProperty,
  VrmStructure
} from "../../interfaces/export.interface";
import {LogError} from "../common.util";
import {CommonErrorCode, Module} from "../../enums/common.enum";
import {Result} from "../../types/common.type";
import {VrmTextureShader} from "../../enums/export.enum";
import {VRM_BASE} from "../../constants/export.constant";

class VrmUtil {
  private static _instance: VrmUtil;
  private _vrmData: VrmStructure | undefined;

  public static Instance() {
    if(this._instance === undefined)
      this._instance = new VrmUtil();

    return this._instance;
  }

  public GetVrmData() {
    if (this._vrmData == undefined)
      this._vrmData = VRM_BASE;
    
    return structuredClone(this._vrmData);
  }
  
  public AddVrmData(extra: DeepPartial<VrmStructure>) {
    const current = this.GetVrmData();
    this._vrmData = mergeDeep(current, extra);
  }
}

export function GetVrmData() {
  return VrmUtil.Instance().GetVrmData();
}

export function GenerateVrmMaterialData(materialList: GltfMaterial[] | undefined) {
  if (materialList == undefined) {
    const msg = "Need material list in order to generate material properties!";
    return void LogError(Module.ExporterUtil, msg);
  }

  const generatedMaterials = materialList
    .map((m): VrmMaterialProperty => {
      return {
        name: m.name,
        shader: VrmTextureShader.Gltf,
        keywordMap: {},
        tagMap: {},
        floatProperties: {},
        vectorProperties: {},
        textureProperties: {}
      }
    });

  const setData: DeepPartial<VrmStructure> = {
    extensions: {
      VRM: {
        materialProperties: generatedMaterials
      }
    }
  };

  VrmUtil.Instance().AddVrmData(setData);
}

export function AddNoBoneScenes(nodesRef: GltfNode[] | undefined, skinsRef: GltfSkin[] | undefined): Result<GltfScene[]> {
  if (nodesRef == undefined || nodesRef.length === 0)
    return {success: false, errMessage: "Nodes on gltf is empty!", errCode: CommonErrorCode.MissingInfo};

  const firstSkinRef = skinsRef?.at(0);
  if (firstSkinRef == undefined)
    return {success: false, errMessage: "Skins on gltf is empty!", errCode: CommonErrorCode.MissingInfo};

  const realNodes: number[] = [];
  
  // find the meshes
  const meshNodes = nodesRef.map((node, index) => {
    if (node.mesh != undefined) {
      realNodes.push(index);
      return {index, node};
    }
  });
  
  // find the parents of the meshes
  nodesRef.map((node, index) => {
    if (node.children != undefined && node.children.some(c => meshNodes.some(m => m?.index === c)))
      realNodes.push(index);
  });
  
  // for (let i = firstSkinRef.skeleton; i < nodesRef.length; i++) {
  //   realNodes.push(i);
  // }
  
  // check result
  console.log("ZeNodes: ", realNodes);
  return {success: true, value: [{nodes: realNodes}]}
}

export function CleanSkins(skinsRef: GltfSkin[] | undefined): Result<GltfSkin[]> {
  const firstSkinRef = skinsRef?.at(0);
  if (firstSkinRef == undefined)
    return {success: false, errMessage: "Skins on gltf is empty!", errCode: CommonErrorCode.MissingInfo};

  firstSkinRef.inverseBindMatrices = 79;
  
  console.log("LeSkins: ", firstSkinRef);
  return {success: true, value: [{...firstSkinRef}]};
}

const GLB_CHUNK_TYPE_BIN = 0x004E4942;
const GLB_CHUNK_PREFIX_BYTES = 8;
const GLB_CHUNK_TYPE_JSON = 0x4E4F534A;
const GLB_HEADER_BYTES = 12;
const GLB_HEADER_MAGIC = 0x46546C67;
const GLB_VERSION = 2;

export async function BinarizeGltfToVrm(gltf: VrmStructure): Promise<Result<ArrayBuffer>> {
  return new Promise((resolve) => {
    try {
      const firstBuffer = gltf.buffers?.at(0);
      // console.log(firstBuffer?.uri)
      // resolve({success: true, value: Base64ToArrayBuffer(firstBuffer?.uri)});
      
      // Binary chunk.
      const binaryChunk = GetPaddedArrayBuffer(Base64ToArrayBuffer(firstBuffer?.uri));
      const binaryChunkPrefix = new DataView(new ArrayBuffer(GLB_CHUNK_PREFIX_BYTES));
      binaryChunkPrefix.setUint32(0, binaryChunk.byteLength, true);
      binaryChunkPrefix.setUint32(4, GLB_CHUNK_TYPE_BIN, true);

      delete firstBuffer?.uri;
      console.log("ToBinary", gltf);
            
      // JSON chunk.
      const jsonChunk = GetPaddedArrayBuffer(stringToArrayBuffer(JSON.stringify(gltf)), 0x20);
      const jsonChunkPrefix = new DataView(new ArrayBuffer(GLB_CHUNK_PREFIX_BYTES));
      jsonChunkPrefix.setUint32(0, jsonChunk.byteLength, true);
      jsonChunkPrefix.setUint32(4, GLB_CHUNK_TYPE_JSON, true);

      // GLB header.
      const header = new ArrayBuffer(GLB_HEADER_BYTES);
      const headerView = new DataView(header);
      headerView.setUint32(0, GLB_HEADER_MAGIC, true);
      headerView.setUint32(4, GLB_VERSION, true);
      const totalByteLength = GLB_HEADER_BYTES
        + jsonChunkPrefix.byteLength + jsonChunk.byteLength
        + binaryChunkPrefix.byteLength + binaryChunk.byteLength;
      headerView.setUint32(8, totalByteLength, true);

      const glbBlob = new Blob([
        header,
        jsonChunkPrefix,
        jsonChunk,
        binaryChunkPrefix,
        binaryChunk
      ], {type: 'application/octet-stream'});

      const glbReader = new FileReader();
      glbReader.readAsArrayBuffer( glbBlob );
      glbReader.onloadend = function () {
        resolve({success: true, value: glbReader.result as ArrayBuffer});
      };
    }
    catch (e) {
      const msg = "Error binarizing vrm!";
      void LogError(Module.VrmUtil, msg, e);
      resolve({success: false, errMessage: msg, errCode: CommonErrorCode.InternalError});
    }
  });
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

function Base64ToArrayBuffer(base64: string | undefined) {
  if (base64 == undefined)
    return new ArrayBuffer(0);

  const splitHeader = base64.split(',');
  const buffer = Buffer.from(splitHeader[1], 'base64');
  // console.log("buffer", buffer);
  const bytes = Uint8Array.from(buffer);
  // console.log("base to ab", bytes.buffer);
  return bytes.buffer;
}

function stringToArrayBuffer(text: string) {
  return new TextEncoder().encode( text ).buffer;
}