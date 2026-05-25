import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, TrendingUp } from "lucide-react";

import { createPassbookApi } from "@rs/sdk";

import { AppHeader } from "../../components/app-header";
import { getToken } from "../../lib/storage";

export const Route = createFileRoute("/app/passbook")({
  component: PassbookPage,
});

const apiUrl = import.meta.env["VITE_API_URL"] ?? "";

function PassbookPage() {
  const token = getToken();
  const passbookApi = createPassbookApi(apiUrl);

  const { data: passbook, isLoading } = useQuery({
    queryKey: ["passbook"],
    queryFn: () => passbookApi.getMine(token),
    enabled: !!token,
  });

  return (
    <div className="bg-surface min-h-screen">
      <AppHeader title="Passbook" />

      <div className="space-y-6 px-6 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Balance Hero Card */}
            <div className="from-primary to-primary-dim text-on-primary flex aspect-4/3 flex-col justify-between rounded-xl bg-linear-to-br p-8 shadow-lg">
              <div>
                <div className="mb-4 flex items-center gap-2 opacity-80">
                  <BookOpen size={16} />
                  <span className="text-xs font-medium">Available Balance</span>
                </div>
                <p className="font-headline text-4xl font-bold tracking-tight">
                  NPR {(passbook?.balance ?? 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs opacity-70">
                  Account: {passbook?.accountNumber ?? "—"}
                </p>
              </div>
            </div>

            {/* Transaction History placeholder */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-headline text-on-surface font-semibold">
                  Transaction History
                </h2>
                <span className="bg-secondary-container text-on-secondary-container rounded-full px-3 py-1 text-xs font-medium">
                  Coming Soon
                </span>
              </div>

              <div className="bg-surface-container-low rounded-xl p-8 text-center">
                <div className="bg-surface-container mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                  <BookOpen size={24} className="text-on-surface-variant" />
                </div>
                <p className="text-on-surface text-sm font-semibold">
                  Passbook features are under development
                </p>
                <p className="text-on-surface-variant mt-2 text-xs leading-relaxed">
                  Transaction history, mini-statements, and digital passbook
                  will be available soon.
                </p>
                <div className="bg-tertiary-container text-on-tertiary-container mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium">
                  <TrendingUp size={12} /> LA-011 Placeholder
                </div>
              </div>
            </section>

            {/* Upcoming features */}
            <section className="space-y-3">
              <h3 className="font-headline text-on-surface-variant text-xs font-semibold tracking-widest uppercase">
                Upcoming Features
              </h3>
              {[
                "Digital passbook with transaction history",
                "Mini statement generation",
                "Interest calculation display",
                "Downloadable account summary",
              ].map((feat) => (
                <div
                  key={feat}
                  className="bg-surface-container-lowest flex items-center gap-3 rounded-xl px-5 py-4 shadow-sm"
                >
                  <div className="bg-primary-container h-2 w-2 shrink-0 rounded-full" />
                  <span className="text-on-surface-variant text-sm">
                    {feat}
                  </span>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
