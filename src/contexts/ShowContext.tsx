import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Caller {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  joinedAt: Date;
  status: 'waiting' | 'live' | 'rejected';
  connectionId?: string;
}

interface ShowContextType {
  callers: Caller[];
  liveCallers: Caller[];
  addCaller: (caller: Omit<Caller, 'id' | 'joinedAt' | 'status'>) => Caller;
  moveToLive: (callerId: string) => void;
  removeCaller: (callerId: string) => void;
  updateCallerStatus: (callerId: string, status: Caller['status']) => void;
  currentShow: string | null;
  startShow: (showName: string) => void;
  endShow: () => void;
  isShowLive: boolean;
}

const ShowContext = createContext<ShowContextType | null>(null);

export function ShowProvider({ children }: { children: ReactNode }) {
  const [callers, setCallers] = useState<Caller[]>([]);
  const [liveCallers, setLiveCallers] = useState<Caller[]>([]);
  const [currentShow, setCurrentShow] = useState<string | null>(null);

  const addCaller = useCallback((caller: Omit<Caller, 'id' | 'joinedAt' | 'status'>): Caller => {
    const newCaller: Caller = {
      ...caller,
      id: uuidv4(),
      joinedAt: new Date(),
      status: 'waiting',
    };

    setCallers(prev => [...prev, newCaller]);
    return newCaller;
  }, []);

  const moveToLive = useCallback((callerId: string) => {
    setCallers(prevCallers => {
      const caller = prevCallers.find(c => c.id === callerId);
      if (!caller) return prevCallers;

      // Move to live if not already there
      setLiveCallers(prevLive => {
        if (prevLive.some(c => c.id === callerId)) return prevLive;
        return [...prevLive, { ...caller, status: 'live' }];
      });

      // Remove from waiting list
      return prevCallers.filter(c => c.id !== callerId);
    });
  }, []);

  const removeCaller = useCallback((callerId: string) => {
    setCallers(prev => prev.filter(caller => caller.id !== callerId));
    setLiveCallers(prev => prev.filter(caller => caller.id !== callerId));
  }, []);

  const updateCallerStatus = useCallback((callerId: string, status: Caller['status']) => {
    const updateArray = (arr: Caller[]) => 
      arr.map(caller => 
        caller.id === callerId ? { ...caller, status } : caller
      );

    setCallers(prev => updateArray(prev));
    setLiveCallers(prev => updateArray(prev));
  }, []);

  const startShow = useCallback((showName: string) => {
    setCurrentShow(showName);
    // In a real app, you would connect to your WebSocket here
  }, []);

  const endShow = useCallback(() => {
    // Clean up all callers
    setCallers([]);
    setLiveCallers([]);
    setCurrentShow(null);
    // In a real app, you would disconnect from WebSocket here
  }, []);

  return (
    <ShowContext.Provider
      value={{
        callers: callers.filter(c => c.status === 'waiting'),
        liveCallers: liveCallers.filter(c => c.status === 'live'),
        addCaller,
        moveToLive,
        removeCaller,
        updateCallerStatus,
        currentShow,
        startShow,
        endShow,
        isShowLive: !!currentShow,
      }}
    >
      {children}
    </ShowContext.Provider>
  );
}

export function useShow() {
  const context = useContext(ShowContext);
  if (!context) {
    throw new Error('useShow must be used within a ShowProvider');
  }
  return context;
}
