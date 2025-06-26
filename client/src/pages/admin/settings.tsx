import { AdminLayout } from "@/components/admin/admin-layout";
import { DepartmentsCategoriesManager } from "@/components/admin/departments-manager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServerSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UpdateSettingsValues } from "@shared/schemas/validation/settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Mail, Save } from "lucide-react";
import { useEffect, useState } from "react";

export default function SystemSettings() {
  const searchParams = new URLSearchParams(window.location.search);
  const oauthStatus = searchParams.get("oauth");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [initiatingOAuth, setInitiatingOAuth] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [googleOAuthAvailable, setGoogleOAuthAvailable] = useState(false);

  // Switch to Google Integration tab if OAuth redirect was successful
  useEffect(() => {
    if (oauthStatus === "success") {
      setActiveTab("google");
    }
  }, [oauthStatus]);

  // Check if Google OAuth is available
  const googleOAuthQuery = useQuery({
    queryKey: ["/api/integrations/google/availability"],
    queryFn: async () => {
      try {
        const response = await apiRequest(
          "GET",
          "/api/integrations/google/availability",
        );
        return response.available as boolean;
      } catch (error) {
        return false;
      }
    },
  });

  // Update googleOAuthAvailable state when the query completes
  useEffect(() => {
    if (googleOAuthQuery.isSuccess) {
      setGoogleOAuthAvailable(googleOAuthQuery.data || false);
    }
  }, [googleOAuthQuery.data, googleOAuthQuery.isSuccess]);

  // Show success/error message if the user is redirected from OAuth
  useEffect(() => {
    // Store the oauth status in a ref to use it after component is mounted
    const status = oauthStatus;

    if (status) {
      requestAnimationFrame(() => {
        if (status === "success") {
          // Show success toast
          toast({
            title: "Google Integration Successful",
            description: "Google integration is now set up.",
          });
        } else if (status === "error") {
          toast({
            title: "Google Integration Failed",
            description: "There was an error connecting to Google Calendar.",
            variant: "destructive",
          });
        }

        // Remove the oauth parameter from the URL to prevent showing the toast on page refresh
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("oauth");
        window.history.replaceState({}, document.title, newUrl.toString());
      });
    }
  }, [oauthStatus, toast]);

  const [clientSettings, setSystemConfig] = useState<UpdateSettingsValues>({
    websiteTitle: "Knowledge Base",
    googleAccountEmail: "",
  });

  // Fetch system settings
  const { data: settings } = useServerSettings(); // Update the system config when settings are loaded (only once)
  useEffect(() => {
    if (settings) {
      setSystemConfig((prevConfig) => ({
        ...prevConfig,
        ...settings,
      }));
    }
  }, [settings]);

  // Initiate Google OAuth
  const initiateOAuthMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("GET", "/api/integrations/google/url");
    },
    onSuccess: (data) => {
      setInitiatingOAuth(false);
      // Redirect to Google's OAuth URL
      window.location.href = data.authUrl;
    },
    onError: (error) => {
      setInitiatingOAuth(false);
      toast({
        title: "OAuth Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (config: UpdateSettingsValues) => {
      return apiRequest("PUT", "/api/admin/settings", config);
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "System settings have been successfully updated",
      });
      setIsSaving(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] }); // Also invalidate public settings
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/dashboard/stats"],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsSaving(false);
    },
  });

  // Start Google OAuth flow
  const initiateGoogleOAuth = () => {
    setInitiatingOAuth(true);
    initiateOAuthMutation.mutate();
  };

  // Send test email mutation
  const sendTestEmailMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/settings/test-email");
    },
    onSuccess: () => {
      toast({
        title: "Test email sent",
        description: "A test email has been sent successfully",
      });
      setSendingTestEmail(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setSendingTestEmail(false);
    },
  });

  // Send a test email
  const sendTestEmail = () => {
    setSendingTestEmail(true);
    sendTestEmailMutation.mutate();
  };

  // Disconnect Google Account
  const disconnectGoogleMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", "/api/admin/settings", {
        googleAccountEmail: null,
        googleCalendarId: null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Google account disconnected",
        description: "Your Google account has been disconnected successfully",
      });
      // Update local state
      setSystemConfig({
        ...clientSettings,
        googleAccountEmail: "",
      });
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle field change
  const handleChange = (field: string, value: any) => {
    setSystemConfig({
      ...clientSettings,
      [field]: value,
    });
  };

  // Save all settings
  const saveSettings = () => {
    setIsSaving(true);
    updateSettingsMutation.mutate(clientSettings);
  };

  return (
    <AdminLayout
      title="System Settings"
      description="Configure system-wide settings and emergency controls."
    >
      <div className="flex justify-end items-center mb-6">
        <Button onClick={saveSettings} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs
        value={activeTab}
        className="space-y-4"
        onValueChange={(value) => {
          setActiveTab(value);
        }}
      >
        {" "}
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="google">Google</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>
                Configure general settings and customizations for the website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="websiteTitle">Website Title</Label>
                  <Input
                    id="websiteTitle"
                    value={clientSettings.websiteTitle || ""}
                    onChange={(e) =>
                      handleChange("websiteTitle", e.target.value)
                    }
                    placeholder="Website title"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="google">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Google Integration
              </CardTitle>
              <CardDescription>
                Connect with Google to automatically manage calendar events and
                send emails.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {googleOAuthAvailable ? (
                <>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="googleAccountEmail">
                        Google Account Email
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="googleAccountEmail"
                          value={
                            clientSettings.googleAccountEmail || "Not connected"
                          }
                          readOnly
                          disabled
                          className="bg-muted/50"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {clientSettings.googleAccountEmail
                          ? "This email will be used as the sender for all outgoing emails"
                          : "Connect with Google to set up the email sender"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 pt-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {clientSettings.googleAccountEmail ? (
                        <>
                          <Button
                            variant="destructive"
                            onClick={() => disconnectGoogleMutation.mutate()}
                            className="flex-1"
                          >
                            Disconnect Google Account
                          </Button>
                          <Button
                            onClick={sendTestEmail}
                            disabled={sendingTestEmail}
                            className="flex-1"
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            {sendingTestEmail
                              ? "Sending..."
                              : "Send Test Email"}
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={initiateGoogleOAuth}
                          disabled={initiatingOAuth}
                          className="flex-1"
                        >
                          {initiatingOAuth
                            ? "Connecting..."
                            : "Connect with Google"}
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Google Integration Unavailable</AlertTitle>
                  <AlertDescription>
                    Google OAuth credentials are not configured. Please check
                    your environment variables for GOOGLE_OAUTH_CLIENT_ID and
                    GOOGLE_OAUTH_CLIENT_SECRET.
                  </AlertDescription>
                </Alert>
              )}{" "}
            </CardContent>
          </Card>
        </TabsContent>{" "}
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Department & Category Management</CardTitle>
              <CardDescription>
                Create and manage departments and their categories to organize
                your articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DepartmentsCategoriesManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
