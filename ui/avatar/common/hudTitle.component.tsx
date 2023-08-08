import { useEffect, useState } from "react";

interface HudFeatureTitleProps {
  selectedFeature: string | undefined;
}

/**
 * HUD Feature Title component for controlling HUD title animation.
 * 
 * @param {string} selectedFeature - The selected feature to display as the HUD feature title.
 */
export default function HudFeatureTitle({ selectedFeature }: HudFeatureTitleProps) {
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

  return (
    <div className="w-full h-[60px] relative overflow-hidden">
      {/* Current HUD feature title with animation */}
      <h2 className={`absolute font-work font-bold text-6xl uppercase truncate ${hasRunAnimation ? '-top-[60px] duration-500 transition-all' : 'top-0'}`}>{currentTitle}</h2>
      {/* Next HUD feature title with animation */}
      <h2 className={`absolute font-work font-bold text-6xl uppercase truncate ${hasRunAnimation ? 'bottom-0 duration-500 transition-all' : '-bottom-[60px]'}`}>{nextTitle}</h2>
    </div>
  );
}