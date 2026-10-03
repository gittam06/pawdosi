/**
 * Seeds a demo dataset: owners, pets, posts, follows, likes, comments and a
 * Lost & Found board.
 *
 *   npm run seed           # add demo data
 *   npm run seed -- --reset   # remove previous demo data first
 *
 * Run with Node's own TypeScript support and --env-file, so there is no build
 * step and no extra dependency.
 *
 * This is the one place the service role key is used: it bypasses RLS, which
 * is exactly what seeding needs and exactly why it must never be imported by
 * anything under src/.
 */

import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";

// --- configuration ----------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run with --env-file=.env.local.",
  );
  process.exit(1);
}

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error(
    "Missing Cloudinary credentials. Run with --env-file=.env.local.",
  );
  process.exit(1);
}

/** Every seeded account uses this domain, which is how --reset finds them. */
const SEED_DOMAIN = "pawpals-demo.local";
const SEED_PASSWORD = "PawPals!Demo-2026";

/**
 * Source images. Lorem Picsum is deterministic per seed and licence-free.
 * Point this at real pet photography for a portfolio screenshot run — nothing
 * else in the script needs to change.
 */
const sourceImage = (seed: string, size = 900) =>
  `https://picsum.photos/seed/${seed}/${size}/${size}`;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

// --- demo content -----------------------------------------------------------

type SeedPet = {
  name: string;
  species: "dog" | "cat" | "bird" | "rabbit" | "other";
  breed: string | null;
  birthDate: string | null;
  gender: "male" | "female" | "unknown";
  bio: string;
  posts: string[];
};

type SeedOwner = {
  username: string;
  displayName: string;
  city: string;
  bio: string;
  pets: SeedPet[];
};

const OWNERS: SeedOwner[] = [
  {
    username: "aarav_s",
    displayName: "Aarav Sharma",
    city: "Bengaluru",
    bio: "Weekend hiker. Two dogs, zero free time.",
    pets: [
      {
        name: "Bruno",
        species: "dog",
        breed: "Indie",
        birthDate: "2021-07-14",
        gender: "male",
        bio: "Rescued from a storm drain in 2021. Now rules the sofa.",
        posts: [
          "Three laps of Cubbon Park and he still had the energy to chase a squirrel home.",
          "Vet day. He knows. He always knows.",
          "Monsoon means one wet dog and one wet human.",
        ],
      },
      {
        name: "Mishti",
        species: "dog",
        breed: "Beagle",
        birthDate: "2023-02-02",
        gender: "female",
        bio: "Nose first, questions later.",
        posts: [
          "Found the treat jar. Again. We are rethinking the shelf situation.",
          "First beach trip — spent the whole time digging one enormous hole.",
        ],
      },
    ],
  },
  {
    username: "meera_n",
    displayName: "Meera Nair",
    city: "Kochi",
    bio: "Illustrator. Cat person, reluctantly also a bird person.",
    pets: [
      {
        name: "Pepper",
        species: "cat",
        breed: "Indian Billi",
        birthDate: "2020-11-30",
        gender: "female",
        bio: "Grey tabby, white chest, opinions about everything.",
        posts: [
          "She has decided my drawing board is hers between 2 and 5pm.",
          "Sunbeam acquired. Do not disturb until further notice.",
          "Six years old today and still convinced she is a kitten.",
        ],
      },
      {
        name: "Kaju",
        species: "bird",
        breed: "Budgerigar",
        birthDate: "2024-05-18",
        gender: "male",
        bio: "Learning to say his own name. Getting closer every week.",
        posts: [
          "New perch, immediately ignored in favour of the curtain rail.",
        ],
      },
    ],
  },
  {
    username: "rhea_dc",
    displayName: "Rhea D'Costa",
    city: "Mumbai",
    bio: "Fosters kittens. Currently at capacity, as always.",
    pets: [
      {
        name: "Momo",
        species: "cat",
        breed: "Persian",
        birthDate: "2022-09-09",
        gender: "male",
        bio: "Came for a weekend foster in 2022. Never left.",
        posts: [
          "Brushing session number four this week. He sheds like it is a career.",
          "Rain on the window is apparently the best television available.",
        ],
      },
    ],
  },
  {
    username: "vikram_r",
    displayName: "Vikram Reddy",
    city: "Hyderabad",
    bio: "Runs a small clinic. Adopted the first patient who refused to leave.",
    pets: [
      {
        name: "Laddoo",
        species: "dog",
        breed: "Labrador",
        birthDate: "2019-03-21",
        gender: "male",
        bio: "Seven years old, still believes every stranger is here for him.",
        posts: [
          "Clinic mascot, self-appointed. Greets every patient at the door.",
          "He has learned which drawer the biscuits live in. We have lost.",
        ],
      },
      {
        name: "Tofu",
        species: "rabbit",
        breed: null,
        birthDate: "2024-12-01",
        gender: "female",
        bio: "Small, fast, entirely in charge.",
        posts: ["Binky at 6am. Every morning. Without fail."],
      },
    ],
  },
  {
    username: "sana_q",
    displayName: "Sana Qureshi",
    city: "Delhi",
    bio: "Street feeder in Hauz Khas. Fifteen regulars and counting.",
    pets: [
      {
        name: "Chotu",
        species: "dog",
        breed: "Indie",
        birthDate: "2022-01-11",
        gender: "male",
        bio: "Was one of the street regulars until he decided otherwise.",
        posts: [
          "Winter coat season. He is deeply unimpressed by the jacket.",
          "Still does his old rounds every evening, just to check on everyone.",
        ],
      },
    ],
  },
  {
    username: "dev_m",
    displayName: "Dev Menon",
    city: "Pune",
    bio: "Photographs other people's dogs. Owns a cat.",
    pets: [
      {
        name: "Kiwi",
        species: "cat",
        breed: "Bombay",
        birthDate: "2023-08-05",
        gender: "female",
        bio: "Entirely black, entirely invisible after sundown.",
        posts: [
          "Spent ten minutes looking for her. She was on the black cushion.",
          "New camera bag, immediately repurposed as a bed.",
        ],
      },
    ],
  },
];

