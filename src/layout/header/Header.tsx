import { useAppSelector } from "../../store";
import { PublicHeader } from "./PublicHeader";
import { PrivateHeader } from "./PrivateHeader";

export function Header() {
  const isAuthenticated = useAppSelector((state) => !!state.auth.token);

  return isAuthenticated ? <PrivateHeader /> : <PublicHeader />;
}
