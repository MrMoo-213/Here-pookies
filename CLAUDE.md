## Here-pookies project knowledge (for any AI picking this up)

## Overview
School-restricted website (Imberhorne school, domain imberhorne.co.uk). Frontend on GitHub Pages / Vercel, backend is a single Google Apps Script Web App (Code.gs) reading/writing a Google Sheet. Static site, no build step, no framework — plain HTML/CSS/JS.

## Conventions
- No code comments anywhere (user's explicit preference), including in Code.gs.
- Formatting style throughout the codebase: blank line between almost every statement (this is the user's existing style, matched in all files, not something to "fix").
- CSS variables/classes are shared globally: css/style.css (auth pages: login, create, guest) and css/home.css (dashboard pages: home, apps, chat, competitions, FNAF).
- Content-Type on all fetch calls to Apps Script MUST be text/plain;charset=utf-8, not application/json — application/json triggers a CORS preflight that Apps Script web apps can't answer, breaking every request silently.
- IMPORTANT GOTCHA: duplicate function/method names (in Code.gs, or duplicate static methods in a JS class like Sheets) do NOT throw — the LAST declaration silently wins. This caused real bugs before (chat attachments failed silently for a while). Always grep for duplicate function/case names before editing Code.gs or sheets.js.
- Spreadsheet ID is baked directly into Code.gs (const SPREADSHEET_ID). Current ID: 1iB9auDG4m-_ziFl15h_yvJGQ0NQS2oQ9SvcxVX14uf0
- After ANY Code.gs change: paste into Apps Script editor, then Deploy -> Manage deployments -> edit (pencil) -> Version: New -> Deploy. Saving alone does NOT update the live /exec endpoint.
- If Code.gs gains a new Google API usage (e.g. DriveApp), the script owner must manually re-authorize: select the relevant no-arg function in the Apps Script dropdown (e.g. getOrCreateChatFolder), Run it, approve the permission prompt, then redeploy.
- Google Drive does NOT reliably serve files for direct <img>/<video> embedding via the old "uc?export=view" URL — use "https://lh3.googleusercontent.com/d/FILEID" for images (works for direct embedding), and for video just link out to "https://drive.google.com/file/d/FILEID/view" instead of embedding (Drive doesn't support inline video playback reliably — no proper range requests). Frontend renders video attachments as a "Watch video" link, not an inline <video> tag, once persisted (local blob: URLs during upload are still shown inline for preview).
- CSS gotcha learned the hard way: avoid nesting a second position:absolute element (e.g. a wrapper div) between a position:relative container and the elements you're trying to position absolutely relative to that container — the wrapper becomes its own containing block and silently breaks the intended positioning math. Keep positioning contexts as flat/shallow as possible.
- Flexbox gotcha: a flex:1 child that's supposed to scroll internally (overflow-y:auto) needs min-height:0 explicitly set on itself AND on any flex-column ancestor between it and the nearest bounded-height container — without it, flex items default to min-height:auto and refuse to shrink below their content size, so instead of scrolling, the whole column overflows and gets clipped by a parent's overflow:hidden (this silently ate the chat/DM input bar once already — .chatArea, .dmThreadView, .chatMessages all need min-height:0).
- Nav menu hover-vs-click gotcha: if you ever see the nav menu popping open on mouseover when it's only supposed to open on click, check for a stray `.navMenu:hover .navItem` CSS rule living alongside `.navMenu.open .navItem` — only the .open one should exist. Also check for an empty `<div class="navHoverZone"></div>` leftover in the markup plus a matching oversized invisible `.navHoverZone` CSS rule — this was dead cruft from an earlier hover-based nav experiment that kept resurfacing across pages; it doubles as an invisible click-blocker over whatever's underneath it, so remove both the div and the CSS rule entirely if found again, don't just fix the hover behavior and leave the div there.

## Routes (js/config.js CONFIG.ROUTES)
- / — login page (index.html)
- /home — dashboard (3 pills: Competitions, Apps, Chat; also has a "Change Name" button + panel, no nav menu bubble here by design)
- /home/apps — games list, dynamic from Games sheet
- /home/apps/FNAF — hardcoded FNAF sub-games, no sheet dependency
- /home/competitions — coming soon placeholder
- /home/chat — chat (GC) + DMs toggle, full DM system built
- /guest — public "coming soon" benefits page, no auth
- /create — request-account flow (3 stages: warning -> google signin + username -> confirmation)
- /404.html — GitHub Pages 404

## Nav menu (home/apps, home/chat, home/competitions, home/apps/FNAF — NOT home/index.html)
Click-only (not hover) fan-out menu, top-right of topbar, five bubbles staggered in a diagonal staircase via flex-column + per-item margin-right: chat (blue #2f8fe0) -> /home/chat, home (red #d43b3b) -> /home, competition (yellow #e0b800) -> /home/competitions, dms (green #28b44b) -> /home/chat?dm=1, games (purple #9b4de0) -> /home/apps. Toggled via .navMenu.open, closed on outside click. If adding a 6th item, add another .navItem:nth-child(6) rule with an incremented margin-right in css/home.css.

## Google Sheets structure
1. Users: Email, Username, Role (0=User,1=Admin,2=Manager,3=Creator), Active (TRUE gates login)
2. Logs: Timestamp, Email, Action, Details, IP (IP always blank — Apps Script web apps can't see client IP). GAME_CLICK actions now logged when a user clicks any game on /apps or /apps/FNAF.
3. Account Requests: Timestamp, Email, Name, Status
4. Active Sessions: Token, Email, Created, Expires, IP
5. Games: Name, URL, Internal (1=internal path like home/apps/x, 0=external full URL), Rating (0 default, unused so far). Internal games render as a green pill on /home/apps, external stay the default blue pill.
6. Game Requests: Timestamp, Email, Name, URL (dedup by URL, silently ignored if duplicate)
7. Chat Messages: Timestamp, Email, Username, Role, Message, AttachmentURL, AttachmentType, LoveCount, HeartCount (last 2 unused by frontend currently, reactToMessage action exists server-side but nothing calls it yet)
8. DM Requests: Timestamp, FromEmail, ToEmail, Method (number/username), Status (pending/accepted/declined)
9. DM Contacts: Timestamp, UserA, UserB, Method (the method originally used to connect them), ShareConsentA, ShareConsentB (both must be true before the "other" identifier is revealed to both sides)
10. DM Messages: Timestamp, ContactId (row number in DM Contacts), FromEmail, Message, AttachmentURL, AttachmentType (images only, video blocked server-side even if somehow sent from client)

## Backend actions (doPost, Code.gs)
login, validateSession, getUser, getRole, logout, log, requestAccount, heartbeat, getGames, loadApps, requestGame, loadChat, getMessages, sendMessage, uploadAttachment (takes a context param: pass "dm" to block video uploads), reactToMessage (unused by frontend still), sendDmRequest, loadDms, respondDmRequest, requestShareIdentity, getDmMessages, sendDmMessage, changeUsername (new this session — validates 3-20 chars, alphanumeric+underscore only, rejects if taken by another active user, updates Users sheet in place).

## DM system design (privacy rules — read carefully before changing)
- Add by NUMBER (6-digit, xxxxxx@imberhorne.co.uk): requester NEVER learns if that number belongs to a real/active user. Response message is IDENTICAL regardless of whether the number exists: "If xxxxxx is registered on Here pookies (emoji) they will have to accept your DM request for you to see if they are a user or not." This is enforced server-side in handleSendDmRequest — do not change this to leak existence info.
- Add by USERNAME: requester CAN see if the username exists (returns an explicit "no user found" error if not — this is intentional, usernames are not considered sensitive).
- Whichever identifier (number or username) was used to establish the contact becomes visible to BOTH parties automatically once accepted (makes sense — the requester already had to know it to send the request, and the recipient sees it on the incoming request so they know who's asking).
- The OTHER identifier stays hidden until BOTH people separately click "share" (ShareConsentA and ShareConsentB both true) — handleRequestShareIdentity just sets the caller's own flag; reveal happens automatically once both are true, computed at read-time in getDmContactsList, nothing is written to the "revealed" state — it's derived live from the two consent booleans every time.
- DM attachments are images only (frontend file input uses accept="image/*", no video option in the DM attach flow at all, and the backend independently rejects any video mimeType passed with context="dm" as defense in depth).
- Group chat (GC) still allows video, unaffected by the DM restriction.
- Accept is idempotent both server-side and client-side: handleRespondDmRequest checks the request isn't already "accepted" AND checks dmContactExists before appending a new DM Contacts row, and the frontend disables the Accept/Decline buttons immediately on click. This exists because rapid double-clicking used to create duplicate DM Contacts rows for the same pair, which made multiple DM threads open for the same person — fixed this session, don't remove either the frontend disabling or the backend existence check, they're both needed (defense in depth, a slow/retried network request could still double-fire even with the button disabled).

## Recently completed (this session)
- Nav menu: fixed it still opening on hover (a leftover `.navMenu:hover .navItem` CSS rule was firing alongside the click-based `.navMenu.open .navItem` one) — deleted the hover rule and the associated dead invisible `.navHoverZone` div/CSS that was sitting as an undetected click-blocker over page content on every page (home/apps, home/chat, home/competitions, home/apps/FNAF). Added a 5th nav bubble, "games" (purple #9b4de0), navigating to /home/apps, on all four pages.
- DM accept-multiple-times bug fixed in both places: Code.gs's handleRespondDmRequest now checks the request isn't already accepted and that a contact doesn't already exist before appending a new DM Contacts row; frontend disables Accept/Decline immediately on click.
- DM thread scroll bug fixed: added min-height:0 to .chatArea, .dmThreadView, .chatMessages so the message list scrolls internally instead of the whole column overflowing and clipping the input bar off-screen (see the flexbox gotcha note above).
- Games add-panel toggle logic rewritten as explicit openSettings()/openAddPanel()/closeAllPanels() functions with one shared source of truth, replacing two independent .toggle("hidden") calls on a shared overlay that could desync depending on click order. Could not confirm a specific root-cause bug by static reading beyond this desync risk — if the user reports it's STILL not opening after this, it needs a live browser console screenshot to diagnose further, not more guessing from the code alone.
- Chat/DM scroll-to-bottom-on-open fixed: images load asynchronously after the initial render's scrollTop assignment, growing the container height afterward and leaving the view scrolled short of the true bottom. Now re-applies scrollTop on each image's load event plus a 100ms settle re-check after initial render, for both group chat and DM threads.
- Games list-view: widened list-view rows (340px, centered) for a clearer one-per-line list feel. Internal games (Internal=1 in the Games sheet) now render as a green pill (.pill-internal); external games keep the default blue pill.
- New "Change Name" feature on home/index.html: button + drawer panel (reuses the .settingsPanel pattern), calls the new changeUsername backend action. If the user's current username is still the literal default "Username", the button gets a pulsing green glow (.attention class, PulseGlow keyframe in animations.css) to nudge them to change it — stops automatically once they do, since the condition is just username==="Username".
- Converted the old dotfile-style `.claude` memory file to `CLAUDE.md` (same content/purpose, just a readable filename/extension the user can actually open — keep writing here going forward, not to a new `.claude` file).

## Pending / not yet built
- reactToMessage exists server-side (LoveCount/HeartCount columns already in Chat Messages sheet) but nothing on the frontend calls it yet. Ask before building — may not still be wanted.
- DM message polling only runs while a thread is open (5s interval), and only for the currently open contact — no unread-badge/notification system for new DMs yet, and no "new DM request" badge/notification indicator in the nav menu (the request only shows up when the user actually opens the DMs list).
- No pagination on chat or DM message lists — will get slow with very long histories eventually, not an issue yet at low volume.
- Video upload speed is still just inherently limited by Apps Script + Drive + base64 overhead — no fix found yet beyond the existing upload-status indicator, mentioned to user as a known limitation.
- Consider adding appsscript.json explicit oauthScopes so future scope-expansions (like DriveApp was) don't require manual re-authorization surprises.
- User mentioned "the games menu doesn't open" as a bug this session — fixed the most plausible cause (panel state desync, see above) but couldn't 100% confirm it was THE cause from static reading alone. Check with the user next session whether it's actually resolved.

## Small tasks to do next prompt:

##Google apps script:
const SPREADSHEET_ID = "1iB9auDG4m-_ziFl15h_yvJGQ0NQS2oQ9SvcxVX14uf0";

const CLIENT_ID = "324275074378-jtfm32a1podbaeijbc6ncqkqod4gjoge.apps.googleusercontent.com";
const ALLOWED_DOMAIN = "imberhorne.co.uk";

const SESSION_DURATION_MS = 2.5 * 60 * 60 * 1000;

const SHEET_USERS = "Users";
const SHEET_LOGS = "Logs";
const SHEET_REQUESTS = "Account Requests";
const SHEET_SESSIONS = "Active Sessions";
const SHEET_GAMES = "Games";
const SHEET_GAME_REQUESTS = "Game Requests";
const SHEET_CHAT = "Chat Messages";
const CHAT_FOLDER_NAME = "Here Pookies Chat Uploads";
const SHEET_DM_REQUESTS = "DM Requests";
const SHEET_DM_CONTACTS = "DM Contacts";
const SHEET_DM_MESSAGES = "DM Messages";

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut({ success: false, message: "Bad request." });
  }

  const action = body.action;
  const token = body.token;

  try {
    switch (action) {
      case "login":
        return jsonOut(handleLogin(body.idToken));
      case "validateSession":
        return jsonOut(handleValidateSession(token));
      case "getUser":
        return jsonOut(handleGetUser(token));
      case "getRole":
        return jsonOut(handleGetRole(token));
      case "logout":
        return jsonOut(handleLogout(token));
      case "log":
        return jsonOut(handleLog(token, body.logAction, body.details));
      case "requestAccount":
        return jsonOut(handleRequestAccount(body.idToken || body.email, body.name));
      case "heartbeat":
        return jsonOut(handleValidateSession(token));
      case "getGames":
        return jsonOut(handleGetGames(token));
      case "loadApps":
        return jsonOut(handleLoadApps(token));
      case "requestGame":
        return jsonOut(handleRequestGame(token, body.name, body.url));
      case "loadChat":
        return jsonOut(handleLoadChat(token));
      case "getMessages":
        return jsonOut(handleGetMessages(token));
      case "sendMessage":
        return jsonOut(handleSendMessage(token, body.message, body.attachmentUrl, body.attachmentType));
      case "uploadAttachment":
        return jsonOut(handleUploadAttachment(token, body.filename, body.mimeType, body.base64Data, body.context));
      case "reactToMessage":
        return jsonOut(handleReactToMessage(token, body.rowId, body.emoji));
      case "sendDmRequest":
        return jsonOut(handleSendDmRequest(token, body.method, body.identifier));
      case "loadDms":
        return jsonOut(handleLoadDms(token));
      case "respondDmRequest":
        return jsonOut(handleRespondDmRequest(token, body.requestId, body.accept));
      case "requestShareIdentity":
        return jsonOut(handleRequestShareIdentity(token, body.contactId));
      case "getDmMessages":
        return jsonOut(handleGetDmMessages(token, body.contactId));
      case "sendDmMessage":
        return jsonOut(handleSendDmMessage(token, body.contactId, body.message, body.attachmentUrl, body.attachmentType));
      case "changeUsername":
        return jsonOut(handleChangeUsername(token, body.newUsername));
      default:
        return jsonOut({ success: false, message: "Unknown action." });
    }
  } catch (err) {
    return jsonOut({ success: false, message: "Server error: " + err.message });
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Here-pookies backend is running.");
}

function handleLogin(idToken) {
  if (!idToken) return { success: false, message: "Missing token." };

  const claims = verifyGoogleIdToken(idToken);
  if (!claims) return { success: false, message: "Invalid Google token." };

  const email = claims.email.toLowerCase();
  if (!email.endsWith("@" + ALLOWED_DOMAIN)) {
    return { success: false, message: "Only @" + ALLOWED_DOMAIN + " accounts may sign in.", errorCode: "WRONG_DOMAIN" };
  }

  const user = findUserByEmail(email);
  if (!user || !user.active) {
    return { success: false, message: "Your account has not yet been approved." };
  }

  const session = createSession(email);
  appendLog(email, "SESSION_CREATED", "New session created", "");

  return { success: true, token: session.token };
}

function handleValidateSession(token) {
  if (!token) return { success: false, message: "No session." };

  const session = findSessionByToken(token);
  if (!session) return { success: false, message: "Session not found." };

  if (Date.now() > session.expires) {
    deleteSessionRow(session.rowIndex);
    return { success: false, message: "Session expired." };
  }

  return { success: true };
}

function handleGetUser(token) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  const session = findSessionByToken(token);
  const user = findUserByEmail(session.email);
  if (!user) return { success: false, message: "User not found." };

  return {
    success: true,
    user: {
      username: user.username,
      email: user.email,
      role: user.role
    }
  };
}

function handleGetRole(token) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  const session = findSessionByToken(token);
  const user = findUserByEmail(session.email);
  if (!user) return { success: false, message: "User not found." };

  return { success: true, role: user.role };
}

function handleLogout(token) {
  const session = findSessionByToken(token);
  if (session) {
    appendLog(session.email, "LOGOUT", "User logged out", "");
    deleteSessionRow(session.rowIndex);
  }
  return { success: true };
}

function handleLog(token, logAction, details) {
  const session = findSessionByToken(token);
  const email = session ? session.email : "unknown";
  appendLog(email, logAction || "UNKNOWN", details || "", "");
  return { success: true };
}

function handleRequestAccount(idTokenOrEmail, name) {
  let email = idTokenOrEmail;
  let displayName = name || "";

  if (idTokenOrEmail && idTokenOrEmail.split(".").length === 3) {
    const claims = verifyGoogleIdToken(idTokenOrEmail);
    if (!claims) return { success: false, message: "Invalid Google token." };
    email = claims.email.toLowerCase();
    displayName = claims.name || displayName;
  }

  if (!email) return { success: false, message: "Missing email." };
  if (!email.toLowerCase().endsWith("@" + ALLOWED_DOMAIN)) {
    return { success: false, message: "Only @" + ALLOWED_DOMAIN + " accounts may request access.", errorCode: "WRONG_DOMAIN" };
  }

  const sheet = getSheet(SHEET_REQUESTS);
  sheet.appendRow([new Date(), email, displayName, "Pending"]);
  appendLog(email, "ACCOUNT_REQUEST", "Requested account", "");

  return { success: true, message: "Request submitted." };
}

function handleGetGames(token) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  return { success: true, games: getGamesList() };
}

function getGamesList() {
  const sheet = getSheet(SHEET_GAMES);
  const data = sheet.getDataRange().getValues();
  const games = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    games.push({
      name: row[0],
      url: row[1],
      internal: Number(row[2]) === 1,
      rating: Number(row[3]) || 0
    });
  }

  return games;
}

function handleLoadApps(token) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  const session = findSessionByToken(token);
  const user = findUserByEmail(session.email);
  if (!user) return { success: false, message: "User not found." };

  return {
    success: true,
    user: {
      username: user.username,
      email: user.email,
      role: user.role
    },
    games: getGamesList()
  };
}

function handleRequestGame(token, name, url) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  if (!name || !url) return { success: false, message: "Missing fields." };

  const session = findSessionByToken(token);
  const sheet = getSheet(SHEET_GAME_REQUESTS);
  const data = sheet.getDataRange().getValues();
  const normalizedUrl = String(url).trim().toLowerCase();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][3]).trim().toLowerCase() === normalizedUrl) {
      return { success: true };
    }
  }

  sheet.appendRow([new Date(), session.email, name, url]);
  appendLog(session.email, "GAME_REQUEST", name + " - " + url, "");

  return { success: true };
}

