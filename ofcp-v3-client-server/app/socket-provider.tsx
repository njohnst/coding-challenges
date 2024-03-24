'use client';

import { createContext, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { io } from 'socket.io-client';

export const SocketContext = createContext(null as Socket | null);

export default function SocketProvider ({children}: {children: React.ReactNode}) {
    //make the context
    const socket = useRef(io(":3001"));

    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>
    );
};
