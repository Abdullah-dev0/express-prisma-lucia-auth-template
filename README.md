# Lucia Auth Starter Kit - Express

This repository is a starter kit for implementing authentication in an Express.js application using [Lucia](https://lucia-auth.com/). It comes pre-configured with essential features for secure and user-friendly authentication:

- **Email Sign-Up & Sign-In:** A simple yet secure way for users to create and access their accounts.
- **OAuth Support:** Integrates with GitHub and Google for social logins, providing a smooth onboarding experience.
- **Email Code Verification:** Sends a verification code to the user's email upon registration, ensuring account authenticity.
- **Resend Code Functionality:** Allows users to request a new verification code if the previous one expires or gets lost.

This starter kit is designed to give you a head start when building applications that require modern authentication flows. Perfect for projects that need flexible and reliable user authentication.

## Features

- Sign-up and Sign-in with email/password
- GitHub and Google OAuth integration
- Email verification via code
- Resend code option for better user experience


## when building a image using Docker you need to add this To your package.json

```
"@node-rs/argon2-linux-x64-gnu": "^1.8.3",
```

## env

```bash
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres?sslmode=disable"


# Github
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Google

GOOGLE_CLIENT_ID=""

GOOGLE_CLIENT_SECRET=""

HOST_NAME=""
# HOST_NAME="http://localhost:5173"



# Node mailer 

EMAIL_USER=""
EMAIL_HOST="" 
EMAIL_PASS=""

```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Abdullahdev0/express-prisma-lucia-auth-template.git
   cd express-prisma-lucia-auth-template