function getMessagesList() {
  const sheet = getSheet(SHEET_CHAT);
  const data = sheet.getDataRange().getValues();
  const messages = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[1]) continue;

    messages.push({
      rowId: i + 1,
      timestamp: row[0],
      email: row[1],
      username: row[2],
      role: Number(row[3]),
      message: row[4],
      attachmentUrl: row[5],
      attachmentType: row[6],
      loveCount: Number(row[7]) || 0,
      heartCount: Number(row[8]) || 0
    });
  }

  return messages;
}

function handleGetMessages(token) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  return { success: true, messages: getMessagesList() };
}

function handleLoadChat(token) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  const session = findSessionByToken(token);
  const user = findUserByEmail(session.email);
  if (!user) return { success: false, message: "User not found." };

  return {
    success: true,
    user: {
      username: user.username,
      email: user.email,
      role: user.role
    },
    messages: getMessagesList()
  };
}

function handleSendMessage(token, message, attachmentUrl, attachmentType) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  if (!message && !attachmentUrl) return { success: false, message: "Empty message." };

  const session = findSessionByToken(token);
  const user = findUserByEmail(session.email);
  if (!user) return { success: false, message: "User not found." };

  const sheet = getSheet(SHEET_CHAT);
  sheet.appendRow([
    new Date(),
    user.email,
    user.username,
    user.role,
    message || "",
    attachmentUrl || "",
    attachmentType || "",
    0,
    0
  ]);

  appendLog(user.email, "CHAT_MESSAGE", message || "(attachment)", "");

  return { success: true };
}

