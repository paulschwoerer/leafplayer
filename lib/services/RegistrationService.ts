import { NotAuthorizedError } from '@/errors/NotAuthorizedError';
import { ValidationError } from '@/errors/ValidationError';
import { InvitationsService } from '@/services/InvitationsService';

import { PasswordService } from './PasswordService';
import { UsersService } from './UsersService';

type UserDetails = {
  username: string;
  displayName?: string;
  password: string;
};

type Injects = {
  usersService: UsersService;
  passwordService: PasswordService;
  invitationsService: InvitationsService;
};

export interface RegistrationService {
  registerUser(inviteCode: string, userDetails: UserDetails): Promise<void>;
}

export default function createRegistrationService({
  usersService,
  passwordService,
  invitationsService,
}: Injects): RegistrationService {
  return {
    async registerUser(inviteCode, userDetails) {
      const isValid = await invitationsService.isValidInviteCode(inviteCode);

      if (!isValid) {
        throw new NotAuthorizedError('Invalid invite code');
      }

      const userExists = await usersService.exists(userDetails.username);

      if (userExists) {
        throw new ValidationError('Username taken');
      }

      const pwResult = passwordService.validatePasswordSecurity(
        userDetails.password,
      );

      if (pwResult instanceof Error) {
        throw pwResult;
      }

      // TODO: a transaction would be nice
      await usersService.create({
        ...userDetails,
        displayName: userDetails.displayName || userDetails.username,
      });
      await invitationsService.invalidateInvitation(inviteCode);
    },
  };
}
