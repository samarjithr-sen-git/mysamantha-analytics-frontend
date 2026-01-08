import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { Separator } from "@/components/ui/separator"

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50">
        {/* The Sidebar component we are about to update with Links */}
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Top Navigation Bar */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Zemuria Analytics Engine
              </span>
            </div>
          </header>
          
          {/* Main Content Area */}
          <div className="flex flex-1 flex-col gap-4 p-6 overflow-y-auto">
            {/* The Outlet is a placeholder for the child components:
               Overview, Financials, or Operations 
            */}
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toaster is placed here to ensure it's on top of all 
          layouts but still within the app context.
      */}
      <Toaster position="top-right" richColors closeButton />
    </SidebarProvider>
  )
}