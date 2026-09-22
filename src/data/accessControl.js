export const moduleDefinitions = [
  {
    id: "dashboard",
    label: "Dashboard",
  },

  {
    id: "inventory",
    label: "Inventory",
  },

  {
    id: "product",
    label: "Product",
  },

  {
    id: "customer",
    label: "Customer",
  },

  {
    id: "purchase",
    label: "Purchase",
  },

  {
    id: "production",
    label: "Production",
  },

  {
    id: "dispatch",
    label: "Dispatch",
  },

  {
    id: "sale_bill",
    label: "Sale Bill",
  },

  {
    id: "payment",
    label: "Payment",
  },

  {
    id: "ledger",
    label: "Ledger",
  },

  {
    id: "lr",
    label: "LR",
  },

  {
    id: "whatsapp_ai",
    label: "WhatsApp AI",
  },

  {
    id: "reports",
    label: "Reports",
  },
];

export const defaultAccessForRole =
  (
    role = "Employee"
  ) => {
    const isSuperAdmin =
      role ===
      "Super Admin";

    return {
      modules:
        Object.fromEntries(
          moduleDefinitions.map(
            ({ id }) => [
              id,
              isSuperAdmin ||
                id ===
                  "dashboard",
            ]
          )
        ),

      profile: {
        view: true,

        edit:
          isSuperAdmin,

        resetPassword:
          isSuperAdmin,
      },
    };
  };

export const normalizeAccess = (
  user
) => {
  const defaults =
    defaultAccessForRole(
      user?.role
    );

  const modules =
    user?.access
      ?.modules || {};

  return {
    modules: {
      ...defaults.modules,

      ...(modules instanceof Map
        ? Object.fromEntries(
            modules
          )
        : modules),
    },

    profile: {
      ...defaults.profile,

      ...(user?.access
        ?.profile || {}),
    },
  };
};