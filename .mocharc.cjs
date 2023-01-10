module.exports = {
    require: "ts-node/register",
    extension: ["ts"],
    "node-option": ["experimental-specifier-resolution=node", "loader=ts-node/esm"],
    spec: ["tests/**/*.spec.ts"],
    recursive: true,
    exit: true
}
