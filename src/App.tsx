import { useState } from "react";
import { AuthScreen } from "@/components/Auth/AuthScreen";
import { Workspace } from "@/components/Workspace/Workspace";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      {!isAuthenticated ? (
        <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />
      ) : (
        <Workspace />
      )}
    </>
  );
}
