import { useLayoutEffect, useRef } from "react";
import Image from "next/image";

// Fragment shader
import { fragmentShaderSource } from '../shader/background.shader'
import SocialButtonsUI from "../common/socialButtons.ui";
import { LogError } from "../../../utils/common.util";
import { Module } from "../../../enums/common.enum";
import ConnectWeb3Button from "../../../components/web3/connectWeb3.component";
import TransparentBoxUI from "../common/transparentBox.ui";



export default function LoginUI() {
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
    <div  className={'fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-client-primary text-white'}>
      <canvas ref={canvasRef} className="w-full h-screen fixed top-0 left-0"></canvas>
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <div className="fixed top-0 w-full h-14 flex items-center px-4 justify-between">
          <Image
            src='resources/icons/campaigns/portal.svg'
            width={106}
            height={24}
            alt="Lukso icon"
          />
          <SocialButtonsUI />
        </div>
        <div className="fixed flex flex-col justify-center items-center gap-8">
          <div>
            <Image
              src='resources/icons/campaigns/portal.svg'
              width={596}
              height={138}
              alt="Lukso icon"
            />
          </div>
          <ConnectWeb3Button classStyles="h-fit" >
              <TransparentBoxUI fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
                <div className="flex items-center gap-3">
                  <p className="text-black">Login to manage your citizens</p>
                </div>
              </TransparentBoxUI>
            </ConnectWeb3Button>
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