function handleUploadAttachment(token, filename, mimeType, base64Data, context) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  if (!base64Data) return { success: false, message: "No file provided." };

  if (context === "dm" && mimeType.indexOf("video/") === 0) {
    return { success: false, message: "Videos aren't allowed in DMs." };
  }

  try {
    const bytes = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(bytes, mimeType, filename);

    const folder = getOrCreateChatFolder();
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();

    let type = "file";
    if (mimeType === "image/gif") {
      type = "gif";
    } else if (mimeType.indexOf("image/") === 0) {
      type = "image";
    } else if (mimeType.indexOf("video/") === 0) {
      type = "video";
    }

    const url = type === "video"
      ? "https://drive.google.com/file/d/" + fileId + "/view"
      : "https://lh3.googleusercontent.com/d/" + fileId;

    return { success: true, url: url, type: type };
  } catch (err) {
    return { success: false, message: "Upload failed: " + err.message };
  }
}

function handleReactToMessage(token, rowId, emoji) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  if (!rowId || !emoji) return { success: false, message: "Missing fields." };

  const sheet = getSheet(SHEET_CHAT);
  const column = emoji === "love" ? 8 : 9;
  const current = sheet.getRange(rowId, column).getValue();
  sheet.getRange(rowId, column).setValue((Number(current) || 0) + 1);

  return { success: true };
}

