import { Fragment } from "react"
import TransparentBox from "../../common/transparentBox.ui"

export default function EditLuksoSectionUI() {
  return (
    <section className="h-full flex items-center justify-between hidden">
      {/* Edit Avatar */}
      <div className="w-[461px] h-full flex flex-col gap-3">
        <TransparentBox
          fullWidth
          border
          backgroundColorClass="bg-[#FFCBDE]"
          heightClass="grow"
          borderSizeClass="border-t-0"
        >
          <h2>Image</h2>
          <div className="grid grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => {
              return (<Fragment key={index}>
                <div>
                  <h3>TOP</h3>
                  <p>Information</p>
                </div>
                <div>
                  <h3>BUTTON</h3>
                  <p>Information</p>
                </div>
              </Fragment>)
            })}
          </div>
          <TransparentBox fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
            <p>World Color <span>0x00f</span></p>
          </TransparentBox>
        </TransparentBox>
      </div>
    </section>
  )
}