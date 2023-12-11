import {GLTFExporterPlugin, GLTFWriter} from "three/examples/jsm/exporters/GLTFExporter";
import {VrmStructure} from "../../interfaces/export.interface";
import {GenerateVrmBoneData, GenerateVrmMaterialData, GetVrmData} from "./vrm.util";

export default class GLTFExporterAddVrmData implements GLTFExporterPlugin {
  public writer: GLTFWriter & { json?: VrmStructure, extensionsUsed?: Record<string, boolean> };
  public name: string;

  constructor(writer: GLTFWriter) {
    this.writer = writer;
    this.name = "VRM";
  }
  
  afterParse() {
    const writer = this.writer;    
    const json = writer.json!;
    const extensionsUsed = writer.extensionsUsed!;
    
    // Get nodes
    const nodes = json.nodes;
    GenerateVrmBoneData(nodes);
    
    // GetMaterial
    const materials = json?.materials;
    // Add material
    GenerateVrmMaterialData(materials);
    
    // Get VRM Values
    const vrmData = GetVrmData();
    
    if (!extensionsUsed[this.name]) {
      // Add VRM extension used
      json.extensions = json.extensions || {};
      // Add to Json
      json.extensions = vrmData.extensions;
      
      extensionsUsed[this.name] = true;
    }
  }
}