function getOrCreateChatFolder() {
  const folders = DriveApp.getFoldersByName(CHAT_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(CHAT_FOLDER_NAME);
}

function handleSendDmRequest(token, method, identifier) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  const session = findSessionByToken(token);
  const fromEmail = session.email;

  if (method === "number") {
    if (!/^\d{6}$/.test(identifier)) {
      return { success: false, message: "Enter a 6-digit school number." };
    }

    const toEmail = identifier + "@" + ALLOWED_DOMAIN;
    const genericMessage = "If " + identifier + " is registered on Here pookies \uD83D\uDE18\uD83D\uDC95 they will have to accept your DM request for you to see if they are a user or not.";

    if (toEmail.toLowerCase() === fromEmail.toLowerCase()) {
      return { success: true, message: genericMessage };
    }

    const targetUser = findUserByEmail(toEmail);
    if (!targetUser || !targetUser.active) {
      return { success: true, message: genericMessage };
    }

    if (dmRelationExists(fromEmail, toEmail)) {
      return { success: true, message: genericMessage };
    }

    createDmRequest(fromEmail, toEmail, "number");
    return { success: true, message: genericMessage };
  }

  if (method === "username") {
    const targetUser = findUserByUsername(identifier);
    if (!targetUser) {
      return { success: false, message: "No user found with that username." };
    }

    if (targetUser.email.toLowerCase() === fromEmail.toLowerCase()) {
      return { success: false, message: "That's your own username." };
    }

    if (dmRelationExists(fromEmail, targetUser.email)) {
      return { success: false, message: "You're already connected or have a pending request with this person." };
    }

    createDmRequest(fromEmail, targetUser.email, "username");
    return { success: true, message: "Request sent to " + targetUser.username + "." };
  }

  return { success: false, message: "Invalid method." };
}

