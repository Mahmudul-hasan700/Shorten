// lib/generateUniqueUsername.ts
import User from "@/models/User";

export async function generateUniqueUsername(
  baseUsername: string
): Promise<string> {
  let username = baseUsername.toLowerCase();
  let isUnique = false;
  let counter = 0;

  // Remove any non-alphanumeric characters
  username = username.replace(/[^a-z0-9]/g, "");

  // Ensure minimum length
  if (username.length < 3) {
    username += Math.random().toString(36).substring(2, 7);
  }

  // Truncate to max length
  username = username.substring(0, 30);

  while (!isUnique) {
    // Check if username exists
    const existingUser = await User.findOne({
      username: counter > 0 ? `${username}${counter}` : username
    });

    if (!existingUser) {
      isUnique = true;
      return counter > 0 ? `${username}${counter}` : username;
    }

    counter++;
  }

  // Fallback (extremely unlikely)
  return `${username}${Math.random().toString(36).substring(2, 7)}`;
}
