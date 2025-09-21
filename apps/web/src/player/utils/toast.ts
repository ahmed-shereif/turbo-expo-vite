import { notify } from '../../lib/notify';

export const playerToast = {
  success: (message: string) => notify.success(message),
  error: (message: string) => notify.error(message),
};
