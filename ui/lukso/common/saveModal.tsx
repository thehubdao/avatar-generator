import Image from "next/image";
import TransparentBoxUI from "./transparentBox.ui";

interface SaveModalUIProps {
    setIsSaveModalOpen: (value: boolean) => void;
    onSave: () => void
}

export default function SaveModalUI({ setIsSaveModalOpen, onSave }: SaveModalUIProps) {

    const closeModal = () => { setIsSaveModalOpen(false) }

    return (
        <div className="z-50 bg-black bg-opacity-30 w-screen h-screen fixed top-0 flex justify-center items-center">
            <TransparentBoxUI fullWidth={false} border heightClass="h-fit min-h-[240px]" backgroundColorClass="bg-client-primary" aditionalClass="w-[50%]">
                <div className="min-w-[515px] flex flex-col gap-4 justify-center items-center">
                    <Image
                        src='resources/icons/campaigns/portal.svg'
                        width={106}
                        height={24}
                        alt="Lukso icon"
                    />
                    <h1 className="text-2xl font-bold text-white">Save This Combination</h1>
                    <h3 className="text-white px-[200px]">Are you sure that you want to save this wearable combination? If you are using a custom <br/> wearable it will be burnt and you will not be able to use it again on a different Citizen.</h3>
                    <div className="flex flex-wrap justify-between gap-3">
                        <button className="w-72 h-fit" onClick={() => { closeModal() }}>
                            <TransparentBoxUI fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
                                <div className="flex items-center gap-3">
                                    <p className="">Go Back</p>
                                </div>
                            </TransparentBoxUI>
                        </button>
                        <button className="w-72 h-fit" onClick={() => {
                            closeModal()
                            onSave()
                        }}>
                            <TransparentBoxUI fullWidth border backgroundColorClass="bg-white" heightClass="h-12" >
                                <div className="flex items-center gap-3">
                                    <p className="">Save</p>
                                </div>
                            </TransparentBoxUI>
                        </button>
                    </div>
                </div>
            </TransparentBoxUI>
        </div>
    )
}