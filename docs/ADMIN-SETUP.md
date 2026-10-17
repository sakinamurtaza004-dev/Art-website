# Connect the studio admin to a database (about 10 minutes, one time)

Until this is done, the shop shows the sample pieces and the admin page can't sign in.
Once it's done, anything you upload in the admin appears on the website for every visitor straight away.

The database is **Supabase** (free plan is plenty for a shop like this). It stores the listings and the photos.

## 1. Create the project
1. Go to **supabase.com** and sign up (GitHub sign-in is fine).
2. Click **New project**. Name it `sakina-art-blog`, choose a region near you (e.g. *Mumbai*), set a database password (save it somewhere), click **Create**.
3. Wait about two minutes while it starts.

## 2. Create the tables and the photo bucket
1. In the left menu open **SQL Editor** → **New query**.
2. Open `supabase/setup.sql` from this project, copy everything, paste it in, and click **Run**.
   You should see "Success. No rows returned".

## 3. Create your admin login
1. Left menu → **Authentication** → **Users** → **Add user** → *Create new user*.
2. Email: `sakinamurtaza004@gmail.com` (this must match `adminEmail` in `js/config.js` and the email in `setup.sql`).
3. Password: choose the password you'll use in the studio. **Tick "Auto Confirm User"**, then create.
4. Left menu → **Authentication** → **Sign In / Providers** (or *Settings*) → turn **OFF "Allow new users to sign up"**, so nobody else can create accounts.

## 4. Connect the website
1. Left menu → **Project Settings** (gear) → **API**.
2. Copy the **Project URL** and the **anon public** key (a long text that starts with `eyJ`, or a key starting `sb_publishable_`).
3. Paste them into `js/config.js`:
   ```js
   supabaseUrl: "https://xxxxxxxx.supabase.co",
   supabaseKey: "eyJ...your anon public key...",
   ```
   The anon key is designed to be public. **Never** paste the `service_role` key anywhere in the website files.

## 5. Use it
1. Open the website → click the **settings (⚙) icon** beside the cart.
2. Username `sakina_artblog` + the password you set in step 3.
3. **Add New** → choose photos → **Next** → fill in the details → **Upload listing**. It is in the shop immediately.

## Good to know
- Free Supabase projects **pause after about a week with no activity**. Visits to the shop count as activity; if it ever pauses, open the dashboard and click *Restore*.
- Photos are shrunk on your device before uploading (max 1600 px), so they load fast and use little storage.
- To change the admin email, change it in `js/config.js` **and** in the 8 places in `supabase/setup.sql`, then run the SQL again.
