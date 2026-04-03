"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlatformIcon } from "@/components/platform-icon";
import { usePlatforms, PlatformInfo } from "@/hooks/use-platforms";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function ConnectDialog({
  platform,
  open,
  onOpenChange,
  onConnected,
}: {
  platform: PlatformInfo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState(false);

  async function handleConnect() {
    setConnecting(true);
    try {
      const res = await fetch(`/api/platforms/${platform.id}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Connection failed");
        return;
      }

      toast.success(
        `Connected to ${platform.name}${data.username ? ` as ${data.username}` : ""}`
      );
      onOpenChange(false);
      setValues({});
      onConnected();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlatformIcon platform={platform.id} className="h-5 w-5" />
            Connect {platform.name}
          </DialogTitle>
          <DialogDescription>
            Enter your credentials to connect. They are encrypted and stored
            locally.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {platform.credentialFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type={field.type}
                placeholder={field.placeholder}
                value={values[field.key] || ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.key]: e.target.value }))
                }
              />
              {field.helpText && (
                <p className="text-xs text-muted-foreground">
                  {field.helpText}
                  {field.helpUrl && (
                    <>
                      {" "}
                      <a
                        href={field.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-foreground"
                      >
                        Open
                      </a>
                    </>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={connecting}
          >
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={connecting}>
            {connecting ? "Connecting..." : "Connect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PlatformCard({
  platform,
  onRefresh,
}: {
  platform: PlatformInfo;
  onRefresh: () => void;
}) {
  const [connectOpen, setConnectOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  async function handleVerify() {
    setVerifying(true);
    try {
      const res = await fetch(`/api/platforms/${platform.id}/verify`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          `${platform.name}: verified${data.username ? ` as ${data.username}` : ""}`
        );
      } else {
        toast.error(`${platform.name}: ${data.error || "verification failed"}`);
      }
      onRefresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setVerifying(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await fetch(`/api/platforms/${platform.id}/disconnect`, {
        method: "POST",
      });
      toast.success(`Disconnected from ${platform.name}`);
      onRefresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDisconnecting(false);
    }
  }

  const isManual = platform.authType === "manual";

  return (
    <>
      <Card
        className={cn(
          "transition-colors",
          platform.isConnected && "border-emerald-500/30"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <PlatformIcon platform={platform.id} className="h-5 w-5" />
              {platform.name}
            </CardTitle>
            {platform.isConnected ? (
              <Badge
                variant="outline"
                className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
              >
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Not connected
              </Badge>
            )}
          </div>
          {isManual && (
            <CardDescription>
              No API available. Text will be copied to clipboard and the platform
              will open in your browser.
            </CardDescription>
          )}
          {platform.maxLength && (
            <CardDescription>
              {platform.maxLength.toLocaleString()} character limit
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {isManual ? (
              <Button
                size="sm"
                variant={platform.isConnected ? "outline" : "default"}
                onClick={async () => {
                  const res = await fetch(
                    `/api/platforms/${platform.id}/connect`,
                    { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}"}
                  );
                  if (res.ok) {
                    toast.success(`${platform.name} enabled`);
                    onRefresh();
                  }
                }}
                disabled={platform.isConnected}
              >
                {platform.isConnected ? "Enabled" : "Enable"}
              </Button>
            ) : platform.isConnected ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleVerify}
                  disabled={verifying}
                >
                  {verifying ? "Verifying..." : "Verify"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConnectOpen(true)}
                >
                  Reconnect
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setConnectOpen(true)}>
                Connect
              </Button>
            )}
            {platform.isConnected && (
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                Disconnect
              </Button>
            )}
          </div>
          {platform.lastVerifiedAt && (
            <p className="mt-2 text-xs text-muted-foreground">
              Last verified:{" "}
              {new Date(platform.lastVerifiedAt).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
      {!isManual && (
        <ConnectDialog
          platform={platform}
          open={connectOpen}
          onOpenChange={setConnectOpen}
          onConnected={onRefresh}
        />
      )}
    </>
  );
}

export default function SettingsPage() {
  const { platforms, loading, refresh } = usePlatforms();

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <p className="text-muted-foreground">Loading platforms...</p>
      </div>
    );
  }

  const connectedCount = platforms.filter((p) => p.isConnected).length;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platforms</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {connectedCount} of {platforms.length} platforms connected.
            Credentials are encrypted and stored locally.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {platforms.map((p) => (
            <PlatformCard key={p.id} platform={p} onRefresh={refresh} />
          ))}
        </div>
      </div>
    </div>
  );
}
