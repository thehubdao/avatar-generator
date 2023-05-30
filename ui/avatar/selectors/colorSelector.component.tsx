interface ColorSelectorProps {
  list?: string[];
  activeColor?: string;
  handleClick: (color: string) => void;
}

interface ColorOptionProps {
  option: string,
  isActive: boolean
}

function ColorOption({option, isActive}: ColorOptionProps) {
  return (
    <div className={`w-12 h-12 p-2 shadow-flat-medium rounded-lg ${isActive ? 'shadow-inset-medium p-4' : ''}`} >
      <div className={`w-full h-full ${isActive ? 'rounded-full' : ''}`} style={{backgroundColor: (`#${option}`)}}></div>
    </div>
  )
}

export default function ColorSelector({list, activeColor, handleClick}: ColorSelectorProps) {
  const selectFeature = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    handleClick(color);
  }

  return (
    <div className="flex gap-3">
      {
        list ?
        list.map(opt => {
          return (
            <div key={opt} className="cursor-pointer" onClick={event => selectFeature(event, opt)}>
              <ColorOption option={opt} isActive={activeColor && activeColor === opt ? true : false} />
            </div>
          )
        })
        :
        <p>no Color list</p>
      }
    </div>
  )
}