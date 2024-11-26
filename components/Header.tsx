"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { data: session } = useSession();

  const AuthButtons = () => (
    <div className="flex flex-col gap-2">
      <Button asChild variant="outline">
        <Link href="/auth/signin">Login</Link>
      </Button>
      <Button asChild>
        <Link href="/auth/signup">Register</Link>
      </Button>
    </div>
  );

  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                session?.user?.image ||
                "https://cdn-icons-png.flaticon.com/128/847/847969.png"
              }
              alt={session?.user?.name || "User Avatar"}
            />
            <AvatarFallback className="text-xs">
              {session?.user?.name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session?.user?.name || "Guest"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email || ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="w-full">
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/links" className="w-full">
              Links
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="w-full">
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut()}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center p-5">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold">URL Shortener</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          <div className="hidden md:flex md:items-center md:space-x-2">
            {session ? <UserDropdown /> : <AuthButtons />}
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      session?.user?.image ||
                      "https://cdn-icons-png.flaticon.com/128/847/847969.png"
                    }
                    alt={session?.user?.name || "User Avatar"}
                  />
                  <AvatarFallback className="text-xs">
                    {session?.user?.name?.charAt(0).toUpperCase() ||
                      "?"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                {session ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session?.user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session?.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="w-full">
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/links" className="w-full">
                          Links
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="w-full">
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => signOut()}>
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                ) : (
                  <AuthButtons />
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </header>
  );
}
