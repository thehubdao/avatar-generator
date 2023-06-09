import { useEffect, useState } from "react"

interface hudTitleProps {
  selectedFeature: string
}

/**
 * HUD Title component for controlling HUD title animation.
 * 
 * @param {string} selectedFeature - The selected feature to display as the HUD title.
 */
const HudTitle = ({ selectedFeature }: hudTitleProps) => {
  // * State for the current and next HUD titles
  const [currentTitle, setCurrentTitle] = useState('HUD');
  const [nextTitle, setNextTitle] = useState('HUD');

  // * State for controlling the animation
  const [runAnimation, setRunAnimation] = useState(false);

  useEffect(() => {
    // * Update the nextTitle and trigger the animation
    setNextTitle(selectedFeature);
    setRunAnimation(true);

    // * After a delay, update the currentTitle and stop the animation
    setTimeout(() => {
      setCurrentTitle(selectedFeature);
      setRunAnimation(false);
    }, 500);
  }, [selectedFeature]);

  // TODO: improve the animation by doing the effect for each letter instead of taking the whole title.

  return (
    <div className="w-full h-[60px] relative overflow-hidden">
      {/* Current HUD title with animation */}
      <h2 className={`absolute font-work font-bold text-6xl uppercase truncate ${runAnimation ? '-top-[60px] duration-500 transition-all' : 'top-0'}`}>{currentTitle}</h2>
      {/* Next HUD title with animation */}
      <h2 className={`absolute font-work font-bold text-6xl uppercase truncate ${runAnimation ? 'bottom-0 duration-500 transition-all' : '-bottom-[60px]'}`}>{nextTitle}</h2>
    </div>
  );
};

export default HudTitle;