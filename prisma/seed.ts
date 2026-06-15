import { prisma } from "../src/config/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log(`Start seeding ...`);

  // 1. Create an OWNER user to own the arenas
  const hashedPassword = await bcrypt.hash("password123", 10);
  const owner = await prisma.user.upsert({
    where: { email: "owner@playsync.com" },
    update: {},
    create: {
      email: "owner@playsync.com",
      name: "Arena Owner",
      password: hashedPassword,
      role: "OWNER",
    },
  });

  console.log(`Created/Found owner: ${owner.email}`);

  // 2. Create multiple arenas for testing pagination and location
  const arenasData = [
    {
      name: "Colombo Futsal Club",
      description: "Premium futsal pitches in the heart of Colombo.",
      address: "123 Galle Road, Colombo 03",
      latitude: 6.904, // Central Colombo
      longitude: 79.851,
      ownerId: owner.id,
    },
    {
      name: "Nugegoda Sports Complex",
      description: "Multi-sport complex with badminton and basketball courts.",
      address: "45 Stanley Thilakaratne Mawatha, Nugegoda",
      latitude: 6.871, // Nugegoda
      longitude: 79.889,
      ownerId: owner.id,
    },
    {
      name: "Kandy Indoor Arena",
      description: "State of the art indoor facilities.",
      address: "78 Peradeniya Road, Kandy",
      latitude: 7.29, // Kandy (Far from Colombo)
      longitude: 80.633,
      ownerId: owner.id,
    },
    {
      name: "Mount Lavinia Beach Sports",
      description: "Beach volleyball and futsal.",
      address: "12 Beach Road, Mount Lavinia",
      latitude: 6.833, // South of Colombo
      longitude: 79.866,
      ownerId: owner.id,
    },
    {
      name: "Battaramulla Badminton Hub",
      description: "Professional badminton courts.",
      address: "99 Pannipitiya Road, Battaramulla",
      latitude: 6.9, // East of Colombo
      longitude: 79.916,
      ownerId: owner.id,
    },
    {
      name: "Wattala Futsal Arena",
      description: "High quality turf.",
      address: "10 Negombo Road, Wattala",
      latitude: 6.983, // North of Colombo
      longitude: 79.883,
      ownerId: owner.id,
    },
    {
      name: "Galle Fort Sports Club",
      description: "Historic sports club.",
      address: "Fort, Galle",
      latitude: 6.033, // Far south
      longitude: 80.216,
      ownerId: owner.id,
    },
    {
      name: "Dehiwala Indoor Stadium",
      description: "Spacious indoor stadium.",
      address: "Station Road, Dehiwala",
      latitude: 6.85,
      longitude: 79.866,
      ownerId: owner.id,
    },
    {
      name: "Pannipitiya Basketball Court",
      description: "Outdoor basketball court.",
      address: "High Level Road, Pannipitiya",
      latitude: 6.844,
      longitude: 79.948,
      ownerId: owner.id,
    },
    {
      name: "Maharagama Youth Center",
      description: "Various sports facilities.",
      address: "High Level Road, Maharagama",
      latitude: 6.848,
      longitude: 79.924,
      ownerId: owner.id,
    },
    {
      name: "Rajagiriya Sports Complex",
      description: "Modern sports complex.",
      address: "Parliament Road, Rajagiriya",
      latitude: 6.909,
      longitude: 79.888,
      ownerId: owner.id,
    },
    {
      name: "Bambalapitiya Flats Ground",
      description: "Community sports ground.",
      address: "Galle Road, Colombo 04",
      latitude: 6.884,
      longitude: 79.855,
      ownerId: owner.id,
    },
  ];

  for (const arenaData of arenasData) {
    // Check if arena already exists to avoid duplicates on re-running
    const existingArena = await prisma.arena.findFirst({
      where: { name: arenaData.name },
    });

    if (!existingArena) {
      const arena = await prisma.arena.create({
        data: arenaData,
      });
      console.log(`Created arena: ${arena.name}`);
    } else {
      console.log(`Arena already exists: ${existingArena.name}`);
    }
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
