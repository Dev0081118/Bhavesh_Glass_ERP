const requireModuleAccess = (moduleName) => (req, res, next) => {
  if (req.user?.role === "Super Admin") {
    return next();
  }

  const modules = req.user?.access?.modules;
  const hasAccess = modules instanceof Map
    ? modules.get(moduleName)
    : modules?.[moduleName];

  if (!hasAccess) {
    return res.status(403).json({ message: `Access to ${moduleName} is disabled.` });
  }

  next();
};

module.exports = { requireModuleAccess };
