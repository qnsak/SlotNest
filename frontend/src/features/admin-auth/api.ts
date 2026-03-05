import { apiRequest } from "../../shared/api/client";

export type AdminLoginPayload = {
  username: string;
  password: string;
};

export async function adminLogin(payload: AdminLoginPayload): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>("/admin/login", {
    method: "POST",
    body: payload,
    credentials: "include",
  });
}

export async function adminLogout(): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>("/admin/logout", {
    method: "POST",
    credentials: "include",
  });
}

export async function checkAdminSession(): Promise<{ ok: boolean }> {
  const today = new Date().toISOString().slice(0, 10);
  await apiRequest<unknown[]>(`/admin/intervals?from=${today}&to=${today}`, {
    method: "GET",
    credentials: "include",
  });
  return { ok: true };
}
