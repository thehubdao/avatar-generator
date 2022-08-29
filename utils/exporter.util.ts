import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter";

export class ExporterUtil {
  private static gltfExporter: GLTFExporter;

  private static getGltfLoaderInstance(): GLTFExporter {
    if(ExporterUtil.gltfExporter === undefined)
      ExporterUtil.gltfExporter = new GLTFExporter();

    return ExporterUtil.gltfExporter;
  }
  
  static async ExportModelGlb(model: GLTF, saveFile: boolean = true) {
    const exporter = this.getGltfLoaderInstance();
    const out = await exporter.parseAsync(model.scene, {
      animations: model.animations,
      binary: true,
    });
    
    if(saveFile)
      SaveArrayBuffer(out as ArrayBuffer, `exported.glb`);
    
    return out as ArrayBuffer;
  }

  static async ExportModelGltf(model: GLTF) {
    const exporter = this.getGltfLoaderInstance();
    const out = await exporter.parseAsync(model.scene, {
      animations: model.animations,
    });
    
    const jsonString = JSON.stringify(out, null, 2);
    SaveString(jsonString, `exported.gltf`);
  }

}

export function SaveFile(blob: Blob, fileName: string) {
  const link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);
  
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}

export function SaveArrayBuffer(buffer: ArrayBuffer, fileName: string) {
  SaveFile(new Blob([buffer], { type: 'application/octet-stream' }), fileName);
}

export function SaveString(text: string, fileName: string) {
  SaveFile(new Blob([text], {type: 'text/plain'}), fileName);
}