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
        
    return new Blob([out as ArrayBuffer], { type: 'application/octet-stream' });
  }

  static async ExportModelGltf(model: GLTF) {
    const exporter = this.getGltfLoaderInstance();
    const out = await exporter.parseAsync(model.scene, {
      animations: model.animations,
    });
    
    const jsonString = JSON.stringify(out, null, 2);
    await SaveString(jsonString, `exported.gltf`);
  }

}

export const delay = (ms: number) => new Promise(resolve => {
  setTimeout(resolve, ms);
});

export async function SaveFile(blob: Blob, fileName: string) {
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  
  await delay(100);
  link.remove();
}

export async function SaveArrayBuffer(buffer: ArrayBuffer, fileName: string) {
  await SaveFile(new Blob([buffer], { type: 'application/octet-stream' }), fileName);
}

export async function SaveString(text: string, fileName: string) {
  await SaveFile(new Blob([text], {type: 'text/plain'}), fileName);
}