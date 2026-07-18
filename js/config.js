const CONFIG = Object.freeze({

CLIENT_ID: "324275074378-jtfm32a1podbaeijbc6ncqkqod4gjoge.apps.googleusercontent.com",

APPS_SCRIPT_URL: "",

ALLOWED_DOMAIN: "imberhorne.co.uk",

ROUTES: Object.freeze({
LOGIN: "/",
HOME: "/home",
GUEST: "/guest",
CREATE: "/create"
}),

ROLES: Object.freeze({
USER: 0,
ADMIN: 1,
MANAGER: 2,
CREATOR: 3
}),

ROLE_NAMES: Object.freeze({
0: "User",
1: "Admin",
2: "Manager",
3: "Creator"
}),

SESSION: Object.freeze({

TOKEN_NAME: "session_token",

MAX_DURATION: 2.5 * 60 * 60 * 1000,

CHECK_INTERVAL: 10000,

EXPIRY_TIMES: Object.freeze([
{hour:9,minute:0},
{hour:11,minute:0},
{hour:11,minute:20},
{hour:13,minute:30},
{hour:14,minute:10},
{hour:15,minute:10},
{hour:17,minute:0}
])

}),

ANIMATION: Object.freeze({

FADE_IN: 250,

FADE_OUT: 180,

BUTTON: 120,

PAGE: 200

}),

LOG_ACTIONS: Object.freeze({

LOGIN: "LOGIN",

LOGOUT: "LOGOUT",

SESSION_CREATED: "SESSION_CREATED",

SESSION_EXPIRED: "SESSION_EXPIRED",

PAGE_VIEW: "PAGE_VIEW",

ACCOUNT_REQUEST: "ACCOUNT_REQUEST",

ERROR: "ERROR"

}),

ERRORS: Object.freeze({

INVALID_DOMAIN: "Only @imberhorne.co.uk accounts may sign in.",

ACCOUNT_NOT_FOUND: "Your account has not yet been approved.",

SESSION_EXPIRED: "Your session has expired.",

NO_SESSION: "Please sign in.",

ACCESS_DENIED: "Access denied."

})

});
