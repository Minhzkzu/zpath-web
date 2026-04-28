'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { getCurrentUserProfile } from "@/lib/profile";
import type { UserProfile } from "@/lib/types";

export const useUserProfile = (options?: { requireAuth?: boolean }) => {
  const router = useRouter();
  const requireAuth = options?.requireAuth ?? true;

  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { user, profile } = await getCurrentUserProfile();

      if (!user) {
        if (requireAuth) {
          router.push("/login");
        }

        setGoogleUser(null);
        setUserProfile(null);
        return;
      }

      setGoogleUser(user);
      setUserProfile(profile);
    } catch (error) {
      console.error("Khong the tai ho so nguoi dung:", error);
      setErrorMessage("Khong the tai ho so cua ban luc nay.");
    } finally {
      setIsLoading(false);
    }
  }, [requireAuth, router]);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setErrorMessage(null);

    getCurrentUserProfile()
      .then(({ user, profile }) => {
        if (!isActive) {
          return;
        }

        if (!user) {
          if (requireAuth) {
            router.push("/login");
          }

          setGoogleUser(null);
          setUserProfile(null);
          return;
        }

        setGoogleUser(user);
        setUserProfile(profile);
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }

        console.error("Khong the tai ho so nguoi dung:", error);
        setErrorMessage("Khong the tai ho so cua ban luc nay.");
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [requireAuth, router]);

  return {
    googleUser,
    userProfile,
    isLoading,
    errorMessage,
    reloadProfile: loadProfile,
  };
};
