"use client";
import { useEffect, useMemo, useState } from "react";
import ImageUploadInput from "@/components/ImageUploadInput";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Loader from "@/components/ui/Loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import {
  requestEmailChange,
  setCurrentPassword,
  updateCurrentPassword,
  updateCurrentUserProfile,
  updateCurrentUsername,
  verifyEmailChange,
} from "@/lib/auth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SegmentRadioGroup } from "@/components/ui/segment-radio";
import { THEME_PALETTE } from "@/components/theme-dialog";
import { RotateCcw } from "lucide-react";

const SettingPage = () => {
  const { user, loading } = useUser();
  const isMobile = useIsMobile();
  const {
    theme: activeTheme,
    setTheme,
    resetTheme,
    mode,
    setMode,
  } = useTheme();
  const safeUserName = user?.user_name?.trim() || "user";
  const [localUserName, setLocalUserName] = useState<string | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const displayedUserName = (localUserName ?? safeUserName).trim() || "user";
  const [localName, setLocalName] = useState<string | null>(null);
  const [localBio, setLocalBio] = useState<string | null>(null);
  const [localLocation, setLocalLocation] = useState<string | null>(null);
  const [localWebsite, setLocalWebsite] = useState<string | null>(null);
  const [localWork, setLocalWork] = useState<string | null>(null);
  const [profileDraft, setProfileDraft] = useState({
    name: "",
    bio: "",
    location: "",
    website: "",
    work: "",
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailChangeStep, setEmailChangeStep] = useState<"request" | "verify">(
    "request",
  );
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmittingEmailChange, setIsSubmittingEmailChange] = useState(false);
  const [localEmail, setLocalEmail] = useState<string | null>(null);
  const displayName = (localName ?? user?.name ?? "").trim();
  const email = (localEmail ?? user?.email ?? "").trim() || "Not set";
  const bio = (localBio ?? user?.metadata?.bio ?? "").trim();
  const location = (localLocation ?? user?.metadata?.location ?? "").trim();
  const website = (localWebsite ?? user?.metadata?.website ?? "").trim();
  const work = (localWork ?? user?.metadata?.work ?? "").trim();
  const triggerClassName =
    "hover:!text-sidebar-primary data-[state=active]:!text-sidebar-primary lg:data-[state=active]:text-xl! after:bg-sidebar-primary! cursor-pointer";
  const isSocialAccount = Boolean(
    user?.auth_provider && user.auth_provider !== "local",
  );
  const needsInitialPassword = isSocialAccount && user?.has_password === false;

  useEffect(() => {
    if (!user) return;

    setProfileDraft({
      name: user.name?.trim() ?? "",
      bio: user.metadata?.bio?.trim() ?? "",
      location: user.metadata?.location?.trim() ?? "",
      website: user.metadata?.website?.trim() ?? "",
      work: user.metadata?.work?.trim() ?? "",
    });
  }, [user]);

  const hasProfileChanges = useMemo(() => {
    if (!user) return false;

    return (
      profileDraft.name.trim() !== (displayName || "").trim() ||
      profileDraft.bio.trim() !== (bio || "").trim() ||
      profileDraft.location.trim() !== (location || "").trim() ||
      profileDraft.website.trim() !== (website || "").trim() ||
      profileDraft.work.trim() !== (work || "").trim()
    );
  }, [bio, displayName, location, profileDraft, user, website, work]);

  const validateUsername = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (normalized.length < 2) return "Username must be at least 2 characters";
    if (normalized.length > 255) return "Username is too long";

    const usernameRegex = /^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+[a-zA-Z0-9]$/;
    if (!usernameRegex.test(normalized)) {
      return "Use letters, numbers, dots, underscores. Cannot start/end with dot or underscore.";
    }

    return null;
  };

  const handleStartUsernameEdit = () => {
    setUsernameDraft(displayedUserName);
    setUsernameError(null);
    setIsEditingUsername(true);
  };

  const handleCancelUsernameEdit = () => {
    setUsernameDraft(displayedUserName);
    setUsernameError(null);
    setIsEditingUsername(false);
  };

  const handleUpdateUsername = async () => {
    const normalized = usernameDraft.trim().toLowerCase();
    const validationError = validateUsername(normalized);

    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    if (normalized === displayedUserName.toLowerCase()) {
      setIsEditingUsername(false);
      return;
    }

    try {
      setIsUpdatingUsername(true);
      setUsernameError(null);

      const response = await updateCurrentUsername(normalized);
      setLocalUserName(normalized);
      setIsEditingUsername(false);
      toast.success(response?.message || "Username updated successfully");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update username. Please try again.";

      setUsernameError(message);
      toast.error(message);
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleUpdateProfile = async () => {
    const nextName = profileDraft.name.trim();
    const nextBio = profileDraft.bio.trim();
    const nextLocation = profileDraft.location.trim();
    const nextWebsite = profileDraft.website.trim();
    const nextWork = profileDraft.work.trim();

    if (!nextName) {
      setProfileError("Display name is required.");
      return;
    }

    if (nextBio.length > 300) {
      setProfileError("Bio must be under 300 characters.");
      return;
    }

    if (nextLocation.length > 100) {
      setProfileError("Location must be under 100 characters.");
      return;
    }

    if (nextWork.length > 100) {
      setProfileError("Work must be under 100 characters.");
      return;
    }

    if (nextWebsite) {
      try {
        new URL(nextWebsite);
      } catch {
        setProfileError("Website must be a valid URL.");
        return;
      }
    }

    try {
      setIsUpdatingProfile(true);
      setProfileError(null);

      const response = await updateCurrentUserProfile({
        name: nextName,
        bio: nextBio,
        location: nextLocation,
        website: nextWebsite,
        work: nextWork,
      });

      setLocalName(nextName);
      setLocalBio(nextBio);
      setLocalLocation(nextLocation);
      setLocalWebsite(nextWebsite);
      setLocalWork(nextWork);

      toast.success(response?.message || "Profile updated successfully");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again.";
      setProfileError(message);
      toast.error(message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    const currentPassword = oldPassword.trim();
    const nextPassword = newPassword.trim();
    const nextConfirmPassword = confirmPassword.trim();

    if (!needsInitialPassword && !currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }

    if (nextPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (nextPassword !== nextConfirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (currentPassword === nextPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      setPasswordError(null);

      const response = needsInitialPassword
        ? await setCurrentPassword(nextPassword)
        : await updateCurrentPassword(currentPassword, nextPassword);
      toast.success(
        response?.message ||
          (needsInitialPassword
            ? "Password set successfully"
            : "Password updated successfully"),
      );
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update password. Please try again.";
      setPasswordError(message);
      toast.error(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleRequestEmailChange = async () => {
    const normalizedEmail = newEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError("New email is required.");
      return;
    }

    if (normalizedEmail === email.toLowerCase()) {
      setEmailError("New email must be different from current email.");
      return;
    }

    try {
      setIsSubmittingEmailChange(true);
      setEmailError(null);

      const response = await requestEmailChange(normalizedEmail);
      toast.success(response?.message || "OTP sent to your new email");
      setEmailChangeStep("verify");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to request email change.";
      setEmailError(message);
      toast.error(message);
    } finally {
      setIsSubmittingEmailChange(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    const normalizedEmail = newEmail.trim().toLowerCase();
    const normalizedOtp = emailOtp.trim();

    if (!normalizedOtp || normalizedOtp.length !== 6) {
      setEmailError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setIsSubmittingEmailChange(true);
      setEmailError(null);

      const response = await verifyEmailChange(normalizedEmail, normalizedOtp);
      setLocalEmail(normalizedEmail);
      toast.success(response?.message || "Email changed successfully");
      setIsEmailDialogOpen(false);
      setEmailChangeStep("request");
      setEmailOtp("");
      setNewEmail("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to verify email change.";
      setEmailError(message);
      toast.error(message);
    } finally {
      setIsSubmittingEmailChange(false);
    }
  };

  if (loading)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
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
          <div className="  p-4  flex flex-col lg:flex-row  space-y-12 lg:space-x-12  items-start justify-center">
            <ImageUploadInput
              userName={displayedUserName}
              userAvatar={user?.avatar_url}
              isEditMode={true}
            />

            <div className="w-full max-w-3xl space-y-6 ">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">
                  Account
                </h2>
                <div className="flex flex-col gap-4 ">
                  <div className="space-y-2">
                    <Label htmlFor="settings-username">Username</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Input
                          id="settings-username"
                          value={
                            isEditingUsername
                              ? usernameDraft
                              : `@${displayedUserName}`
                          }
                          onChange={(event) => {
                            setUsernameDraft(event.target.value);
                            setUsernameError(null);
                          }}
                          readOnly={!isEditingUsername}
                          disabled={isUpdatingUsername}
                        />
                        {!isEditingUsername ? (
                          <Button
                            type="button"
                            onClick={handleStartUsernameEdit}
                          >
                            Update Username
                          </Button>
                        ) : (
                          <>
                            <Button
                              type="button"
                              onClick={handleUpdateUsername}
                              disabled={isUpdatingUsername}
                            >
                              {isUpdatingUsername ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCancelUsernameEdit}
                              disabled={isUpdatingUsername}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                      {usernameError ? (
                        <p className="text-sm text-destructive">
                          {usernameError}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-name">Display Name</Label>
                    <Input
                      id="settings-name"
                      value={profileDraft.name}
                      onChange={(event) => {
                        setProfileDraft((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }));
                        setProfileError(null);
                      }}
                      disabled={isUpdatingProfile}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="settings-email">Email</Label>
                    <div className="flex items-center gap-3">
                      <Input id="settings-email" value={email} readOnly />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEmailDialogOpen(true)}
                      >
                        Change Email
                      </Button>
                    </div>
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
                      value={profileDraft.bio}
                      onChange={(event) => {
                        setProfileDraft((prev) => ({
                          ...prev,
                          bio: event.target.value,
                        }));
                        setProfileError(null);
                      }}
                      disabled={isUpdatingProfile}
                      className="min-h-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-location">Location</Label>
                    <Input
                      id="settings-location"
                      value={profileDraft.location}
                      onChange={(event) => {
                        setProfileDraft((prev) => ({
                          ...prev,
                          location: event.target.value,
                        }));
                        setProfileError(null);
                      }}
                      disabled={isUpdatingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-work">Work</Label>
                    <Input
                      id="settings-work"
                      value={profileDraft.work}
                      onChange={(event) => {
                        setProfileDraft((prev) => ({
                          ...prev,
                          work: event.target.value,
                        }));
                        setProfileError(null);
                      }}
                      disabled={isUpdatingProfile}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="settings-website">Website</Label>
                    <Input
                      id="settings-website"
                      value={profileDraft.website}
                      onChange={(event) => {
                        setProfileDraft((prev) => ({
                          ...prev,
                          website: event.target.value,
                        }));
                        setProfileError(null);
                      }}
                      disabled={isUpdatingProfile}
                    />
                  </div>
                </div>
                {profileError ? (
                  <p className="text-sm text-destructive">{profileError}</p>
                ) : null}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleUpdateProfile}
                    disabled={!hasProfileChanges || isUpdatingProfile}
                  >
                    {isUpdatingProfile ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account password.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start space-y-4">
              <p className="text-sm text-muted-foreground">
                {needsInitialPassword
                  ? `Your account is using ${user?.auth_provider} login. Set a password to enable email/password login too.`
                  : "Change your password securely."}
              </p>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  {needsInitialPassword ? "Set Password" : "Update Password"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Theme and UI preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Theme color</h3>
                <p className="text-xs text-muted-foreground">
                  Choose an accent color for the interface.
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 max-w-sm">
                  {THEME_PALETTE.map(({ theme, name, color }) => {
                    const isActive = activeTheme === theme;

                    return (
                      <Button
                        key={theme}
                        type="button"
                        variant="outline"
                        onClick={() => setTheme(theme)}
                        style={{ backgroundColor: color, borderColor: color }}
                        className={cn(
                          "size-10 rounded-md border-2 p-0",
                          isActive ? "ring-2 ring-primary ring-offset-2" : "",
                        )}
                        title={name}
                        aria-label={`Set ${name} theme`}
                      />
                    );
                  })}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetTheme}
                  className="ml-auto w-fit gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-4" />
                  Reset
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Appearance mode</h3>
                <p className="text-xs text-muted-foreground">
                  Choose how Fluxo looks on this device.
                </p>
                <SegmentRadioGroup
                  value={mode}
                  onChange={setMode}
                  options={[
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                    { value: "system", label: "System" },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {needsInitialPassword
                ? "Set Account Password"
                : "Update Password"}
            </DialogTitle>
            <DialogDescription>
              {needsInitialPassword
                ? "Create a password to also sign in with email and password."
                : "Enter your current password and choose a new one."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!needsInitialPassword ? (
              <div className="space-y-2">
                <Label htmlFor="settings-current-password">
                  Current Password
                </Label>
                <Input
                  id="settings-current-password"
                  type="password"
                  value={oldPassword}
                  onChange={(event) => {
                    setOldPassword(event.target.value);
                    setPasswordError(null);
                  }}
                  disabled={isUpdatingPassword}
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="settings-new-password">New Password</Label>
              <Input
                id="settings-new-password"
                type="password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setPasswordError(null);
                }}
                disabled={isUpdatingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-confirm-password">
                Confirm New Password
              </Label>
              <Input
                id="settings-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setPasswordError(null);
                }}
                disabled={isUpdatingPassword}
              />
            </div>
            {passwordError ? (
              <p className="text-sm text-destructive">{passwordError}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(false)}
              disabled={isUpdatingPassword}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdatePassword}
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword
                ? needsInitialPassword
                  ? "Setting..."
                  : "Updating..."
                : needsInitialPassword
                  ? "Set Password"
                  : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isEmailDialogOpen}
        onOpenChange={(open) => {
          setIsEmailDialogOpen(open);
          if (!open) {
            setEmailChangeStep("request");
            setEmailError(null);
            setEmailOtp("");
            setNewEmail("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email</DialogTitle>
            <DialogDescription>
              {emailChangeStep === "request"
                ? "Enter a new email. We will send an OTP for verification."
                : "Enter the OTP sent to your new email to confirm this change."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-new-email">New Email</Label>
              <Input
                id="settings-new-email"
                type="email"
                value={newEmail}
                onChange={(event) => {
                  setNewEmail(event.target.value);
                  setEmailError(null);
                }}
                disabled={
                  isSubmittingEmailChange || emailChangeStep === "verify"
                }
              />
            </div>
            {emailChangeStep === "verify" ? (
              <div className="space-y-2">
                <Label htmlFor="settings-email-otp">OTP</Label>
                <Input
                  id="settings-email-otp"
                  value={emailOtp}
                  onChange={(event) => {
                    setEmailOtp(event.target.value);
                    setEmailError(null);
                  }}
                  placeholder="Enter 6-digit OTP"
                  disabled={isSubmittingEmailChange}
                />
              </div>
            ) : null}
            {emailError ? (
              <p className="text-sm text-destructive">{emailError}</p>
            ) : null}
          </div>
          <DialogFooter>
            {emailChangeStep === "verify" ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEmailChangeStep("request");
                  setEmailOtp("");
                  setEmailError(null);
                }}
                disabled={isSubmittingEmailChange}
              >
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEmailDialogOpen(false)}
                disabled={isSubmittingEmailChange}
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              onClick={
                emailChangeStep === "request"
                  ? handleRequestEmailChange
                  : handleVerifyEmailChange
              }
              disabled={isSubmittingEmailChange}
            >
              {isSubmittingEmailChange
                ? emailChangeStep === "request"
                  ? "Sending..."
                  : "Verifying..."
                : emailChangeStep === "request"
                  ? "Send OTP"
                  : "Verify & Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingPage;
