/* =====================================================================
   WEDDING SITE CONFIG  —  edit this file, nothing else, for the basics.
   ===================================================================== */
window.WEDDING_CONFIG = {

  /* ---- When the countdown counts down to (local time, 24h clock) ---- */
  weddingDate: '2026-12-12T16:00:00',   // ceremony, Sat 12 Dec 4:00 pm

  /* ---- Where Request Booth entries are saved --------------------------
     Songs, suggestions and wishes go straight into the Wedding HQ
     planner's database (Firebase project "sanchari-suvodeep-wedding") and
     appear in its Requests inbox. (RSVPs are closed.) These two values only
     identify the project; they are not secrets. The database's security
     rules decide what's allowed: anyone can add an entry, nobody outside
     the planner can read them. Previews on localhost never save.
  ------------------------------------------------------------------- */
  rsvpStore: {
    projectId: 'sanchari-suvodeep-wedding',
    apiKey: 'AIzaSyBn87xwduHNH_0zZuLRL1wfjcmoOinukG0'
  },

  /* ---- The photo booth ------------------------------------------------
     Guests share photos from Dec 11 (lodge time), only after scanning one of
     the QR signs at the lodge (the QR carries a code; without it the page
     just asks them to scan one). Photos go to the wedding's Google Drive
     through the Wedding HQ service; the service checks the code and dates
     too, so editing this file can't open it early.
  ------------------------------------------------------------------- */
  photoBooth: {
    opens: '2026-12-11',
    closes: '2026-12-21',
    api: 'https://wedding-hq-api.sanchari-suvodeep.workers.dev'
  },

  /* ---- Shown to guests if a reply can't be sent ---------------------- */
  contactEmail: 'suvodeep.majumder90@gmail.com',

  /* ---- Song ideas for the Request Booth's record crate ---------------
     Each one shows as an album sleeve under the song card; tapping it
     fills in the song. Styles: country, pop, hindi, bengali.
     [style, title, artist]. Add or remove freely.
  ------------------------------------------------------------------- */
  songIdeas: [
    ['country', 'Tennessee Whiskey', 'Chris Stapleton'],
    ['country', 'Friends in Low Places', 'Garth Brooks'],
    ['country', 'Wagon Wheel', 'Darius Rucker'],
    ['country', 'Jolene', 'Dolly Parton'],
    ['country', '9 to 5', 'Dolly Parton'],
    ['country', 'Rocky Top', 'The Osborne Brothers'],
    ['country', 'Take Me Home, Country Roads', 'John Denver'],
    ['country', 'Before He Cheats', 'Carrie Underwood'],
    ['country', 'Die a Happy Man', 'Thomas Rhett'],
    ['country', 'Chicken Fried', 'Zac Brown Band'],
    ['country', 'Man! I Feel Like a Woman!', 'Shania Twain'],
    ['country', 'Neon Moon', 'Brooks & Dunn'],
    ['country', 'Boot Scootin’ Boogie', 'Brooks & Dunn'],
    ['country', 'Fishin’ in the Dark', 'Nitty Gritty Dirt Band'],
    ['country', 'Chattahoochee', 'Alan Jackson'],
    ['country', 'Mountain Music', 'Alabama'],
    ['country', 'Islands in the Stream', 'Kenny Rogers & Dolly Parton'],
    ['country', 'Forever and Ever, Amen', 'Randy Travis'],
    ['country', 'I Hope You Dance', 'Lee Ann Womack'],
    ['country', 'Strawberry Wine', 'Deana Carter'],
    ['country', 'Cruise', 'Florida Georgia Line'],
    ['country', 'Body Like a Back Road', 'Sam Hunt'],
    ['country', 'Beautiful Crazy', 'Luke Combs'],
    ['country', 'Fast Car', 'Luke Combs'],
    ['country', 'Speechless', 'Dan + Shay'],
    ['country', '10,000 Hours', 'Dan + Shay & Justin Bieber'],
    ['country', 'Something in the Orange', 'Zach Bryan'],
    ['country', 'Gunpowder & Lead', 'Miranda Lambert'],
    ['country', 'Achy Breaky Heart', 'Billy Ray Cyrus'],
    ['country', 'Cotton Eye Joe', 'Rednex'],
    ['pop', 'Uptown Funk', 'Mark Ronson ft. Bruno Mars'],
    ['pop', 'Shut Up and Dance', 'Walk the Moon'],
    ['pop', 'Dancing Queen', 'ABBA'],
    ['pop', 'I Wanna Dance with Somebody', 'Whitney Houston'],
    ['pop', 'Shake It Off', 'Taylor Swift'],
    ['pop', 'Perfect', 'Ed Sheeran'],
    ['pop', 'Can’t Stop the Feeling!', 'Justin Timberlake'],
    ['pop', 'September', 'Earth, Wind & Fire'],
    ['pop', 'Marry You', 'Bruno Mars'],
    ['pop', 'Levitating', 'Dua Lipa'],
    ['pop', 'Love Story', 'Taylor Swift'],
    ['pop', 'Mr. Brightside', 'The Killers'],
    ['pop', 'Single Ladies', 'Beyoncé'],
    ['pop', 'Macarena', 'Los del Río'],
    ['pop', 'Don’t Stop Me Now', 'Queen'],
    ['pop', 'Sweet Caroline', 'Neil Diamond'],
    ['pop', 'Livin’ on a Prayer', 'Bon Jovi'],
    ['pop', 'Wake Me Up Before You Go-Go', 'Wham!'],
    ['pop', 'Celebration', 'Kool & The Gang'],
    ['pop', 'Shout', 'The Isley Brothers'],
    ['pop', 'Hey Ya!', 'OutKast'],
    ['pop', 'Crazy in Love', 'Beyoncé ft. Jay-Z'],
    ['pop', 'Love On Top', 'Beyoncé'],
    ['pop', 'Valerie', 'Mark Ronson ft. Amy Winehouse'],
    ['pop', 'Wannabe', 'Spice Girls'],
    ['pop', 'Blinding Lights', 'The Weeknd'],
    ['pop', 'Don’t Start Now', 'Dua Lipa'],
    ['pop', 'Dynamite', 'BTS'],
    ['pop', 'Good as Hell', 'Lizzo'],
    ['pop', 'Thinking Out Loud', 'Ed Sheeran'],
    ['pop', 'All of Me', 'John Legend'],
    ['pop', 'A Thousand Years', 'Christina Perri'],
    ['pop', 'Y.M.C.A.', 'Village People'],
    ['hindi', 'Kesariya', 'Arijit Singh'],
    ['hindi', 'London Thumakda', 'Labh Janjua, Sonu Kakkar & Neha Kakkar'],
    ['hindi', 'Gallan Goodiyaan', 'Dil Dhadakne Do'],
    ['hindi', 'Badtameez Dil', 'Benny Dayal'],
    ['hindi', 'Tum Hi Ho', 'Arijit Singh'],
    ['hindi', 'Mehendi Laga Ke Rakhna', 'Lata Mangeshkar & Udit Narayan'],
    ['hindi', 'Kala Chashma', 'Badshah'],
    ['hindi', 'Nachde Ne Saare', 'Jasleen Royal'],
    ['hindi', 'Din Shagna Da', 'Jasleen Royal'],
    ['hindi', 'Raataan Lambiyan', 'Jubin Nautiyal & Asees Kaur'],
    ['hindi', 'Gerua', 'Arijit Singh'],
    ['hindi', 'Desi Girl', 'Shankar Mahadevan'],
    ['hindi', 'Balam Pichkari', 'Vishal Dadlani & Shalmali Kholgade'],
    ['hindi', 'Bole Chudiyan', 'Udit Narayan, Alka Yagnik & Sonu Nigam'],
    ['hindi', 'Say Shava Shava', 'Sunidhi Chauhan, Udit Narayan & Alka Yagnik'],
    ['hindi', 'Chaiyya Chaiyya', 'Sukhwinder Singh & Sapna Awasthi'],
    ['hindi', 'Kajra Re', 'Shankar Mahadevan, Alisha Chinai & Javed Ali'],
    ['hindi', 'Tujh Mein Rab Dikhta Hai', 'Roop Kumar Rathod'],
    ['hindi', 'Ainvayi Ainvayi', 'Salim Merchant & Sunidhi Chauhan'],
    ['hindi', 'Gal Mitthi Mitthi', 'Tochi Raina'],
    ['hindi', 'Tenu Leke', 'Sonu Nigam & Mahalakshmi Iyer'],
    ['hindi', 'Senorita', 'Farhan Akhtar, Hrithik Roshan & Abhay Deol'],
    ['hindi', 'Nagada Sang Dhol', 'Shreya Ghoshal & Osman Mir'],
    ['hindi', 'Malhari', 'Vishal Dadlani'],
    ['hindi', 'Kar Gayi Chull', 'Badshah & Neha Kakkar'],
    ['hindi', 'The Breakup Song', 'Arijit Singh, Badshah & Jonita Gandhi'],
    ['hindi', 'Morni Banke', 'Guru Randhawa & Neha Kakkar'],
    ['hindi', 'Zingaat', 'Ajay-Atul'],
    ['hindi', 'Sauda Khara Khara', 'Diljit Dosanjh & Dhvani Bhanushali'],
    ['hindi', 'Jhoome Jo Pathaan', 'Arijit Singh & Sukriti Kakar'],
    ['hindi', 'What Jhumka?', 'Arijit Singh & Jonita Gandhi'],
    ['hindi', 'Chaleya', 'Arijit Singh & Shilpa Rao'],
    ['bengali', 'Tumi Robe Nirobe', 'Rabindra Sangeet'],
    ['bengali', 'Ekla Cholo Re', 'Rabindra Sangeet'],
    ['bengali', 'Pagla Hawar Badol Dine', 'Rabindra Sangeet'],
    ['bengali', 'Coffee Houser Sei Addata', 'Manna Dey'],
    ['bengali', 'Amake Amar Moto Thakte Dao', 'Anupam Roy'],
    ['bengali', 'Mon Majhi Re', 'Arijit Singh'],
    ['bengali', 'Tomake Chai', 'Arijit Singh'],
    ['bengali', 'Bojhena Shey Bojhena', 'Arijit Singh'],
    ['bengali', 'Purano Sei Diner Kotha', 'Rabindra Sangeet'],
    ['bengali', 'Aaj Jyotsna Raate Sobai Geche Bone', 'Rabindra Sangeet'],
    ['bengali', 'Mayabono Biharini', 'Rabindra Sangeet'],
    ['bengali', 'Esho Shyamalo Sundaro', 'Rabindra Sangeet'],
    ['bengali', 'Phagun Haway Haway', 'Rabindra Sangeet'],
    ['bengali', 'Ei Path Jodi Na Sesh Hoy', 'Hemanta Mukherjee & Sandhya Mukhopadhyay'],
    ['bengali', 'Ei Raat Tomar Amar', 'Hemanta Mukherjee'],
    ['bengali', 'Ke Prothom Kache Esechi', 'Manna Dey & Lata Mangeshkar'],
    ['bengali', 'Lilabali Lilabali', 'Wedding folk song'],
    ['bengali', 'Holud Bato Mehendi Bato', 'Wedding folk song'],
    ['bengali', 'Bhromor Koio Giya', 'Folk (Radharaman Dutta)'],
    ['bengali', 'Lal Paharir Deshe Ja', 'Bengali folk']
  ],

  /* ---- Ideas for the suggestion and wish tiles ------------------------
     [group, the card's title, what gets filled in].
  ------------------------------------------------------------------- */
  boothIdeas: {
    suggestion: [
      ['games', 'Board games night', 'A fireside board games night (bring your favorite!).'],
      ['games', 'Karaoke night', 'Karaoke night in the lodge. Duets mandatory.'],
      ['games', 'Antakshari', 'A round of antakshari after dinner.'],
      ['games', 'Couple trivia', 'A "how well do you know the couple" trivia game.'],
      ['games', 'Pool tournament', 'A pool tournament with a very silly trophy.'],
      ['games', 'Poker night', 'A friendly poker night (pennies only).'],
      ['food', 'S’mores bar', 'A s’mores bar at the fire pit.'],
      ['food', 'Pancake breakfast', 'A big pancake breakfast on Sunday morning.'],
      ['food', 'All-day chai', 'A chai station that stays open all day.'],
      ['food', 'Mishti night', 'A Bengali sweets (mishti) tasting night.'],
      ['food', 'Tennessee BBQ', 'A proper Tennessee barbecue.'],
      ['food', 'Hot cocoa bar', 'A hot cocoa bar for the cold evenings.'],
      ['outdoors', 'Sunrise hike', 'A sunrise hike to watch the mist lift off the Smokies.'],
      ['outdoors', 'Waterfall walk', 'A waterfall walk in the national park.'],
      ['outdoors', 'Stargazing', 'Stargazing from the deck on a clear night.'],
      ['outdoors', 'Big group photo', 'A big group photo with the mountains behind us.'],
      ['outdoors', 'Snowball fight', 'If it snows: a snowball fight!'],
      ['outdoors', 'SkyBridge trip', 'A trip to the Gatlinburg SkyBridge.'],
      ['traditions', 'Wishing tree', 'A wishing tree where everyone hangs a note for the two of you.'],
      ['traditions', 'Ring-finding game', 'The ring-finding game from Bengali weddings.'],
      ['traditions', 'Fireside toasts', 'Toasts and stories around the fire.'],
      ['traditions', 'Time capsule', 'A time capsule to open on your 10th anniversary.'],
      ['traditions', 'Polaroid guestbook', 'A polaroid guestbook.'],
      ['traditions', 'Dance-off', 'A family vs. friends dance-off.']
    ],
    wish: [
      ['blessing', 'Endless adventures', 'Wishing you a lifetime of adventures together.'],
      ['blessing', 'A home full of laughter', 'May your home always be full of laughter.'],
      ['blessing', 'Love that grows', 'May your love grow deeper every single year.'],
      ['blessing', 'Shubho Bibaho!', 'Shubho Bibaho! Wishing you both a lifetime of happiness.'],
      ['blessing', 'Best friends', 'May you always be each other’s best friend.'],
      ['advice', 'Never go to bed angry', 'Never go to bed angry. Stay up and talk it out.'],
      ['advice', 'Date nights forever', 'Keep the date nights going, forever.'],
      ['advice', 'Say thank you', 'Say thank you for the small things, every day.'],
      ['advice', 'Share dessert', 'Always share dessert.'],
      ['advice', 'Kitchen dancing', 'Never stop dancing in the kitchen.'],
      ['prediction', 'First dance', 'Prediction: the first dance turns into a full Bollywood number.'],
      ['prediction', 'Happy tears', 'Prediction: someone cries before the vows even start.'],
      ['prediction', 'Aunties rule', 'Prediction: the aunties own the dance floor by 9 pm.'],
      ['prediction', 'A dog by 2028', 'Prediction: there’s a dog in the family within two years.'],
      ['prediction', 'Snow on cue', 'Prediction: it snows right on cue for the photos.'],
      ['funny', 'The remote', 'May you always agree on who holds the remote.'],
      ['funny', 'The thermostat', 'May you never fight over the thermostat.'],
      ['funny', 'Stronger than Wi-Fi', 'May your love be stronger than the lodge Wi-Fi.'],
      ['funny', 'The last slice', 'May you always fight over the last slice of pizza (and then share it).']
    ]
  },

  /* ---- Background music ---------------------------------------------
     Drop an .mp3 at assets/audio/ambient.mp3 and it just works.
     If the file isn't there, the music button hides itself automatically.
     Always starts muted — browsers block autoplay, and guests hate it.
  ------------------------------------------------------------------- */
  audioSrc: 'assets/audio/ambient.mp3',
  audioVolume: 0.35
};
