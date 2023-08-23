import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter";
import {Delay, LogError} from "./common.util";
import {Module} from "../enums/common.enum";
import {clone} from "three/examples/jsm/utils/SkeletonUtils";
import {SetPose} from "./model.util";
import {BoneMatrix} from "../types/model.type";
import { VRMObject } from "../types/vrm.types";
import { vrmDataObject } from "../constants/vrmData.constant";

class ExporterUtil {
  private static _instance: ExporterUtil;
  private _gltfExporter: GLTFExporter | null;
  
  constructor() {
    this._gltfExporter = null;
  }
  
  public static Instance() {
    if(ExporterUtil._instance === undefined)
      ExporterUtil._instance = new ExporterUtil();
    
    return ExporterUtil._instance;
  }
  
  public GltfExporter() {
    if(this._gltfExporter == null) {
      this._gltfExporter = new GLTFExporter();
    }
    
    return this._gltfExporter;
  }
}

export async function ExportModelGlb(model: GLTF) {
    const exporter = ExporterUtil.Instance().GltfExporter();
    // CleanModelForExport(model); // TODO: use at some point
    const out = await exporter.parseAsync(model.scene, {
        animations: model.animations,
        binary: true,
    });

    return new Blob([out as ArrayBuffer], { type: 'application/octet-stream' });
}

function GetPaddedBufferSize( bufferSize: number) {
	return Math.ceil( bufferSize / 4 ) * 4;
}

function GetPaddedArrayBuffer( arrayBuffer: ArrayBuffer, paddingByte = 0 ) {
	const paddedLength = GetPaddedBufferSize( arrayBuffer.byteLength );
	if ( paddedLength !== arrayBuffer.byteLength ) {
		const array = new Uint8Array( paddedLength );
		array.set( new Uint8Array( arrayBuffer ) );
		if ( paddingByte !== 0 ) {
			for ( let i = arrayBuffer.byteLength; i < paddedLength; i ++ ) {
				array[ i ] = paddingByte;
			}
		}
		return array.buffer;
	}
	return arrayBuffer;
}

function StringToArrayBuffer(text: string) {
	return new TextEncoder().encode(text).buffer;
}

export async function ExportModelVrm(model: GLTF, pose?: Record<string, BoneMatrix | undefined>) {
  const exporter = ExporterUtil.Instance().GltfExporter();
  const sceneClone = clone(model.scene);
  
  SetPose(sceneClone, pose);
  
  // CleanModelForExport(model); // TODO: use at some point
  const out = await exporter.parseAsync(sceneClone, {
    animations: [],
  }) as VRMObject;

  const extensionsArray = out["extensionsUsed"];
  extensionsArray.push("VRM");
  out["extensions"] = vrmDataObject;
  
  const blob = new Blob([out.buffers], { type: 'application/octet-stream' });

  const reader = new FileReader();
	reader.readAsArrayBuffer( blob );
	reader.onloadend = function () {
		
    // Binary chunk.
		const binaryChunk = GetPaddedArrayBuffer(reader.result as ArrayBuffer);
		const binaryChunkPrefix = new DataView(new ArrayBuffer(8));
		binaryChunkPrefix.setUint32(0, binaryChunk.byteLength, true);
		binaryChunkPrefix.setUint32(4, 0x004E4942, true);
		
    // JSON chunk.
		const jsonChunk = GetPaddedArrayBuffer(StringToArrayBuffer(JSON.stringify(out) ), 0x20);
		const jsonChunkPrefix = new DataView( new ArrayBuffer(8) );
		jsonChunkPrefix.setUint32( 0, jsonChunk.byteLength, true );
		jsonChunkPrefix.setUint32( 4, 0x4E4F534A, true );
		
    // GLB header.
		const header = new ArrayBuffer(12);
		const headerView = new DataView(header);
		headerView.setUint32( 0, 0x46546C67, true );
		headerView.setUint32( 4, 2, true );

		const totalByteLength = 12
			+ jsonChunkPrefix.byteLength + jsonChunk.byteLength
			+ binaryChunkPrefix.byteLength + binaryChunk.byteLength;
		headerView.setUint32( 8, totalByteLength, true );

		const glbBlob = new Blob([
			header,
			jsonChunkPrefix,
			jsonChunk,
			binaryChunkPrefix,
			binaryChunk
		], { type: 'application/octet-stream' });
		
    const glbReader = new FileReader();
		glbReader.readAsArrayBuffer(glbBlob);
		glbReader.onloadend = async function () {
      await SaveArrayBuffer(glbReader.result as ArrayBuffer, "vrm_model.vrm");          
		};
	};
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