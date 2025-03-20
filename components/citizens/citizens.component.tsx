import { useEffect } from "react";
import { CitizensPageLocation } from "../../enums/citizens/common.enum";
import CitizensUI from "../../ui/citizens/citizens.ui"
import { GoToPage } from "../../utils/router.util";



    export default function CitizensComponent() {

        const isLoggedIn = () => {
            //TODO: PERSISTENCIA DE SESION
            return false;
        }

        useEffect(() => {
            if (!isLoggedIn()) {
                GoToPage(CitizensPageLocation.LOGIN);
            }
        }, []);


    return <CitizensUI />
}
