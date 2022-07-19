import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter";

export class ExporterUtil {
  private static gltfExporter: GLTFExporter;

  private static getGltfLoaderInstance(): GLTFExporter {
    if(ExporterUtil.gltfExporter === undefined)
      ExporterUtil.gltfExporter = new GLTFExporter();

    return ExporterUtil.gltfExporter;
  }
  
  static async ExportModelGlb(model: GLTF) {
    const exporter = this.getGltfLoaderInstance();
    const out = await exporter.parseAsync(model.scene, {
      animations: model.animations,
      binary: true,
    });
    
    return out as ArrayBuffer;
    // SaveArrayBuffer(out as ArrayBuffer, `exported.glb`);
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

function save(blob: Blob, fileName: string) {
  const link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);
  
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}

export function SaveArrayBuffer(buffer: ArrayBuffer, fileName: string) {
  save(new Blob([buffer], { type: 'application/octet-stream' }), fileName);
}

export function SaveString(text: string, fileName: string) {
  save(new Blob([text], {type: 'text/plain'}), fileName);
}