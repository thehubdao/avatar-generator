import {NearestFilter, TextureLoader} from "three";
import {IsWebUrl, LogError} from "./common.util";
import {GetFileUrl} from "./firebase.util";
import {Module} from "../enums/common.enum";

export type TextureTone = 'threeTone' | 'fourTone' | 'fiveTone';

export class TextureUtil {
  private static _instance: TextureUtil;
  private _textureLoader: TextureLoader | undefined;

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
}

export async function GetToneTexture(tone: TextureTone = 'threeTone' ) {
  const toneTexture = await TextureUtil.Instance().TextureLoader().loadAsync(`/resources/tones/${tone}.jpg`);
  toneTexture.minFilter = NearestFilter;
  toneTexture.magFilter = NearestFilter;

  return toneTexture;
}

export async function GetTextureFromFile(url: string | undefined) {
  let realUrl: string | undefined = url;
  if (url != undefined && !IsWebUrl(url)) realUrl = await GetFileUrl(url);
  
  if (realUrl == undefined) return void LogError(Module.TextureUtil, `Couldn't get texture from url: ${url}`);
  
  return TextureUtil.Instance().TextureLoader().loadAsync(realUrl);
}