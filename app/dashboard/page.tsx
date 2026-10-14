import {createClient} from "@/lib/supabase/server";import {redirect} from "next/navigation";import Dashboard from "@/components/dashboard";
export default async function Page(){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");return <Dashboard email={user.email??""} userId={user.id}/> }
