import {GLTFExporterPlugin, GLTFWriter} from "three/examples/jsm/exporters/GLTFExporter";
import {Object3D} from "three";
import {VrmStructure} from "../../interfaces/export.interface";
import {GenerateVrmBoneData, GenerateVrmMaterialData, GetVrmData} from "./vrm.util";

export default class GLTFExporterAddVrmData implements GLTFExporterPlugin {
  public writer: GLTFWriter & { json?: VrmStructure };
  public name: string;

  constructor(writer: GLTFWriter) {
    this.writer = writer;
    this.name = 'AB_add_vrm_data';
  }
  
  afterParse(input: Object3D | Object3D[]) {
    const writer = this.writer;    
    const json = writer.json;
    if (json == undefined) return;
        
    // Get nodes
    const nodes = json.nodes;
    GenerateVrmBoneData(nodes);
    
    // GetMaterial
    const materials = json?.materials;
    // Add material
    GenerateVrmMaterialData(materials);
    
    // Add VRM extension used
    json.extensionsUsed = json.extensionsUsed || [];
    json.extensionsUsed.push("VRM");
    
    // Get VRM Values
    const vrmData = GetVrmData();
    
    // Add to Json
    json.extensions = vrmData.extensions;
  }
}