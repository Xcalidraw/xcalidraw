import { useNavigate } from "react-router-dom";
import { useLogout } from "../../../../hooks/auth.hooks";

export const useUserActions = () => {
  const navigate = useNavigate();
  const logout = useLogout();

  const navigateToProfile = () => {
    navigate("/profile");
  };

  const navigateToSubscription = () => {
    navigate("/subscription");
  };

  const navigateToSettings = () => {
    navigate("/settings");
  };

  const navigateToAdmin = () => {
    navigate("/admin");
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate("/auth/login");
      },
    });
  };

  const openHelpCenter = () => {
    // TODO: Open help center
    console.log("Open help center");
  };

  return {
    navigateToProfile,
    navigateToSubscription,
    navigateToSettings,
    navigateToAdmin,
    handleLogout,
    openHelpCenter,
    isLoggingOut: logout.isPending,
  };
};
