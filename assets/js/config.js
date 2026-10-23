/* =====================================================================
   WEDDING SITE CONFIG  —  edit this file, nothing else, for the basics.
   ===================================================================== */
window.WEDDING_CONFIG = {

  /* ---- When the countdown counts down to (local time, 24h clock) ---- */
  weddingDate: '2026-12-12T16:00:00',   // ceremony, Sat 12 Dec 4:00 pm

  /* ---- Where RSVPs are saved -----------------------------------------
     Replies go straight into the Wedding HQ planner's database (Firebase
     project "sanchari-suvodeep-wedding") and appear in its RSVP inbox on
     the Guests tab. These two values only identify the project; they are
     not secrets. The database's security rules decide what's allowed:
     anyone can add a reply, nobody outside the planner can read them.
  ------------------------------------------------------------------- */
  rsvpStore: {
    projectId: 'sanchari-suvodeep-wedding',
    apiKey: 'AIzaSyBn87xwduHNH_0zZuLRL1wfjcmoOinukG0'
  },

  /* ---- Shown to guests if a reply can't be sent ---------------------- */
  contactEmail: 'suvodeep.majumder90@gmail.com',

  /* ---- Deadline shown on the RSVP card ------------------------------ */
  rsvpDeadline: 'November 1, 2026',

  /* ---- Background music ---------------------------------------------
     Drop an .mp3 at assets/audio/ambient.mp3 and it just works.
     If the file isn't there, the music button hides itself automatically.
     Always starts muted — browsers block autoplay, and guests hate it.
  ------------------------------------------------------------------- */
  audioSrc: 'assets/audio/ambient.mp3',
  audioVolume: 0.35
};
