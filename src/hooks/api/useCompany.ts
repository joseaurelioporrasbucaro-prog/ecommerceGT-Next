import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ApiFetch } from '@/utils/Api';
import { useAuth } from '@/utils/AuthContext';
import type {
  Company,
  CompanyRow,
  Employee,
  EmployeeRow,
  UpdateCompanyPayload,
  AddEmployeePayload,
} from '@/types/api';
import { COMPANY_TEAM_QUERY_KEY } from './useCompanyTeam';

export const COMPANY_QUERY_KEY = ['company'] as const;
export const EMPLOYEES_QUERY_KEY = ['employees'] as const;

function normalizeCompany(row: CompanyRow): Company {
  return {
    busid: row.busid,
    name: row.bname,
    tradeName: row.btname,
    address: row.baddress ?? '',
    phone: row.bphone ?? '',
    logo: row.blogo || null,
    showEmployees: Boolean(row.showemployees),
  };
}

/**
 * Fase 8 — empresa a la que pertenece el usuario logueado.
 * POST /getcompany (auth). Devuelve 400 si el usuario no pertenece a ninguna
 * empresa; en ese caso la query queda en error y la UI lo trata como "sin empresa".
 */
export function useCompany() {
  const { user } = useAuth();
  return useQuery({
    queryKey: COMPANY_QUERY_KEY,
    queryFn: async () => {
      const res = await ApiFetch.post<{ company: CompanyRow }>('/getcompany', {});
      return normalizeCompany(res.company);
    },
    enabled: !!user,
    retry: false,
    staleTime: 60_000,
  });
}

function normalizeEmployee(row: EmployeeRow): Employee {
  return {
    id: row.cusid,
    firstName: row.firstname,
    lastName: row.lastname,
    email: row.email,
    status: row.status ?? '',
    isAdmin: Boolean(row.isadmin),
    createdAt: row.dcreate ?? null,
  };
}

/**
 * Fase 8 — empleados de una empresa.
 * POST /getemployees { busid }. Solo corre cuando hay busid.
 */
export function useEmployees(busid: number | undefined) {
  return useQuery({
    queryKey: [...EMPLOYEES_QUERY_KEY, busid] as const,
    queryFn: async () => {
      const rows = await ApiFetch.post<EmployeeRow[]>('/getemployees', { busid });
      return rows.map(normalizeEmployee);
    },
    enabled: !!busid,
    staleTime: 60_000,
  });
}

/**
 * Fase 8 — actualizar datos de la empresa. POST /changeinfoc (auth).
 */
export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, UpdateCompanyPayload>({
    mutationFn: (payload) =>
      ApiFetch.post<{ message: string }>('/changeinfoc', payload),
    onSuccess: (data) => {
      toast.success(data.message || 'Empresa actualizada');
      void queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEY });
    },
    onError: (err) => toast.error(err.message || 'No se pudo actualizar la empresa'),
  });
}

/**
 * Fase 8 — agregar un empleado a la empresa (admin). POST /add-employee (auth).
 * El backend valida el límite de usuarios del plan (sub_users).
 */
export function useAddEmployee(busid: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, AddEmployeePayload>({
    mutationFn: (payload) =>
      ApiFetch.post<{ message: string }>('/add-employee', payload),
    onSuccess: (data) => {
      toast.success(data.message || 'Empleado agregado');
      void queryClient.invalidateQueries({ queryKey: [...EMPLOYEES_QUERY_KEY, busid] });
      void queryClient.invalidateQueries({ queryKey: COMPANY_TEAM_QUERY_KEY });
    },
    onError: (err) => toast.error(err.message || 'No se pudo agregar el empleado'),
  });
}

/**
 * Fase 8 — INVITAR a la empresa a un usuario YA existente (sin crear cuenta).
 * POST /invite-existing-user (auth) { cusId }. Crea una invitación pendiente que
 * el usuario debe aceptar/rechazar (desde la notificación o el correo). El
 * backend valida el límite del plan, que no pertenezca a otra empresa y que no
 * haya ya una invitación pendiente.
 */
export function useInviteExistingUser() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (cusId) =>
      ApiFetch.post<{ message: string }>('/invite-existing-user', { cusId }),
    onSuccess: (data) => {
      toast.success(data.message || 'Invitación enviada');
      void queryClient.invalidateQueries({ queryKey: COMPANY_TEAM_QUERY_KEY });
    },
    onError: (err) => toast.error(err.message || 'No se pudo enviar la invitación'),
  });
}
