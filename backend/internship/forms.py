from django import forms
from .models import User







class RegistrationForm(forms.ModelForm): 






    password = forms.CharField(widget=forms.PasswordInput) #to hide the password when typing
    confirm_password = forms.CharField(widget=forms.PasswordInput) #to confirm the password

    class Meta: #specifies which model to use and which fields to include in the form
        model = User
        fields = ['username', 'email', 'role', 'password']

    def clean(self):#to validate the form data, in this case to check if the password and confirm password match
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirm = cleaned_data.get('confirm_password')

        if password != confirm:
            raise forms.ValidationError("passwords dont match")
        return cleaned_data
class LoginForm(forms.Form): #not model form because we are not creating a new user, just authenticating
    username = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput)

         

         