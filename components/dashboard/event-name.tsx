import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useDashboardStore from "@/store/dashboard-store";
import { Users } from "lucide-react";
import AvatarCircles from "../ui/avatar-circles";

export default function EventName() {
  const [members, groupName] = useDashboardStore((group) => [
    group.members,
    group.name,
  ]);

  return (
    <Card className="h-min">
      <CardHeader>
        <div className="flex items-center justify-between space-y-0">
          <CardTitle className="max-w-40 truncate lg:w-full">
            {groupName}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Splitting with</CardDescription>
      </CardHeader>
      <CardContent>
        <AvatarCircles members={members} />
      </CardContent>
    </Card>
  );
}
