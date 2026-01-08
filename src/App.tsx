import './App.css'
import {Route, Routes} from "react-router-dom";
import {Dashboard} from "./pages/Dashboard.tsx";
import RequireAuth from "./auth/RequireAuth.tsx";
import {EmployeeTable} from "./pages/EmployeeTable.tsx";
import {AppSidebar} from "@/components/app-sidebar.tsx";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar.tsx";
import {SiteHeader} from "@/components/site-header.tsx";

function App() {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className={"p-4"}>
                  <Routes>
                    <Route path="/" element={
                      <RequireAuth>
                        <Dashboard/>
                      </RequireAuth>
                    }/>
                    <Route path="/employees" element={
                      <RequireAuth>
                        <EmployeeTable/>
                      </RequireAuth>
                    }/>
                  </Routes>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default App