function dmRelationExists(emailA, emailB) {
  const requests = getSheet(SHEET_DM_REQUESTS).getDataRange().getValues();

  for (let i = 1; i < requests.length; i++) {
    const row = requests[i];
    const matches =
      (row[1].toLowerCase() === emailA.toLowerCase() && row[2].toLowerCase() === emailB.toLowerCase()) ||
      (row[1].toLowerCase() === emailB.toLowerCase() && row[2].toLowerCase() === emailA.toLowerCase());

    if (matches && row[4] !== "declined") return true;
  }

  if (dmContactExists(emailA, emailB)) return true;

  return false;
}

function dmContactExists(emailA, emailB) {
  const contacts = getSheet(SHEET_DM_CONTACTS).getDataRange().getValues();

  for (let i = 1; i < contacts.length; i++) {
    const row = contacts[i];
    if (!row[1] || !row[2]) continue;

    const matches =
      (row[1].toLowerCase() === emailA.toLowerCase() && row[2].toLowerCase() === emailB.toLowerCase()) ||
      (row[1].toLowerCase() === emailB.toLowerCase() && row[2].toLowerCase() === emailA.toLowerCase());

    if (matches) return true;
  }

  return false;
}

function createDmRequest(fromEmail, toEmail, method) {
  getSheet(SHEET_DM_REQUESTS).appendRow([new Date(), fromEmail, toEmail, method, "pending"]);
  appendLog(fromEmail, "DM_REQUEST", "To " + toEmail + " via " + method, "");
}

