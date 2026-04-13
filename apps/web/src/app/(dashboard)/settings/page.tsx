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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/hooks/use-user";

const SettingPage = () => {
  const { user, loading } = useUser();
  const triggerClassName =
    "hover:!text-sidebar-primary data-[state=active]:!text-sidebar-primary data-[state=active]:text-xl! after:bg-sidebar-primary! cursor-pointer";

  if (loading)
    return (
      <DiagramLoader className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    );
  return (
    <div className="px-2 py-4">
      <h1 className="text-3xl font-medium mb-3 ml-3">Settings</h1>
      <Tabs
        defaultValue="profile"
        orientation="vertical"
        className="w-full h-full"
      >
        <TabsList
          variant="line"
          className="min-w-50 bg-secondary rounded-lg! py-3 "
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
          <div className="p-4">
            <ImageUploadInput
              userName={user?.user_name}
              userAvatar={user?.avatar_url}
              isEditMode={true}
            />
          </div>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Track performance and user engagement metrics. Monitor trends
                and identify growth opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Page views are up 25% compared to last month.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <div>overview tab</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingPage;
