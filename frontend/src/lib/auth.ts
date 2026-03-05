export type AdminCredentials = {
  username: string;
  password: string;
};

let adminCredentials: AdminCredentials | null = null;

export function setAdminCredentials(credentials: AdminCredentials): void {
  adminCredentials = credentials;
}

export function clearAdminCredentials(): void {
  adminCredentials = null;
}

export function getAdminCredentials(): AdminCredentials | null {
  return adminCredentials;
}

export function getAdminAuthorizationHeader(): string | null {
  const credentials = getAdminCredentials();
  if (!credentials) {
    return null;
  }

  const token = btoa(`${credentials.username}:${credentials.password}`);
  return `Basic ${token}`;
}
