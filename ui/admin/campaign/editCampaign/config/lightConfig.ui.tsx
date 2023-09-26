import { useEffect, useState } from "react";
import { ConfigLight } from "../../../../../interfaces/light.interface";
import { AGVector3 } from "../../../../../interfaces/common.interface";
import AGButton from "../../../../common/ag-button.component";

interface lightConfigUIProps {
  lights: ConfigLight | undefined;
}

export default function LightConfigUI({ lights }: lightConfigUIProps) {
  const [defaultColor, setDefaultColor] = useState<string>(lights?.params.color ?? "000");
  const [lightLAt, setLightLAt] = useState<AGVector3>(lights?.params.lAt ?? { x: 0, y: 0, z: 0 });
  const [lightPos, setLightPos] = useState<AGVector3>(lights?.params.pos ?? { x: 0, y: 0, z: 0 });

  const handlePosXChange = (e: React.ChangeEvent<HTMLInputElement>, setFunction: React.Dispatch<React.SetStateAction<AGVector3>>) => {
    const newX = e.currentTarget.valueAsNumber;
    setFunction((prevPos) => ({ ...prevPos, x: newX }));
  };

  const handlePosYChange = (e: React.ChangeEvent<HTMLInputElement>, setFunction: React.Dispatch<React.SetStateAction<AGVector3>>) => {
    const newY = e.currentTarget.valueAsNumber;
    setFunction((prevPos) => ({ ...prevPos, y: newY }));
  };

  const handlePosZChange = (e: React.ChangeEvent<HTMLInputElement>, setFunction: React.Dispatch<React.SetStateAction<AGVector3>>) => {
    const newZ = e.currentTarget.valueAsNumber;
    setFunction((prevPos) => ({ ...prevPos, z: newZ }));
  };

  if (!lights) return <></>;

  useEffect(() => {
    setLightPos(lights?.params.pos ?? { x: 0, y: 0, z: 0 });
    setDefaultColor(lights?.params.color ?? "000");
  }, [lights]);

  return (
    <>
      {lights.params.pos && (
        <div>
          <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
            Light position:
          </p>
          <div className="flex gap-4 px-2">
            <div className="flex items-center gap-2">
              <p>X:</p>
              <input
                type="number"
                className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
                value={lightPos.x}
                onChange={(e) => handlePosXChange(e, setLightPos)}
              />
            </div>
            <div className="flex items-center gap-2">
              <p>Y:</p>
              <input
                type="number"
                className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
                value={lightPos.y}
                onChange={(e) => handlePosYChange(e, setLightPos)}
              />
            </div>
            <div className="flex items-center gap-2">
              <p>Z:</p>
              <input
                type="number"
                className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
                value={lightPos.z}
                onChange={(e) => handlePosZChange(e, setLightPos)}
              />
            </div>
          </div>
        </div>
      )}
      {lights.params.lAt && (<div>
        <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">Look at:</p>
        <div className="flex gap-4 px-2">
          <div className="flex items-center gap-2">
            <p>X:</p>
            <input
              type="number"
              className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
              defaultValue={lightLAt.x}
              onChange={(e) => handlePosXChange(e, setLightLAt)}
            />
          </div>
          <div className="flex items-center gap-2">
            <p>Y:</p>
            <input
              type="number"
              className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
              defaultValue={lightLAt.y}
              onChange={(e) => handlePosYChange(e, setLightLAt)}
            />
          </div>
          <div className="flex items-center gap-2">
            <p>Z:</p>
            <input
              type="number"
              className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
              defaultValue={lightLAt.z}
              onChange={(e) => handlePosZChange(e, setLightLAt)}
            />
          </div>
        </div>
      </div>)}
      {lights.params.color && (<div>
        <p className="font-poppins font-medium text-purple pb-2">Default color:</p>
        <div className="relative rounded-full overflow-hidden w-full h-12">
          <input type="color" name="" value={`#${defaultColor}`} className="absolute -top-2 -left-2 w-[130%] h-[130%]"
            onChange={e => { setDefaultColor(e.target.value.substring(1)) }} onLoad={() => setDefaultColor(lights.params.color ?? '000')} />
          <div className="absolute bottom-2 left-2/4 -translate-x-2/4 rounded-full bg-bg shadow-inset-hard w-16 flex justify-center items-center">
            <p className="text-xs">{defaultColor}</p>
          </div>
        </div>
      </div>)}
      <div className="pt-4">
        <AGButton nm full onClickEvent={() => alert('building update function')}>
          <p className="py-2">Update</p>
        </AGButton>
      </div>
    </>
  );
}