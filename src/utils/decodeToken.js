// this if for checkiing  user roles
export function getRoleFromToken(token) {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const role = payload.roles?.[0]; // ROLE_USER / ROLE_ADMIN

    return role?.replace("ROLE_", ""); // USER / ADMIN
  } catch (err) {
    return null;
  }
}