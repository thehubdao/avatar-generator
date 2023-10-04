import { useEffect, useRef, useState } from "react";
import { ConfigLight } from "../../../../../interfaces/light.interface";
import { AGVector3 } from "../../../../../interfaces/common.interface";
import AGButton from "../../../../common/ag-button.component";
import { MdKeyboardArrowDown } from "react-icons/md";
import { LightType } from "../../../../../enums/light.enum";
import { LIGHT_TYPE_LABELS } from "../../../../../constants/lightType.constant";

interface LightConfigUIProps {
  lightOption: string;
  lights: ConfigLight[] | undefined;
  updateLightConfig: (config: ConfigLight[]) => void;
}

const sectionOnLightType = {
  [LightType.PointLight]: ['position', 'lookAt', 'color', 'intensity', 'distance', 'decay'],
  [LightType.RectAreaLight]: ['position', 'lookAt', 'color', 'intensity', 'size'],
  [LightType.AmbientLight]: ['color', 'intensity'],
  ['']: []
}

export default function LightConfigUI({
  lightOption,
  lights,
  updateLightConfig,
}: LightConfigUIProps) {
  //* Retrieve the current option based on the selected light type
  const currentOption = lights?.find((light) => light.type === lightOption);

  const [lightDecay, setLightDecay] = useState<number>(currentOption?.params.decay ?? 0);
  const [lightDistance, setLightDistance] = useState<number>(currentOption?.params.dist ?? 0);
  const [lightIntensity, setLightIntensity] = useState<number>(currentOption?.params.intst ?? 0);
  const [defaultColor, setDefaultColor] = useState<string>(currentOption?.params.color ?? "000000");
  const [lightLookAt, setLightLookAt] = useState<AGVector3>(currentOption?.params.lAt ?? { x: 0, y: 0, z: 0 });
  const [lightPosition, setLightPosition] = useState<AGVector3>(currentOption?.params.pos ?? { x: 0, y: 0, z: 0 });
  const [lightSize, setLightSize] = useState<{ width: number, height: number }>({ width: currentOption?.params.width ?? 0, height: currentOption?.params.height ?? 0 });

  const createLightConfig = useRef<HTMLSelectElement>(null);
  const lightTypeOptions = Object.values(LightType);
  const isAllOptionsDisabled = lightTypeOptions.every(lightType => lights?.some(light => light.type === lightType));
  const [createLightOption, setCreateLightOption] = useState<string>('');

  //* Handle input change for every numeric input fields on lights config
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFunction: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const newValue = e.currentTarget.valueAsNumber;
    setFunction(isNaN(newValue) ? 0 : newValue);
  };

  const handleSelectChange = () => {
    setCreateLightOption(createLightConfig.current?.value ?? '');
  }

  const sendUpdateLightConfig = () => {
    if (!currentOption) return;

    // Map the updated properties for the selected light type
    const newLights = lights
      ? lights.map((light) => {
        if (light.type !== lightOption) return light;

        const props: Partial<ConfigLight["params"]> = {};

        if ('dist' in light.params) props.dist = lightDistance;
        if ('decay' in light.params) props.decay = lightDecay;
        if ('intst' in light.params) props.intst = lightIntensity;
        if ('color' in light.params) props.color = defaultColor;
        if ('pos' in light.params) props.pos = { ...lightPosition };
        if ('lAt' in light.params) props.lAt = { ...lightLookAt };
        if ('width' in light.params || 'height' in light.params) {
          props.width = lightSize.width;
          props.height = lightSize.height;
        }
        return { ...light, params: { ...light.params, ...props, }, };
      })
      : [];

    updateLightConfig(newLights);
  };

  const sendNewLightConfig = () => {
    const props: Partial<ConfigLight["params"]> = {};
    const selectedLightType = createLightOption as LightType;

    // Map the properties based on the selected light type
    sectionOnLightType[selectedLightType].forEach((prop) => {
      switch (prop) {
        case 'position':
          props.pos = { ...lightPosition };
          break;
        case 'lookAt':
          props.lAt = { ...lightLookAt };
          break;
        case 'color':
          props.color = defaultColor;
          break;
        case 'intensity':
          props.intst = lightIntensity;
          break;
        case 'decay':
          props.decay = lightDecay;
          break;
        case 'distance':
          props.dist = lightDistance;
          break;
        case 'size':
          props.width = lightSize.width;
          props.height = lightSize.height;
          break;
        default:
          break;
      }
    });

    const newLight: ConfigLight = {
      type: selectedLightType,
      params: props
    }

    // Update the light configurations with the new light.
    const newLights = [...(lights || []), newLight];

    updateLightConfig(newLights);
  }

  //* Function to return an empty string if a number is NaN.
  const controlNaN = (number: number) => {
    return isNaN(number) ? "" : number.toString();
  };

  //* Effect to update state variables when the selected light option changes.
  useEffect(() => {
    const newOption = lights?.find((light) => light.type === lightOption);
    if (newOption) {
      setLightDistance(newOption.params.dist || 0);
      setLightDecay(newOption.params.decay || 0);
      setLightIntensity(newOption.params.intst || 0);
      setDefaultColor(newOption.params.color || "000000");
      setLightPosition(newOption.params.pos ?? { x: 0, y: 0, z: 0 });
      setLightLookAt(newOption.params.lAt ?? { x: 0, y: 0, z: 0 });
      setLightSize({ width: newOption.params.width || 0, height: newOption.params.height || 0 });
    }

    // Filter available light types to create a new light.
    const lightTypes = [LightType.PointLight, LightType.RectAreaLight, LightType.AmbientLight];
    const filteredLightTypes = lightTypes.filter(lightType => !lights?.some(light => light.type === lightType));
    setCreateLightOption(filteredLightTypes[0] || '');
  }, [lightOption, lights]);

  return (
    <>
      {lightOption === 'new light' && <div className="relative mt-5 w-full cursor-pointer px-2">
        <div className="absolute top-2/4 right-4 -translate-y-2/4 pointer-events-none">
          <MdKeyboardArrowDown />
        </div>
        <select
          className="bg-bg shadow-flat-medium hover:shadow-flat-hard w-full h-[48px] py-2 px-4 rounded-lg cursor-pointer"
          ref={createLightConfig}
          onChange={handleSelectChange}
        >
          {isAllOptionsDisabled && (
            <option value="" disabled>
              No lights available to add
            </option>
          )}
          {lightTypeOptions.map((lightType) => (
            !lights?.some(light => light.type === lightType) && (
              <option key={lightType} value={lightType}>
                {LIGHT_TYPE_LABELS[lightType]}
              </option>
            )
          ))}
        </select>
      </div>}
      {/* Position input fields */}
      {(currentOption?.params.pos || sectionOnLightType[createLightOption as LightType].includes('position')) && (
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
                  value={controlNaN(lightPosition[axis.toLowerCase() as "x" | "y" | "z"])}
                  onChange={(e) => handleInputChange(e, (value) => setLightPosition({ ...lightPosition, [axis.toLowerCase()]: value }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Look at input fields */}
      {(currentOption?.params.lAt || sectionOnLightType[createLightOption as LightType].includes('lookAt')) && (
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
                  value={controlNaN(lightLookAt[axis.toLowerCase() as "x" | "y" | "z"])}
                  onChange={(e) => handleInputChange(e, (value) => setLightLookAt({ ...lightLookAt, [axis.toLowerCase()]: value }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Color selection field */}
      {(currentOption?.params.color || sectionOnLightType[createLightOption as LightType].includes('color')) && (
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
                setDefaultColor(currentOption?.params.color || "000000")
              }
            />
            <div className="absolute bottom-2 left-2/4 -translate-x-2/4 rounded-full bg-bg shadow-inset-hard w-16 flex justify-center items-center">
              <p className="text-xs">{defaultColor}</p>
            </div>
          </div>
        </div>
      )}
      {/* Size input fields */}
      {(currentOption?.params && ('width' in currentOption.params || 'height' in currentOption.params) || sectionOnLightType[createLightOption as LightType].includes('size')) && (
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
                  value={controlNaN(lightSize[axis.toLowerCase() as "width" | "height"])}
                  onChange={(e) => handleInputChange(e, (value) => setLightSize({ ...lightSize, [axis.toLowerCase()]: value }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Other input fields */}
      {(currentOption?.params && ('intst' in currentOption.params || 'decay' in currentOption.params || 'dist' in currentOption.params) || ['intensity', 'decay', 'distance'].some(item => sectionOnLightType[createLightOption as LightType].includes(item))) && (
        <div>
          <p className="font-poppins font-medium text-purple pt-4 mt-2 px-2">
            Other props:
          </p>
          <div className="flex flex-col gap-4 px-2">
            {((currentOption && 'intst' in currentOption.params) || sectionOnLightType[createLightOption as LightType].includes('position')) && (
              <div className="flex items-center gap-2" key={'intst'}>
                <p>Intensity:</p>
                <input
                  type="number"
                  name='intensity'
                  className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
                  value={controlNaN(lightIntensity)}
                  onChange={(e) => handleInputChange(e, setLightIntensity)}
                />
              </div>
            )}
            {((currentOption && 'dist' in currentOption.params) || sectionOnLightType[createLightOption as LightType].includes('distance')) && (
              <div className="flex items-center gap-2" key={'dist'}>
                <p>Distance:</p>
                <input
                  type="number"
                  name='distance'
                  className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
                  value={controlNaN(lightDistance)}
                  onChange={(e) => handleInputChange(e, setLightDistance)}
                />
              </div>
            )}
            {((currentOption && 'decay' in currentOption.params) || sectionOnLightType[createLightOption as LightType].includes('decay')) && (
              <div className="flex items-center gap-2" key={'decay'}>
                <p>Decay:</p>
                <input
                  type="number"
                  name='decay'
                  className="shadow-inset-soft px-4 py-2 my-2 min-h-[48px] w-20 rounded-lg text-center bg-bg"
                  value={controlNaN(lightDecay)}
                  onChange={(e) => handleInputChange(e, setLightDecay)}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {/* Create and Update button */}
      <div className="pt-4">
        {lightOption === 'new light'
          ? <>{!isAllOptionsDisabled && <AGButton nm full onClickEvent={() => sendNewLightConfig()}>
            <p className="py-2">Create</p>
          </AGButton>}</>
          : <AGButton nm full onClickEvent={() => sendUpdateLightConfig()}>
            <p className="py-2">Update</p>
          </AGButton>}
      </div>
    </>
  );
}
