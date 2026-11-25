# Sophea and Francine Dale Wedding Invitation

Standalone React and Vite wedding invitation. The current Vite configuration builds for the domain root (`base: "/"`).

## Run locally

1. Install dependencies with `npm install`.
2. Start the preview with `npm run dev`.

If the site will be served beneath a URL subpath, update the Vite base and the root-relative CSS image, font, preload, and RSVP API URLs together, then verify the host's routing. The current build is intended for a domain root.

## Content status

The first site draft uses the supplied names, date, ceremony and reception information, attire palette, guest rules, gift note, entourage list, and ten supplied couple photos. The love story paragraph is drafted from the short client wording.

Before launch, confirm the RSVP deadline, reserved seat count, map pins, the names and pairings in the principal sponsor list, and the exact reception venue name. The RSVP form supports up to five guest names and an optional message per response; it writes one row per guest through a Vercel server function and Google Apps Script. Follow [RSVP_SETUP.md](RSVP_SETUP.md) to deploy and configure the private spreadsheet integration. Background music is included in `public/music` and starts after the guest opens the invitation.
