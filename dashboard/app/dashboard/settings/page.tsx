import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardData } from "@/lib/data";

export default async function SettingsPage() {
  const data = await getDashboardData();

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardDescription>Connected organization</CardDescription>
          <CardTitle>{data.installation.org_login}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-3">
            <img src={data.installation.org_avatar_url} alt={data.installation.org_login} className="size-14 rounded-2xl object-cover" />
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <Badge className="mt-2">{data.installation.plan}</Badge>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.2rem] bg-muted/55 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Usage this month</p>
              <p className="mt-2 text-2xl font-semibold">$1,842.33</p>
            </div>
            <div className="rounded-[1.2rem] bg-muted/55 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Billing</p>
              <p className="mt-2 text-2xl font-semibold capitalize">{data.installation.plan}</p>
            </div>
          </div>
          <Button>Upgrade to Pro</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Danger zone</CardDescription>
          <CardTitle>Disconnect GitHub App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This removes webhook ingestion and stops future cost analysis for the connected organization.
          </p>
          <Button variant="destructive">Disconnect GitHub App</Button>
        </CardContent>
      </Card>
    </div>
  );
}
