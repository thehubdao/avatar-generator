import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter";
import {Delay, LogError, Raise} from "./common.util";
import {CommonErrorCode, Module} from "../enums/common.enum";
import {clone} from "three/examples/jsm/utils/SkeletonUtils";
import {IsBone, IsSkinnedMesh, SetPose} from "./model.util";
import {BoneMatrix} from "../types/model.type";
import {Result} from "../types/common.type";
import GLTFExporterAddVrmData from "./threejs/export-plugin.util";
import {Bone, BufferGeometry, Material, Matrix4, Scene, Skeleton, SkinnedMesh} from "three";
import {mergeGeometries} from "three/examples/jsm/utils/BufferGeometryUtils";
import {degToRad} from "three/src/math/MathUtils";

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
      this._vrmExporter.register(writer => new GLTFExporterAddVrmData(writer));
    }
    
    return this._vrmExporter;
  }
}

export async function ExportModelGlb(model: GLTF | undefined): Promise<Result<Blob>> {
  try {
    if (model == undefined)
      Raise("Model can't be undefined if trying to export!");

    const exporter = ExporterUtil.Instance().GltfExporter();
    // CleanModelForExport(model); // TODO: use at some point
    const out = await exporter.parseAsync(model.scene, {
      animations: model.animations,
      binary: true,
    });

    return {success: true, value: new Blob([out as ArrayBuffer], {type: 'application/octet-stream'})};
  } catch (e) {
    const err = e as Error;
    void LogError(Module.ExporterUtil, err.message, err);
    return {success: false, errMessage: err.message, errCode: CommonErrorCode.InternalError};
  }
}

export async function ExportModelGltf(model: GLTF | undefined): Promise<Result<Blob>> {
  try {
    if (model == undefined)
      Raise("Model can't be undefined if trying to export!");

    const exporter = ExporterUtil.Instance().GltfExporter();

    const gltf = await exporter.parseAsync(model.scene, {
      animations: [],
    });

    const output = JSON.stringify(gltf, null, 2);
    return {success: true, value: new Blob([output], {type: 'text/plain'})};
  }
  catch (e) {
    const err = e as Error;
    void LogError(Module.ExporterUtil, err.message, err);
    return {success: false, errMessage: err.message, errCode:  CommonErrorCode.InternalError};
  }
}

export async function ExportModelVrm(model: GLTF | undefined, pose?: Record<string, BoneMatrix | undefined>): Promise<Result<Blob>> {
  const exporter = ExporterUtil.Instance().VrmExporter();
  try {
    if (model == undefined)
      Raise("Model can't be undefined if trying to export!");

    // TODO: Check how to force scale on sub objects without changing scale on those subobjects
    
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

    // CleanModelForExport(model);
    let glb = await exporter.parseAsync(sceneReal, {
      animations: [],
      binary: true,
      trs: true,
    }) as ArrayBuffer;
    
    return {success: true, value: new Blob([glb], { type: 'application/octet-stream' })};
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
  await SaveFile(new Blob([buffer], { type: 'application/octet-stream' }), fileName);
}

export async function SaveString(text: string, fileName: string) {
  await SaveFile(new Blob([text], {type: 'text/plain'}), fileName);
}