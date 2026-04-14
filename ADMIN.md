# Go Turkmenistan — Admin Panel Guide

The admin panel lives at `/admin`. It is a Next.js App Router application with
JWT-based authentication and file-system content persistence.

---

## Table of Contents

1. [Logging in](#1-logging-in)
2. [Logging out](#2-logging-out)
3. [Editing section content](#3-editing-section-content)
4. [Uploading images](#4-uploading-images)
5. [Changing your password](#5-changing-your-password)
6. [Forgot your password? (reset via env var)](#6-forgot-your-password)
7. [Downloading a backup](#7-downloading-a-backup)
8. [Adding a new section](#8-adding-a-new-section)
9. [Adding a new field to an existing section](#9-adding-a-new-field-to-an-existing-section)
10. [Configuring recommended image sizes](#10-configuring-recommended-image-sizes)
11. [Security notes](#11-security-notes)

---

## 1. Logging in

1. Open `/admin` in your browser — you will be redirected to `/admin/login`.
2. Enter the username and password configured in `.env.local`.
3. The session lasts **8 hours**; after that you are automatically signed out.

Default credentials (set during setup):

```
Username: admin
Password: (the one you chose when generating the hash)
```

> **Rate limit:** Five failed attempts within 60 seconds will temporarily block
> login from that IP. The error message includes how many seconds remain.

---

## 2. Logging out

Click the **Sign out** button in the header or the icon at the bottom of the
sidebar. Your session cookie is cleared immediately.

---

## 3. Editing section content

1. Click a section in the left sidebar (e.g. **Hero**, **Events**).
2. Edit any field in the form. Text fields are live-editable; array items can
   be expanded/collapsed individually or all at once.
3. **Save:** click the **Save** button or press **⌘S** (Mac) / **Ctrl+S** (Windows).
4. **Preview:** click the **Preview** button to open the live site in a new tab.
5. **Discard:** click **Cancel** to revert all unsaved changes (you will be asked
   to confirm).

A red banner appears at the top whenever there are unsaved changes. Closing or
navigating away from the browser tab while there are unsaved changes will
trigger a browser warning.

---

## 4. Uploading images

Image fields display a drag-and-drop upload zone instead of a plain text input.

1. Drag an image onto the zone, or click **Browse** to open the file picker.
2. The uploader validates:
   - **Format** (jpg, png, webp — exact formats depend on the field spec).
   - **File size** against the per-field maximum (e.g. 5 MB for the hero banner).
   - **Dimensions**: a **yellow warning** appears if the image dimensions differ
     from the recommended size. The upload still works — it is a warning, not a
     block.
3. Check **"Optimise on upload"** to have the server convert the image to WebP
   at ~85% quality. This reduces file size noticeably for jpg/png sources.
4. Click **Upload**. The image is saved to `/public/uploads/<section>/` and the
   content JSON is updated automatically. No additional "Save" click is needed
   for image changes.

Original site images live in `/public/images/` and are never deleted by the
admin. Uploaded replacements go into `/public/uploads/`.

---

## 5. Changing your password

1. Go to **Settings** in the sidebar.
2. Fill in **Current Password**, **New Password**, and **Confirm**.
3. The strength indicator updates as you type (Weak → Fair → Good → Strong).
4. Minimum requirements: 8 characters, one uppercase, one lowercase, one number.
5. Click **Change Password** and confirm the modal.
6. You will be signed out immediately. Log in again with your new password.

The new hash is stored in `content/.auth.json` (git-ignored) and also patched
into `.env.local` if it is writable (local development).

---

## 6. Forgot your password?

### Option A — overwrite the hash in `.env.local` (local development)

1. Generate a new bcrypt hash:

   ```bash
   node -e "const b=require('bcryptjs'); b.hash('newpassword', 12).then(console.log)"
   ```

2. Open `.env.local` and replace the value of `ADMIN_PASSWORD_HASH`:

   ```
   ADMIN_PASSWORD_HASH=$2b$12$<your new hash here>
   ```

3. **Delete `content/.auth.json`** if it exists — it takes priority over the
   env var, so removing it forces the system to read from `.env.local` again.

4. Restart the dev server: `npm run dev`.

### Option B — delete `content/.auth.json` (hosted environments)

On a hosted server where you can access the filesystem, delete
`content/.auth.json`. The system falls back to `ADMIN_PASSWORD_HASH` in the
environment variables. Update that variable in your hosting dashboard and
restart the server.

---

## 7. Downloading a backup

Go to **Settings → Site → Download** to download a ZIP archive containing:

- All content JSON files from `/content/` (excluding `.auth.json`).
- All uploaded images from `/public/uploads/`.

The archive is named `goturkmenistan-backup-YYYY-MM-DD.zip`.

---

## 8. Adding a new section

1. **Create the content JSON file** at `content/<sectionkey>.json` with your
   initial data structure.

2. **Create or update the frontend component** in `src/components/` to import
   from the new JSON file.

3. **Register the section** in two places:

   - `src/app/admin/sections/[section]/page.tsx` — add an entry to
     `SECTION_META`:
     ```ts
     mynewsection: {
       label: "My New Section",
       description: "Short description.",
       preview: "/#mynewsection",
     },
     ```

   - `src/components/admin/AdminShell.tsx` — add to `NAV_SECTIONS`:
     ```ts
     { label: "My New Section", href: "/admin/sections/mynewsection", icon: SomeIcon },
     ```

   - `src/components/admin/ContentForm.tsx` — add to `SECTION_ICONS`:
     ```ts
     mynewsection: SomeIcon,
     ```

4. **Register the section in the upload and content API routes:**

   - `src/app/api/admin/content/[section]/route.ts` — add `"mynewsection"` to
     `ALLOWED_SECTIONS`.
   - `src/app/api/admin/upload/route.ts` — add `"mynewsection"` to
     `ALLOWED_SECTIONS`.

5. **Add image specs** (if the section has image fields) in
   `content/image-specs.json` under a `"mynewsection"` key (see §10).

---

## 9. Adding a new field to an existing section

1. Open `content/<section>.json` and add the new field with a default value:
   ```json
   {
     "existingField": "...",
     "myNewTextField": "Default value"
   }
   ```

2. That's it for the admin — the form generator picks up all fields from the
   JSON automatically. String fields become text inputs, long strings become
   textareas, image paths become upload zones, booleans become checkboxes, and
   numbers become number inputs.

3. Update the **frontend component** that reads the JSON to use the new field.

> **Image fields** are detected automatically if the key name starts with
> `image`, `img`, `src`, `icon`, `thumbnail`, `screenshot`, `video`, `bg`, or
> `backgroundImage`, **or** if the value starts with `/images/`, `/videos/`, or
> `/uploads/`. If your new image field has a different name, prefix it with one
> of the above.

---

## 10. Configuring recommended image sizes

Open `content/image-specs.json`. Each entry maps a **section key** →
**field-path pattern** → **spec object**:

```json
{
  "hero": {
    "backgroundImage": {
      "recommendedWidth": 1920,
      "recommendedHeight": 1080,
      "maxFileSizeMB": 5,
      "allowedFormats": ["jpg", "jpeg", "png", "webp"],
      "description": "Full-screen hero banner (landscape)"
    }
  },
  "events": {
    "events.*.image": {
      "recommendedWidth": 600,
      "recommendedHeight": 400,
      "maxFileSizeMB": 2,
      "allowedFormats": ["jpg", "jpeg", "png", "webp"],
      "description": "Event card image (landscape 3:2)"
    }
  }
}
```

Use `*` in the field path to match any array index (e.g. `images.*.src` matches
`images.0.src`, `images.1.src`, etc.).

Fields:

| Field              | Type       | Description                                              |
|--------------------|------------|----------------------------------------------------------|
| `recommendedWidth` | `number`   | Pixels. Shown as a hint; mismatch shows a yellow warning |
| `recommendedHeight`| `number`   | Pixels.                                                  |
| `maxFileSizeMB`    | `number`   | Upload is blocked if exceeded                            |
| `allowedFormats`   | `string[]` | Upload is blocked if format not in list                  |
| `description`      | `string`   | Shown in the upload zone                                 |

---

## 11. Security notes

| Measure | Details |
|---|---|
| Rate limiting | Login: max 5 attempts / 60 s per IP (in-memory; resets on server restart) |
| Password storage | bcrypt 12 rounds; hash stored in `content/.auth.json` (git-ignored) |
| Session | HTTP-only JWT cookie, 8-hour TTL, `sameSite: lax` |
| Input validation | Zod schemas on all auth API routes |
| CSRF | Mitigated by `sameSite: lax` + JSON `Content-Type` requirement |
| Clickjacking | `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` on all `/admin` routes |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Dark mode | Forced light via `<meta name="color-scheme" content="light">` |
| Uploads | Saved to `/public/uploads/` (git-ignored); originals in `/public/images/` are never modified |
| `.auth.json` | Git-ignored. Contains bcrypt hash only. Never commit this file. |
