import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from 'gsap';

// Fragment shader
import { fragmentShaderSource } from '../shader/background.shader'

interface AGLoadingProps {
  loading: boolean;
  socialMedia: { alt: string, link: string, icon: React.ReactElement }[]
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentSection: React.Dispatch<React.SetStateAction<number>>;
}

export default function LuksoLoadingUI({ loading, socialMedia, setIsLoading, setCurrentSection }: AGLoadingProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      console.error('WebGL is not support on your browser');
      return;
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

    if (!shaderProgram || !vertexShader || !fragmentShader) return;

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
  }, []);

  const compileShader = (gl: WebGLRenderingContext, source: string, type: number) => {
    const shader = gl.createShader(type);

    if (!shader) return;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Error on compile shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  useEffect(() => {
    if (!parentRef.current) return
    gsap.to(parentRef.current, {
      opacity: 0,
      ease: 'power1.out',
      duration: 1,
      // delay: 5 
      delay: 1000
    }).then(() => {
      setIsLoading(false);
      setCurrentSection(0);
    });
  }, []);

  return (
    <>{loading
      ? <div className={'fixed z-50 top-0 left-0 w-screen h-screen flex justify-center items-center bg-[#FABCE2]'} ref={parentRef}>
        <canvas ref={canvasRef} className="w-full h-screen fixed top-0 left-0"></canvas>
        <div className="w-full h-screen flex flex-col justify-center items-center">
          <div className="fixed top-0 w-full h-14 flex items-center px-4 justify-between">
            <Image
              src='/resources/icons/campaigns/lukso.svg'
              width={106}
              height={24}
              alt="Lukso icon"
            />
            <div className="flex gap-3">
              {socialMedia.map((item, index) => {
                return <Link key={index} href={item.link} target="_blank">
                  {item.icon}
                </Link>
              })}
            </div>
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
      </div> : ''
    }</>
  );
}