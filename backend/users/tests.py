from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.core.exceptions import ValidationError
from django.test import TestCase, override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from users.tokens import profile_password_change_token

User = get_user_model()


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    DEFAULT_FROM_EMAIL="school@example.org",
)
class PasswordFlowTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="parent@example.org", password="OldPass1!", first_name="Анна", is_active=True
        )
        self.uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        self.client = APIClient()

    def authenticate(self, user=None):
        token = RefreshToken.for_user(user or self.user).access_token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def profile_payload(self, token, **changes):
        payload = {
            "uid": self.uid,
            "token": token,
            "current_password": "OldPass1!",
            "new_password": "NewPass2@",
            "re_new_password": "NewPass2@",
        }
        payload.update(changes)
        return payload

    def test_profile_email_requires_auth_and_matching_account_email(self):
        url = "/api/v1/users/profile_password_change/"
        response = self.client.post(url, {"email": self.user.email}, format="json")
        self.assertEqual(response.status_code, 401)

        self.authenticate()
        response = self.client.post(url, {"email": "another@example.org"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(len(mail.outbox), 0)

        response = self.client.post(url, {"email": self.user.email}, format="json")
        self.assertEqual(response.status_code, 204)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.user.email])
        self.assertIn(f"{settings.FRONTEND_SITE_URL}/profile/password-change/{self.uid}/", mail.outbox[0].body)

    def test_profile_confirmation_requires_old_password_and_keeps_jwt_usable(self):
        token = profile_password_change_token.make_token(self.user)
        url = "/api/v1/users/profile_password_change_confirm/"

        response = self.client.post(url, self.profile_payload(token), format="json")
        self.assertEqual(response.status_code, 401)

        self.authenticate()

        response = self.client.post(url, self.profile_payload(token, current_password="incorrect"), format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("current_password", response.data)

        response = self.client.post(url, self.profile_payload(token, re_new_password="different"), format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("re_new_password", response.data)

        response = self.client.post(url, self.profile_payload(token, new_password="weakpass1"), format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("re_new_password", response.data)

        response = self.client.post(
            url,
            self.profile_payload(token, new_password="weakpass1", re_new_password="weakpass1"),
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("new_password", response.data)

        response = self.client.post(url, self.profile_payload(token), format="json")
        self.assertEqual(response.status_code, 204)
        self.user.refresh_from_db()
        self.assertFalse(self.user.check_password("OldPass1!"))
        self.assertTrue(self.user.check_password("NewPass2@"))
        self.assertFalse(profile_password_change_token.check_token(self.user, token))
        self.assertEqual(self.client.get("/api/v1/users/me/").status_code, 200)

    def test_profile_link_is_for_one_account_and_not_accepted_as_guest_reset(self):
        profile_token = profile_password_change_token.make_token(self.user)
        other = User.objects.create_user(email="other@example.org", password="OldPass1!", is_active=True)
        self.authenticate(other)

        response = self.client.post(
            "/api/v1/users/profile_password_change_confirm/",
            self.profile_payload(profile_token),
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("uid", response.data)

        self.client.credentials()
        response = self.client.post(
            "/api/v1/users/reset_password_confirm/",
            {"uid": self.uid, "token": profile_token, "new_password": "NewPass2@", "re_new_password": "NewPass2@"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("OldPass1!"))

        self.authenticate()
        guest_token = default_token_generator.make_token(self.user)
        response = self.client.post(
            "/api/v1/users/profile_password_change_confirm/",
            self.profile_payload(guest_token),
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("token", response.data)

    def test_guest_reset_email_and_confirmation_enforce_policy(self):
        response = self.client.post("/api/v1/users/reset_password/", {"email": self.user.email}, format="json")
        self.assertEqual(response.status_code, 204)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(f"{settings.FRONTEND_SITE_URL}/password-change/{self.uid}/", mail.outbox[0].body)

        token = default_token_generator.make_token(self.user)
        url = "/api/v1/users/reset_password_confirm/"
        payload = {"uid": self.uid, "token": token, "new_password": "NewPass2@", "re_new_password": "NewPass2@"}

        response = self.client.post(url, {**payload, "re_new_password": "wrong"}, format="json")
        self.assertEqual(response.status_code, 400)

        response = self.client.post(url, {**payload, "new_password": "weakpass1", "re_new_password": "weakpass1"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("new_password", response.data)

        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, 204)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewPass2@"))
        self.assertFalse(default_token_generator.check_token(self.user, token))

    def test_password_policy_rejects_non_latin_or_incomplete_passwords(self):
        invalid_passwords = (
            "Ab1!xyz",
            "Пароль1!A",
            "lowercase1!",
            "UPPERCASE1!",
            "NoDigit!x",
            "NoSymbol1x",
            "BadSpace1! x",
            "OtherChar1?",
        )
        for password in invalid_passwords:
            with self.subTest(password=password), self.assertRaises(ValidationError):
                validate_password(password, self.user)

        validate_password("GoodPass1!", self.user)
