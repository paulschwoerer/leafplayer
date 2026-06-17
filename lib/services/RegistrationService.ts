import { NotAuthorizedError } from '../errors/NotAuthorizedError.ts';
import { ValidationError } from '../errors/ValidationError.ts';
import { InvitationsService } from '../services/InvitationsService.ts';

import { PasswordService } from './PasswordService.ts';
import { UsersService } from './UsersService.ts';

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
  registerUser(inviteCode: string, userDetails: UserDetails): void;
}

export default function createRegistrationService({
  usersService,
  passwordService,
  invitationsService,
}: Injects): RegistrationService {
  return {
    registerUser(inviteCode, userDetails) {
      const isValid = invitationsService.isValidInviteCode(inviteCode);

      if (!isValid) {
        throw new NotAuthorizedError('Invalid invite code');
      }

      const userExists = usersService.exists(userDetails.username);

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
      usersService.create({
        ...userDetails,
        displayName: userDetails.displayName || userDetails.username,
      });
      invitationsService.invalidateInvitation(inviteCode);
    },
  };
}
