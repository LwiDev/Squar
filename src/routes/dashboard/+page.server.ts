import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
  // Dashboard just redirects to editor now (one page per user)
  throw redirect(303, "/editor");
};
