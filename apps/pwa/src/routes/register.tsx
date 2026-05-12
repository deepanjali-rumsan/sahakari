import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { createAuthApi } from "@rs/sdk";

import { setStorageItem } from "../lib/storage";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

const authApi = createAuthApi(import.meta.env["VITE_API_URL"] ?? "");

function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: {
      phone: "",
      fullName: "",
      cooperative: "",
      passbookNumber: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      if (value.password !== value.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      setError("");
      try {
        const res = await authApi.register({
          phone: value.phone,
          fullName: value.fullName,
          cooperative: value.cooperative,
          passbookNumber: value.passbookNumber,
          password: value.password,
        });
        setStorageItem("token", res.accessToken);
        setStorageItem("user", JSON.stringify(res.user));
        navigate({ to: "/app/dashboard" });
      } catch (err: any) {
        setError(err.message ?? "Registration failed");
      }
    },
  });

  const inputClass =
    "w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/50 focus:ring-2 focus:ring-primary/40 transition placeholder:text-on-surface-variant/50";

  return (
    <div className="bg-surface flex min-h-screen flex-col pb-10">
      {/* Top decorative gradient */}
      <div className="from-primary to-primary-dim h-36 bg-linear-to-br" />

      <div className="-mt-10 flex flex-1 flex-col px-6">
        <div className="bg-surface-container-lowest space-y-6 rounded-xl p-7 shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
          <div>
            <h1 className="font-headline text-on-surface text-2xl font-bold">
              Create Account
            </h1>
            <p className="text-on-surface-variant mt-1 text-sm">
              Register as a cooperative member
            </p>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field name="phone">
              {(field) => (
                <div>
                  <label className="text-on-surface-variant font-headline mb-1.5 block text-sm font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="9779810223471"
                    className={inputClass}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="fullName">
              {(field) => (
                <div>
                  <label className="text-on-surface-variant font-headline mb-1.5 block text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Surpana Surkheti"
                    className={inputClass}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="cooperative">
              {(field) => (
                <div>
                  <label className="text-on-surface-variant font-headline mb-1.5 block text-sm font-medium">
                    Cooperative Name
                  </label>
                  <input
                    type="text"
                    placeholder="Chandragiri Saving & Credit"
                    className={inputClass}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="passbookNumber">
              {(field) => (
                <div>
                  <label className="text-on-surface-variant font-headline mb-1.5 block text-sm font-medium">
                    Passbook Number
                  </label>
                  <input
                    type="text"
                    placeholder="PASS1"
                    className={inputClass}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div>
                  <label className="text-on-surface-variant font-headline mb-1.5 block text-sm font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Min 8 chars: 1 capital, 1 digit, 1 special"
                    className={inputClass}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="confirmPassword">
              {(field) => (
                <div>
                  <label className="text-on-surface-variant font-headline mb-1.5 block text-sm font-medium">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Repeat password"
                    className={inputClass}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-on-primary hover:bg-primary-dim w-full rounded-lg py-3.5 text-sm font-semibold transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating account..." : "Register"}
                </button>
              )}
            </form.Subscribe>
          </form>

          <p className="text-on-surface-variant text-center text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
