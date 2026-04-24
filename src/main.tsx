import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { UserProvider } from "./contexts/user.context.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider } from "./contexts/notification.context.tsx";
const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </UserProvider>
    </QueryClientProvider>
  </StrictMode>,
);
