import { useEffect, useRef } from "react";
import { fragmentShader } from "../shader/test.shader";
import Image from "next/image";

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
        <canvas ref={canvasRef} width={400} height={400} className="fixed top-0 left-0"></canvas>
        <div className="w-full h-screen flex flex-col justify-center items-center">
          <div className="fixed top-0 w-full h-14 flex items-center px-4 justify-between">
            <Image
              src='/resources/icons/campaigns/lukso.svg'
              width={106}
              height={24}
              alt="Lukso icon"
            />
            <div>
              <p>Social Medias</p>
            </div>
          </div>
          <Image
            src='/resources/icons/campaigns/lukso.svg'
            width={596}
            height={138}
            alt="Lukso icon"
          />
          <div className="w-[596px]">
            <p className="text-4xl mt-7 tracking-[1.21em] text-center">AVATAR HU<span className="tracking-[0em]">B</span></p>
          </div>
        </div>
      </div> : ''
    }</>
  );
}