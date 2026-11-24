import { SignInButton } from "@/components/InternetIdentity";
import { ErrorState, PageHeader } from "@/components/layout/PageParts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useIsAdmin,
  useSaveTelegramSettings,
  useTelegramSettings,
  useTestTelegramSettings,
} from "@/hooks/useQueries";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Lock, Send, ShieldAlert, XCircle } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

const STEPS = [
  {
    title: "Creează botul",
    body: "Deschide Telegram, scrie @BotFather și trimite comanda /newbot. Alege un nume și un username pentru bot.",
  },
  {
    title: "Copiază tokenul",
    body: "BotFather îți răspunde cu un token de forma 123456789:AAH... Acesta este tokenul botului.",
  },
  {
    title: "Găsește chat ID-ul",
    body: "Adaugă botul într-un grup sau scrie-i un mesaj, apoi deschide api.telegram.org/bot<TOKEN>/getUpdates și caută valoarea „chat”:{„id”:...}.",
  },
  {
    title: "Salvează și testează",
    body: "Lipește tokenul și chat ID-ul mai jos, salvează, apoi trimite un mesaj de test ca să confirmi că totul funcționează.",
  },
];

function AccessDenied() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <div
        data-ocid="settings.access_denied_state"
        className="rounded-2xl border border-border bg-card p-8 text-center shadow-card"
      >
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-secondary text-primary">
          <ShieldAlert className="size-7" aria-hidden="true" />
        </span>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Nu ai acces la această pagină
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Setările de notificări sunt disponibile doar pentru administratorul
          magazinului. Dacă ai nevoie de acces, contactează administratorul.
        </p>
        <Link
          to="/"
          data-ocid="settings.home_link"
          className="mt-6 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Întoarce-te la magazine
        </Link>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div
      data-ocid="settings.loading_state"
      className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card"
    >
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-40 rounded-full" />
    </div>
  );
}

export default function AdminSettingsPage() {
  const { identity, isInitializing } = useInternetIdentity();
  const signedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  if (isInitializing) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-14">
        <SettingsSkeleton />
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-14">
        <div
          data-ocid="settings.signin_state"
          className="rounded-2xl border border-border bg-card p-8 text-center shadow-card"
        >
          <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-secondary text-primary">
            <Lock className="size-7" aria-hidden="true" />
          </span>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Autentifică-te ca administrator
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Pagina de setări este rezervată administratorului. Autentifică-te cu
            Internet Identity pentru a continua.
          </p>
          <div className="mt-6 flex justify-center">
            <SignInButton className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60" />
          </div>
        </div>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-14">
        <SettingsSkeleton />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return <AdminSettingsContent />;
}

function AdminSettingsContent() {
  const { data: settings, isLoading, isError, refetch } = useTelegramSettings();
  const saveSettings = useSaveTelegramSettings();
  const testSettings = useTestTelegramSettings();

  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (settings && !initialized) {
      setBotToken(settings.botToken);
      setChatId(settings.chatId);
      setInitialized(true);
    }
  }, [settings, initialized]);

  const trimmedToken = botToken.trim();
  const trimmedChat = chatId.trim();
  const canSave = trimmedToken.length > 0 && trimmedChat.length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;
    saveSettings.mutate({ botToken: trimmedToken, chatId: trimmedChat });
  };

  const saveError = saveSettings.isError
    ? saveSettings.error.message || "Salvarea a eșuat. Încearcă din nou."
    : null;
  const testResult = testSettings.data;
  const testError = testSettings.isError
    ? testSettings.error.message || "Testul nu a putut fi trimis."
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <PageHeader
        eyebrow="Setări administrator"
        title="Notificări Telegram"
        description="Configurează botul care primește comenzile clienților."
        actions={
          settings && (
            <Badge
              data-ocid="settings.status_badge"
              variant={settings.configured ? "default" : "secondary"}
              className="rounded-full px-3 py-1"
            >
              {settings.configured ? (
                <CheckCircle2 aria-hidden="true" />
              ) : (
                <XCircle aria-hidden="true" />
              )}
              {settings.configured ? "Configurat" : "Neconfigurat"}
            </Badge>
          )
        }
      />

      {isError ? (
        <div className="mt-8">
          <ErrorState
            title="Setările nu au putut fi încărcate"
            description="Verifică conexiunea și încearcă din nou."
            onRetry={() => void refetch()}
          />
        </div>
      ) : isLoading ? (
        <SettingsSkeleton />
      ) : (
        <div className="mt-8 space-y-6">
          <form
            onSubmit={handleSubmit}
            data-ocid="settings.form"
            className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8"
          >
            <h2 className="font-display text-lg font-semibold text-foreground">
              Datele botului
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Comenzile vor fi trimise în chatul indicat mai jos.
            </p>

            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="bot-token">Token bot</Label>
                <Input
                  id="bot-token"
                  data-ocid="settings.bot_token_input"
                  value={botToken}
                  onChange={(event) => setBotToken(event.target.value)}
                  placeholder="123456789:AAH..."
                  autoComplete="off"
                  spellCheck={false}
                  className="h-11 rounded-lg font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chat-id">Chat ID</Label>
                <Input
                  id="chat-id"
                  data-ocid="settings.chat_id_input"
                  value={chatId}
                  onChange={(event) => setChatId(event.target.value)}
                  placeholder="-1001234567890"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-11 rounded-lg font-mono text-sm"
                />
              </div>
            </div>

            {saveError && (
              <p
                role="alert"
                data-ocid="settings.save_error_state"
                className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {saveError}
              </p>
            )}

            {saveSettings.isSuccess && !saveError && (
              <p
                data-ocid="settings.save_success_state"
                className="mt-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-foreground"
              >
                <CheckCircle2
                  className="size-4 text-success"
                  aria-hidden="true"
                />
                Setările au fost salvate.
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                data-ocid="settings.save_button"
                disabled={!canSave || saveSettings.isPending}
                className="h-10 rounded-full px-6"
              >
                {saveSettings.isPending ? "Se salvează…" : "Salvează setările"}
              </Button>
              <Button
                type="button"
                variant="outline"
                data-ocid="settings.test_button"
                onClick={() => testSettings.mutate()}
                disabled={testSettings.isPending}
                className="h-10 rounded-full px-6"
              >
                <Send aria-hidden="true" />
                {testSettings.isPending
                  ? "Se trimite…"
                  : "Trimite mesaj de test"}
              </Button>
            </div>

            {testResult && (
              <div
                data-ocid={
                  testResult.__kind__ === "ok"
                    ? "settings.test_success_state"
                    : "settings.test_error_state"
                }
                className={
                  testResult.__kind__ === "ok"
                    ? "mt-4 flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-foreground"
                    : "mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                }
              >
                {testResult.__kind__ === "ok" ? (
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-success"
                    aria-hidden="true"
                  />
                ) : (
                  <XCircle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span className="min-w-0 break-words">
                  {testResult.__kind__ === "ok"
                    ? "Mesajul de test a fost trimis cu succes."
                    : testResult.err}
                </span>
              </div>
            )}

            {testError && (
              <p
                role="alert"
                data-ocid="settings.test_error_state"
                className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {testError}
              </p>
            )}
          </form>

          <section
            data-ocid="settings.instructions_section"
            className="rounded-2xl border border-border bg-secondary/40 p-6 md:p-8"
          >
            <h2 className="font-display text-lg font-semibold text-foreground">
              Cum creezi botul și găsești chat ID-ul
            </h2>
            <ol className="mt-5 space-y-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </div>
  );
}
