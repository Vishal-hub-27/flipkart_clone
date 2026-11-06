
"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isLoggedIn, loading, logout } = useAuth();

  const router = useRouter();

  // Protect profile page
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [loading, isLoggedIn, router]);

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  // Wait until authentication check completes
  if (loading || !isLoggedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">

        <h1 className="text-2xl font-bold mb-6">
          My Profile
        </h1>

        <div className="space-y-5">

          <div>
            <p className="text-gray-500 text-sm">
              Full Name
            </p>

            <p className="font-semibold text-lg">
              {user?.name}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">
              Email Address
            </p>

            <p className="font-semibold text-lg">
              {user?.email}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">
              Account Status
            </p>

            <p className="text-green-600 font-semibold">
              Active
            </p>
          </div>

        </div>

        <div className="flex gap-4 mt-8">

          <Link
            href="/"
            className="bg-blue-600 text-white px-5 py-2 rounded"
          >
            Back to Home
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-5 py-2 rounded"
          >
            Logout
          </button>

        </div>

      </div>
    </div>
  );
}
