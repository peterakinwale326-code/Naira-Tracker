"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCorsOrigin = getCorsOrigin;
function getCorsOrigin() {
    const origins = process.env.FRONTEND_ORIGIN
        ?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    if (!origins?.length)
        return '*';
    return origins.length === 1 ? origins[0] : origins;
}
//# sourceMappingURL=cors.js.map