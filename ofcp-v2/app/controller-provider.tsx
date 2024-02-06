'use client';

import { createContext, useRef, useState } from "react";
import Controller from "./controller/controller";

export const ControllerContext = createContext([null, ()=>null] as [Controller | null, ()=>void]);

export default function ControllerProvider ({children}: {children: React.ReactNode}) {
    const [renderState, setRenderState] = useState(false);

    //hack to force the page to rerender when the controller changes
    const rerender = () => {
        setRenderState(!renderState);
    };

    //make the context
    const controller = useRef(new Controller());

    return (
        <ControllerContext.Provider value={[controller.current, rerender]}>
            {children}
        </ControllerContext.Provider>
    );
};