function findUserByUsername(username) {
  const sheet = getSheet(SHEET_USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[1]).toLowerCase() === String(username).toLowerCase()) {
      return {
        rowIndex: i + 1,
        email: row[0],
        username: row[1],
        role: Number(row[2]),
        active: row[3] === true || row[3] === "TRUE" || row[3] === 1
      };
    }
  }
  return null;
}

function handleLoadDms(token) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  const session = findSessionByToken(token);
  const myEmail = session.email;

  const requestsSheet = getSheet(SHEET_DM_REQUESTS);
  const requestsData = requestsSheet.getDataRange().getValues();
  const incomingRequests = [];

  for (let i = 1; i < requestsData.length; i++) {
    const row = requestsData[i];
    if (row[2].toLowerCase() === myEmail.toLowerCase() && row[4] === "pending") {
      const fromUser = findUserByEmail(row[1]);
      incomingRequests.push({
        requestId: i + 1,
        method: row[3],
        display: row[3] === "number" ? row[1].split("@")[0] : (fromUser ? fromUser.username : "Unknown")
      });
    }
  }

  return {
    success: true,
    requests: incomingRequests,
    contacts: getDmContactsList(myEmail)
  };
}

function getDmContactsList(myEmail) {
  const sheet = getSheet(SHEET_DM_CONTACTS);
  const data = sheet.getDataRange().getValues();
  const contacts = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const userA = row[1];
    const userB = row[2];

    if (!userA || !userB) continue;
    if (userA.toLowerCase() !== myEmail.toLowerCase() && userB.toLowerCase() !== myEmail.toLowerCase()) continue;

    const iAmA = userA.toLowerCase() === myEmail.toLowerCase();
    const otherEmail = iAmA ? userB : userA;
    const method = row[3];
    const consentA = row[4] === true || row[4] === "TRUE";
    const consentB = row[5] === true || row[5] === "TRUE";
    const bothConsented = consentA && consentB;
    const myConsent = iAmA ? consentA : consentB;

    const otherUser = findUserByEmail(otherEmail);
    const otherNumber = otherEmail.split("@")[0];
    const otherUsername = otherUser ? otherUser.username : "Unknown";

    let display = method === "number" ? otherNumber : otherUsername;
    let revealedExtra = null;

    if (bothConsented) {
      revealedExtra = method === "number" ? otherUsername : otherNumber;
    }

    contacts.push({
      contactId: i + 1,
      display: display,
      revealedExtra: revealedExtra,
      method: method,
      shareConsented: bothConsented,
      myConsent: myConsent
    });
  }

  return contacts;
}

