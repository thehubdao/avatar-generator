import { useRef } from "react";
import { WebGLInfo } from "three";

interface ExampleProps {
  logs: WebGLInfo | undefined;
  resX: number | undefined; 
  resY: number | undefined; 
}

function LogComponent(props: ExampleProps) {
  const wrapper = useRef(null);
  function show() {
    const dom = wrapper.current as HTMLElement | null;
    if (dom) {
      dom.classList.toggle('translate-y-3/4');
    }
  }
  return (
    <div className="fixed right-0 bottom-0 translate-y-3/4 bg-slate-600 bg-opacity-50 p-3" ref={wrapper} onClick={show}>
      <h1 className="text-white pb-2">INFO PANEL</h1>
      <p className="text-white text-xs">Screen Width: 
      {props.resX ?
      <span className="text-slate-900">{props.resX}px</span>
      : <span className="text-slate-900">Undefined</span>}
      </p>
      <p className="text-white text-xs">Screen Height: 
      {props.resY ?
      <span className="text-slate-900">{props.resY}px</span>
      : <span className="text-slate-900">Undefined</span>}
      </p>
      { props.logs ?
      <>
        <p className="text-white text-xs">Scene polycount: <span className="text-slate-900">{props.logs.render.triangles}</span></p>
        <p className="text-white text-xs">Active Drawcalls: <span className="text-slate-900">{props.logs.render.calls}</span></p>
        <p className="text-white text-xs">Textures in Memory: <span className="text-slate-900">{props.logs.memory.textures}</span></p>
        <p className="text-white text-xs">Geometries in Memory: <span className="text-slate-900">{props.logs.memory.geometries}</span></p>
      </>
      : <p className="text-white text-xs">No logs</p>}
    </div>
  )
}

export {LogComponent};

