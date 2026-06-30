"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface RegisterFormState {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface FieldError {
  name?: string;
  email?: string;
  password?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});

  const [form, setForm] = useState<RegisterFormState>({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

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
  }

  function validate(): boolean {
    const errors: FieldError = {};

    if (!form.name.trim()) {
      errors.name = "Name is required.";
    }

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

  async function sendVerificationEmail(email: string) {
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email , purpose: "verify_mail",}),
    });

    return response.ok;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      setServerError("");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data?.error || "Something went wrong. Please try again.");
        return;
      }

      await sendVerificationEmail(form.email);

      router.push("/");

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
      <h1 className="text-3xl font-bold mb-6">Register</h1>

      {serverError && (
        <p
          role="alert"
          className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3"
        >
          {serverError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name <span aria-hidden="true">*</span>
          </label>

          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`w-full border rounded p-3 ${fieldErrors.name ? "border-red-500" : ""
              }`}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            required
          />

          {fieldErrors.name && (
            <p id="name-error" className="mt-1 text-xs text-red-600">
              {fieldErrors.name}
            </p>
          )}
        </div>

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
            className={`w-full border rounded p-3 ${fieldErrors.email ? "border-red-500" : ""
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
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone <span className="text-gray-400 font-normal">(optional)</span>
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded p-3"
          />
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
              className={`w-full border rounded p-3 pr-16 ${fieldErrors.password ? "border-red-500" : ""
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
          className="w-full bg-black text-white py-3 rounded disabled:bg-gray-400 transition-colors"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-5 text-center">
        Already have an account?{" "}
        <Link href="/login" className="font-medium underline">
          Login
        </Link>
      </p>
    </main>
  );
}