function handleRespondDmRequest(token, requestId, accept) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  const session = findSessionByToken(token);
  const sheet = getSheet(SHEET_DM_REQUESTS);
  const row = sheet.getRange(requestId, 1, 1, 5).getValues()[0];

  if (!row[2] || row[2].toLowerCase() !== session.email.toLowerCase()) {
    return { success: false, message: "Not your request." };
  }

  if (row[4] === "declined") {
    return { success: true };
  }

  if (!accept) {

    if (row[4] === "accepted") {
      return { success: true };
    }

    sheet.getRange(requestId, 5).setValue("declined");
    return { success: true };

  }

  if (row[4] === "accepted") {
    return { success: true };
  }

  sheet.getRange(requestId, 5).setValue("accepted");

  if (!dmContactExists(row[1], row[2])) {
    const contactsSheet = getSheet(SHEET_DM_CONTACTS);
    contactsSheet.appendRow([new Date(), row[1], row[2], row[3], false, false]);
  }

  return { success: true };
}

function handleRequestShareIdentity(token, contactId) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  const session = findSessionByToken(token);
  const sheet = getSheet(SHEET_DM_CONTACTS);
  const row = sheet.getRange(contactId, 1, 1, 6).getValues()[0];

  if (row[1].toLowerCase() === session.email.toLowerCase()) {
    sheet.getRange(contactId, 5).setValue(true);
  } else if (row[2].toLowerCase() === session.email.toLowerCase()) {
    sheet.getRange(contactId, 6).setValue(true);
  } else {
    return { success: false, message: "Not your contact." };
  }

  return { success: true };
}

function handleGetDmMessages(token, contactId) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  const session = findSessionByToken(token);
  const contactsSheet = getSheet(SHEET_DM_CONTACTS);
  const contactRow = contactsSheet.getRange(contactId, 1, 1, 6).getValues()[0];

  if (contactRow[1].toLowerCase() !== session.email.toLowerCase() && contactRow[2].toLowerCase() !== session.email.toLowerCase()) {
    return { success: false, message: "Not your contact." };
  }

  const sheet = getSheet(SHEET_DM_MESSAGES);
  const data = sheet.getDataRange().getValues();
  const messages = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (Number(row[1]) !== Number(contactId)) continue;

    messages.push({
      fromMe: row[2].toLowerCase() === session.email.toLowerCase(),
      message: row[3],
      attachmentUrl: row[4],
      attachmentType: row[5],
      timestamp: row[0]
    });
  }

  return { success: true, messages: messages };
}

function handleSendDmMessage(token, contactId, message, attachmentUrl, attachmentType) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  if (!message && !attachmentUrl) return { success: false, message: "Empty message." };
  if (attachmentType === "video") return { success: false, message: "Videos aren't allowed in DMs." };

  const session = findSessionByToken(token);
  const contactsSheet = getSheet(SHEET_DM_CONTACTS);
  const contactRow = contactsSheet.getRange(contactId, 1, 1, 6).getValues()[0];

  if (contactRow[1].toLowerCase() !== session.email.toLowerCase() && contactRow[2].toLowerCase() !== session.email.toLowerCase()) {
    return { success: false, message: "Not your contact." };
  }

  getSheet(SHEET_DM_MESSAGES).appendRow([
    new Date(),
    contactId,
    session.email,
    message || "",
    attachmentUrl || "",
    attachmentType || ""
  ]);

  return { success: true };
}

function handleChangeUsername(token, newUsername) {
  const validation = handleValidateSession(token);
  if (!validation.success) return validation;

  const session = findSessionByToken(token);
  const user = findUserByEmail(session.email);
  if (!user) return { success: false, message: "User not found." };

  const trimmed = String(newUsername || "").trim();

  if (trimmed.length < 3 || trimmed.length > 20) {
    return { success: false, message: "Username must be 3-20 characters." };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { success: false, message: "Letters, numbers, and underscores only." };
  }

  const existing = findUserByUsername(trimmed);
  if (existing && existing.email.toLowerCase() !== user.email.toLowerCase()) {
    return { success: false, message: "That username is taken." };
  }

  getSheet(SHEET_USERS).getRange(user.rowIndex, 2).setValue(trimmed);
  appendLog(user.email, "USERNAME_CHANGED", trimmed, "");

  return { success: true, username: trimmed };
}

