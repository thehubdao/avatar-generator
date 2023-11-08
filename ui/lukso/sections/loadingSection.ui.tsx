import { useLayoutEffect, useRef } from "react";
import Image from "next/image";

// Fragment shader
import { fragmentShaderSource } from '../shader/background.shader'
import SocialButtonsUI from "../common/socialButtons.ui";
import { LogError } from "../../../utils/common.util";
import { Module } from "../../../enums/common.enum";

interface LoadingUIProps {
  getloaderDivElement: (elementReference: HTMLDivElement) => void;
}

export default function LoadingUI({ getloaderDivElement }: LoadingUIProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const compileShader = (gl: WebGLRenderingContext, source: string, type: number) => {
    const shader = gl.createShader(type);

    if (!shader) return void LogError(Module.Lukso, 'Shader doesn\'t exist on compile shader function');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      void LogError(Module.Lukso, 'Error on compile shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  function createShader() {
    if (parentRef.current) getloaderDivElement(parentRef.current);
    if (!canvasRef.current) return void LogError(Module.Lukso, 'Canvas doesn\'t exist on create shader function');

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      return void LogError(Module.Lukso, 'WebGL is not support on your browser on create shader function');
    }

    // Vertex shader (optional)
    const vertexShaderSource = `
      attribute vec4 coordinates;
      void main(void) {
        gl_Position = coordinates;
      }
    `;

    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);

    const shaderProgram = gl.createProgram();

    if (!shaderProgram || !vertexShader || !fragmentShader)
      return void LogError(Module.Lukso, 'Shader Program | Vertex Shader | Fragment Shader doesn\'t exist on create shader function');

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    const coordsAttrib = gl.getAttribLocation(shaderProgram, 'coordinates');
    gl.enableVertexAttribArray(coordsAttrib);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(coordsAttrib, 2, gl.FLOAT, false, 0, 0);

    const timeUniformLocation = gl.getUniformLocation(shaderProgram, 'u_time');
    const resolutionUniformLocation = gl.getUniformLocation(shaderProgram, 'u_resolution');

    const render = (time: number) => {
      gl.uniform1f(timeUniformLocation, time / 1000);
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }

  useLayoutEffect(() => {
    createShader();
  }, []);

  return (
    <div ref={parentRef} className={'fixed z-50 top-0 left-0 w-screen h-screen flex justify-center items-center bg-[#FABCE2]'}>
      <canvas ref={canvasRef} className="w-full h-screen fixed top-0 left-0"></canvas>
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <div className="fixed top-0 w-full h-14 flex items-center px-4 justify-between">
          <Image
            src='/resources/icons/campaigns/lukso.svg'
            width={106}
            height={24}
            alt="Lukso icon"
          />
          <SocialButtonsUI />
        </div>
        <div className="fixed">
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
        <div className="fixed bottom-0 right-0 m-5">
          <p className="text-xl tracking-[0.21em]">Powered b<span className="tracking-[0em]">y</span></p>
          <Image
            src='/resources/images/the-hub-logo-white.svg'
            alt="the hub icon"
            width={182}
            height={32}
          />
        </div>
      </div>
    </div>
  );
}