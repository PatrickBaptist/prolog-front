export const apiRoutes = {
  auth: {
    login: '/login',
    firstAccessPassword: '/first-access/password',
  },
  dashboards: {
    filters: '/dashboards/filters',
    overview: '/dashboards/overview',
    headcount: '/dashboards/headcount',
    turnover: '/dashboards/turnover',
    bankHours: '/dashboards/bank-hours',
    bankHoursEmployees: '/dashboards/bank-hours/employees',
    absenteeism: '/dashboards/absenteeism',
  },
} as const;
