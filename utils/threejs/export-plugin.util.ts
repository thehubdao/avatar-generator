import {GLTFExporterPlugin, GLTFWriter} from "three/examples/jsm/exporters/GLTFExporter";
import {Object3D, SkinnedMesh} from "three";
import {IsSkinnedMesh} from "../model.util";
import {CastStringToInteger} from "../common.util";
import {GltfMaterial} from "../../interfaces/export.interface";

interface WriterProps {
  json: {
    material: GltfMaterial[]
  }
}

export default class GLTFExporterRemoveSkinDuplicatesExtension implements GLTFExporterPlugin {
  public writer: GLTFWriter;
  public name: string;

  constructor(writer: GLTFWriter) {
    this.writer = writer;
    this.name = 'AB_add_vrm_data';
  }
  
  writeNode(object: Object3D, nodeDef: { [key: string]: any }) {
    console.log("Write Node!");
    const writer = this.writer;
    const json = {...writer.json};
    const skins = [...writer.skins] as SkinnedMesh[];
    
    console.log("JSON", json);
    
    if (!IsSkinnedMesh(object)) return;

    console.log("Skins", skins);    
    
    const skinRef = ObjectEntries(skins).find(([key, val]) => val === object);
    
    console.log(skinRef);
    
    // if (CastStringToInteger(skinRef[0]) !== 0) {
    //   console.log("Remove!", skinRef[0], 0, skinRef[0] !== 0);
    //   delete writer.skins[skinRef[0]];
    // }
    // else {
    //   console.log("Not!", skinRef[0], skinRef[0] !== 0)
    //   console.log(writer.skins[0]);
    // }
    
    // nodeDef.skin = 0;
    
    console.log(object, nodeDef);
  }
  
  afterParse(input: Object3D | Object3D[]) {
    const writer = this.writer;
    const json = writer.json;
    
    console.log(json);
    
    // TODO: Generate Bones
    
    // GetMaterial
    // Add material
    
    // Get VRM Values
    // Add to Json
    
  }
}

export function ObjectEntries<K extends (string | number | symbol), V>(obj: Record<K, V>) {
  return Object.entries(obj) as unknown as [K, V][];
}