import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import Snackbar from "./snackbar.ui";

interface SnackbarContextType {
  showSnackbar: (message: ReactNode) => void;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

interface SnackbarProviderProps {
  children: ReactNode;
}

export default function SnackbarProvider({children}: SnackbarProviderProps) {
  const [snackbars, setSnackbars] = useState<{ id: number; message: ReactNode }[]>([]);
  const [nextId, setNextId] = useState(1);

  const showSnackbar = useCallback((message: ReactNode) => {
    const id = nextId;
    setSnackbars((prev) => [...prev, { id, message }]);
    setNextId((prev) => prev + 1);

    setTimeout(() => {
      setSnackbars((prev) => prev.filter((snackbar) => snackbar.id !== id));
    }, 5000);
  }, [nextId]);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 space-y-4 z-50">
        {snackbars.map((snackbar) => (
          <Snackbar key={snackbar.id} message={snackbar.message} />
        ))}
      </div>
    </SnackbarContext.Provider>
  );
}

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};