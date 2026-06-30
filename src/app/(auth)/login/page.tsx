"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface LoginFormState {
  email: string;
  password: string;
}

interface FieldError {
  email?: string;
  password?: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const verified = searchParams.get("verified");
  const registered = searchParams.get("registered");
  const emailFromUrl = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldError>({});

  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (emailFromUrl) {
      setForm((prev) => ({
        ...prev,
        email: emailFromUrl,
      }));
    }
  }, [emailFromUrl]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    setServerError("");
    setSuccessMessage("");
  }

  function validate(): boolean {
    const errors: FieldError = {};

    if (!form.email.trim()) {
      errors.email = "Email is required.";
    }

    if (!form.password) {
      errors.password = "Password is required.";
    } else if (form.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleResendVerification() {
    if (!form.email.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "Email is required.",
      }));
      return;
    }

    try {
      setResendingOtp(true);
      setServerError("");
      setSuccessMessage("");

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email, purpose: "verify_mail",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data?.error || "Failed to send verification email.");
        return;
      }

      setSuccessMessage("Verification email sent. Please check your inbox.");
    } catch (error) {
      console.error(error);
      setServerError("Network error. Please try again.");
    } finally {
      setResendingOtp(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      setServerError("");
      setSuccessMessage("");
      setNeedsVerification(false);

      const response = await fetch("/api/auth/login", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data?.error || "Invalid credentials. Please try again.";

        setServerError(errorMessage);

        if (
          response.status === 403 &&
          errorMessage.toLowerCase().includes("verify")
        ) {
          setNeedsVerification(true);
        }

        return;
      }

      if (data.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      setServerError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Login</h1>

      {verified === "success" && (
        <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
          Email verified successfully. You can login now.
        </p>
      )}

      {verified === "failed" && (
        <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          Verification link expired or invalid.
        </p>
      )}

      {verified === "error" && (
        <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          Something went wrong during verification.
        </p>
      )}

      {registered === "success" && (
        <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
          Account created successfully. We sent a verification email. Please
          verify your email before login.
        </p>
      )}

      {registered === "otp_failed" && (
        <p className="mb-4 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3">
          Account created, but verification email was not sent. Click resend
          verification below.
        </p>
      )}

      {successMessage && (
        <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
          {successMessage}
        </p>
      )}

      {serverError && (
        <p
          role="alert"
          className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3"
        >
          {serverError}
        </p>
      )}

      {needsVerification && (
        <div className="mb-4 border border-yellow-200 bg-yellow-50 rounded p-3">
          <p className="text-sm text-yellow-800 mb-3">
            Your email is not verified. Please verify your email before login.
          </p>

          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendingOtp}
            className="text-sm bg-black text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {resendingOtp ? "Sending..." : "Resend Verification Email"}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email <span aria-hidden="true">*</span>
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={`w-full border rounded p-3 ${
              fieldErrors.email ? "border-red-500" : ""
            }`}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            required
          />

          {fieldErrors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-600">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password <span aria-hidden="true">*</span>
          </label>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className={`w-full border rounded p-3 pr-16 ${
                fieldErrors.password ? "border-red-500" : ""
              }`}
              aria-describedby={
                fieldErrors.password ? "password-error" : undefined
              }
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-800"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {fieldErrors.password && (
            <p id="password-error" className="mt-1 text-xs text-red-600">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer bg-black text-white py-3 rounded disabled:bg-gray-400 transition-colors"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-5 text-center">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium underline">
          Register
        </Link>
      </p>
       
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="max-w-md mx-auto px-4 py-10">Loading...</main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}