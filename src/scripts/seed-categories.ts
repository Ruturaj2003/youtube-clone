import { db } from "@/db";
import { categories } from "@/db/schema";

// TODO: Create a script to seed categories
const categoryNames = [
  "Cars and vehicles",
  "Comedy",
  "Education",
  "Entertainment",
  "Gaming",
  "Film and Animation",
  "How-to and Style",
  "Music",
  "News and Politics",
  "People and Blogs",
  "Pets and Animals",
  "Science and Technology",
  "Sports",
  "Travel and Events",
];

async function main() {
  console.log("Seeding Categories");
  try {
    const values = categoryNames.map((name) => {
      return {
        name,
        description: `Videos related to ${name.toLocaleLowerCase()}`,
      };
    });
    await db.insert(categories).values(values);
    console.log("Categories Seeded Successfully");
  } catch (error) {
    console.error("Error Seeding Categories ", error);
    process.exit(1);
  }
}

main();
