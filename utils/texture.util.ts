import {NearestFilter, Texture, TextureLoader} from "three";

export type TextureTone = 'threeTone' | 'fourTone' | 'fiveTone';

export class TextureUtil {
  private static _textureLoader: TextureLoader;
  
  private static _toneTexture: Record<string, Texture>;
  
  private static getTextureUtilInstance() {
    if(TextureUtil._textureLoader === undefined)
      TextureUtil._textureLoader = new TextureLoader();
    
    return TextureUtil._textureLoader;
  }
  
  private static getSavedToneTexture(tone: TextureTone) {
    if(TextureUtil._toneTexture && TextureUtil._toneTexture[tone])
      return TextureUtil._toneTexture[tone].clone();
    
    return undefined;
  }
  
  private static saveToneTexture(tone: TextureTone, texture: Texture) {
    if(TextureUtil._toneTexture === undefined)
      TextureUtil._toneTexture = {};
    
    TextureUtil._toneTexture[tone] = texture.clone();
  }
  
  static async GetToneTexture(tone: TextureTone = 'threeTone' ) {
    let toneTexture = TextureUtil.getSavedToneTexture(tone);
    if(toneTexture === undefined) {
      toneTexture = await TextureUtil.getTextureUtilInstance().loadAsync(`resources/tones/${tone}.jpg`);
      toneTexture.minFilter = NearestFilter;
      toneTexture.magFilter = NearestFilter;
      TextureUtil.saveToneTexture(tone, toneTexture);
    }
    
    return toneTexture;
  }
}