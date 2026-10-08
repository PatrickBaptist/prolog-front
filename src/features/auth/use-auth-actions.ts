import { useMutation } from '@tanstack/react-query';
import { authService } from './auth.service';

export function useDefineFirstAccessPassword() {
  return useMutation({
    mutationFn: ({ password, token }: { password: string; token: string }) =>
      authService.defineFirstAccessPassword(password, token),
  });
}
