import re

from django.core.exceptions import ValidationError


class LatinComplexPasswordValidator:
    """Require the password format used by the recovery and change forms."""

    allowed_characters = re.compile(r"^[A-Za-z0-9@#$%&*!]+$")

    def validate(self, password, user=None):
        if (
            len(password) < 8
            or not self.allowed_characters.fullmatch(password)
            or not re.search(r"[A-Z]", password)
            or not re.search(r"[a-z]", password)
            or not re.search(r"[0-9]", password)
            or not re.search(r"[@#$%&*!]", password)
        ):
            raise ValidationError(
                "Пароль должен содержать не менее 8 символов: латинские заглавные и строчные буквы, цифру и спецсимвол (@#$%&*!).",
                code="invalid_password_format",
            )

    def get_help_text(self):
        return "Не менее 8 символов: латинские заглавные и строчные буквы, цифра и спецсимвол (@#$%&*!)."
