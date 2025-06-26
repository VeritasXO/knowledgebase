import { Badge } from "../badge";

export function BadgeSwitch({ enabled }: { enabled: boolean }) {
  return (
    <Badge variant={enabled ? "green" : "red"}>
      {enabled ? "Enabled" : "Disabled"}
    </Badge>
  );
}
