import { BadgeCheck } from "lucide-react";
import { formatDistanceToNow, fromUnixTime } from "date-fns";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@umamin/ui/components/avatar";

import { cn } from "@ui/lib/utils";
import { ShareButton } from "./share-button";
import { Card, CardHeader } from "@umamin/ui/components/card";

type Props = {
  imageUrl?: string | null;
  username: string;
  createdAt: number;
  bio?: string | null;
};

export function UserCard({ ...user }: Props) {
  return (
    <Card className="bg-background">
      <CardHeader className="rounded-2xl">
        <div className="flex justify-between py-5">
          <div className="flex gap-6 items-center">
            <Avatar className="md:h-28 md:w-28 h-16 w-16">
              <AvatarImage
                className="rounded-full"
                src={user?.imageUrl ?? ""}
                alt={`${user?.username}'s avatar`}
              />
              <AvatarFallback className="text-xs">
                {user?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-1">
                  <p className="font-semibold md:text-xl">@{user?.username}</p>
                  {process.env.NEXT_PUBLIC_VERIFIED_USERS?.split(",").includes(
                    user.username,
                  ) && <BadgeCheck className="w-4 h-4 text-pink-500" />}
                </div>

                <ShareButton username={user.username} />
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Joined{" "}
                {formatDistanceToNow(fromUnixTime(user.createdAt), {
                  addSuffix: true,
                })}
              </p>

              <p
                className={cn(
                  "mt-3 text-sm break-words text-muted-foreground",
                  {
                    "break-all": user?.bio?.split(" ").length === 1,
                  },
                )}
              >
                {user?.bio}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
