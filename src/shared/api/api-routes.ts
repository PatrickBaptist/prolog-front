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
  imports: {
    employeesPreview: '/imports/employees/preview',
    employee: (id: string) => `/imports/employees/${id}`,
    employeeConfirm: (id: string) => `/imports/employees/${id}/confirm`,
    absenceHoursPreview: '/imports/absence-hours/preview',
    absenceHours: (id: string) => `/imports/absence-hours/${id}`,
    absenceHoursConfirm: (id: string) => `/imports/absence-hours/${id}/confirm`,
    ignoreIssue: (importId: string, issueId: string) => `/imports/${importId}/issues/${issueId}/ignore`,
  },
} as const;
