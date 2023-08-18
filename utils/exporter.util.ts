import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter";
import {Delay, LogError} from "./common.util";
import {Module} from "../enums/common.enum";
import {clone} from "three/examples/jsm/utils/SkeletonUtils";
import {SetPose} from "./model.util";
import {BoneMatrix} from "../types/model.type";
import { VRMData } from "../constants/vrmData.constant";

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

export async function ExportModelVrm(model: GLTF, pose?: Record<string, BoneMatrix | undefined>) {
  const exporter = ExporterUtil.Instance().GltfExporter();
  const sceneClone = clone(model.scene);
  
  SetPose(sceneClone, pose);
  
  // CleanModelForExport(model); // TODO: use at some point
  const out = await exporter.parseAsync(sceneClone, {
    animations: [],
  });

  const out_json = JSON.parse(JSON.stringify(out, null, 2));

  let extensionsArray: string[] = out_json["extensionsUsed"];
  extensionsArray.push("VRMC_vrm");
  out_json["extensions"] = VRMData;


  /**
   * The next let me change node index 
   * for each bone found in gltf nodes array 
   * and set it in vrm humanbones nodes prop
   */

  let mixamoBonesNotFound = [];
  
  for (const bone of Object.keys(VRMData.extensions.VRMC_vrm.humanoid.humanBones)) {
    const boneIndex = findIndexByNameEndingWith(out_json["nodes"], bone);
    if (boneIndex != -1) {
      VRMData.extensions.VRMC_vrm.humanoid.humanBones[bone].node = boneIndex;
    } else {
      mixamoBonesNotFound.push({bone, boneIndex});
      //TODO How to get index of bones not found by name in order to edit node prop in vrm humanbone
    }
  }
    
  //TODO Need to get the glb file again at this point
  /**
   * For some reason this function, creates an empty binary.
   */
  const modifiedVRM = new Uint8Array(out_json);

  await SaveArrayBuffer(modifiedVRM, `exported.vrm`);
}

function findIndexByNameEndingWith(array: { matrix: number[]; name: string; extras: { name: string }}[], searchTerm: string): number {
  searchTerm = searchTerm.toLowerCase();
  return array.findIndex(obj => obj.name.toLowerCase().endsWith(searchTerm));
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