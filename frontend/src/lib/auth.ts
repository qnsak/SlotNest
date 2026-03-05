const ADMIN_USERNAME_KEY = "slotnest.admin.username";
const ADMIN_PASSWORD_KEY = "slotnest.admin.password";

export type AdminCredentials = {
  username: string;
  password: string;
};

export function setAdminCredentials(credentials: AdminCredentials): void {
  sessionStorage.setItem(ADMIN_USERNAME_KEY, credentials.username);
  sessionStorage.setItem(ADMIN_PASSWORD_KEY, credentials.password);
}

export function clearAdminCredentials(): void {
  sessionStorage.removeItem(ADMIN_USERNAME_KEY);
  sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
}

export function getAdminCredentials(): AdminCredentials | null {
  const username = sessionStorage.getItem(ADMIN_USERNAME_KEY);
  const password = sessionStorage.getItem(ADMIN_PASSWORD_KEY);

  if (!username || !password) {
    return null;
  }

  return { username, password };
}

export function getAdminAuthorizationHeader(): string | null {
  const credentials = getAdminCredentials();
  if (!credentials) {
    return null;
  }

  const token = btoa(`${credentials.username}:${credentials.password}`);
  return `Basic ${token}`;
}
