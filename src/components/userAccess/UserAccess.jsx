// src/components/UserRoleAccess.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Form, Table, Button } from "react-bootstrap";
import user_profile from "../../assets/user.png";
import { NavLink, useLocation } from "react-router-dom";
import {
  canAdd,
  canEdit,
  canDelete,
  canPrint,
  canExport,
} from "../../utils/permissionUtils";
const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${API_URL}/api/permissions`;

const UserAccess = () => {
  const location = useLocation();
  const menuItems = JSON.parse(localStorage.getItem("menuItems")) || [];
  const currentPath = location.pathname.split("/").filter(Boolean);
  console.log("PATH =", currentPath);
  const currentMainModule = currentPath[0]?.toLowerCase()?.trim();
  const currentSubModule = currentPath[1]
    ?.replace(/-/g, " ")
    ?.toLowerCase()
    ?.trim();

  console.log("MAIN MODULE =", currentMainModule);
  console.log("SUB MODULE =", currentSubModule);
  let MODULE_ID = 0;

  // FIND MAIN MODULE
  const matchedModule = menuItems.find(
    (module) => module.moduleName?.toLowerCase()?.trim() === currentMainModule,
  );

  console.log("MATCHED MODULE =", matchedModule);

  // FIND SUBMODULE
  if (matchedModule?.submodules) {
    const matchedSubmodule = matchedModule.submodules.find(
      (sub) => sub.moduleName?.toLowerCase()?.trim() === currentSubModule,
    );

    console.log("MATCHED SUBMODULE =", matchedSubmodule);

    if (matchedSubmodule) {
      MODULE_ID = Number(matchedSubmodule.moduleId);
    }
  }

  console.log("MODULE_ID =", MODULE_ID);

  const permissionColumns = [
    {
      key: "add_access",
      label: "Add",
      visible: canAdd(MODULE_ID),
    },
    {
      key: "edit_access",
      label: "Edit",
      visible: canEdit(MODULE_ID),
    },
    {
      key: "delete_access",
      label: "Delete",
      visible: canDelete(MODULE_ID),
    },
    {
      key: "print_access",
      label: "Print",
      visible: canPrint(MODULE_ID),
    },
    {
      key: "export_access",
      label: "Export",
      visible: canExport(MODULE_ID),
    },
  ];
  const [roles, setRoles] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [groupedModules, setGroupedModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedModules, setSelectedModules] = useState({});
  const [assignedModules, setAssignedModules] = useState(new Set());
  const [moduleGroupSelection, setModuleGroupSelection] = useState({});
  const [detailedPermissions, setDetailedPermissions] = useState({});

  const [loading, setLoading] = useState(false);

  // =========================================
  // FETCH ROLES + MODULES
  // =========================================
  useEffect(() => {
    fetchInitialData();
  }, []);

  const toggleModule = (moduleName) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };

  const handleModuleCheck = (group, checked) => {
    setSelectedModules((prev) => ({
      ...prev,
      [group.module_name]: checked
        ? group.submodules.map((s) => Number(s.module_id))
        : [],
    }));
  };

  const handleSubmoduleCheck = (groupName, submoduleId, checked) => {
    setSelectedModules((prev) => {
      const existing = prev[groupName] || [];

      return {
        ...prev,
        [groupName]: checked
          ? [...existing, Number(submoduleId)]
          : existing.filter((id) => id !== Number(submoduleId)),
      };
    });
  };

  // =========================================
  // HANDLE HEADER CHECKBOX
  // =========================================

  const handleColumnPermission = (permission, checked) => {
    const updated = { ...detailedPermissions };

    // ONLY LOOP THROUGH ASSIGNED MODULES
    assignedModules.forEach((moduleId) => {
      const moduleData = allModules.find(
        (m) => Number(m.module_id) === Number(moduleId),
      );

      if (!moduleData) return;

      const existing = updated[moduleId] || {
        role: selectedRole,
        module_id: moduleId,
        submodule_id: moduleId,
        segment: moduleData.segment,
        main_module: moduleData.main_module,
        add_access: 0,
        edit_access: 0,
        delete_access: 0,
        print_access: 0,
        export_access: 0,
      };

      updated[moduleId] = {
        ...existing,
        [permission]: checked ? 1 : 0,
      };
    });

    setDetailedPermissions(updated);
  };

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [rolesRes, modulesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/roles`, {
          headers: { Authorization: `Bearer ${token}` },
        }),

        axios.get(`${API_BASE_URL}/modules`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setRoles(rolesRes.data);
      setAllModules(modulesRes.data);
      console.log(modulesRes.data);

      // =========================================
      // GROUP MODULES
      // =========================================

      const groupedMap = {};
      const groupedArray = [];

      modulesRes.data.forEach((m) => {
        const mainModule = m.main_module;

        if (!groupedMap[mainModule]) {
          groupedMap[mainModule] = {
            module_name: mainModule,
            submodules: [],
          };

          groupedArray.push(groupedMap[mainModule]);
        }

        groupedMap[mainModule].submodules.push(m);
      });

      setGroupedModules(groupedArray);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
  };

  // =========================================
  // ROLE SELECT
  // =========================================
  const handleRoleSelect = async (roleName) => {
    setSelectedRole(roleName);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE_URL}/${roleName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 1. Set assigned modules
      const assignedIds = (data.assignedModules || []).map(Number);
      setAssignedModules(new Set(assignedIds));

      // 2. Set detailed permissions
      const detailsMap = {};
      (data.detailedPermissions || []).forEach((p) => {
        detailsMap[Number(p.module_id)] = { ...p };
      });
      setDetailedPermissions(detailsMap);

      // 3. RECONSTRUCT moduleGroupSelection
      const newGroupSelection = {};
      groupedModules.forEach((group) => {
        const subIdsInGroup = group.submodules
          .map((s) => Number(s.module_id))
          .filter((id) => assignedIds.includes(id));

        if (subIdsInGroup.length > 0) {
          newGroupSelection[group.module_name] = {
            checked_all:
              subIdsInGroup.length === group.submodules.length ? 1 : 0,
            submodule_ids: subIdsInGroup,
          };
        }
      });
      setModuleGroupSelection(newGroupSelection);
    } catch (err) {
      console.error(err);
      // ... error handling
    }
    setLoading(false);
  };

  // =========================================
  // TOGGLE MODULE
  // =========================================

  const handleModuleAssign = (moduleId) => {
    const updated = new Set(assignedModules);

    if (updated.has(moduleId)) {
      updated.delete(moduleId);
    } else {
      updated.add(moduleId);
    }

    setAssignedModules(updated);
  };

  const createDefaultPermissions = (sub, role) => ({
    role,
    module_id: sub.module_id,
    submodule_id: sub.module_id,
    segment: sub.segment,
    main_module: sub.main_module,
    add_access: 1,
    edit_access: 1,
    delete_access: 1,
    print_access: 1,
    export_access: 1,
  });

  // =========================================
  // PERMISSION CHANGE
  // =========================================

  const handlePermissionChange = (submodule, permName) => {
    const moduleId = Number(submodule.module_id);

    // =====================================
    // ASSIGN MODULE AUTO
    // =====================================

    const updatedModules = new Set(assignedModules);

    updatedModules.add(moduleId);

    setAssignedModules(updatedModules);

    // =====================================
    // EXISTING DATA
    // =====================================

    const existing = detailedPermissions[moduleId] || {
      role: selectedRole,
      segment: submodule.segment,
      main_module: submodule.main_module,
      submodule_id: moduleId,
      module_id: moduleId,
      add_access: 0,
      edit_access: 0,
      delete_access: 0,
      print_access: 0,
      export_access: 0,
    };

    // =====================================
    // TOGGLE VALUE
    // =====================================

    const updatedPermission = {
      ...existing,
      [permName]: existing[permName] ? 0 : 1,
    };

    // =====================================
    // UPDATE STATE
    // =====================================

    setDetailedPermissions((prev) => ({
      ...prev,
      [moduleId]: updatedPermission,
    }));
  };

  const handleModuleGroupToggle = (group, isChecked) => {
    const nextAssigned = new Set(assignedModules);
    const nextPermissions = { ...detailedPermissions };
    const nextGroupSelection = { ...moduleGroupSelection };

    if (isChecked) {
      // Check all submodules
      group.submodules.forEach((sub) => {
        const sId = Number(sub.module_id);
        nextAssigned.add(sId);
        nextPermissions[sId] = createDefaultPermissions(sub, selectedRole);
      });
      nextGroupSelection[group.module_name] = {
        checked_all: 1,
        submodule_ids: group.submodules.map((s) => Number(s.module_id)),
      };
    } else {
      // Uncheck all submodules
      group.submodules.forEach((sub) => {
        const sId = Number(sub.module_id);
        nextAssigned.delete(sId);
        delete nextPermissions[sId];
      });
      delete nextGroupSelection[group.module_name];
    }

    setModuleGroupSelection(nextGroupSelection);
    setAssignedModules(nextAssigned);
    setDetailedPermissions(nextPermissions);
  };

  const handleSubmoduleToggle = (group, sub, isChecked) => {
    const sId = Number(sub.module_id);
    const nextAssigned = new Set(assignedModules);
    const nextPermissions = { ...detailedPermissions };
    const nextGroupSelection = { ...moduleGroupSelection };

    if (isChecked) {
      nextAssigned.add(sId);
      nextPermissions[sId] = createDefaultPermissions(sub, selectedRole);
    } else {
      nextAssigned.delete(sId);
      delete nextPermissions[sId];
    }

    // RECALCULATE GROUP STATE
    const currentSubIds = Array.from(nextAssigned);
    const groupSubIds = group.submodules.map((s) => Number(s.module_id));

    // Check if ALL submodules in this group are present in assignedModules
    const allChecked = groupSubIds.every((id) => currentSubIds.includes(id));
    // Check if AT LEAST ONE is checked
    const someChecked = groupSubIds.some((id) => currentSubIds.includes(id));

    if (allChecked) {
      nextGroupSelection[group.module_name] = {
        checked_all: 1,
        submodule_ids: groupSubIds,
      };
    } else if (someChecked) {
      // Optional: Keep group object if you want to track partial selection
      nextGroupSelection[group.module_name] = {
        checked_all: 0,
        submodule_ids: groupSubIds.filter((id) => currentSubIds.includes(id)),
      };
    } else {
      delete nextGroupSelection[group.module_name];
    }

    setModuleGroupSelection(nextGroupSelection);
    setAssignedModules(nextAssigned);
    setDetailedPermissions(nextPermissions);
  };

  // =========================================
  // SAVE
  // =========================================

  const handleSave = async () => {
    if (!selectedRole) {
      alert("Please select role");
      return;
    }

    // =========================
    // MODULE PAYLOAD
    // =========================
    const modulePayload = Object.entries(moduleGroupSelection).map(
      ([name, data]) => ({
        role: selectedRole,
        module_name: name,
        checked_all: data.checked_all,
        submodule_ids: data.submodule_ids,
      }),
    );

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const permissionsPayload = Array.from(assignedModules).map((moduleId) => {
        const moduleData = allModules.find((m) => m.module_id === moduleId);

        const existing = detailedPermissions[moduleId] || {};

        return {
          role: selectedRole,
          module_id: moduleId,
          submodule_id: moduleId,
          segment: moduleData?.segment || "",
          main_module: moduleData?.main_module || "",
          add_access: existing.add_access || 0,
          edit_access: existing.edit_access || 0,
          delete_access: existing.delete_access || 0,
          print_access: existing.print_access || 0,
          export_access: existing.export_access || 0,
        };
      });

      console.log("Sending Payload:", permissionsPayload, modulePayload);

      // ================= API =================

      await axios.post(
        `${API_BASE_URL}/save`,
        {
          role: selectedRole,
          permissions: permissionsPayload,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Permissions saved successfully!");
    } catch (err) {
      console.error(err);

      console.log(err.response?.data);

      alert(err.response?.data?.message || "Failed to save permissions");

      if (err.response?.status === 401) {
        localStorage.removeItem("token");

        window.location.href = "/login";
      }
    }

    setLoading(false);
  };

  // VISIBLE SUBMODULES

  const visibleSubmodules = allModules.filter((m) =>
    assignedModules.has(m.module_id),
  );

  return (
    <div
      className="page-container"
      style={{
        fontSize: "13px",
      }}
    >
      {/* ========================================= */}
      {/* ROLES */}
      {/* ========================================= */}

      <style>
        {`/* Container spacing */
.role-item {
  width: 100px; /* Fixed width to keep items uniform */
}

/* Hover effect */
.role-item:hover .role-circle {
  background-color: #dee2e6 !important;
}

/* Active State */
.role-item.active .role-circle {
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.2);
}

.role-text {
  text-transform: uppercase;
  color: #333;
}`}
      </style>

      <Card className="p-4 mb-4 shadow-sm border-0">
        <h5 className="fw-bold mb-4">Set access by user role</h5>

        <div className="d-flex flex-wrap gap-4 justify-content-start">
          {roles.map((role) => (
            <div
              key={role.role_name}
              className={`role-item d-flex flex-column align-items-center ${
                selectedRole === role.role_name ? "active" : ""
              }`}
              onClick={() => handleRoleSelect(role.role_name)}
              style={{ cursor: "pointer", transition: "all 0.3s ease" }}
            >
              <div
                className="role-circle mb-2 d-flex align-items-center justify-content-center"
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  backgroundColor:
                    selectedRole === role.role_name ? "#55c8cf" : "#e9ecef",
                  color: selectedRole === role.role_name ? "#fff" : "#495057",
                  fontSize: "24px",
                }}
              >
                <img
                  style={{ maxWidth: "4rem", borderRadius: "50%" }}
                  src={`${user_profile}`}
                />
              </div>
              <div
                className="role-text text-center fw-medium"
                style={{ fontSize: "12px" }}
              >
                {role.role_name.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </Card>
      {/* ========================================= */}
      {/* MODULES */}
      {/* ========================================= */}
      {/* ========================================= */}
      {/* MODULES (UPDATED UI LIKE IMAGE) */}
      {/* ========================================= */}

      {selectedRole && (
        <>
          <Card className="p-3 mb-3">
            <h4>{selectedRole} - Module Access</h4>

            {/* SELECT ALL */}
            <div className="border p-3 mb-3 bg-white">
              <div className="mb-2">
                <Form.Check
                  type="checkbox"
                  label={
                    <span style={{ fontWeight: "500" }}>
                      Select All{" "}
                      <span style={{ color: "orangered" }}>
                        ({allModules.length})
                      </span>
                    </span>
                  }
                  checked={
                    assignedModules.size === allModules.length &&
                    allModules.length > 0
                  }
                  onChange={(e) => {
                    console.log("All Modules length:", allModules.length);
                    const checked = e.target.checked;

                    if (checked) {
                      // 1. Create flat list of all IDs
                      const allIds = allModules.map((m) => Number(m.module_id));

                      // 2. Update States
                      setAssignedModules(new Set(allIds));

                      // 3. Permissions Map
                      const updatedPermissions = {};
                      allModules.forEach((m) => {
                        updatedPermissions[m.module_id] = {
                          role: selectedRole,
                          module_id: m.module_id,
                          submodule_id: m.module_id,
                          segment: m.segment,
                          main_module: m.main_module,
                          add_access: 1,
                          edit_access: 1,
                          delete_access: 1,
                          print_access: 1,
                          export_access: 1,
                        };
                      });
                      setDetailedPermissions(updatedPermissions);

                      // 4. Group Selection Map
                      const newGroupSelection = {};
                      groupedModules.forEach((group) => {
                        newGroupSelection[group.module_name] = {
                          checked_all: 1,
                          submodule_ids: group.submodules.map((s) =>
                            Number(s.module_id),
                          ),
                        };
                      });
                      setModuleGroupSelection(newGroupSelection);

                      // 5. Expand all groups
                      const expanded = {};
                      groupedModules.forEach(
                        (g) => (expanded[g.module_name] = true),
                      );
                      setExpandedModules(expanded);
                    } else {
                      // Clear all
                      setAssignedModules(new Set());
                      setDetailedPermissions({});
                      setModuleGroupSelection({});
                    }
                  }}
                />
              </div>

              {/* MODULE LIST */}
              <div className="mt-3">
                {groupedModules.map((group) => (
                  <div
                    key={group.module_name}
                    className="border rounded mb-2 p-2"
                  >
                    <div className="d-flex align-items-center">
                      {/* --- REPLACE THE FORM.CHECK BELOW --- */}
                      <Form.Check
                        type="checkbox"
                        className="me-2"
                        checked={
                          !!moduleGroupSelection[group.module_name]?.checked_all
                        }
                        ref={(el) => {
                          if (el) {
                            el.indeterminate =
                              !moduleGroupSelection[group.module_name]
                                ?.checked_all &&
                              moduleGroupSelection[group.module_name]
                                ?.submodule_ids?.length > 0;
                          }
                        }}
                        onChange={(e) =>
                          handleModuleGroupToggle(group, e.target.checked)
                        }
                      />
                      {/* ------------------------------------- */}

                      <div
                        className="flex-grow-1"
                        style={{ cursor: "pointer", fontWeight: "600" }}
                        onClick={() => toggleModule(group.module_name)}
                      >
                        {expandedModules[group.module_name] ? "▼" : "▶"}{" "}
                        {group.module_name}
                      </div>
                    </div>

                    {expandedModules[group.module_name] && (
                      <div className="ms-4 mt-2">
                        {group.submodules.map((sub) => (
                          <Form.Check
                            key={sub.module_id}
                            type="checkbox"
                            label={sub.module_name}
                            checked={assignedModules.has(Number(sub.module_id))}
                            onChange={(e) =>
                              handleSubmoduleToggle(
                                group,
                                sub,
                                e.target.checked,
                              )
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Assign Modules"}
            </Button>
          </Card>

          {/* ================= TABLE ================= */}
          <Card className="p-3">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">
                {selectedRole?.toUpperCase()} - PERMISSION ACCESS
              </h4>

              {/* SAVE BUTTON */}
            </div>

            <Table bordered className="permission-table">
              <thead className="table-dark">
                <tr>
                  <th>Main Module</th>

                  <th>Submodule</th>

                  {permissionColumns
                    .filter((p) => p.visible)
                    .map((perm) => (
                      <th key={perm.key} className="text-center">
                        <div className="d-flex flex-column align-items-center">
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              handleColumnPermission(perm.key, e.target.checked)
                            }
                          />

                          <span>{perm.label}</span>
                        </div>
                      </th>
                    ))}
                </tr>
              </thead>
{/* 
              <tbody>
                {allModules.map((m) => (
                  <tr key={m.module_id}>
                    <td>{m.main_module}</td>

                    <td>{m.module_name}</td>

                    {permissionColumns
                      .filter((p) => p.visible)
                      .map((perm) => (
                        <td key={perm.key} className="text-center">
                          <input
                            type="checkbox"
                            checked={
                              !!detailedPermissions[Number(m.module_id)]?.[
                                perm.key
                              ]
                            }
                            onChange={() => handlePermissionChange(m, perm.key)}
                          />
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody> */}
<tbody>
  {allModules
    .filter((m) => assignedModules.has(Number(m.module_id)))
    .map((m) => (
      <tr key={m.module_id}>
        <td>{m.main_module}</td>

        <td>{m.module_name}</td>

        {permissionColumns
          .filter((p) => p.visible)
          .map((perm) => (
            <td key={perm.key} className="text-center">
              <input
                type="checkbox"
                checked={
                  !!detailedPermissions[Number(m.module_id)]?.[perm.key]
                }
                onChange={() => handlePermissionChange(m, perm.key)}
              />
            </td>
          ))}
      </tr>
    ))}
</tbody>
            </Table>

            {/* BOTTOM SAVE BUTTON */}
            <div className="mt-3">
              <Button variant="success" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default UserAccess;
