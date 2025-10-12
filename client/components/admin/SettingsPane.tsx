import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { HomeToggles } from "@shared/entities";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function useAuthedFetch(token: string | null) {
  return async (url: string, init?: RequestInit) => {
    const res = await fetch(url, { ...(init||{}), headers: { "Content-Type":"application/json", Authorization: token ? `Bearer ${token}` : "" , ...(init?.headers||{}) } });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  };
}

export default function SettingsPane({ token }: { token: string | null }) {
  const afetch = useAuthedFetch(token);
  const [toggles, setToggles] = useState<HomeToggles>({ showNewsletter:true, showPremium:true, showPromo:true });
  
  // Profile management state
  const [profile, setProfile] = useState({ name: "", email: "", username: "" });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    afetch("/api/admin/toggles").then(setToggles).catch(()=>{}); 
    afetch("/api/admin/profile").then(setProfile).catch(()=>{});
  }, []);

  const saveToggles = async () => {
    try {
      setLoading(true);
      const resp = await afetch("/api/admin/toggles", { method:"PUT", body: JSON.stringify(toggles) });
      setToggles(resp);
      toast.success("Settings saved successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const resp = await afetch("/api/admin/profile", { 
        method: "PUT", 
        body: JSON.stringify({ name: profile.name, email: profile.email, username: profile.username }) 
      });
      setProfile(resp);
      toast.success("Profile updated successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      await afetch("/api/admin/password", { 
        method: "PUT", 
        body: JSON.stringify({ currentPassword, newPassword }) 
      });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your admin profile and site settings</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="site">Site Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your admin account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={profile.name} 
                  onChange={(e)=>setProfile({...profile, name: e.target.value})}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={profile.username} 
                  onChange={(e)=>setProfile({...profile, username: e.target.value})}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profile.email} 
                  onChange={(e)=>setProfile({...profile, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <Button onClick={updateProfile} disabled={loading}>
                {loading ? "Saving..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e)=>setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  value={newPassword} 
                  onChange={(e)=>setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e)=>setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button onClick={changePassword} disabled={loading}>
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Toggles</CardTitle>
              <CardDescription>Control visibility of site features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Newsletter Section</Label>
                  <p className="text-sm text-muted-foreground">Show newsletter signup on homepage</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={toggles.showNewsletter} 
                  onChange={(e)=>setToggles({...toggles, showNewsletter:e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Premium Section</Label>
                  <p className="text-sm text-muted-foreground">Display premium products section</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={toggles.showPremium} 
                  onChange={(e)=>setToggles({...toggles, showPremium:e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Promo Banner</Label>
                  <p className="text-sm text-muted-foreground">Show promotional banner</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={toggles.showPromo} 
                  onChange={(e)=>setToggles({...toggles, showPromo:e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
              <Button onClick={saveToggles} disabled={loading}>
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
