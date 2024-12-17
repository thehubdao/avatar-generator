import { WebGLRenderer } from "three";

class SceneUtil {
    private static _instance: SceneUtil;
    renderer: WebGLRenderer | undefined;
  
    public static Instance(): SceneUtil {
      if (SceneUtil._instance === undefined)
        SceneUtil._instance = new SceneUtil();
  
      return SceneUtil._instance;
    }
  
    public storeRenderer(renderer: WebGLRenderer) {
      this.renderer = renderer
    }
  
    public getRenderer(): WebGLRenderer | undefined {
      return this.renderer
    }
}

export default SceneUtil
