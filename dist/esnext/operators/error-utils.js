import { catchError } from 'rxjs/operators';
export const createErrorOperator = (operation) => (cb) => (catchError((e, $) => { throw operation(e, $, cb); }));
//# sourceMappingURL=error-utils.js.map