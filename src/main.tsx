import 'bootstrap/dist/css/bootstrap.min.css'
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "react-oidc-context";

const oidcAuthorityUrl = import.meta.env.VITE_OIDC_AUTHORITY_URL || 'http://localhost:9000/application/o/employee_api';
const oidcClientId = import.meta.env.VITE_OIDC_CLIENT_ID || 'employee_api_client';

const oidc = {
    authority: oidcAuthorityUrl,
    client_id: oidcClientId,
    redirect_uri: `${window.location.origin}/callback`,
    post_logout_redirect_uri: `${window.location.origin}/`,
    response_type: "code",
    scope: "openid profile email", // optional: " offline_access"
};


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider {...oidc}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>,
)
