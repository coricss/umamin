import SchemaBuilder from "@pothos/core";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";
import { DateResolver, JSONResolver } from "graphql-scalars";

import { SelectNote } from "@umamin/db/schema/note";
import { SelectMessage } from "@umamin/db/schema/message";
import { SelectAccount, SelectUser } from "@umamin/db/schema/user";

type WithUser<T> = T & { user?: SelectUser | null };

type MessageCursor = { id?: string | null; createdAt?: number | null };
type NoteCursor = { id?: string | null; updatedAt?: number | null };

type WithCursor<T> = {
  hasMore: boolean;
  cursor: (T extends SelectMessage ? MessageCursor : NoteCursor) | null;
  data: WithUser<T extends SelectMessage ? SelectMessage : SelectNote>[] | null;
};

const builder = new SchemaBuilder<{
  AuthScopes: {
    authenticated: boolean;
  };
  Objects: {
    User: SelectUser & {
      note?: SelectNote | null;
      accounts?: SelectAccount[] | null;
    };
    Account: SelectAccount;
    Note: WithUser<SelectNote>;
    Message: WithUser<SelectMessage>;
    MessageCursor: MessageCursor;
    NoteCursor: NoteCursor;
    NotesWithCursor: WithCursor<SelectNote>;
    MessagesWithCursor: WithCursor<SelectMessage>;
  };
  Context: {
    currentUser: SelectUser;
  };
  Scalars: {
    JSON: {
      Input: unknown;
      Output: unknown;
    };
    Date: {
      Input: Date;
      Output: Date;
    };
  };
}>({
  plugins: [ScopeAuthPlugin],
  authScopes: async (ctx) => ({
    authenticated: !!ctx.currentUser,
  }),
});

builder.addScalarType("JSON", JSONResolver);
builder.addScalarType("Date", DateResolver);

export default builder;
