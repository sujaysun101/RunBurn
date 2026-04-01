import { RecommendationCard } from "@/components/RecommendationCard";
import { getDashboardData } from "@/lib/data";

export default async function RecommendationsPage() {
  const data = await getDashboardData();
  const recommendations = [...data.recommendations].sort(
    (a, b) => b.estimated_monthly_savings_usd - a.estimated_monthly_savings_usd
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Recommendations</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          AI-generated cost cuts, sorted by projected monthly savings.
        </p>
      </div>

      <div className="grid gap-4">
        {recommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} />
        ))}
      </div>
    </div>
  );
}
