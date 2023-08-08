import {NearestFilter, Texture, TextureLoader} from "three";
import {IsWebUrl, LogError} from "../common.util";
import {GetFileUrl} from "../firebase.util";
import {Module} from "../../enums/common.enum";
import {TextureTone} from "../../types/texture.type";

class TextureUtil {
  private static _instance: TextureUtil;
  private _textureLoader: TextureLoader | undefined;
  private _textureDb: Record<string, Texture> | undefined;

  private constructor() {
    this._textureLoader = undefined;
  }
  
  public static Instance() {
    if(this._instance === undefined)
      this._instance = new TextureUtil();

    return this._instance;
  }
  
  public TextureLoader() {
    if(this._textureLoader === undefined)
      this._textureLoader = new TextureLoader();
    
    return this._textureLoader;
  }
  
  public async GetToneTexture(tone: TextureTone) {
    if (this._textureDb && this._textureDb[tone])
      return this._textureDb[tone].clone();

    if (this._textureDb === undefined) this._textureDb = {};
    
    const toneTexture = await TextureUtil.Instance().TextureLoader().loadAsync(`/resources/tones/${tone}.jpg`);
    toneTexture.minFilter = NearestFilter;
    toneTexture.magFilter = NearestFilter;

    this._textureDb[tone] = toneTexture.clone();
    
    return toneTexture;
  }
}

export async function GetToneTexture(tone: TextureTone = 'threeTone' ) {
  return TextureUtil.Instance().GetToneTexture(tone);
}

export async function GetTextureFromFile(url: string | undefined) {
  let realUrl: string | undefined = url;
  if (url != undefined && !IsWebUrl(url)) realUrl = await GetFileUrl(url);
  
  if (realUrl == undefined) return void LogError(Module.TextureUtil, `Couldn't get texture from url: ${url ?? ''}`);
  
  return TextureUtil.Instance().TextureLoader().loadAsync(realUrl);
}