import { 
  LayoutDashboard, 
  DollarSign, 
  ShieldCheck, 
  LogOut,
  UsersRound,
  Server 
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SamanthaLogo } from "@/components/shared/Logo"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

const navItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "User Analytics",
    url: "/dashboard/users",
    icon: UsersRound,
  },
  {
    title: "Financial Intelligence",
    url: "/dashboard/financials",
    icon: DollarSign,
  },
  {
    title: "Manual Operations",
    url: "/dashboard/operations",
    icon: ShieldCheck,
  },
  {
    title: "System & Infra",
    url: "/dashboard/system",
    icon: Server,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    toast.info("Logged out of Zemuria Engine")
    navigate("/login")
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      {/* Sidebar Branding Area */}
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-4">
          <SamanthaLogo className="h-9 w-auto shrink-0" />
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-lg tracking-tight text-foreground">
              Samantha
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              Admin Engine
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs font-semibold uppercase text-muted-foreground/70">
            Analytics & Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary transition-colors"
                  >
                    <Link to={item.url}>
                      <item.icon className="size-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Action Footer */}
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="size-5" />
              <span className="font-medium">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}