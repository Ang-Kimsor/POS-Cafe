import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import { LoadingProvider } from "./context/LoadingContext";
import { ServerErrorProvider } from "./context/ServerErrorContext";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ServerErrorProvider>
        <LoadingProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LoadingProvider>
      </ServerErrorProvider>
    </Provider>
  </StrictMode>
);
