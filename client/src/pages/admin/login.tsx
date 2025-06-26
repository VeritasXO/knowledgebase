import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { WebsiteSwitcher } from "@/components/website-switcher";
import { useClientSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type AdminLoginFormValues,
  adminLoginSchema,
} from "@shared/schemas/validation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "wouter";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: settings } = useClientSettings();
  const [isLoading, setIsLoading] = useState(false);

  // Define the login form
  const loginForm = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  // No longer needed as it's handled in WebsiteSwitcher component

  // Check session status
  const { isLoading: isCheckingSession } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/me", undefined, {
          on401: "throw",
        });
        if (response) {
          setLocation("/admin/dashboard");
        }
        return response;
      } catch (error) {
        // Ignore auth errors
        return null;
      }
    },
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  const handleLogin = async (data: AdminLoginFormValues) => {
    setIsLoading(true);
    try {
      const values = await apiRequest("POST", "/api/auth/login", data);
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/admin/dashboard");
      toast({
        title: "Welcome back!",
        description: `Logged in successfully as ${values.user.email}`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description:
          error instanceof Error
            ? error.message
            : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onLoginSubmit = (data: AdminLoginFormValues) => {
    handleLogin(data);
  };
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 relative">
      {/* Website switcher positioned at the top left */}
      <div className="absolute top-4 left-4 w-64">
        <WebsiteSwitcher />
      </div>

      {/* Theme toggle positioned at the top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md shadow-lg border-gray-200 dark:border-gray-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-center">
              {settings?.websiteTitle} Admin
            </CardTitle>
            <CardDescription className="text-center">
              Enter your admin credentials to access the management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@becovic.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                          href="/admin/password-forgot"
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </CardContent>{" "}
          <CardFooter className="flex flex-col justify-center pt-0"></CardFooter>
        </Card>
      </div>
    </div>
  );
}
