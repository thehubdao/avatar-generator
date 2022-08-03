import { WebGLInfo } from "three";

function LogComponent(props: any) {
  return (
    <div className="fixed right-0 bottom-0 bg-slate-600 bg-opacity-50 p-4 pointer-events-none">
      <p className="text-white text-xs font-black">LOGS</p>
          { props.logs ?
            <>
              <p className="text-white text-xs">Scene polycount: <span className="text-yellow-300">{props.logs.render.triangles}</span></p>
              <p className="text-white text-xs">Active Drawcalls: <span className="text-yellow-300">{props.logs.render.calls}</span></p>
              <p className="text-white text-xs">Textures in Memory: <span className="text-yellow-300">{props.logs.memory.textures}</span></p>
              <p className="text-white text-xs">Geometries in Memory: <span className="text-yellow-300">{props.logs.memory.geometries}</span></p>
            </>
            : <p className="text-white text-xs">No logs</p>}
    </div>
  )
}

export {LogComponent};

