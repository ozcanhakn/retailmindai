"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { createAuthClient } from "better-auth/react"
import { authClient } from "@/lib/aut-client";


export default function Home() {

    const {data: session} = authClient.useSession();

    
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");



    const onSubmit = () => {
        authClient.signUp.email({
            email,
            name,
            password,
        }, {
            onError: () => {
                window.alert("Something went wrong");

            },
            onSuccess: () => {
                window.alert("Successed");
            }
        });
    }

    if(session) {
        return (
           <div className="flex flex-col gap-4">
            <p>Logged in as {session.user.name}</p>
            <Button onClick={() => authClient.signOut()}>
                Sign Out
            </Button>
           </div>
        );
    }


    return (
        <div className="flex flex-col gap-4">
            <Input
            placeholder="name"
            value={name} onChange={(e) => setName(e.target.value)}
            />
            <Input
            placeholder="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <Input
            placeholder="password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={onSubmit}>
                Create user
            </Button>
        </div>
    )

}