type SeedReport = {
  ownerIndex: number;
  type: "lost" | "found";
  status: "open" | "reunited";
  species: SeedPet["species"];
  title: string;
  description: string;
  city: string;
  locality: string;
  hoursAgo: number;
  contactNote: string;
  withPhoto: boolean;
};

const REPORTS: SeedReport[] = [
  {
    ownerIndex: 1,
    type: "lost",
    status: "open",
    species: "cat",
    title: "Grey tabby missing near Panampilly Nagar",
    description:
      "Slipped out through a balcony grill on Tuesday evening. White patch on the chest, red collar with a small bell. Very shy with strangers — please do not chase, just call and we will come.",
    city: "Kochi",
    locality: "Panampilly Nagar, 2nd Cross",
    hoursAgo: 20,
    contactNote: "WhatsApp preferred, any time of day.",
    withPhoto: true,
  },
  {
    ownerIndex: 4,
    type: "found",
    status: "open",
    species: "dog",
    title: "Found a limping indie near Hauz Khas market",
    description:
      "Brown and white, no collar, favouring the left hind leg. Very friendly and clearly used to people, so he belongs to someone. He is with me and has eaten. Can hold him for a few days.",
    city: "Delhi",
    locality: "Hauz Khas Village, near the deer park gate",
    hoursAgo: 6,
    contactNote: "Call between 9am and 9pm.",
    withPhoto: true,
  },
  {
    ownerIndex: 0,
    type: "lost",
    status: "open",
    species: "dog",
    title: "Beagle missing from Indiranagar 12th Main",
    description:
      "Tan and white beagle, answers to Mishti, wearing a blue harness. Last seen following a food cart down 12th Main on Sunday evening. She is nose-driven and will have gone wherever the smell went.",
    city: "Bengaluru",
    locality: "Indiranagar, 12th Main",
    hoursAgo: 40,
    contactNote: "Any hour. We are not sleeping much.",
    withPhoto: true,
  },
  {
    ownerIndex: 2,
    type: "found",
    status: "reunited",
    species: "cat",
    title: "Found a ginger cat in Bandra West — back home now",
    description:
      "Found sheltering under a parked car during the storm. Posted here on Thursday and his family recognised the white sock markings within the hour. Home and dry.",
    city: "Mumbai",
    locality: "Bandra West, Carter Road",
    hoursAgo: 96,
    contactNote: "No longer needed — thank you to everyone who shared.",
    withPhoto: true,
  },
  {
    ownerIndex: 3,
    type: "lost",
    status: "reunited",
    species: "rabbit",
    title: "Rabbit missing in Jubilee Hills — found next door",
    description:
      "Tofu got out through a gap in the fence. Spent two days under the neighbour's tulsi plant, entirely unbothered. Leaving this up because somebody told us to check under the plants.",
    city: "Hyderabad",
    locality: "Jubilee Hills, Road No. 36",
    hoursAgo: 150,
    contactNote: "",
    withPhoto: false,
  },
];

