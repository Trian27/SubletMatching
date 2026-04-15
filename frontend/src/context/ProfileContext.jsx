import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getMyProfile, saveMyProfile } from "../api/profilesApi";
import { useAuth } from "./AuthContext";

const DEFAULT_PROFILE = {
  full_name: "",
  rutgers_affiliation: "",
  preferred_contact_method: "email",
  phone: "",
  is_renter: true,
  is_host: false,
  is_admin: false,
  email: "",
};

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { session, user, isConfigured } = useAuth();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!user || !isConfigured) {
        setProfile({
          ...DEFAULT_PROFILE,
          email: user?.email || "",
        });
        setErrorMessage("");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getMyProfile({ accessToken: session?.access_token });
        if (!isMounted) return;
        setProfile({
          ...DEFAULT_PROFILE,
          ...data,
          email: data.email || user.email || "",
        });
      } catch (error) {
        if (!isMounted) return;
        if (error.status === 404) {
          setProfile({
            ...DEFAULT_PROFILE,
            email: user.email || "",
          });
        } else {
          setErrorMessage(error.message || "Could not load profile.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [isConfigured, session?.access_token, user]);

  const updateProfile = useCallback(async (nextProfile) => {
    const saved = await saveMyProfile(nextProfile, {
      accessToken: session?.access_token,
    });
    setProfile({
      ...DEFAULT_PROFILE,
      ...saved,
      email: saved.email || user?.email || "",
    });
    return saved;
  }, [session?.access_token, user?.email]);

  const value = useMemo(
    () => ({
      profile,
      isLoading,
      errorMessage,
      updateProfile,
      hasCompletedProfile:
        Boolean(profile.full_name?.trim()) &&
        Boolean(profile.rutgers_affiliation?.trim()),
    }),
    [errorMessage, isLoading, profile, updateProfile]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}
