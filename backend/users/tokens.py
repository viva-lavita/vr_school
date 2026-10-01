from django.contrib.auth.tokens import PasswordResetTokenGenerator


class ProfilePasswordChangeTokenGenerator(PasswordResetTokenGenerator):
    # A separate purpose prevents a profile link from working at the guest reset endpoint.
    key_salt = "users.tokens.ProfilePasswordChangeTokenGenerator"


profile_password_change_token = ProfilePasswordChangeTokenGenerator()