// --- helpers ----------------------------------------------------------------

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 3_600_000).toISOString();

function log(step: string): void {
  console.log(`  ${step}`);
}

/** Uploads a remote image into one of the app's folders. */
async function upload(
  folder: "avatars" | "pets" | "posts" | "reports",
  seed: string,
  size = 900,
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  const result = await cloudinary.uploader.upload(sourceImage(seed, size), {
    folder: `pawpals/${folder}`,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

/** Removes previously seeded accounts and every Cloudinary asset they own. */
async function reset(): Promise<void> {
  console.log("Resetting demo data…");

  const { data: listed, error } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });

  if (error) throw error;

  const seeded = listed.users.filter((user) =>
    user.email?.endsWith(`@${SEED_DOMAIN}`),
  );

  if (seeded.length === 0) {
    log("no demo accounts found");
    return;
  }

  const ids = seeded.map((user) => user.id);

  // Collect asset ids before the cascade deletes the rows that reference them.
  const [profiles, pets, images, reports] = await Promise.all([
    supabase.from("profiles").select("avatar_public_id").in("id", ids),
    supabase.from("pets").select("avatar_public_id").in("owner_id", ids),
    supabase
      .from("post_images")
      .select("public_id, post:posts!inner(author_id)"),
    supabase
      .from("lost_found_reports")
      .select("image_public_id")
      .in("reporter_id", ids),
  ]);

  const publicIds = [
    ...(profiles.data ?? []).map((row) => row.avatar_public_id),
    ...(pets.data ?? []).map((row) => row.avatar_public_id),
    ...(images.data ?? [])
      .filter((row) => {
        const post = row.post as unknown as { author_id: string } | null;
        return post ? ids.includes(post.author_id) : false;
      })
      .map((row) => row.public_id),
    ...(reports.data ?? []).map((row) => row.image_public_id),
  ].filter((id): id is string => Boolean(id));

  for (const id of publicIds) {
    await cloudinary.uploader
      .destroy(id, { resource_type: "image", invalidate: true })
      .catch(() => undefined);
  }

  log(`deleted ${publicIds.length} Cloudinary assets`);

  for (const id of ids) {
    await supabase.auth.admin.deleteUser(id);
  }

  log(`deleted ${ids.length} demo accounts (profiles and content cascade)`);
}

// --- seeding ----------------------------------------------------------------

async function seed(): Promise<void> {
  console.log("Seeding demo data…");

  const ownerIds: string[] = [];
  const petIds: string[] = [];
  const postIds: { id: string; authorId: string }[] = [];

  for (const [index, owner] of OWNERS.entries()) {
    const email = `${owner.username}@${SEED_DOMAIN}`;

    const { data: created, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password: SEED_PASSWORD,
        email_confirm: true,
        user_metadata: { display_name: owner.displayName },
      });

    if (createError || !created.user) {
      throw createError ?? new Error(`Could not create ${email}`);
    }

    const userId = created.user.id;
    ownerIds.push(userId);

    const avatar = await upload("avatars", `owner-${index}`, 400);

    // The signup trigger already made the profile row; fill in the rest.
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        username: owner.username,
        display_name: owner.displayName,
        city: owner.city,
        bio: owner.bio,
        avatar_url: avatar.url,
        avatar_public_id: avatar.publicId,
      })
      .eq("id", userId);

    if (profileError) throw profileError;

    log(`owner ${owner.displayName}`);

    for (const [petIndex, pet] of owner.pets.entries()) {
      const petAvatar = await upload("pets", `pet-${index}-${petIndex}`, 600);
      const slug = `${pet.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random()
        .toString(36)
        .slice(2, 6)}`;

      const { data: petRow, error: petError } = await supabase
        .from("pets")
        .insert({
          owner_id: userId,
          name: pet.name,
          slug,
          species: pet.species,
          breed: pet.breed,
          birth_date: pet.birthDate,
          gender: pet.gender,
          bio: pet.bio,
          avatar_url: petAvatar.url,
          avatar_public_id: petAvatar.publicId,
        })
        .select("id")
        .single();

      if (petError || !petRow) throw petError ?? new Error("pet insert failed");

      petIds.push(petRow.id);
      log(`  pet ${pet.name} (/pets/${slug})`);

      for (const [postIndex, caption] of pet.posts.entries()) {
        const { data: postRow, error: postError } = await supabase
          .from("posts")
          .insert({
            pet_id: petRow.id,
            author_id: userId,
            caption,
            // Spread posts backwards through the last few weeks so the feed
            // has a believable shape rather than twenty identical timestamps.
            created_at: hoursAgo(
              6 + postIndex * 29 + petIndex * 11 + index * 37,
            ),
          })
          .select("id")
          .single();

        if (postError || !postRow) {
          throw postError ?? new Error("post insert failed");
        }

        postIds.push({ id: postRow.id, authorId: userId });

        const imageCount = 1 + ((postIndex + petIndex) % 3);
        const images = await Promise.all(
          Array.from({ length: imageCount }, (_, imageIndex) =>
            upload(
              "posts",
              `post-${index}-${petIndex}-${postIndex}-${imageIndex}`,
            ),
          ),
        );

        const { error: imagesError } = await supabase
          .from("post_images")
          .insert(
            images.map((image, position) => ({
              post_id: postRow.id,
              url: image.url,
              public_id: image.publicId,
              width: image.width,
              height: image.height,
              position,
            })),
          );

        if (imagesError) throw imagesError;
      }
    }
  }

  // Everyone follows every pet that is not theirs.
  const { data: petOwners } = await supabase
    .from("pets")
    .select("id, owner_id");

  const follows = (petOwners ?? []).flatMap((pet) =>
    ownerIds
      .filter((ownerId) => ownerId !== pet.owner_id)
      // Two or three followers per pet rather than a complete graph.
      .filter((_, position) => position % 2 === 0)
      .map((ownerId) => ({ follower_id: ownerId, pet_id: pet.id })),
  );

  if (follows.length > 0) {
    const { error } = await supabase.from("follows").insert(follows);
    if (error) throw error;
    log(`${follows.length} follows`);
  }

  const likes = postIds.flatMap((post) =>
    ownerIds
      .filter((ownerId) => ownerId !== post.authorId)
      .filter((_, position) => position % 2 === 0)
      .map((ownerId) => ({ user_id: ownerId, post_id: post.id })),
  );

  if (likes.length > 0) {
    const { error } = await supabase.from("likes").insert(likes);
    if (error) throw error;
    log(`${likes.length} likes`);
  }

  const COMMENTS = [
    "He looks so pleased with himself.",
    "This is the content I signed up for.",
    "Same energy as mine at 6am.",
    "That face should be illegal.",
    "Give them a scratch behind the ear from me.",
  ];

  const comments = postIds.slice(0, 12).map((post, index) => {
    const commenter =
      ownerIds.find((ownerId) => ownerId !== post.authorId) ?? ownerIds[0];

    return {
      post_id: post.id,
      user_id: commenter,
      body: COMMENTS[index % COMMENTS.length],
    };
  });

  if (comments.length > 0) {
    const { error } = await supabase.from("comments").insert(comments);
    if (error) throw error;
    log(`${comments.length} comments`);
  }

  for (const report of REPORTS) {
    const image = report.withPhoto
      ? await upload("reports", `report-${report.title.slice(0, 12)}`, 800)
      : null;

    const { error } = await supabase.from("lost_found_reports").insert({
      reporter_id: ownerIds[report.ownerIndex],
      type: report.type,
      status: report.status,
      species: report.species,
      title: report.title,
      description: report.description,
      city: report.city,
      locality: report.locality,
      last_seen_at: hoursAgo(report.hoursAgo),
      contact_note: report.contactNote || null,
      image_url: image?.url ?? null,
      image_public_id: image?.publicId ?? null,
      // The check constraint ties these together; set both or neither.
      reunited_at:
        report.status === "reunited" ? hoursAgo(report.hoursAgo / 2) : null,
      created_at: hoursAgo(report.hoursAgo),
    });

    if (error) throw error;
  }

  log(`${REPORTS.length} lost & found reports`);

  console.log("\nDone.");
  console.log(`Sign in as any demo owner with:`);
  console.log(`  email:    <username>@${SEED_DOMAIN}`);
  console.log(`  password: ${SEED_PASSWORD}`);
  console.log(`  e.g.      ${OWNERS[0].username}@${SEED_DOMAIN}`);
}

// --- entry point ------------------------------------------------------------

const shouldReset = process.argv.includes("--reset");

try {
  if (shouldReset) await reset();
  await seed();
} catch (error) {
  console.error("\nSeeding failed:", error);
  process.exit(1);
}
