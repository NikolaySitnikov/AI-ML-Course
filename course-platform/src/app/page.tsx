import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to admin for now (public site will be built later)
  redirect("/admin");
}
