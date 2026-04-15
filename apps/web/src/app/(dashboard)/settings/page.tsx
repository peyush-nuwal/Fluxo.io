"use client";
import ImageUploadInput from "@/components/ImageUploadInput";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DiagramLoader from "@/components/ui/diagram-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
import { useIsMobile } from "@/hooks/use-mobile";

const SettingPage = () => {
  const { user, loading } = useUser();
  const isMobile = useIsMobile();
  const safeUserName = user?.user_name?.trim() || "user";
  const displayName = user?.name?.trim() || "Not set";
  const email = user?.email?.trim() || "Not set";
  const bio = user?.metadata?.bio?.trim() || "No bio added yet.";
  const location = user?.metadata?.location?.trim() || "Not set";
  const website = user?.metadata?.website?.trim() || "Not set";
  const work = user?.metadata?.work?.trim() || "Not set";
  const triggerClassName =
    "hover:!text-sidebar-primary data-[state=active]:!text-sidebar-primary lg:data-[state=active]:text-xl! after:bg-sidebar-primary! cursor-pointer";

  if (loading)
    return (
      <div className="flex items-center justify-center">
        <DiagramLoader />
      </div>
    );
  return (
    <div className="w-full px-2 py-4">
      <h1 className="text-3xl font-medium mb-3 ml-3">Settings</h1>
      <Tabs
        defaultValue="profile"
        orientation={isMobile ? "horizontal" : "vertical"}
        className="w-full h-full"
      >
        <TabsList
          variant="line"
          className={cn(
            "bg-secondary rounded-md! lg:rounded-lg! lg:py-3",
            isMobile
              ? "w-full justify-start overflow-x-auto"
              : "min-w-20 lg:min-w-70",
          )}
        >
          <TabsTrigger value="profile" className={triggerClassName}>
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className={triggerClassName}>
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className={triggerClassName}>
            Appearance
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <div className="  p-4  flex  space-x-12  items-start justify-center">
            <ImageUploadInput
              userName={safeUserName}
              userAvatar={user?.avatar_url}
              isEditMode={true}
            />

            <div className="w-full max-w-3xl space-y-6 ">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">
                  Account
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="settings-username">Username</Label>
                    <Input
                      id="settings-username"
                      value={`@${safeUserName}`}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-name">Display Name</Label>
                    <Input id="settings-name" value={displayName} readOnly />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="settings-email">Email</Label>
                    <Input id="settings-email" value={email} readOnly />
                  </div>
                </div>
              </div>
              {/* ---public-profile--- */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">
                  Public Profile
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="settings-bio">Bio</Label>
                    <Textarea
                      id="settings-bio"
                      value={bio}
                      readOnly
                      className="min-h-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-location">Location</Label>
                    <Input id="settings-location" value={location} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-work">Work</Label>
                    <Input id="settings-work" value={work} readOnly />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="settings-website">Website</Label>
                    <Input id="settings-website" value={website} readOnly />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Security controls will appear here (password, sessions, 2FA).
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Coming soon.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Theme and UI preferences.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Coming soon.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingPage;
