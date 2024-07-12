import { promises as fs } from "fs";
import { cookies } from "next/headers";
import { createYoga } from "graphql-yoga";
import { getSession, lucia } from "@/lib/auth";
import { useAPQ } from "@graphql-yoga/plugin-apq";
import { gqlSchema, initContextCache } from "@umamin/gql";
import { useResponseCache } from "@graphql-yoga/plugin-response-cache";
import { useCSRFPrevention } from "@graphql-yoga/plugin-csrf-prevention";
import { usePersistedOperations } from "@graphql-yoga/plugin-persisted-operations";
import { useDisableIntrospection } from "@graphql-yoga/plugin-disable-introspection";

const { handleRequest } = createYoga({
  schema: gqlSchema,
  context: async () => {
    const { session } = await getSession();

    return {
      ...initContextCache(),
      userId: session?.userId,
    };
  },
  graphqlEndpoint: "/api/graphql",
  graphiql: process.env.NODE_ENV === "development",
  fetchAPI: { Response },
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? "https://www.umamin.link"
        : "http://localhost:3000",
    credentials: true,
    methods: ["POST", "GET", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  plugins: [
    useCSRFPrevention({
      requestHeaders: ["x-graphql-yoga-csrf"],
    }),
    useResponseCache({
      session: () => cookies().get(lucia.sessionCookieName)?.value,
      invalidateViaMutation: false,
      scopePerSchemaCoordinate: {
        "Query.user": "PRIVATE",
        "Query.note": "PRIVATE",
        "Query.messages": "PRIVATE",
        "Query.messagesFromCursor": "PRIVATE",
      },
      ttl: 30_000,
      ttlPerSchemaCoordinate: {
        "Query.notes": 180_000,
        "Query.notesFromCursor": 180_000,
        "Query.userByUsername": 180_000,
      },
    }),
    useDisableIntrospection({
      isDisabled: () => process.env.NODE_ENV === "production",
    }),
    usePersistedOperations({
      // allowArbitraryOperations: process.env.NODE_ENV === "development",
      customErrors: {
        notFound: {
          message: "Operation is not found",
          extensions: {
            http: {
              status: 404,
            },
          },
        },
        keyNotFound: {
          message: "Key is not found",
          extensions: {
            http: {
              status: 404,
            },
          },
        },
        persistedQueryOnly: {
          message: "Only persisted operations are allowed",
          extensions: {
            http: {
              status: 403,
            },
          },
        },
      },
      skipDocumentValidation: true,
      async getPersistedOperation(key: string) {
        const file = await fs.readFile(
          process.cwd() + "/public/persisted-operations.json",
          "utf-8",
        );
        const persistedOperations = JSON.parse(file);
        return persistedOperations[key];
      },
    }),
    useAPQ(),
  ],
});

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS,
};
