import { apiRequest } from "../../shared/api/client";

export type CreateLiffSessionPayload = {
  id_token: string | null;
  access_token: string | null;
};

export type LiffSessionResponse = {
  ok: boolean;
};

export function createLiffSession(payload: CreateLiffSessionPayload): Promise<LiffSessionResponse> {
  return apiRequest<LiffSessionResponse>("/liff/session", {
    method: "POST",
    body: payload,
    credentials: "include",
  });
}
