import { createErrorOperator } from './error-utils';
export const mapError = createErrorOperator((e, $, cb) => cb(e, $));
//# sourceMappingURL=map-error.js.map