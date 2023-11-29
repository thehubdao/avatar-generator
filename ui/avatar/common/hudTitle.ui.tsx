import { useEffect, useState } from "react";

interface HudFeatureTitleUIProps {
  selectedFeature: string | undefined;
  size?: 'small' | 'medium' | 'big'
}

/**
 * HUD Feature Title component for controlling HUD title animation.
 * 
 * @param {string} selectedFeature - The selected feature to display as the HUD feature title.
 */
export default function HudFeatureTitleUI({ selectedFeature, size = 'big' }: HudFeatureTitleUIProps) {
  // * State for the current and next HUD titles
  const [currentTitle, setCurrentTitle] = useState<string>();
  const [nextTitle, setNextTitle] = useState<string>();

  // * State for controlling the animation
  const [hasRunAnimation, setHasRunAnimation] = useState(false);

  useEffect(() => {
    // * Update the nextTitle and trigger the animation
    setNextTitle(selectedFeature);
    setHasRunAnimation(true);

    // * After a delay, update the currentTitle and stop the animation
    setTimeout(() => {
      setCurrentTitle(selectedFeature);
      setHasRunAnimation(false);
    }, 500);
  }, [selectedFeature]);

  // TODO: improve the animation by doing the effect for each letter instead of taking the whole title.

  const getSizeClass = () => {
    const tailwindClass = {
      textSize: '',
      height: ''
    }

    switch (size) {
      case 'small':
        tailwindClass.textSize = 'text-2xl';
        tailwindClass.height = 'h-[32px]';
        break;
      case 'medium':
        tailwindClass.textSize = 'text-4xl';
        tailwindClass.height = 'h-[40px]';
        break;
      case 'big':
        tailwindClass.textSize = 'text-6xl';
        tailwindClass.height = 'h-[60px]';
        break;
    }

    return `${tailwindClass.textSize} ${tailwindClass.height}`
  }

  return (
    <div className={`w-full relative overflow-hidden font-work font-bold ${getSizeClass()}`}>
      {/* Current HUD feature title with animation */}
      <h2 className={`w-full absolute uppercase truncate ${hasRunAnimation ? '-top-[60px] duration-500 transition-all' : 'top-0'}`}>{currentTitle}</h2>
      {/* Next HUD feature title with animation */}
      <h2 className={`w-full absolute uppercase truncate ${hasRunAnimation ? 'bottom-0 duration-500 transition-all' : '-bottom-[60px]'}`}>{nextTitle}</h2>
    </div>
  );
}