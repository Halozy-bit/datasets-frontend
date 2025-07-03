//make menu item terlihat di sm dan md
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <div className="mx-auto border-b flex justify-between px-2 py-2 bg-white dark:bg-gray-800 shadow-md text-gray-900 dark:text-gray-100">
      {/* Navigation Menu */}
      <NavigationMenu className="flex items-center space-x-4 justify-between">
        <NavigationMenuList className="space-x-2 p-3">
          <NavigationMenuItem>
            <NavigationMenuLink to="/">
              <LayoutDashboard />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex items-center space-x-2">
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="space-x-2 p-3 ">
            <NavigationMenuItem>
              <NavigationMenuLink to="/">Home</NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink to="/datasets">Datasets</NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink to="/upload">Upload</NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink to="/docs">Docs</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button variant="outline" size="sm">
                <LogIn className="mr-1 h-4 w-4" />
                Login
              </Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

    </div>
  );
}
