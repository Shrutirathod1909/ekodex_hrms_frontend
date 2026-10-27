import { createContext, useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import axios from "axios";

export const PermissionsContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  const getPermissionsByModule = (moduleName) => {
    // Note: Use the state variable 'permissions' directly here
    if (!permissions.detailedPermissions) return [];

    const searchName = moduleName.toLowerCase();
    return permissions.detailedPermissions.filter(
      (permission) => permission.module_name?.toLowerCase() === searchName,
    )[0];
  };

  const getPermissionsByModuleId = (id) => {
    // Ensure we are comparing as numbers if the ID might be a string
    const numericId = Number(id);

    if (!permissions.detailedPermissions) return [];

    return permissions.detailedPermissions.filter(
      (permission) => permission.module_id === numericId,
    )[0];
  };

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      // console.log("from context :", token);
      if (!token) {
        setPermissions(["token not found"]);
        return;
      }

      const response = await api.get(
        `${import.meta.env.VITE_API_URL}/api/permissions/get-permissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // console.log("from context Permission:", permissions);
      setPermissions(response.data?.permissions || response.data || []);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/get-user-data`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log(response.data);

      setUserData(response.data.user);
    } catch (error) {
      console.error("Failed to fetch User Data:", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPermissions(), fetchUserData()]);
      setLoading(false);
    };
    init();
  }, [fetchPermissions, fetchUserData]); // Added dependencies
  // Optional: expose refetch function
  const refetch = () => fetchPermissions();
  const refetchUser = () => fetchUserData();

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        userData,
        getPermissionsByModule,
        getPermissionsByModuleId,
        refetch,
        refetchUser,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};
