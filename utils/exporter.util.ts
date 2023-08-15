import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter";
import {Delay, LogError} from "./common.util";
import {Module} from "../enums/common.enum";
import {clone} from "three/examples/jsm/utils/SkeletonUtils";
import {SetPose} from "./model.util";
import {BoneMatrix} from "../types/model.type";

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
    binary: true,
  });

  return new Blob([out as ArrayBuffer], { type: 'application/octet-stream' });
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