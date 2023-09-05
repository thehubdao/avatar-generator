interface TransparentBoxProps {
  children: React.ReactNode,
  fullWidth?: boolean,
  opacityPercentage?: '25' | '50' | '75'
  heightClass?: string,
  paddingClass?: string,
  backgroundColorClass?: string,
  border?: boolean,
  borderSizeClass?: string,
  borderColorClass?: string,
  aditionalClass?: string
}

export default function TransparentBox({
  children,
  fullWidth,
  opacityPercentage = '75',
  backgroundColorClass,
  heightClass = 'h-full',
  paddingClass = 'px-11',
  border,
  borderSizeClass = 'border-2',
  borderColorClass = 'border-white'
}: TransparentBoxProps) {
  const widthClass = fullWidth ? 'w-full' : 'w-fit'
  const borderClass = border ? `${borderColorClass} ${borderSizeClass}` : 'border-none'

  const getBgOpacity = () => {
    if (opacityPercentage === '25') return 'bg-opacity-25'
    if (opacityPercentage === '50') return 'bg-opacity-50'
    return 'bg-opacity-75'
  }

  return (
    <div
      className={`
        flex flex-col justify-center items-center border-2 border-white 
        ${widthClass}
        ${borderClass}
        ${getBgOpacity()}
        ${backgroundColorClass}
        ${heightClass}
        ${paddingClass}
      `}
    >{children}</div >
  )
}