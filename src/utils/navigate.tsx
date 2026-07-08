import type { NavigateFunction } from "react-router-dom";

let _navigate: NavigateFunction | null = null;

export const setNavigate = (navigate: NavigateFunction) => {
  _navigate = navigate;
};

export const navigate = (path: string) => {
  if (_navigate) {
    _navigate(path);
  } else {
    window.location.href = path;
  }
};