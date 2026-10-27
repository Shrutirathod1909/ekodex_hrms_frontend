// src/utils/permissionUtils.js

export const getPermissions = () => {
  try {
    return JSON.parse(
      localStorage.getItem("permissions") || "[]"
    );
  } catch {
    return [];
  }
};

export const getPermission = (
  moduleId,
  submoduleId = null
) => {
  const permissions = getPermissions();

  return permissions.find(
    (item) =>
      Number(item.module_id) === Number(moduleId) &&
      (submoduleId === null ||
        Number(item.submodule_id) === Number(submoduleId))
  );
};

export const canAdd = (
  moduleId,
  submoduleId = null
) => {
  const permission = getPermission(
    moduleId,
    submoduleId
  );

  return permission?.add_access === 1;
};

export const canEdit = (
  moduleId,
  submoduleId = null
) => {
  const permission = getPermission(
    moduleId,
    submoduleId
  );

  return permission?.edit_access === 1;
};

export const canDelete = (
  moduleId,
  submoduleId = null
) => {
  const permission = getPermission(
    moduleId,
    submoduleId
  );

  return permission?.delete_access === 1;
};

export const canPrint = (
  moduleId,
  submoduleId = null
) => {
  const permission = getPermission(
    moduleId,
    submoduleId
  );

  return permission?.print_access === 1;
};

export const canExport = (
  moduleId,
  submoduleId = null
) => {
  const permission = getPermission(
    moduleId,
    submoduleId
  );

  return permission?.export_access === 1;
};