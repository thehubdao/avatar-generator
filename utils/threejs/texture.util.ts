import {NearestFilter, Texture, TextureLoader} from "three";
import {IsWebUrl, LogError} from "../common.util";
import {GetFileUrl} from "../firebase.util";
import {CommonErrorCode, Module} from "../../enums/common.enum";
import {TextureTone} from "../../types/texture.type";
import { Result } from "../../types/common.type";

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

  public async GetTexture(url: string): Promise<Result<Texture>> {
    try {
      const newTexture = await TextureUtil.Instance().TextureLoader().loadAsync(url);
      return {success: true, value: newTexture};
    }
    catch(e) {
      const msg = `Couldn't make a texture for url: ${url}!`;
      void LogError(Module.TextureUtil, msg, e);
      return {success: false, errMessage: msg, errCode: CommonErrorCode.InternalError};
    }
  }

  public async GetTextureMemory(url: string): Promise<Result<Texture>> {
    if (this._textureDb && this._textureDb[url])
      return {success: true, value: this._textureDb[url].clone()};

    if (this._textureDb === undefined) this._textureDb = {};

    try {
      const newTexture = await TextureUtil.Instance().TextureLoader().loadAsync(url);

      this._textureDb[url] = newTexture.clone();
      return {success: true, value: newTexture};
    }
    catch(e) {
      const msg = `Couldn't make a texture for url: ${url}!`;
      void LogError(Module.TextureUtil, msg, e);
      return {success: false, errMessage: msg, errCode: CommonErrorCode.InternalError};
    }
  }
}

export async function GetToneTexture(tone: TextureTone = 'threeTone' ) {
  return TextureUtil.Instance().GetToneTexture(tone);
}

export async function GetTextureFromFile(url: string | undefined): Promise<Result<Texture>> {
  if (url == undefined) {
    const msg =  "Missing URL to get texture from file!";
    void LogError(Module.TextureUtil, msg);
    return {success: false, errMessage: msg, errCode: CommonErrorCode.MissingInfo};
  }

  let realUrl = url;

  if (!IsWebUrl(url)) {
    const result = await GetFileUrl(url);
    if (result.success)
      realUrl = result.value;
  }

  return TextureUtil.Instance().GetTexture(realUrl);
}