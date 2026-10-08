import { apiRoutes } from '../../shared/api/api-routes';
import { api } from '../../shared/api/client';
import type { DashboardFiltersResponse, DashboardOverview } from '../../shared/api/types';

export const dashboardService = {
  async filters() {
    const { data } = await api.get<DashboardFiltersResponse>(apiRoutes.dashboards.filters);
    return data;
  },

  async overview(year: number) {
    const { data } = await api.get<DashboardOverview>(apiRoutes.dashboards.overview, {
      params: { year },
    });
    return data;
  },
};
