import { useQuery } from '@tanstack/react-query';
import { dashboardService } from './dashboard.service';

export function useDashboardFilters() {
  return useQuery({
    queryKey: ['dashboard-filters'],
    queryFn: dashboardService.filters,
  });
}

export function useDashboardOverview(year?: number) {
  return useQuery({
    queryKey: ['dashboard-overview', year],
    queryFn: () => dashboardService.overview(year!),
    enabled: Boolean(year),
  });
}
