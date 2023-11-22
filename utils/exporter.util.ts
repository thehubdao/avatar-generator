import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter";
import {Delay, LogError, Raise} from "./common.util";
import {CommonErrorCode, Module} from "../enums/common.enum";
import {clone} from "three/examples/jsm/utils/SkeletonUtils";
import {SetPose} from "./model.util";
import {BoneMatrix} from "../types/model.type";
import {Result} from "../types/common.type";
import GLTFExporterAddVrmData from "./threejs/export-plugin.util";
import {GenerateVrmScene} from "./threejs/vrm.util";
import {Object3D} from "three";

class ExporterUtil {
  private static _instance: ExporterUtil;
  private _gltfExporter: GLTFExporter | undefined;
  private _vrmExporter: GLTFExporter | undefined;

  public static Instance() {
    if (ExporterUtil._instance === undefined)
      ExporterUtil._instance = new ExporterUtil();

    return ExporterUtil._instance;
  }

  public GltfExporter() {
    if (this._gltfExporter == undefined) {
      this._gltfExporter = new GLTFExporter();
    }

    return this._gltfExporter;
  }

  public VrmExporter() {
    if (this._vrmExporter == undefined) {
      this._vrmExporter = new GLTFExporter();
      this._vrmExporter.register(writer => new GLTFExporterAddVrmData(writer));
    }

    return this._vrmExporter;
  }
}

export async function ExportModelGlb(model: GLTF | undefined, pose?: Record<string, BoneMatrix | undefined>) {
  return ExportObjectGlb(model?.scene, pose);
}

export async function ExportObjectGlb(object: Object3D | undefined, pose?: Record<string, BoneMatrix | undefined>): Promise<Result<Blob>> {
  try {
    if (object == undefined)
      Raise("Model can't be undefined if trying to export!");

    const exporter = ExporterUtil.Instance().GltfExporter();

    const sceneClone = clone(object);
    SetPose(sceneClone, pose);

    // CleanModelForExport(model);
    const out = await exporter.parseAsync(sceneClone, {
      animations: [],
      binary: true,
      trs: true,
    }) as ArrayBuffer;

    return {success: true, value: new Blob([out], {type: 'application/octet-stream'})};
  } catch (e) {
    const err = e as Error;
    void LogError(Module.ExporterUtil, err.message, err);
    return {success: false, errMessage: err.message, errCode: CommonErrorCode.InternalError};
  }
}

export async function ExportModelGltf(model: GLTF | undefined) {
  return ExportObjectGltf(model?.scene);
}

export async function ExportObjectGltf(object: Object3D | undefined): Promise<Result<Blob>> {
  try {
    if (object == undefined)
      Raise("Model can't be undefined if trying to export!");

    const exporter = ExporterUtil.Instance().GltfExporter();

    const gltf = await exporter.parseAsync(object, {
      animations: [],
    });

    const output = JSON.stringify(gltf, null, 2);
    return {success: true, value: new Blob([output], {type: 'text/plain'})};
  } catch (e) {
    const err = e as Error;
    void LogError(Module.ExporterUtil, err.message, err);
    return {success: false, errMessage: err.message, errCode: CommonErrorCode.InternalError};
  }
}

export async function ExportModelVrm(model: GLTF | undefined, pose?: Record<string, BoneMatrix | undefined>) {
  return ExportObjectVrm(model?.scene, pose);
}

export async function ExportObjectVrm(object: Object3D | undefined, pose?: Record<string, BoneMatrix | undefined>): Promise<Result<Blob>> {
  const exporter = ExporterUtil.Instance().VrmExporter();
  try {
    if (object == undefined)
      Raise("Model can't be undefined if trying to export!");

    const sceneClone = clone(object);
    SetPose(sceneClone, pose);

    const vrmAvatar = GenerateVrmScene(sceneClone);

    // CleanModelForExport(model);
    const vrm = await exporter.parseAsync(vrmAvatar, {
      animations: [],
      binary: true,
      trs: true,
    }) as ArrayBuffer;

    return {success: true, value: new Blob([vrm], {type: 'application/octet-stream'})};
  } catch (err) {
    const msg = "Error while exporting to VRM!";
    void LogError(Module.ExporterUtil, msg, err);
    return {success: false, errMessage: msg, errCode: CommonErrorCode.InternalError};
  }
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
  await SaveFile(new Blob([buffer], {type: 'application/octet-stream'}), fileName);
}

export async function SaveString(text: string, fileName: string) {
  await SaveFile(new Blob([text], {type: 'text/plain'}), fileName);
}