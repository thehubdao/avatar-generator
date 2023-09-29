import { useEffect, useState } from "react";
import { ConfigLight } from "../../../../../interfaces/light.interface";
import { AGVector3 } from "../../../../../interfaces/common.interface";
import AGButton from "../../../../common/ag-button.component";

interface LightConfigUIProps {
  lightOption: string;
  lights: ConfigLight[] | undefined;
  updateLightConfig: (config: ConfigLight[]) => void;
}

export default function LightConfigUI({
  lightOption,
  lights,
  updateLightConfig,
}: LightConfigUIProps) {
  // State for the current configuration object
  const [currentOption, setCurrentOption] = useState<ConfigLight | undefined>(lights?.find((light) => light.type === lightOption));
  // States light properties
  const [lightDist, setLightDist] = useState<number>(currentOption?.params.dist ?? 0);
  const [lightDecay, setLightDecay] = useState<number>(currentOption?.params.decay ?? 0);
  const [lightIntst, setLightIntst] = useState<number>(currentOption?.params.intst ?? 0);
  const [defaultColor, setDefaultColor] = useState<string>(currentOption?.params.color ?? "000");
  const [lightLAt, setLightLAt] = useState<AGVector3>(currentOption?.params.lAt ?? { x: 0, y: 0, z: 0 });
  const [lightPos, setLightPos] = useState<AGVector3>(currentOption?.params.pos ?? { x: 0, y: 0, z: 0 });
  const [lightSize, setLightSize] = useState<{ width: number, height: number }>({ width: currentOption?.params.width ?? 0, height: currentOption?.params.height ?? 0 });

  // Handle position input changes
  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>, setFunction: React.Dispatch<React.SetStateAction<AGVector3>>) => {
    const newValue = e.currentTarget.valueAsNumber;
    setFunction((prevPos) => ({ ...prevPos, [e.target.name]: newValue }));
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>, setFunction: React.Dispatch<React.SetStateAction<{ width: number, height: number }>>) => {
    const newValue = e.currentTarget.valueAsNumber;
    setFunction((prevPos) => ({ ...prevPos, [e.target.name]: newValue }));
  };

  const handlePropChange = (e: React.ChangeEvent<HTMLInputElement>, setFunction: React.Dispatch<React.SetStateAction<number>>) => {
    const newValue = e.currentTarget.valueAsNumber;
    setFunction(newValue);
  };

  // Check if a number is NaN and return an empty string if true
  const controlNaN = (number: number) => {
    return isNaN(number) ? "" : number.toString();
  };

  const sendNewLightConfig = () => {
    // Handle the case when currentOption is undefined
    if (!currentOption) return;

    const newLights = lights
      ? lights.map((light) => {
        // Return the original object if it's not the one to update
        if (light.type !== lightOption) return light;

        // Create a props object with conditional properties
        const props: Partial<ConfigLight["params"]> = {};

        if (light.params.dist) props.dist = lightDist;
        if (light.params.decay) props.decay = lightDecay;
        if (light.params.intst) props.intst = lightIntst;
        if (light.params.color) props.color = defaultColor;
        if (light.params.pos) props.pos = {
          x: isNaN(lightPos.x) ? 0 : lightPos.x,
          y: isNaN(lightPos.y) ? 0 : lightPos.y,
          z: isNaN(lightPos.z) ? 0 : lightPos.z,
        };
        if (light.params.lAt) props.lAt = {
          x: isNaN(lightLAt.x) ? 0 : lightLAt.x,
          y: isNaN(lightLAt.y) ? 0 : lightLAt.y,
          z: isNaN(lightLAt.z) ? 0 : lightLAt.z,
        };
        if (light.params.width || light.params.height) {
          props.width = lightSize.width;
          props.height = lightSize.height;
        }
        // return the Updated properties if they exist
        return { ...light, params: { ...light.params, ...props, }, };
      })
      : [];

    // Call the updateLightConfig function with the updated array
    updateLightConfig(newLights);
  };


  // Update current state when lightOption changes
  useEffect(() => {
    const newOption = lights?.find((light) => light.type === lightOption);
    setCurrentOption(newOption);
    setLightPos(newOption?.params.pos ?? { x: 0, y: 0, z: 0 });
    setLightLAt(newOption?.params.lAt ?? { x: 0, y: 0, z: 0 });
    setDefaultColor(newOption?.params.color ?? "000");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightOption]);

  // If there is no currentOption, render nothing
  if (!currentOption) return null;

  return (
    <>
      {/* Position input fields */}
      {currentOption.params.pos && (
        <div>
          <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
            Light position:
          </p>
          <div className="flex gap-4 px-2">
            {["X", "Y", "Z"].map((axis) => (
              <div className="flex items-center gap-2" key={axis}>
                <p>{axis}:</p>
                <input
                  type="number"
                  name={axis.toLowerCase()}
                  className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
                  value={controlNaN(
                    lightPos[axis.toLowerCase() as "x" | "y" | "z"]
                  )}
                  onChange={(e) => handlePositionChange(e, setLightPos)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Look at input fields */}
      {currentOption.params.lAt && (
        <div>
          <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
            Look at:
          </p>
          <div className="flex gap-4 px-2">
            {["X", "Y", "Z"].map((axis) => (
              <div className="flex items-center gap-2" key={axis}>
                <p>{axis}:</p>
                <input
                  type="number"
                  name={axis.toLowerCase()}
                  className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
                  value={controlNaN(
                    lightLAt[axis.toLowerCase() as "x" | "y" | "z"]
                  )}
                  onChange={(e) => handlePositionChange(e, setLightLAt)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Color selection field */}
      {currentOption.params.color && (
        <div>
          <p className="font-poppins font-medium text-purple pb-2 pt-4 mt-2 px-2">
            Default color:
          </p>
          <div className="relative rounded-full overflow-hidden w-full h-12">
            <input
              type="color"
              name="color"
              value={`#${defaultColor}`}
              className="absolute -top-2 -left-2 w-[130%] h-[130%]"
              onChange={(e) => {
                setDefaultColor(e.target.value.substring(1));
              }}
              onLoad={() =>
                setDefaultColor(currentOption.params.color ?? "000")
              }
            />
            <div className="absolute bottom-2 left-2/4 -translate-x-2/4 rounded-full bg-bg shadow-inset-hard w-16 flex justify-center items-center">
              <p className="text-xs">{defaultColor}</p>
            </div>
          </div>
        </div>
      )}
      {/* Size input fields */}
      {(typeof currentOption.params.width === 'number' && !isNaN(currentOption.params.width)) && (
        <div>
          <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
            Size:
          </p>
          <div className="flex gap-4 px-2">
            {["Width", "Height"].map((axis) => (
              <div className="flex items-center gap-2" key={axis}>
                <p>{axis}:</p>
                <input
                  type="number"
                  name={axis.toLowerCase()}
                  className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
                  value={controlNaN(
                    lightSize[axis.toLowerCase() as "width" | "height"]
                  )}
                  onChange={(e) => handleSizeChange(e, setLightSize)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Other input fields */}
      {(currentOption.params.intst || currentOption.params.decay || currentOption.params.dist) && (
        <div>
          <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
            Othre props:
          </p>
          <div className="flex flex-col gap-4 px-2">
            {currentOption.params.intst && (
              <div className="flex items-center gap-2" key={'intst'}>
                <p>Intensity:</p>
                <input
                  type="number"
                  name='intensity'
                  className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
                  value={controlNaN(lightIntst)}
                  onChange={(e) => handlePropChange(e, setLightIntst)}
                />
              </div>
            )}
            {currentOption.params.dist && (
              <div className="flex items-center gap-2" key={'dist'}>
                <p>Distance:</p>
                <input
                  type="number"
                  name='distance'
                  className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
                  value={controlNaN(lightDist)}
                  onChange={(e) => handlePropChange(e, setLightDist)}
                />
              </div>
            )}
            {currentOption.params.decay && (
              <div className="flex items-center gap-2" key={'decay'}>
                <p>Decay:</p>
                <input
                  type="number"
                  name='decay'
                  className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
                  value={controlNaN(lightDecay)}
                  onChange={(e) => handlePropChange(e, setLightDecay)}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {/* Update button */}
      <div className="pt-4">
        <AGButton nm full onClickEvent={() => sendNewLightConfig()}>
          <p className="py-2">Update</p>
        </AGButton>
      </div>
    </>
  );
}
