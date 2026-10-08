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
    list: '/imports',
    employeesPreview: '/imports/employees/preview',
    employee: (id: string) => `/imports/employees/${id}`,
    employeeConfirm: (id: string) => `/imports/employees/${id}/confirm`,
    absenceHoursPreview: '/imports/absence-hours/preview',
    absenceHours: (id: string) => `/imports/absence-hours/${id}`,
    absenceHoursConfirm: (id: string) => `/imports/absence-hours/${id}/confirm`,
    ignoreIssue: (importId: string, issueId: string) => `/imports/${importId}/issues/${issueId}/ignore`,
    cancel: (id: string) => `/imports/${id}/cancel`,
  },
  employees: {
    list: '/employees',
    create: '/employees',
    detail: (id: string) => `/employees/${id}`,
    update: (id: string) => `/employees/${id}`,
    monthlyApuration: (id: string, year: number, month: number) => `/employees/${id}/apurations/${year}/${month}`,
  },
} as const;
