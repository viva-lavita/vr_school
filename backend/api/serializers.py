from rest_framework import serializers

from api.models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["name", "email", "phone", "comment", "accepted_policy", "created_at"]
        read_only_fields = ["created_at"]

    def validate_accepted_policy(self, value):
        if not value:
            raise serializers.ValidationError(
                "Вы должны подтвердить согласие с политикой обработки персональных данных."
            )
        return value
