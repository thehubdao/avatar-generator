import { useEffect, useState } from "react"

interface hudTitleProps {
  selectedFeature: string
}

const HudTitle = ({ selectedFeature }: hudTitleProps) => {
  const [currentTitle, setCurrentTitle] = useState<string>('HUD');
  const [nextTitle, setNextTitle] = useState<string>('HUD');

  const [runAnimation, setRunAnimation] = useState<boolean>(false);

  useEffect(() => {
    setNextTitle(selectedFeature);
    setRunAnimation(true);

    setTimeout(() => {
      setCurrentTitle(selectedFeature);
      setRunAnimation(false);
    }, 500)
  }, [selectedFeature])

  return (
    <div className="w-full h-[60px] relative overflow-hidden">
      <h2 className={`absolute font-work font-bold text-6xl uppercase truncate ${runAnimation ? '-top-[60px] duration-500 transition-all' : 'top-0'}`}>{currentTitle}</h2>
      <h2 className={`absolute font-work font-bold text-6xl uppercase truncate ${runAnimation ? 'bottom-0 duration-500 transition-all' : '-bottom-[60px]'}`}>{nextTitle}</h2>
    </div>
  )
}

export default HudTitle