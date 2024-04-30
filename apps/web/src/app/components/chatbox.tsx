import { Send } from "lucide-react";

import { ChatList } from "./chat-list";
import { Input } from "@umamin/ui/components/input";
import { Button } from "@umamin/ui/components/button";
import { ProfileHoverCard } from "./profile-hover-card";
import type { GetUserByUsernameResult } from "@/lib/gql";
import { Card, CardFooter, CardHeader } from "@umamin/ui/components/card";

export function ChatBox({
  ...user
}: GetUserByUsernameResult) {
  return (
    <Card className="border flex flex-col justify-between min-w-80 w-full max-w-2xl h-[70vh] min-h-[350px] max-h-[450px] relative">
      <CardHeader className="bg-background border-b w-full item-center rounded-t-2xl flex justify-between flex-row">
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground">To:</span>
          <ProfileHoverCard user={user}>
            <div>
              <p className="font-medium leading-none cursor-pointer">
                @{user.username}
              </p>
            </div>
          </ProfileHoverCard>
        </div>

        <span className="font-semibold text-muted-foreground">umamin</span>
      </CardHeader>

      <ChatList imageUrl={user.imageUrl} />

      <CardFooter className="flex w-full flex-col z-10">
        <form className="flex w-full max-w-lg items-center space-x-2">
          <Input
            id="message"
            placeholder="Type your message..."
            className="focus-visible:ring-transparent flex-1 text-base"
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            // disabled={input.trim().length === 0}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
