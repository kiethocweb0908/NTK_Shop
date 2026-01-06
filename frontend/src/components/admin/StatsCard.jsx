import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StatsCard({ icon: Icon, cd, title, value }) {
  return (
    <Card className={`border-gray-200`}>
      <CardHeader>
        <CardTitle className="text-muted-foreground font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-black flex items-center">
          <Icon className={`h-5 w-5 mr-2 ${cd}`} /> {value}
        </p>
      </CardContent>
    </Card>
  );
}
