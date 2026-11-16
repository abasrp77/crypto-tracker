interface User {
  id: number;
  email: string;
  name?: string;
}

export const useAuth = () => {
  const user = useState<User | null>("auth_user", () => null);
  const isChecked = useState<boolean>("auth_checked", () => false);
  const isAuthenticated = computed(() => !!user.value);
  const { apiFetch } = useApi();

  const fetchUser = async () => {
    try {
      const data = await apiFetch("/auth/me", {
        showToast: false,
      });
      user.value = data.user;
    } catch (err: any) {
      user.value = null;
    } finally {
      isChecked.value = true;
    }
  };

  const register = async (credentials: {
    email: string;
    password: string;
    name?: string;
  }) => {
    const res = await apiFetch<{ success: boolean; user: User }>(
      "/auth/register",
      {
        method: "POST",
        body: credentials,
        showToast: false,
      },
    );
    user.value = res.user;
    return res;
  };

  const login = async (credentials: { email: string; password: string }) => {
    const res = await apiFetch<{ success: boolean; user: User }>(
      "/auth/login",
      {
        method: "POST",
        body: credentials,
        showToast: false,
      },
    );
    user.value = res.user;
    return res;
  };

  const loginAsDemo = async () => {
    const res = await apiFetch<{ success: boolean; user: User }>(
      "/auth/demo",
      {
        method: "POST",
        showToast: false,
      },
    );
    user.value = res.user;
    return res;
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      user.value = null;
      await navigateTo("/auth/login");
    }
  };

  return {
    user,
    isAuthenticated,
    isChecked,
    fetchUser,
    register,
    login,
    loginAsDemo,
    logout,
  };
};
