import dynamic from "next/dynamic";
import { DetailSkeleton } from "./skeletons";

// Heavy interactive pieces load as separate chunks; a skeleton holds their place.
export const LazyOpeningEditor = dynamic(
  () => import("./OpeningEditor").then((m) => m.OpeningEditor),
  { loading: () => <DetailSkeleton /> },
);
export const LazyRoleMatrix = dynamic(() => import("./RoleMatrix").then((m) => m.RoleMatrix), {
  loading: () => <div className="office-skeleton h-[32rem]" aria-busy="true" />,
});
export const LazyAreaChart = dynamic(() => import("./AreaChart").then((m) => m.AreaChart), {
  loading: () => <div className="office-skeleton h-56" aria-busy="true" />,
});
