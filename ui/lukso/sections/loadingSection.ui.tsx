import { useEffect, useRef } from "react";
import { fragmentShader } from "../shader/test.shader";

interface AGLoadingProps {
  loading?: boolean;
  transparency?: boolean;
  bgColor?: string;
}

export default function LuksoLoadingUI({ loading, bgColor, transparency }: AGLoadingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // function loadShader(gl: any, type: any, source: any) {
  //   const shader = gl.createShader(type);

  //   // Send the source to the shader object
  //   gl.shaderSource(shader, source);

  //   // Compile the shader program
  //   gl.compileShader(shader);

  //   // See if it compiled successfully
  //   if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
  //     console.log(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,);
  //     gl.deleteShader(shader);
  //     return null;
  //   }
  // }

  // function initShaderProgram(gl: any) {
  //   const fsLoaded = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
  //   const shaderProgram = gl.createProgram();

  //   if (!shaderProgram || !fsLoaded) return
  //   gl.attachShader(shaderProgram, fsLoaded);
  //   gl.linkProgram(shaderProgram);
  // }

  // useEffect(() => {
  //   if (!canvasRef) return
  //   const gl = canvasRef.current?.getContext("webgl");
  //   if (!gl) return

  //   initShaderProgram(gl);
  // }, [])


  return (
    <>{loading
      ? <div className={'fixed z-50 top-0 left-0 w-screen h-screen flex justify-center items-center' + (transparency ? ' bg-opacity-50 backdrop-blur-sm' : '')}
        style={{ backgroundColor: `#${bgColor ?? "FFFFFF"}${transparency ? '80' : ''}` }}>
        <canvas ref={canvasRef} width={400} height={400}></canvas>
      </div> : ''
    }</>
  );
}