import { useEffect, useState } from "react";
import { Lock, LogOut, ShieldCheck, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";

import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";


const Settings = () => {
    const navigate = useNavigate();
    const { logout, clearSession } = useAuth();


    const [profile, setProfile] = useState({
        name: "",
        email: "",
    });


    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");


    const [password, setPassword] = useState({
        newPassword: "",
        confirmPassword: "",
    });


    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState("");


    const [logoutAllOpen, setLogoutAllOpen] = useState(false);
    const [logoutAllLoading, setLogoutAllLoading] = useState(false);
    const [logoutAllError, setLogoutAllError] = useState("");


    useEffect(() => {
        const loadProfile = async () => {
            try {
                setProfileLoading(true);
                setProfileError("");

                const data = await authService.getProfile();

                setProfile({
                    name: data.name || "",
                    email: data.email || "",
                });
            } catch (error) {
                setProfileError(
                    error.response?.data?.message ||
                    "Failed to load profile."
                );
            } finally {
                setProfileLoading(false);
            }
        };


        loadProfile();
    }, []);


    const handleProfileChange = (event) => {
        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const handleProfileSubmit = async (event) => {
        event.preventDefault();

        setProfileError("");
        setProfileSuccess("");


        if (!profile.name.trim()) {
            setProfileError("Name cannot be empty.");
            return;
        }


        if (!profile.email.trim()) {
            setProfileError("Email cannot be empty.");
            return;
        }


        try {
            setProfileSaving(true);

            const data = await authService.updateProfile({
                name: profile.name.trim(),
                email: profile.email.trim(),
            });


            setProfile({
                name: data.user.name,
                email: data.user.email,
            });


            setProfileSuccess("Profile updated successfully.");
        } catch (error) {
            setProfileError(
                error.response?.data?.message ||
                "Failed to update profile."
            );
        } finally {
            setProfileSaving(false);
        }
    };


    const handlePasswordChange = (event) => {
        const { name, value } = event.target;

        setPassword((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const handlePasswordSubmit = async (event) => {
        event.preventDefault();

        setPasswordError("");


        if (!password.newPassword) {
            setPasswordError("Please enter a new password.");
            return;
        }


        if (password.newPassword.length < 8) {
            setPasswordError(
                "Password must be at least 8 characters long."
            );
            return;
        }


        if (!/[A-Z]/.test(password.newPassword)) {
            setPasswordError(
                "Password must contain at least one uppercase letter."
            );
            return;
        }


        if (!/[a-z]/.test(password.newPassword)) {
            setPasswordError(
                "Password must contain at least one lowercase letter."
            );
            return;
        }


        if (!/[0-9]/.test(password.newPassword)) {
            setPasswordError(
                "Password must contain at least one number."
            );
            return;
        }


        if (!/[^A-Za-z0-9\s]/.test(password.newPassword)) {
            setPasswordError(
                "Password must contain at least one special character."
            );
            return;
        }


        if (password.newPassword !== password.confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }


        try {
            setPasswordSaving(true);

            await authService.updateProfile({
                password: password.newPassword,
            });


            // Password changes invalidate all backend sessions.
            // Clear the current frontend session and redirect to login.
            clearSession();

            navigate("/login", { replace: true });
        } catch (error) {
            setPasswordError(
                error.response?.data?.message ||
                "Failed to update password."
            );
        } finally {
            setPasswordSaving(false);
        }
    };


    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };


    const handleLogoutAll = async () => {
        try {
            setLogoutAllLoading(true);
            setLogoutAllError("");

            await authService.logoutAll();

            // logout-all already invalidates all backend sessions.
            // Only clear the frontend session here.
            clearSession();

            setLogoutAllOpen(false);

            navigate("/login", { replace: true });
        } catch (error) {
            setLogoutAllError(
                error.response?.data?.message ||
                "Failed to log out from all devices."
            );
        } finally {
            setLogoutAllLoading(false);
        }
    };


    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-medium text-slate-400">
                    Workspace / Settings
                </p>

                <h1 className="mt-1 text-2xl font-semibold text-white">
                    Settings
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                    Manage your profile and account security.
                </p>
            </div>


            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <Card
                    title="Profile"
                    description="Update your personal account information."
                >
                    {profileLoading ? (
                        <div className="py-8 text-center text-sm text-slate-400">
                            Loading profile...
                        </div>
                    ) : (
                        <form
                            onSubmit={handleProfileSubmit}
                            className="space-y-5"
                        >
                            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                                    <User
                                        size={18}
                                        className="text-slate-300"
                                    />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-white">
                                        Account Profile
                                    </p>

                                    <p className="text-xs text-slate-400">
                                        Keep your information up to date.
                                    </p>
                                </div>
                            </div>


                            <Input
                                label="Name"
                                name="name"
                                value={profile.name}
                                onChange={handleProfileChange}
                                placeholder="Enter your name"
                            />


                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                                placeholder="Enter your email"
                            />


                            {profileError && (
                                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                                    <p className="text-xs leading-5 text-red-400">
                                        {profileError}
                                    </p>
                                </div>
                            )}


                            {profileSuccess && (
                                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5">
                                    <p className="text-xs leading-5 text-emerald-400">
                                        {profileSuccess}
                                    </p>
                                </div>
                            )}


                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={profileSaving}
                                >
                                    {profileSaving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>


                <Card
                    title="Security"
                    description="Manage your account password."
                >
                    <form
                        onSubmit={handlePasswordSubmit}
                        className="space-y-5"
                    >
                        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                                <Lock
                                    size={18}
                                    className="text-slate-300"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-white">
                                    Change Password
                                </p>

                                <p className="text-xs text-slate-400">
                                    Use a strong password for your account.
                                </p>
                            </div>
                        </div>


                        <Input
                            label="New Password"
                            type="password"
                            name="newPassword"
                            value={password.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter new password"
                        />


                        <Input
                            label="Confirm New Password"
                            type="password"
                            name="confirmPassword"
                            value={password.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="Confirm new password"
                        />


                        <p className="text-xs leading-5 text-slate-500">
                            Password must contain at least 8 characters,
                            including uppercase, lowercase, number, and
                            special character.
                        </p>


                        {passwordError && (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                                <p className="text-xs leading-5 text-red-400">
                                    {passwordError}
                                </p>
                            </div>
                        )}


                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={passwordSaving}
                            >
                                {passwordSaving
                                    ? "Updating..."
                                    : "Update Password"}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>


            <Card
                title="Account Security"
                description="Manage active authentication sessions."
            >
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                        <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800">
                                <ShieldCheck
                                    size={18}
                                    className="text-slate-300"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-white">
                                    Current Session
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    Sign out from the device you are currently
                                    using.
                                </p>
                            </div>
                        </div>


                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleLogout}
                        >
                            <LogOut size={15} />
                            Log Out
                        </Button>
                    </div>


                    <div className="flex items-start justify-between gap-4 rounded-xl border border-red-500/10 bg-red-500/5 p-4">
                        <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                                <LogOut
                                    size={18}
                                    className="text-red-400"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-white">
                                    Log Out All Devices
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    Sign out from all active sessions on your
                                    account.
                                </p>
                            </div>
                        </div>


                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                                setLogoutAllError("");
                                setLogoutAllOpen(true);
                            }}
                        >
                            Log Out All
                        </Button>
                    </div>
                </div>
            </Card>


            <Modal
                isOpen={logoutAllOpen}
                onClose={() => {
                    if (!logoutAllLoading) {
                        setLogoutAllOpen(false);
                    }
                }}
                title="Log Out All Devices"
            >
                <div className="space-y-5">
                    <p className="text-sm leading-6 text-slate-400">
                        This will sign you out from all active sessions,
                        including this device. You will need to log in again.
                    </p>


                    {logoutAllError && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                            <p className="text-xs leading-5 text-red-400">
                                {logoutAllError}
                            </p>
                        </div>
                    )}


                    <div className="flex justify-end gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setLogoutAllOpen(false)}
                            disabled={logoutAllLoading}
                        >
                            Cancel
                        </Button>


                        <Button
                            variant="danger"
                            onClick={handleLogoutAll}
                            disabled={logoutAllLoading}
                        >
                            {logoutAllLoading
                                ? "Logging Out..."
                                : "Log Out All Devices"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};


export default Settings;

