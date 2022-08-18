import {NearestFilter, Texture, TextureLoader} from "three";

export type TextureTone = 'threeTone' | 'fourTone' | 'fiveTone';

export class TextureUtil {
  //#region Singleton
  private static _instance: TextureUtil;
  public static Instance() {
    if(this._instance === undefined)
      this._instance = new TextureUtil();

    return this._instance;
  }
  //#endregion
  
  private _textureLoader: TextureLoader | undefined;
  private _toneTexture: Record<string, Texture> | undefined;
  
  private constructor() {
    this._textureLoader = undefined;
    this._toneTexture = undefined;
  }
  
  private getTextureUtilInstance() {
    if(this._textureLoader === undefined)
      this._textureLoader = new TextureLoader();
    
    return this._textureLoader;
  }
  
  private getSavedToneTexture(tone: TextureTone) {
    if(this._toneTexture && this._toneTexture[tone])
      return this._toneTexture[tone].clone();
    
    return undefined;
  }
  
  private saveToneTexture(tone: TextureTone, texture: Texture) {
    if(this._toneTexture === undefined)
      this._toneTexture = {};
    
    this._toneTexture[tone] = texture.clone();
  }
  
  public async GetToneTexture(tone: TextureTone = 'threeTone' ) {
    let toneTexture = this.getSavedToneTexture(tone);
    if(toneTexture === undefined) {
      toneTexture = await this.getTextureUtilInstance().loadAsync(`resources/tones/${tone}.jpg`);
      toneTexture.minFilter = NearestFilter;
      toneTexture.magFilter = NearestFilter;
      this.saveToneTexture(tone, toneTexture);
    }
    
    return toneTexture;
  }
}