function verifyGoogleIdToken(idToken) {
  const url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(idToken);
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });

  if (response.getResponseCode() !== 200) return null;

  const claims = JSON.parse(response.getContentText());

  if (claims.aud !== CLIENT_ID) return null;
  if (claims.email_verified !== "true" && claims.email_verified !== true) return null;
  if (!claims.email) return null;

  return claims;
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet(name) {
  const sheet = getSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error("Missing sheet: " + name);
  return sheet;
}

function findUserByEmail(email) {
  const sheet = getSheet(SHEET_USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[0]).toLowerCase() === email.toLowerCase()) {
      return {
        rowIndex: i + 1,
        email: row[0],
        username: row[1],
        role: Number(row[2]),
        active: row[3] === true || row[3] === "TRUE" || row[3] === 1
      };
    }
  }
  return null;
}

function findSessionByToken(token) {
  if (!token) return null;

  const sheet = getSheet(SHEET_SESSIONS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === token) {
      return {
        rowIndex: i + 1,
        token: row[0],
        email: row[1],
        expires: new Date(row[3]).getTime()
      };
    }
  }
  return null;
}

function createSession(email) {
  const sheet = getSheet(SHEET_SESSIONS);
  const token = generateToken();
  const created = new Date();
  const expires = new Date(created.getTime() + SESSION_DURATION_MS);

  sheet.appendRow([token, email, created, expires, ""]);

  return { token: token, expires: expires };
}

function deleteSessionRow(rowIndex) {
  getSheet(SHEET_SESSIONS).deleteRow(rowIndex);
}

function appendLog(email, action, details, ip) {
  getSheet(SHEET_LOGS).appendRow([new Date(), email, action, details, ip || ""]);
}

function generateToken() {
  return Utilities.getUuid() + Utilities.getUuid().replace(/-/g, "");
}

function expireOldSessions() {
  const sheet = getSheet(SHEET_SESSIONS);
  const data = sheet.getDataRange().getValues();
  const now = Date.now();

  for (let i = data.length - 1; i >= 1; i--) {
    const expires = new Date(data[i][3]).getTime();
    if (now > expires) {
      sheet.deleteRow(i + 1);
    }
  }
}

function setupSheets() {
  const ss = getSpreadsheet();

  createSheetIfMissing(ss, SHEET_USERS, ["Email", "Username", "Role", "Active"]);
  createSheetIfMissing(ss, SHEET_LOGS, ["Timestamp", "Email", "Action", "Details", "IP"]);
  createSheetIfMissing(ss, SHEET_REQUESTS, ["Timestamp", "Email", "Name", "Status"]);
  createSheetIfMissing(ss, SHEET_SESSIONS, ["Token", "Email", "Created", "Expires", "IP"]);
  createSheetIfMissing(ss, SHEET_GAME_REQUESTS, ["Timestamp", "Email", "Name", "URL"]);
  createSheetIfMissing(ss, SHEET_GAMES, ["Name", "URL", "Internal", "Rating"]);
  createSheetIfMissing(ss, SHEET_CHAT, ["Timestamp", "Email", "Username", "Role", "Message", "AttachmentURL", "AttachmentType", "LoveCount", "HeartCount"]);
  createSheetIfMissing(ss, SHEET_DM_REQUESTS, ["Timestamp", "FromEmail", "ToEmail", "Method", "Status"]);
  createSheetIfMissing(ss, SHEET_DM_CONTACTS, ["Timestamp", "UserA", "UserB", "Method", "ShareConsentA", "ShareConsentB"]);
  createSheetIfMissing(ss, SHEET_DM_MESSAGES, ["Timestamp", "ContactId", "FromEmail", "Message", "AttachmentURL", "AttachmentType"]);

  seedDefaultGames(ss);
}

function seedDefaultGames(ss) {
  const sheet = ss.getSheetByName(SHEET_GAMES);
  if (sheet.getLastRow() > 1) return;

  sheet.appendRow(["Geometry Dash", "home/apps/geometry-dash", 1, 0]);
  sheet.appendRow(["Merge Fellas", "home/apps/merge-fellas", 1, 0]);
  sheet.appendRow(["Merge Fruits", "home/apps/merge-fruits", 1, 0]);
}

function createSheetIfMissing(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

## End of google apps script
