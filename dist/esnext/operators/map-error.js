import { catchError } from 'rxjs/operators';
export const mapError = (cb) => (catchError((e, $) => { throw cb(e, $); }));
//# sourceMappingURL=map-error.js.map